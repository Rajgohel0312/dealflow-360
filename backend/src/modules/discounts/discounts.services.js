import * as discountRepo from "./discounts.repository.js";
import { findCategoryById } from "../categories/categories.repository.js";
import AppError from "../../shared/errors/AppError.js";

export const createDiscountRule = async (data) => {
  const category = await findCategoryById(data.category_id);
  if (!category) {
    throw new AppError("Product category not found", 404);
  }

  const existingRule = await discountRepo.findDiscountRuleByTierAndCategory(
    data.customer_tier,
    data.category_id
  );

  if (existingRule) {
    throw new AppError(
      `A discount rule for tier ${data.customer_tier} and category ${category.name} already exists`,
      409
    );
  }

  return discountRepo.createDiscountRule(data);
};

export const getAllDiscountRules = async (filters = {}) => {
  return discountRepo.findAllDiscountRules(filters);
};

export const getDiscountRuleById = async (id) => {
  const rule = await discountRepo.findDiscountRuleById(id);
  if (!rule) {
    throw new AppError("Discount rule not found", 404);
  }
  return rule;
};

export const updateDiscountRule = async (id, data) => {
  const existingRule = await discountRepo.findDiscountRuleById(id);
  if (!existingRule) {
    throw new AppError("Discount rule not found", 404);
  }

  const newTier = data.customer_tier || existingRule.customer_tier;
  const newCatId = data.category_id || existingRule.category_id;

  if (data.category_id && data.category_id !== existingRule.category_id) {
    const category = await findCategoryById(data.category_id);
    if (!category) {
      throw new AppError("Product category not found", 404);
    }
  }

  if (
    newTier !== existingRule.customer_tier ||
    newCatId !== existingRule.category_id
  ) {
    const duplicate = await discountRepo.findDiscountRuleByTierAndCategory(
      newTier,
      newCatId,
      id
    );

    if (duplicate) {
      throw new AppError(
        `A discount rule for tier ${newTier} and specified category already exists`,
        409
      );
    }
  }

  return discountRepo.updateDiscountRule(id, data);
};
