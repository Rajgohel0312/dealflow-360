import Joi from "joi";

export const createDiscountRuleSchema = Joi.object({
  customer_tier: Joi.string().valid("Bronze", "Silver", "Gold").required(),
  category_id: Joi.string().uuid().required(),
  max_discount_percent: Joi.number().min(0).max(100).required(),
  risk_level: Joi.string()
    .valid("NORMAL", "MANAGER", "FINANCE")
    .optional()
    .default("NORMAL"),
  is_active: Joi.boolean().optional().default(true),
});

export const updateDiscountRuleSchema = Joi.object({
  customer_tier: Joi.string().valid("Bronze", "Silver", "Gold").optional(),
  category_id: Joi.string().uuid().optional(),
  max_discount_percent: Joi.number().min(0).max(100).optional(),
  risk_level: Joi.string().valid("NORMAL", "MANAGER", "FINANCE").optional(),
  is_active: Joi.boolean().optional(),
});
