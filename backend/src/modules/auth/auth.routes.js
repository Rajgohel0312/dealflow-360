import { loginUser, profile, registerUser } from "./auth.controllers.js";
import { validate } from "../../middleware/validate.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import { loginUserSchema, registerUserSchema } from "./auth.validations.js";
import { ROLES } from "../../shared/constants/roles.js";

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

  app.route(
    "get",
    `${prefix}/me/profile`,
    authenticate,
    profile,
  );
}
