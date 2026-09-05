import Joi from "joi";

export const createFulfillmentSchema = Joi.object({
  warehouse_id: Joi.string().uuid().required(),
});

export const shipFulfillmentSchema = Joi.object({
  tracking_number: Joi.string().trim().min(2).max(100).required(),
});
