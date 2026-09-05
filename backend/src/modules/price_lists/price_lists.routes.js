import {
  createPriceList, getPriceLists, getPriceListById, updatePriceList,
  addPriceListItem, getPriceListItems, updatePriceListItem, deletePriceListItem,
} from "./price_lists.controllers.js";
import { validate } from "../../middleware/validate.js";
import {
  createPriceListSchema, updatePriceListSchema,
  createPriceListItemSchema, updatePriceListItemSchema,
} from "./price_lists.validations.js";
import { authenticateEmployee, authorize } from "../../middleware/auth.middleware.js";

const ALL_ROLES = ["Admin", "Sales Rep", "Manager", "Finance", "Operations"];

export default function priceListRoutes(app, prefix) {
  // Price Lists
  app.route("POST",   `${prefix}/price-lists`,                           authenticateEmployee, authorize("Admin"), validate(createPriceListSchema), createPriceList);
  app.route("GET",    `${prefix}/price-lists`,                           authenticateEmployee, authorize(...ALL_ROLES), getPriceLists);
  app.route("GET",    `${prefix}/price-lists/:id`,                       authenticateEmployee, authorize(...ALL_ROLES), getPriceListById);
  app.route("PATCH",  `${prefix}/price-lists/:id`,                       authenticateEmployee, authorize("Admin"), validate(updatePriceListSchema), updatePriceList);
  // Price List Items
  app.route("POST",   `${prefix}/price-lists/:priceListId/items`,        authenticateEmployee, authorize("Admin"), validate(createPriceListItemSchema), addPriceListItem);
  app.route("GET",    `${prefix}/price-lists/:priceListId/items`,        authenticateEmployee, authorize(...ALL_ROLES), getPriceListItems);
  app.route("PATCH",  `${prefix}/price-lists/:priceListId/items/:itemId`,authenticateEmployee, authorize("Admin"), validate(updatePriceListItemSchema), updatePriceListItem);
  app.route("DELETE", `${prefix}/price-lists/:priceListId/items/:itemId`,authenticateEmployee, authorize("Admin"), deletePriceListItem);
}
