import { createInvoiceFromOrder, getInvoices, getInvoiceById, issueInvoice, sendInvoiceEmail } from "./invoices.controllers.js";
import { authenticateEmployee, authorize } from "../../middleware/auth.middleware.js";

const ALL_ROLES = ["Admin", "Sales Rep", "Manager", "Finance", "Operations"];
const FIN = ["Admin", "Finance", "Sales Rep"];

export default function invoiceRoutes(app, prefix) {
  app.route("POST", `${prefix}/orders/:orderId/invoice`, authenticateEmployee, authorize(...FIN), createInvoiceFromOrder);
  app.route("GET",  `${prefix}/invoices`,                authenticateEmployee, authorize(...ALL_ROLES), getInvoices);
  app.route("GET",  `${prefix}/invoices/:id`,            authenticateEmployee, authorize(...ALL_ROLES), getInvoiceById);
  app.route("POST", `${prefix}/invoices/:id/issue`,      authenticateEmployee, authorize(...FIN), issueInvoice);
  app.route("POST", `${prefix}/invoices/:id/send-email`, authenticateEmployee, authorize(...FIN), sendInvoiceEmail);
}
