import Joi from "joi";

export const registerUserSchema = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().email().trim().required(),
  password: Joi.string().min(3).required(),
});


export const loginUserSchema = Joi.object({
    email: Joi.string()
        .email()
        .trim()
        .required(),

    password: Joi.string()
        .required(),
});