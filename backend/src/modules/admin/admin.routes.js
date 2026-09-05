import { authenticateEmployee, authorize } from "../../middleware/auth.middleware.js";
import { changeRole, listUsers, listRoles } from "./admin.controllers.js";
import { validate } from "../../middleware/validate.js";
import { changeRoleSchema } from "./admin.validations.js";

const APPROVAL = ["Admin", "Manager"];

export default function adminRoutes(app, prefix) {
  app.route(
    "GET",
    `${prefix}/admin/users`,
    authenticateEmployee,
    authorize(...APPROVAL),
    listUsers
  );

  app.route(
    "GET",
    `${prefix}/admin/roles`,
    authenticateEmployee,
    authorize(...APPROVAL),
    listRoles
  );

  app.route(
    "PATCH",
    `${prefix}/admin/users/:id/role`,
    authenticateEmployee,
    authorize("Admin"),
    validate(changeRoleSchema),
    changeRole
  );
}
