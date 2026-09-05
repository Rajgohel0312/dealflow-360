import { loginUser, logoutUser, profile, registerUser } from "./auth.controllers.js";
import { validate } from "../../middleware/validate.js";
import { authenticateEmployee } from "../../middleware/auth.middleware.js";
import { checkAuthDelay } from "../../middleware/progressiveAuthDelay.middleware.js";
import { rateLimiter } from "../../middleware/rateLimiter.middleware.js";
import { loginUserSchema, registerUserSchema } from "./auth.validations.js";

export default function authRoutes(app, prefix) {
  app.route(
    "POST",
    `${prefix}/auth/register`,
    rateLimiter({ windowSec: 300, max: 10, keyPrefix: 'auth_register' }),
    checkAuthDelay,
    validate(registerUserSchema),
    registerUser,
  );

  app.route(
    "POST",
    `${prefix}/auth/login`,
    rateLimiter({ windowSec: 300, max: 15, keyPrefix: 'auth_login' }),
    checkAuthDelay,
    validate(loginUserSchema),
    loginUser,
  );

  app.route(
    "POST",
    `${prefix}/auth/logout`,
    authenticateEmployee,
    logoutUser,
  );

  app.route(
    "GET",
    `${prefix}/me/profile`,
    authenticateEmployee,
    profile,
  );
}
