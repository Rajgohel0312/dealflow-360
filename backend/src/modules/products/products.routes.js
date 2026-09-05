import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
} from "./products.controllers.js";
import { validate } from "../../middleware/validate.js";
import {
  createProductSchema,
  updateProductSchema,
} from "./products.validations.js";
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

export default function productRoutes(app, prefix) {
  // Create product (Admin only)
  app.route(
    "POST",
    `${prefix}/products`,
    authenticateEmployee,
    authorize(ROLES.ADMIN),
    validate(createProductSchema),
    createProduct
  );

  // Get all products (All employee roles)
  app.route(
    "GET",
    `${prefix}/products`,
    authenticateEmployee,
    authorize(...ALL_EMPLOYEE_ROLES),
    getProducts
  );

  // Get product by ID (All employee roles)
  app.route(
    "GET",
    `${prefix}/products/:id`,
    authenticateEmployee,
    authorize(...ALL_EMPLOYEE_ROLES),
    getProductById
  );

  // Update product (Admin only)
  app.route(
    "PATCH",
    `${prefix}/products/:id`,
    authenticateEmployee,
    authorize(ROLES.ADMIN),
    validate(updateProductSchema),
    updateProduct
  );
}
