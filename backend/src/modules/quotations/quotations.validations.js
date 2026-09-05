import Joi from "joi";

export const createQuotationSchema = Joi.object({
  customer_id: Joi.string().uuid().required(),
  price_list_id: Joi.string().uuid().optional().allow(null, ""),
  currency: Joi.string().trim().uppercase().length(3).optional().default("INR"),
  valid_until: Joi.date().iso().optional().allow(null),
  notes: Joi.string().trim().allow("", null).optional(),
});

export const updateQuotationSchema = Joi.object({
  price_list_id: Joi.string().uuid().optional().allow(null, ""),
  currency: Joi.string().trim().uppercase().length(3).optional(),
  valid_until: Joi.date().iso().optional().allow(null),
  notes: Joi.string().trim().allow("", null).optional(),
});

export const addQuotationItemSchema = Joi.object({
  product_id: Joi.string().uuid().required(),
  quantity: Joi.number().greater(0).required(),
  discount_percent: Joi.number().min(0).max(100).optional().default(0),
});

export const updateQuotationItemSchema = Joi.object({
  quantity: Joi.number().greater(0).optional(),
  discount_percent: Joi.number().min(0).max(100).optional(),
});

export const approvalActionSchema = Joi.object({
  comments: Joi.string().trim().allow("", null).optional(),
});
