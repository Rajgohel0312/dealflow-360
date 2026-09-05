import { getExecutiveDashboard } from "./reports.controllers.js";
import { authenticateEmployee, authorize } from "../../middleware/auth.middleware.js";

const ALL_ROLES = ["Admin", "Sales Rep", "Manager", "Finance", "Operations"];

export default function reportRoutes(app, prefix) {
  app.route("GET", `${prefix}/reports/dashboard`, authenticateEmployee, authorize(...ALL_ROLES), getExecutiveDashboard);
}
