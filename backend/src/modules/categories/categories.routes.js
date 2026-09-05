import { createCategory, getCategories, getCategoryById, updateCategory } from "./categories.controllers.js";
import { validate } from "../../middleware/validate.js";
import { createCategorySchema, updateCategorySchema } from "./categories.validations.js";
import { authenticateEmployee, authorize } from "../../middleware/auth.middleware.js";

const ALL_ROLES = ["Admin", "Sales Rep", "Manager", "Finance", "Operations"];

export default function categoryRoutes(app, prefix) {
  app.route("POST", `${prefix}/categories`, authenticateEmployee, authorize("Admin"), validate(createCategorySchema), createCategory);
  app.route("GET",  `${prefix}/categories`, authenticateEmployee, authorize(...ALL_ROLES), getCategories);
  app.route("GET",  `${prefix}/categories/:id`, authenticateEmployee, authorize(...ALL_ROLES), getCategoryById);
  app.route("PATCH",`${prefix}/categories/:id`, authenticateEmployee, authorize("Admin"), validate(updateCategorySchema), updateCategory);
}
