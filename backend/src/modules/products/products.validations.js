import Joi from "joi";

export const createProductSchema = Joi.object({
  category_id: Joi.string().uuid().required(),
  name: Joi.string().trim().min(2).max(255).required(),
  sku: Joi.string().trim().min(2).max(100).required(),
  description: Joi.string().trim().allow("", null).optional(),
  base_price: Joi.number().min(0).required(),
  cost_price: Joi.number().min(0).required(),
  unit: Joi.string().trim().max(50).optional().default("unit"),
  tax_rate: Joi.number().min(0).max(100).optional().default(0),
  product_type: Joi.string()
    .valid("ONE_TIME", "SUBSCRIPTION")
    .optional()
    .default("ONE_TIME"),
  is_active: Joi.boolean().optional().default(true),
});

export const updateProductSchema = Joi.object({
  category_id: Joi.string().uuid().optional(),
  name: Joi.string().trim().min(2).max(255).optional(),
  sku: Joi.string().trim().min(2).max(100).optional(),
  description: Joi.string().trim().allow("", null).optional(),
  base_price: Joi.number().min(0).optional(),
  cost_price: Joi.number().min(0).optional(),
  unit: Joi.string().trim().max(50).optional(),
  tax_rate: Joi.number().min(0).max(100).optional(),
  product_type: Joi.string().valid("ONE_TIME", "SUBSCRIPTION").optional(),
  is_active: Joi.boolean().optional(),
});
