import { createProduct, getProducts, getProductById, updateProduct } from "./products.controllers.js";
import { validate } from "../../middleware/validate.js";
import { createProductSchema, updateProductSchema } from "./products.validations.js";
import { authenticateEmployee, authorize } from "../../middleware/auth.middleware.js";

const ALL_ROLES = ["Admin", "Sales Rep", "Manager", "Finance", "Operations"];

export default function productRoutes(app, prefix) {
  app.route("POST",  `${prefix}/products`,     authenticateEmployee, authorize("Admin"), validate(createProductSchema), createProduct);
  app.route("GET",   `${prefix}/products`,     authenticateEmployee, authorize(...ALL_ROLES), getProducts);
  app.route("GET",   `${prefix}/products/:id`, authenticateEmployee, authorize(...ALL_ROLES), getProductById);
  app.route("PATCH", `${prefix}/products/:id`, authenticateEmployee, authorize("Admin"), validate(updateProductSchema), updateProduct);
}
