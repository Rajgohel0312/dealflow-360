import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
} from "./categories.controllers.js";
import { validate } from "../../middleware/validate.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./categories.validations.js";
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

export default function categoryRoutes(app, prefix) {
  // Create category (Admin only)
  app.route(
    "POST",
    `${prefix}/categories`,
    authenticateEmployee,
    authorize(ROLES.ADMIN),
    validate(createCategorySchema),
    createCategory
  );

  // Get all categories (All employee roles)
  app.route(
    "GET",
    `${prefix}/categories`,
    authenticateEmployee,
    authorize(...ALL_EMPLOYEE_ROLES),
    getCategories
  );

  // Get category by ID (All employee roles)
  app.route(
    "GET",
    `${prefix}/categories/:id`,
    authenticateEmployee,
    authorize(...ALL_EMPLOYEE_ROLES),
    getCategoryById
  );

  // Update category (Admin only)
  app.route(
    "PATCH",
    `${prefix}/categories/:id`,
    authenticateEmployee,
    authorize(ROLES.ADMIN),
    validate(updateCategorySchema),
    updateCategory
  );
}
