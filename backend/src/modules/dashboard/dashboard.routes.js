import { getDashboard } from "./dashboard.controllers.js";
import { authenticateAnyUser } from "../../middleware/auth.middleware.js";

export default function dashboardRoutes(app, prefix) {
  app.route("GET", `${prefix}/dashboard`, authenticateAnyUser, getDashboard);
}
