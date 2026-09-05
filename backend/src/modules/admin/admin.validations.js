import Joi from "joi";

export const changeRoleSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required().messages({
      "string.guid": "User ID must be a valid UUID",
      "any.required": "User ID is required in the URL",
    }),
  }),

  body: Joi.object({
    roleId: Joi.string().uuid().required().messages({
      "string.guid": "Role ID must be a valid UUID",
      "any.required": "roleId is required",
    }),
  }),
};
