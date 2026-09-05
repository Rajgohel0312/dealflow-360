import Joi from "joi";

export const updateOrderSchema = Joi.object({
  status: Joi.string()
    .valid("CONFIRMED", "PROCESSING", "FULFILLED", "CANCELLED")
    .optional(),
});
