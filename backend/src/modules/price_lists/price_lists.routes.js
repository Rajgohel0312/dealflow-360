import {
  createPriceList,
  getPriceLists,
  getPriceListById,
  updatePriceList,
  addPriceListItem,
  getPriceListItems,
  updatePriceListItem,
  deletePriceListItem,
} from "./price_lists.controllers.js";
import { validate } from "../../middleware/validate.js";
import {
  createPriceListSchema,
  updatePriceListSchema,
  createPriceListItemSchema,
  updatePriceListItemSchema,
} from "./price_lists.validations.js";
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

export default function priceListRoutes(app, prefix) {
  // Price Lists
  app.route(
    "POST",
    `${prefix}/price-lists`,
    authenticateEmployee,
    authorize(ROLES.ADMIN),
    validate(createPriceListSchema),
    createPriceList
  );

  app.route(
    "GET",
    `${prefix}/price-lists`,
    authenticateEmployee,
    authorize(...ALL_EMPLOYEE_ROLES),
    getPriceLists
  );

  app.route(
    "GET",
    `${prefix}/price-lists/:id`,
    authenticateEmployee,
    authorize(...ALL_EMPLOYEE_ROLES),
    getPriceListById
  );

  app.route(
    "PATCH",
    `${prefix}/price-lists/:id`,
    authenticateEmployee,
    authorize(ROLES.ADMIN),
    validate(updatePriceListSchema),
    updatePriceList
  );

  // Price List Items
  app.route(
    "POST",
    `${prefix}/price-lists/:priceListId/items`,
    authenticateEmployee,
    authorize(ROLES.ADMIN),
    validate(createPriceListItemSchema),
    addPriceListItem
  );

  app.route(
    "GET",
    `${prefix}/price-lists/:priceListId/items`,
    authenticateEmployee,
    authorize(...ALL_EMPLOYEE_ROLES),
    getPriceListItems
  );

  app.route(
    "PATCH",
    `${prefix}/price-lists/:priceListId/items/:itemId`,
    authenticateEmployee,
    authorize(ROLES.ADMIN),
    validate(updatePriceListItemSchema),
    updatePriceListItem
  );

  app.route(
    "DELETE",
    `${prefix}/price-lists/:priceListId/items/:itemId`,
    authenticateEmployee,
    authorize(ROLES.ADMIN),
    deletePriceListItem
  );
}
