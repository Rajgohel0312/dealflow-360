import Joi from "joi";

export const createNegotiationSchema = {
  body: Joi.object({
    reason: Joi.string().trim().allow("", null).optional(),
    items: Joi.array()
      .items(
        Joi.object({
          quotation_item_id: Joi.string().uuid().optional(),
          product_id: Joi.string().uuid().optional(),
          requested_quantity: Joi.number().greater(0).optional(),
          requested_discount_percent: Joi.number().min(0).max(100).optional(),
          requested_unit_price: Joi.number().min(0).optional(),
          notes: Joi.string().trim().allow("", null).optional(),
        })
      )
      .optional(),
  }),
};
