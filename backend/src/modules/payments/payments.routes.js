import { recordPayment, getPaymentsByInvoice, getPaymentById } from "./payments.controllers.js";
import { validate } from "../../middleware/validate.js";
import { recordPaymentSchema } from "./payments.validations.js";
import { authenticateEmployee, authorize } from "../../middleware/auth.middleware.js";

const ALL_ROLES = ["Admin", "Sales Rep", "Manager", "Finance", "Operations"];
const CAN_RECORD = ["Admin", "Finance", "Sales Rep"];

export default function paymentRoutes(app, prefix) {
  app.route("POST", `${prefix}/invoices/:invoiceId/payments`,  authenticateEmployee, authorize(...CAN_RECORD), validate(recordPaymentSchema), recordPayment);
  app.route("GET",  `${prefix}/invoices/:invoiceId/payments`,  authenticateEmployee, authorize(...ALL_ROLES), getPaymentsByInvoice);
  app.route("GET",  `${prefix}/payments/:id`,                  authenticateEmployee, authorize(...ALL_ROLES), getPaymentById);
}
