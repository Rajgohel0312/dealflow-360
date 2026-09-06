import { createDiscountRule, getDiscountRules, getDiscountRuleById, updateDiscountRule, deleteDiscountRule } from "./discounts.controllers.js";
import { validate } from "../../middleware/validate.js";
import { createDiscountRuleSchema, updateDiscountRuleSchema } from "./discounts.validations.js";
import { authenticateEmployee, authorize } from "../../middleware/auth.middleware.js";

const ALL_ROLES = ["Admin", "Sales Rep", "Manager", "Finance", "Operations"];

export default function discountRoutes(app, prefix) {
  app.route("POST",   `${prefix}/discount-rules`,     authenticateEmployee, authorize("Admin"), validate(createDiscountRuleSchema), createDiscountRule);
  app.route("GET",    `${prefix}/discount-rules`,     authenticateEmployee, authorize(...ALL_ROLES), getDiscountRules);
  app.route("GET",    `${prefix}/discount-rules/:id`, authenticateEmployee, authorize(...ALL_ROLES), getDiscountRuleById);
  app.route("PATCH",  `${prefix}/discount-rules/:id`, authenticateEmployee, authorize("Admin"), validate(updateDiscountRuleSchema), updateDiscountRule);
  app.route("DELETE", `${prefix}/discount-rules/:id`, authenticateEmployee, authorize("Admin"), deleteDiscountRule);
}
