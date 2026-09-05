import Joi from "joi";

export const createCustomerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(255).required(),

  email: Joi.string().trim().email().max(255).optional().allow(null, ""),

  phone: Joi.string().trim().max(50).optional().allow(null, ""),

  address: Joi.string().trim().max(1000).optional().allow(null, ""),

  customer_tier: Joi.string()
    .valid("Bronze", "Silver", "Gold")
    .default("Bronze"),

  currency: Joi.string().trim().uppercase().length(3).default("INR"),
});

export const createCustomerEmpSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).required(),
  email: Joi.string().trim().email().max(255).required(),
  password: Joi.string().min(8).max(128).required(),
});

export const customerLoginSchema = Joi.object({
  email: Joi.string().trim().email().max(255).required(),

  password: Joi.string().required(),
});
export const changeCustomerPasswordSchema = {
  body: Joi.object({
    current_password: Joi.string().required(),
    new_password: Joi.string().min(8).max(128).required(),
    confirm_password: Joi.string()
      .valid(Joi.ref("new_password"))
      .required()
      .messages({ "any.only": "Passwords do not match" }),
  }),
};

export const updateCustomerSchema = {
  params: Joi.object({ customerId: Joi.string().uuid().required() }),
  body: Joi.object({
    name: Joi.string().trim().min(2).max(255).optional(),
    email: Joi.string().trim().email().max(255).optional().allow(null, ""),
    phone: Joi.string().trim().max(50).optional().allow(null, ""),
    address: Joi.string().trim().max(1000).optional().allow(null, ""),
    customer_tier: Joi.string().valid("Bronze", "Silver", "Gold").optional(),
    currency: Joi.string().trim().uppercase().length(3).optional(),
  }).min(1),
};

export const updateCustomerUserSchema = {
  params: Joi.object({
    customerId: Joi.string().uuid().required(),
    userId: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    name: Joi.string().trim().min(2).max(150).optional(),
    email: Joi.string().trim().email().max(255).optional(),
    is_active: Joi.boolean().optional(),
  }).min(1),
};
