import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import { ROLES } from "../../shared/constants/roles.js";
import { changeRole } from "./admin.controllers.js";
import { validate } from "../../middleware/validate.js";
import { changeRoleSchema } from "./admin.validations.js";

export default function adminRoutes(app, prefix) {
  app.route(
    "patch",
    `${prefix}/admin/users/:id/role`,
    authenticate,
    authorize(ROLES.ADMIN),
    validate(changeRoleSchema),
    changeRole,
  );
}
