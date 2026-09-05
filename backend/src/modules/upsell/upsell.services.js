import * as upsellRepo from "./upsell.repository.js";
import { findAllProducts } from "../products/products.repository.js";
import { createQuotation, addQuotationItem } from "../quotations/quotations.services.js";
import AppError from "../../shared/errors/AppError.js";

export const getRecommendationsForCustomer = async (customerId) => {
  const purchasedProductIds = await upsellRepo.findPurchasedProductIdsByCustomer(customerId);

  let explicitRecs = [];
  if (purchasedProductIds.length > 0) {
    explicitRecs = await upsellRepo.findRecommendationsByProducts(purchasedProductIds);
  }

  // Fallback: If no explicit recommendation mapping configured, return top active catalog products
  const allProducts = await findAllProducts({ is_active: true });
  const unpurchasedProducts = allProducts.filter((p) => !purchasedProductIds.includes(p.id));

  const fallbackRecs = unpurchasedProducts.slice(0, 4).map((p) => ({
    product_id: p.id,
    recommended_product_id: p.id,
    recommended_product_name: p.name,
    recommended_product_sku: p.sku,
    recommended_base_price: p.base_price,
    reason: "Complementary catalog add-on product for deal expansion",
    priority: 1,
  }));

  return {
    purchased_product_ids: purchasedProductIds,
    recommendations: explicitRecs.length > 0 ? explicitRecs : fallbackRecs,
  };
};

export const createQuotationFromRecommendation = async (salesRepId, userRole, customerId, productIds = []) => {
  if (!productIds || productIds.length === 0) {
    throw new AppError("At least one recommended product must be selected to generate a proposal", 400);
  }

  // 1. Create new draft quotation
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);

  const quotation = await createQuotation(salesRepId, userRole, {
    customer_id: customerId,
    sales_rep_id: salesRepId,
    valid_until: dueDate.toISOString().split("T")[0],
    notes: "Upsell / Cross-Sell Opportunity Proposal",
  });

  // 2. Add selected recommended products
  for (const prodId of productIds) {
    await addQuotationItem(quotation.id, salesRepId, userRole, {
      product_id: prodId,
      quantity: 1,
      discount_percent: 0,
    });
  }

  return quotation;
};
