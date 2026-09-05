import Joi from "joi";

export const createQuotationFromRecSchema = {
  body: Joi.object({
    customer_id: Joi.string().uuid().required(),
    product_ids: Joi.array().items(Joi.string().uuid()).min(1).required(),
  }),
};
