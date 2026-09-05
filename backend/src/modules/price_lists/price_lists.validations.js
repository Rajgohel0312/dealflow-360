import Joi from "joi";

export const createPriceListSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).required(),
  currency: Joi.string().trim().uppercase().length(3).optional().default("INR"),
  description: Joi.string().trim().allow("", null).optional(),
  is_active: Joi.boolean().optional().default(true),
});

export const updatePriceListSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).optional(),
  currency: Joi.string().trim().uppercase().length(3).optional(),
  description: Joi.string().trim().allow("", null).optional(),
  is_active: Joi.boolean().optional(),
});

export const createPriceListItemSchema = Joi.object({
  product_id: Joi.string().uuid().required(),
  price: Joi.number().min(0).required(),
  minimum_quantity: Joi.number().greater(0).optional().default(1),
  maximum_quantity: Joi.number().min(Joi.ref("minimum_quantity")).allow(null).optional(),
});

export const updatePriceListItemSchema = Joi.object({
  price: Joi.number().min(0).optional(),
  minimum_quantity: Joi.number().greater(0).optional(),
  maximum_quantity: Joi.number().allow(null).optional(),
});
