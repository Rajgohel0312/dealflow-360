import * as quotationRepo from "./quotations.repository.js";
import { findCustomerById } from "../customers/customers.repository.js";
import { findProductById } from "../products/products.repository.js";
import { findPriceListById, findPriceListItemsByPriceListId } from "../price_lists/price_lists.repository.js";
import { findDiscountRuleByTierAndCategory } from "../discounts/discounts.repository.js";
import { findOrderByQuotationId } from "../orders/orders.repository.js";
import AppError from "../../shared/errors/AppError.js";
import { ROLES } from "../../shared/constants/roles.js";

const isAdminRole = (role) => {
  if (!role) return false;
  const s = String(role).toUpperCase();
  return s === "ADMIN" || role === ROLES.ADMIN;
};

const isSalesRepRole = (role) => {
  if (!role) return false;
  const s = String(role).toUpperCase();
  return s === "SALES_REP" || s === "SALES REP" || role === ROLES.SALES_REP;
};

// ==========================================
// QUOTATION HEADERS
// ==========================================

export const createQuotation = async (salesRepId, userRole, data) => {
  const customer = await findCustomerById(data.customer_id);
  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  if (customer.is_active === false) {
    throw new AppError("Cannot create quotation for an inactive customer", 400);
  }

  // Sales rep ownership check (Admin can create for any customer)
  if (!isAdminRole(userRole) && customer.sales_rep_id !== salesRepId) {
    throw new AppError("You can only create quotations for your assigned customers", 403);
  }

  if (data.price_list_id) {
    const priceList = await findPriceListById(data.price_list_id);
    if (!priceList || !priceList.is_active) {
      throw new AppError("Selected price list is inactive or invalid", 400);
    }
  }

  const qtnNumber = await quotationRepo.generateNextQuotationNumber();

  const quotation = await quotationRepo.createQuotation({
    quotation_number: qtnNumber,
    customer_id: data.customer_id,
    sales_rep_id: salesRepId,
    price_list_id: data.price_list_id || null,
    currency: data.currency || "INR",
    valid_until: data.valid_until || null,
    notes: data.notes || null,
    status: "DRAFT",
    subtotal: 0,
    discount_amount: 0,
    tax_amount: 0,
    total_amount: 0,
    risk_level: "NORMAL",
    requires_approval: false,
  });

  return quotation;
};

export const getQuotations = async (userId, userRole, filters = {}) => {
  if (isSalesRepRole(userRole)) {
    filters.sales_rep_id = userId;
  }
  return quotationRepo.findAllQuotations(filters);
};

export const getQuotationById = async (id) => {
  const quotation = await quotationRepo.findQuotationById(id);
  if (!quotation) {
    throw new AppError("Quotation not found", 404);
  }

  const items = await quotationRepo.findQuotationItemsByQuotationId(id);
  const approvals = await quotationRepo.findApprovalsByQuotationId(id);

  return {
    ...quotation,
    items,
    approvals,
  };
};

export const updateQuotation = async (id, userId, userRole, data) => {
  const quotation = await quotationRepo.findQuotationById(id);
  if (!quotation) {
    throw new AppError("Quotation not found", 404);
  }

  if (quotation.status !== "DRAFT") {
    throw new AppError("Cannot edit quotation after submission", 400);
  }

  if (!isAdminRole(userRole) && quotation.sales_rep_id !== userId) {
    throw new AppError("Unauthorized to edit this quotation", 403);
  }

  if (data.price_list_id && data.price_list_id !== quotation.price_list_id) {
    const priceList = await findPriceListById(data.price_list_id);
    if (!priceList || !priceList.is_active) {
      throw new AppError("Selected price list is inactive or invalid", 400);
    }
  }

  return quotationRepo.updateQuotation(id, data);
};

export const deleteQuotation = async (id, userId, userRole) => {
  const quotation = await quotationRepo.findQuotationById(id);
  if (!quotation) {
    throw new AppError("Quotation not found", 404);
  }

  const existingOrder = await findOrderByQuotationId(id);
  if (existingOrder) {
    throw new AppError(
      `Cannot delete quotation ${quotation.quotation_number} because it has already been converted to Sales Order ${existingOrder.order_number}`,
      400
    );
  }

  if (!isAdminRole(userRole) && quotation.sales_rep_id !== userId) {
    throw new AppError("Unauthorized to delete this quotation", 403);
  }

  await quotationRepo.deleteQuotation(id);
  return { message: `Quotation ${quotation.quotation_number} deleted successfully` };
};

// ==========================================
// ITEM & PRICE CALCULATION ENGINE
// ==========================================

const resolveUnitPrice = async (priceListId, productId, quantity, fallbackBasePrice) => {
  if (!priceListId) return Number(fallbackBasePrice);

  const priceItems = await findPriceListItemsByPriceListId(priceListId);
  const matchingItems = priceItems.filter(
    (item) => item.product_id === productId && Number(item.minimum_quantity) <= Number(quantity)
  );

  if (matchingItems.length === 0) return Number(fallbackBasePrice);

  // Pick tier item with the highest minimum_quantity that is <= requested quantity
  matchingItems.sort((a, b) => Number(b.minimum_quantity) - Number(a.minimum_quantity));
  return Number(matchingItems[0].price);
};

const defaultTierMaxDiscounts = {
  Gold: 15,
  Silver: 10,
  Bronze: 5,
};

const recalculateHeaderTotals = async (quotationId) => {
  const quotation = await quotationRepo.findQuotationById(quotationId);
  if (!quotation) return;

  const items = await quotationRepo.findQuotationItemsByQuotationId(quotationId);
  const customerTier = quotation.customer_tier || "Bronze";

  let subtotal = 0;
  let discount_amount = 0;
  let tax_amount = 0;
  let total_amount = 0;

  let requires_approval = false;
  let risk_level = "NORMAL";

  for (const item of items) {
    const gross = Number(item.unit_price) * Number(item.quantity);
    subtotal += gross;
    discount_amount += Number(item.discount_amount);
    tax_amount += Number(item.tax_amount);
    total_amount += Number(item.line_total);

    const rule = await findDiscountRuleByTierAndCategory(
      customerTier,
      item.category_id
    );

    const maxAllowedDiscount = rule
      ? Number(rule.max_discount_percent)
      : (defaultTierMaxDiscounts[customerTier] || 5);

    const requestedDiscount = Number(item.discount_percent);

    if (requestedDiscount > maxAllowedDiscount) {
      requires_approval = true;
      if (risk_level !== "FINANCE") risk_level = "MANAGER";
    }

    if (rule && rule.risk_level === "MANAGER") {
      requires_approval = true;
      if (risk_level !== "FINANCE") risk_level = "MANAGER";
    }

    if (rule && rule.risk_level === "FINANCE") {
      requires_approval = true;
      risk_level = "FINANCE";
    }
  }

  await quotationRepo.updateQuotation(quotationId, {
    subtotal,
    discount_amount,
    tax_amount,
    total_amount,
    risk_level,
    requires_approval,
  });
};

export const addQuotationItem = async (quotationId, userId, userRole, data) => {
  const quotation = await quotationRepo.findQuotationById(quotationId);
  if (!quotation) {
    throw new AppError("Quotation not found", 404);
  }

  if (quotation.status !== "DRAFT") {
    throw new AppError("Cannot add items to a quotation after submission", 400);
  }

  if (!isAdminRole(userRole) && quotation.sales_rep_id !== userId) {
    throw new AppError("Unauthorized to modify this quotation", 403);
  }

  const product = await findProductById(data.product_id);
  if (!product || !product.is_active) {
    throw new AppError("Product not found or inactive", 400);
  }

  const unitPrice = await resolveUnitPrice(
    quotation.price_list_id,
    product.id,
    data.quantity,
    product.base_price
  );

  const discountPercent = Number(data.discount_percent || 0);
  const gross = unitPrice * Number(data.quantity);
  const discountAmt = gross * (discountPercent / 100);
  const taxable = gross - discountAmt;
  const taxRate = Number(product.tax_rate || 0);
  const taxAmt = taxable * (taxRate / 100);
  const lineTotal = taxable + taxAmt;

  const item = await quotationRepo.createQuotationItem({
    quotation_id: quotationId,
    product_id: product.id,
    quantity: Number(data.quantity),
    unit_price: unitPrice,
    discount_percent: discountPercent,
    discount_amount: discountAmt,
    tax_rate: taxRate,
    tax_amount: taxAmt,
    line_total: lineTotal,
  });

  await recalculateHeaderTotals(quotationId);

  return item;
};

export const updateQuotationItem = async (quotationId, itemId, userId, userRole, data) => {
  const quotation = await quotationRepo.findQuotationById(quotationId);
  if (!quotation) {
    throw new AppError("Quotation not found", 404);
  }

  if (quotation.status !== "DRAFT") {
    throw new AppError("Cannot edit items in a quotation after submission", 400);
  }

  const existingItem = await quotationRepo.findQuotationItemById(itemId);
  if (!existingItem || existingItem.quotation_id !== quotationId) {
    throw new AppError("Quotation item not found", 404);
  }

  const product = await findProductById(existingItem.product_id);
  const newQty = data.quantity !== undefined ? Number(data.quantity) : Number(existingItem.quantity);
  const newDiscountPercent = data.discount_percent !== undefined ? Number(data.discount_percent) : Number(existingItem.discount_percent);

  const unitPrice = await resolveUnitPrice(
    quotation.price_list_id,
    product.id,
    newQty,
    product.base_price
  );

  const gross = unitPrice * newQty;
  const discountAmt = gross * (newDiscountPercent / 100);
  const taxable = gross - discountAmt;
  const taxRate = Number(existingItem.tax_rate || 0);
  const taxAmt = taxable * (taxRate / 100);
  const lineTotal = taxable + taxAmt;

  const updatedItem = await quotationRepo.updateQuotationItem(itemId, {
    quantity: newQty,
    unit_price: unitPrice,
    discount_percent: newDiscountPercent,
    discount_amount: discountAmt,
    tax_amount: taxAmt,
    line_total: lineTotal,
  });

  await recalculateHeaderTotals(quotationId);

  return updatedItem;
};

export const deleteQuotationItem = async (quotationId, itemId, userId, userRole) => {
  const quotation = await quotationRepo.findQuotationById(quotationId);
  if (!quotation) {
    throw new AppError("Quotation not found", 404);
  }

  if (quotation.status !== "DRAFT") {
    throw new AppError("Cannot delete items from a quotation after submission", 400);
  }

  const existingItem = await quotationRepo.findQuotationItemById(itemId);
  if (!existingItem || existingItem.quotation_id !== quotationId) {
    throw new AppError("Quotation item not found", 404);
  }

  await quotationRepo.deleteQuotationItem(itemId);
  await recalculateHeaderTotals(quotationId);

  return { message: "Quotation item removed successfully" };
};

// ==========================================
// DISCOUNT & RISK ENGINE / SUBMIT / APPROVALS
// ==========================================

export const submitQuotation = async (quotationId, userId, userRole) => {
  const quotation = await quotationRepo.findQuotationById(quotationId);
  if (!quotation) {
    throw new AppError("Quotation not found", 404);
  }

  if (quotation.status !== "DRAFT") {
    throw new AppError("Quotation has already been submitted", 400);
  }

  const items = await quotationRepo.findQuotationItemsByQuotationId(quotationId);
  if (items.length === 0) {
    throw new AppError("Cannot submit an empty quotation. Please add products first.", 400);
  }

  const customerTier = quotation.customer_tier || "Bronze";

  let requiresApproval = false;
  let evaluatedRiskLevel = "NORMAL"; // 'NORMAL', 'MANAGER', 'FINANCE'
  const riskReasons = [];

  for (const item of items) {
    const rule = await findDiscountRuleByTierAndCategory(
      customerTier,
      item.category_id
    );

    const maxAllowedDiscount = rule
      ? Number(rule.max_discount_percent)
      : (defaultTierMaxDiscounts[customerTier] || 5);
    const requestedDiscount = Number(item.discount_percent);

    if (requestedDiscount > maxAllowedDiscount) {
      requiresApproval = true;
      if (evaluatedRiskLevel !== "FINANCE") evaluatedRiskLevel = "MANAGER";
      riskReasons.push(
        `Product '${item.product_name}' requested ${requestedDiscount}% discount exceeds ${customerTier} Tier allowed threshold of ${maxAllowedDiscount}%`
      );
    }

    if (rule && rule.risk_level === "MANAGER") {
      requiresApproval = true;
      if (evaluatedRiskLevel !== "FINANCE") evaluatedRiskLevel = "MANAGER";
      riskReasons.push(`Category '${item.category_name}' triggers Manager review`);
    }

    if (rule && rule.risk_level === "FINANCE") {
      requiresApproval = true;
      evaluatedRiskLevel = "FINANCE";
      riskReasons.push(`Category '${item.category_name}' triggers Finance escalation`);
    }
  }

  if (requiresApproval) {
    await quotationRepo.updateQuotation(quotationId, {
      status: "UNDER_REVIEW",
      risk_level: evaluatedRiskLevel,
      requires_approval: true,
    });

    const pendingApproval = await quotationRepo.findPendingApprovalForQuotation(quotationId);
    if (!pendingApproval) {
      await quotationRepo.createQuotationApproval({
        quotation_id: quotationId,
        approval_level: evaluatedRiskLevel,
        status: "PENDING",
        comments: riskReasons.join(" | "),
      });
    }

    return {
      status: "UNDER_REVIEW",
      requires_approval: true,
      risk_level: evaluatedRiskLevel,
      reasons: riskReasons,
      message: "Quotation submitted and routed for Manager/Finance approval",
    };
  }

  // Auto-approved
  await quotationRepo.updateQuotation(quotationId, {
    status: "APPROVED",
    risk_level: "NORMAL",
    requires_approval: false,
  });

  return {
    status: "APPROVED",
    requires_approval: false,
    risk_level: "NORMAL",
    message: "Quotation validated and approved automatically!",
  };
};

export const evaluateQuotationRisk = async (quotationId) => {
  const quotation = await quotationRepo.findQuotationById(quotationId);
  if (!quotation) {
    throw new AppError("Quotation not found", 404);
  }

  const items = await quotationRepo.findQuotationItemsByQuotationId(quotationId);
  const customerTier = quotation.customer_tier || "Bronze";

  let requiresApproval = false;
  let evaluatedRiskLevel = "NORMAL";
  const riskReasons = [];

  for (const item of items) {
    const rule = await findDiscountRuleByTierAndCategory(
      customerTier,
      item.category_id
    );

    const maxAllowedDiscount = rule
      ? Number(rule.max_discount_percent)
      : (defaultTierMaxDiscounts[customerTier] || 5);
    const requestedDiscount = Number(item.discount_percent);

    if (requestedDiscount > maxAllowedDiscount) {
      requiresApproval = true;
      if (evaluatedRiskLevel !== "FINANCE") evaluatedRiskLevel = "MANAGER";
      riskReasons.push(
        `Product '${item.product_name}' discount ${requestedDiscount}% exceeds ${customerTier} Tier limit of ${maxAllowedDiscount}%`
      );
    }

    if (rule && rule.risk_level === "MANAGER") {
      requiresApproval = true;
      if (evaluatedRiskLevel !== "FINANCE") evaluatedRiskLevel = "MANAGER";
      riskReasons.push(`Category '${item.category_name}' triggers Manager review`);
    }

    if (rule && rule.risk_level === "FINANCE") {
      requiresApproval = true;
      evaluatedRiskLevel = "FINANCE";
      riskReasons.push(`Category '${item.category_name}' triggers Finance escalation`);
    }
  }

  return {
    status: requiresApproval ? "UNDER_REVIEW" : "APPROVED",
    requires_approval: requiresApproval,
    risk_level: evaluatedRiskLevel,
    reasons: riskReasons,
    message: requiresApproval
      ? "Negotiation routed for Manager/Finance approval"
      : "Negotiation terms within acceptable thresholds",
  };
};

export const getPendingApprovals = async () => {
  return quotationRepo.findPendingApprovals();
};

export const approveQuotation = async (quotationId, approverId, data) => {
  const quotation = await quotationRepo.findQuotationById(quotationId);
  if (!quotation) {
    throw new AppError("Quotation not found", 404);
  }

  if (quotation.status !== "UNDER_REVIEW") {
    throw new AppError("Quotation is not pending approval", 400);
  }

  const approval = await quotationRepo.findPendingApprovalForQuotation(quotationId);
  if (approval) {
    await quotationRepo.updateQuotationApproval(approval.id, {
      approver_id: approverId,
      status: "APPROVED",
      comments: data.comments || "Approved by manager",
      approved_at: new Date(),
    });
  }

  await quotationRepo.updateQuotation(quotationId, {
    status: "APPROVED",
  });

  return { message: "Quotation approved successfully" };
};

export const rejectQuotation = async (quotationId, approverId, data) => {
  const quotation = await quotationRepo.findQuotationById(quotationId);
  if (!quotation) {
    throw new AppError("Quotation not found", 404);
  }

  if (quotation.status !== "UNDER_REVIEW") {
    throw new AppError("Quotation is not pending approval", 400);
  }

  const approval = await quotationRepo.findPendingApprovalForQuotation(quotationId);
  if (approval) {
    await quotationRepo.updateQuotationApproval(approval.id, {
      approver_id: approverId,
      status: "REJECTED",
      comments: data.comments || "Rejected by manager",
      approved_at: new Date(),
    });
  }

  await quotationRepo.updateQuotation(quotationId, {
    status: "REJECTED",
  });

  return { message: "Quotation rejected successfully" };
};
