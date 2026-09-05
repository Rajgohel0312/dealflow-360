import Joi from "joi";

export const recordPaymentSchema = {
  body: Joi.object({
    amount: Joi.number().greater(0).required(),
    payment_method: Joi.string()
      .valid("BANK_TRANSFER", "CARD", "UPI", "CASH", "OTHER")
      .optional(),
    transaction_reference: Joi.string().trim().allow("", null).optional(),
  }),
};
