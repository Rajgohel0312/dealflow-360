import {
  createQuotation, getQuotations, getQuotationById, updateQuotation, deleteQuotation,
  addQuotationItem, updateQuotationItem, deleteQuotationItem,
  submitQuotation, getPendingApprovals, approveQuotation, rejectQuotation,
} from "./quotations.controllers.js";
import { validate } from "../../middleware/validate.js";
import {
  createQuotationSchema, updateQuotationSchema, addQuotationItemSchema,
  updateQuotationItemSchema, approvalActionSchema,
} from "./quotations.validations.js";
import { authenticateEmployee, authenticateAnyUser, authorize } from "../../middleware/auth.middleware.js";

const ALL_ROLES   = ["Admin", "Sales Rep", "Manager", "Finance", "Operations", "ADMIN", "SALES_REP", "MANAGER", "FINANCE", "OPERATIONS"];
const APPROVAL    = ["Admin", "Manager", "Finance", "ADMIN", "MANAGER", "FINANCE"];
const CAN_CREATE  = ["Admin", "Sales Rep", "ADMIN", "SALES_REP"];

export default function quotationRoutes(app, prefix) {
  // Pending Approvals
  app.route("GET",    `${prefix}/quotations/approvals/pending`,   authenticateEmployee, authorize(...APPROVAL), getPendingApprovals);
  // Header CRUD
  app.route("POST",   `${prefix}/quotations`,                     authenticateEmployee, authorize(...CAN_CREATE), validate(createQuotationSchema), createQuotation);
  app.route("GET",    `${prefix}/quotations`,                     authenticateEmployee, authorize(...ALL_ROLES), getQuotations);
  app.route("GET",    `${prefix}/quotations/:id`,                 authenticateAnyUser, getQuotationById);
  app.route("PATCH",  `${prefix}/quotations/:id`,                 authenticateEmployee, authorize(...CAN_CREATE), validate(updateQuotationSchema), updateQuotation);
  app.route("DELETE", `${prefix}/quotations/:id`,                 authenticateEmployee, authorize(...CAN_CREATE), deleteQuotation);
  // Line Items
  app.route("POST",   `${prefix}/quotations/:id/items`,           authenticateEmployee, authorize(...CAN_CREATE), validate(addQuotationItemSchema), addQuotationItem);
  app.route("PATCH",  `${prefix}/quotations/:id/items/:itemId`,   authenticateEmployee, authorize(...CAN_CREATE), validate(updateQuotationItemSchema), updateQuotationItem);
  app.route("DELETE", `${prefix}/quotations/:id/items/:itemId`,   authenticateEmployee, authorize(...CAN_CREATE), deleteQuotationItem);
  // Workflow
  app.route("POST",   `${prefix}/quotations/:id/submit`,          authenticateEmployee, authorize(...CAN_CREATE), submitQuotation);
  app.route("POST",   `${prefix}/quotations/:id/approve`,         authenticateEmployee, authorize(...APPROVAL), validate(approvalActionSchema), approveQuotation);
  app.route("POST",   `${prefix}/quotations/:id/reject`,          authenticateEmployee, authorize(...APPROVAL), validate(approvalActionSchema), rejectQuotation);
}
