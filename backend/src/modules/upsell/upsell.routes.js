import { getRecommendationsForCustomer, createQuotationFromRecommendation } from "./upsell.controllers.js";
import { validate } from "../../middleware/validate.js";
import { createQuotationFromRecSchema } from "./upsell.validations.js";
import { authenticateEmployee, authorize } from "../../middleware/auth.middleware.js";

const ALL_ROLES = ["Admin", "Sales Rep", "Manager", "Finance", "Operations", "ADMIN", "SALES_REP", "MANAGER", "FINANCE", "OPERATIONS"];
const CAN_CREATE_QTN = ["Admin", "Sales Rep", "ADMIN", "SALES_REP"];

export default function upsellRoutes(app, prefix) {
  app.route("GET",  `${prefix}/customers/:customerId/recommendations`,   authenticateEmployee, authorize(...ALL_ROLES), getRecommendationsForCustomer);
  app.route("POST", `${prefix}/recommendations/create-quotation`,        authenticateEmployee, authorize(...CAN_CREATE_QTN), validate(createQuotationFromRecSchema), createQuotationFromRecommendation);
}
