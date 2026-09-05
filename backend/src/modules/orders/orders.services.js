import * as orderRepo from "./orders.repository.js";
import { findQuotationById, findQuotationItemsByQuotationId, updateQuotation } from "../quotations/quotations.repository.js";
import AppError from "../../shared/errors/AppError.js";
import { ROLES } from "../../shared/constants/roles.js";

export const convertQuotationToOrder = async (quotationId, salesRepId, userRole) => {
  const quotation = await findQuotationById(quotationId);
  if (!quotation) {
    throw new AppError("Quotation not found", 404);
  }

  if (quotation.status === "CONVERTED") {
    throw new AppError("Quotation has already been converted to a Sales Order", 409);
  }

  if (quotation.status !== "APPROVED") {
    throw new AppError(`Quotation must be APPROVED before converting to an order. Current status: ${quotation.status}`, 400);
  }

  const existingOrder = await orderRepo.findOrderByQuotationId(quotationId);
  if (existingOrder) {
    throw new AppError("Quotation has already been converted to an order", 409);
  }

  const orderNumber = await orderRepo.generateNextOrderNumber();

  const order = await orderRepo.createOrder({
    order_number: orderNumber,
    quotation_id: quotationId,
    customer_id: quotation.customer_id,
    sales_rep_id: quotation.sales_rep_id,
    currency: quotation.currency || "INR",
    subtotal: quotation.subtotal,
    discount_amount: quotation.discount_amount,
    tax_amount: quotation.tax_amount,
    total_amount: quotation.total_amount,
    status: "CONFIRMED",
    order_date: new Date(),
  });

  const qtnItems = await findQuotationItemsByQuotationId(quotationId);
  for (const item of qtnItems) {
    await orderRepo.createOrderItem({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_percent: item.discount_percent,
      discount_amount: item.discount_amount,
      tax_rate: item.tax_rate,
      tax_amount: item.tax_amount,
      line_total: item.line_total,
    });
  }

  await updateQuotation(quotationId, { status: "CONVERTED" });

  const fullOrder = await orderRepo.findOrderById(order.id);
  const items = await orderRepo.findOrderItemsByOrderId(order.id);

  return {
    ...fullOrder,
    items,
  };
};

export const getAllOrders = async (userId, userRole, filters = {}) => {
  if (userRole === ROLES.SALES_REP) {
    filters.sales_rep_id = userId;
  }
  return orderRepo.findAllOrders(filters);
};

export const getOrderById = async (id) => {
  const order = await orderRepo.findOrderById(id);
  if (!order) {
    throw new AppError("Sales Order not found", 404);
  }
  const items = await orderRepo.findOrderItemsByOrderId(id);
  return {
    ...order,
    items,
  };
};
