import {
  createDiscountRule,
  getDiscountRules,
  getDiscountRuleById,
  updateDiscountRule,
} from "./discounts.controllers.js";
import { validate } from "../../middleware/validate.js";
import {
  createDiscountRuleSchema,
  updateDiscountRuleSchema,
} from "./discounts.validations.js";
import {
  authenticateEmployee,
  authorize,
} from "../../middleware/auth.middleware.js";
import { ROLES } from "../../shared/constants/roles.js";

const ALL_EMPLOYEE_ROLES = [
  ROLES.ADMIN,
  ROLES.SALES_REP,
  ROLES.MANAGER,
  ROLES.FINANCE,
  ROLES.OPERATIONS,
];

export default function discountRoutes(app, prefix) {
  app.route(
    "POST",
    `${prefix}/discount-rules`,
    authenticateEmployee,
    authorize(ROLES.ADMIN),
    validate(createDiscountRuleSchema),
    createDiscountRule
  );

  app.route(
    "GET",
    `${prefix}/discount-rules`,
    authenticateEmployee,
    authorize(...ALL_EMPLOYEE_ROLES),
    getDiscountRules
  );

  app.route(
    "GET",
    `${prefix}/discount-rules/:id`,
    authenticateEmployee,
    authorize(...ALL_EMPLOYEE_ROLES),
    getDiscountRuleById
  );

  app.route(
    "PATCH",
    `${prefix}/discount-rules/:id`,
    authenticateEmployee,
    authorize(ROLES.ADMIN),
    validate(updateDiscountRuleSchema),
    updateDiscountRule
  );
}
