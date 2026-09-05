import * as upsellService from "./upsell.services.js";

export const getRecommendationsForCustomer = async (req, res) => {
  const { customerId } = req.params;
  const result = await upsellService.getRecommendationsForCustomer(customerId);

  return res.status(200).json({
    success: true,
    ...result,
  });
};

export const createQuotationFromRecommendation = async (req, res) => {
  const { customer_id, product_ids } = req.body;
  const quotation = await upsellService.createQuotationFromRecommendation(
    req.user?.id,
    req.user?.role_name,
    customer_id,
    product_ids
  );

  return res.status(201).json({
    success: true,
    message: "New draft quotation created from recommended products",
    quotation,
  });
};
