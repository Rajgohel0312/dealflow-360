import { convertQuotationToOrder, getOrders, getOrderById } from "./orders.controllers.js";
import { authenticateEmployee, authorize } from "../../middleware/auth.middleware.js";

const ALL_ROLES = ["Admin", "Sales Rep", "Manager", "Finance", "Operations"];
const CAN_CONVERT = ["Admin", "Sales Rep", "Operations"];

export default function orderRoutes(app, prefix) {
  app.route("POST", `${prefix}/orders/from-quotation/:quotationId`, authenticateEmployee, authorize(...CAN_CONVERT), convertQuotationToOrder);
  app.route("GET",  `${prefix}/orders`,                             authenticateEmployee, authorize(...ALL_ROLES), getOrders);
  app.route("GET",  `${prefix}/orders/:id`,                         authenticateEmployee, authorize(...ALL_ROLES), getOrderById);
}
