import { loginUser, registerUser } from "./auth.controllers.js";
import { validate } from "../../middleware/validate.js";
import { loginUserSchema, registerUserSchema } from "./auth.validations.js";

export default function authRoutes(app, prefix) {
  app.route(
    "post",
    `${prefix}/auth/register`,
    validate(registerUserSchema),
    registerUser,
  );

  app.route(
    "post",
    `${prefix}/auth/login`,
    validate(loginUserSchema),
    loginUser,
  );
}
