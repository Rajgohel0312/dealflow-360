import * as discountService from "./discounts.services.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";

export const createDiscountRule = asyncHandler(async (req, res) => {
  const discountRule = await discountService.createDiscountRule(req.body);

  return res.status(201).json({
    success: true,
    message: "Discount rule created successfully",
    discount_rule: discountRule,
  });
});

export const getDiscountRules = asyncHandler(async (req, res) => {
  const filters = {
    customer_tier: req.query.customer_tier,
    category_id: req.query.category_id,
  };

  if (req.query.is_active !== undefined) {
    filters.is_active = req.query.is_active === "true";
  }

  const discountRules = await discountService.getAllDiscountRules(filters);

  return res.status(200).json({
    success: true,
    discount_rules: discountRules,
  });
});

export const getDiscountRuleById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const discountRule = await discountService.getDiscountRuleById(id);

  return res.status(200).json({
    success: true,
    discount_rule: discountRule,
  });
});

export const updateDiscountRule = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedRule = await discountService.updateDiscountRule(id, req.body);

  return res.status(200).json({
    success: true,
    message: "Discount rule updated successfully",
    discount_rule: updatedRule,
  });
});

export const deleteDiscountRule = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await discountService.deleteDiscountRule(id);

  return res.status(200).json({
    success: true,
    message: result.message || "Discount rule deleted successfully",
  });
});
