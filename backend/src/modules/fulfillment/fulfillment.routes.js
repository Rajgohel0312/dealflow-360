import {
  createFulfillmentForOrder, getFulfillments, getFulfillmentById,
  pickFulfillment, packFulfillment, shipFulfillment, deliverFulfillment,
} from "./fulfillment.controllers.js";
import { validate } from "../../middleware/validate.js";
import { createFulfillmentSchema, shipFulfillmentSchema } from "./fulfillment.validations.js";
import { authenticateEmployee, authorize } from "../../middleware/auth.middleware.js";

const ALL_ROLES = ["Admin", "Sales Rep", "Manager", "Finance", "Operations"];
const OPS       = ["Admin", "Operations"];

export default function fulfillmentRoutes(app, prefix) {
  app.route("POST", `${prefix}/orders/:orderId/fulfillment`,  authenticateEmployee, authorize(...OPS), validate(createFulfillmentSchema), createFulfillmentForOrder);
  app.route("GET",  `${prefix}/fulfillments`,                 authenticateEmployee, authorize(...ALL_ROLES), getFulfillments);
  app.route("GET",  `${prefix}/fulfillments/:id`,             authenticateEmployee, authorize(...ALL_ROLES), getFulfillmentById);
  app.route("POST", `${prefix}/fulfillments/:id/pick`,        authenticateEmployee, authorize(...OPS), pickFulfillment);
  app.route("POST", `${prefix}/fulfillments/:id/pack`,        authenticateEmployee, authorize(...OPS), packFulfillment);
  app.route("POST", `${prefix}/fulfillments/:id/ship`,        authenticateEmployee, authorize(...OPS), validate(shipFulfillmentSchema), shipFulfillment);
  app.route("POST", `${prefix}/fulfillments/:id/deliver`,     authenticateEmployee, authorize(...OPS), deliverFulfillment);
}
