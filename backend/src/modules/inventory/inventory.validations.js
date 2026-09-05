import Joi from "joi";

export const createWarehouseSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).required(),
  code: Joi.string().trim().uppercase().min(2).max(50).required(),
  location: Joi.string().trim().allow("", null).optional(),
  address: Joi.string().trim().allow("", null).optional(),
});

export const updateWarehouseSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).optional(),
  location: Joi.string().trim().allow("", null).optional(),
  address: Joi.string().trim().allow("", null).optional(),
  is_active: Joi.boolean().optional(),
});

export const addStockSchema = Joi.object({
  warehouse_id: Joi.string().uuid().required(),
  product_id: Joi.string().uuid().required(),
  quantity: Joi.number().greater(0).required(),
});

export const reserveStockSchema = Joi.object({
  warehouse_id: Joi.string().uuid().required(),
  quantity: Joi.number().greater(0).required(),
  reference_id: Joi.string().uuid().optional().allow(null),
});
