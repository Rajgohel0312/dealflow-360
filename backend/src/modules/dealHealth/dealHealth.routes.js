import { getDealHealth } from "./dealHealth.controllers.js";
import { authenticateEmployee, authorize } from "../../middleware/auth.middleware.js";

const ALL_ROLES = ["Admin", "Sales Rep", "Manager", "Finance", "Operations"];

export default function dealHealthRoutes(app, prefix) {
  app.route("GET", `${prefix}/quotations/:id/health`, authenticateEmployee, authorize(...ALL_ROLES), getDealHealth);
}
