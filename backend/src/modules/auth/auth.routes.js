import { loginUser, profile, registerUser } from "./auth.controllers.js";
import { validate } from "../../middleware/validate.js";
import { authenticateEmployee, authorize } from "../../middleware/auth.middleware.js";
import { loginUserSchema, registerUserSchema } from "./auth.validations.js";
import { ROLES } from "../../shared/constants/roles.js";

export default function authRoutes(app, prefix) {
  app.route(
    "POST",
    `${prefix}/auth/register`,
    validate(registerUserSchema),
    registerUser,
  );

  app.route(
    "POST",
    `${prefix}/auth/login`,
    validate(loginUserSchema),
    loginUser,
  );

  app.route(
    "GET",
    `${prefix}/me/profile`,
    authenticateEmployee,
    profile,
  );
}
