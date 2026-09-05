import {
  createQuotation,
  getQuotations,
  getQuotationById,
  updateQuotation,
  addQuotationItem,
  updateQuotationItem,
  deleteQuotationItem,
  submitQuotation,
  getPendingApprovals,
  approveQuotation,
  rejectQuotation,
} from "./quotations.controllers.js";
import { validate } from "../../middleware/validate.js";
import {
  createQuotationSchema,
  updateQuotationSchema,
  addQuotationItemSchema,
  updateQuotationItemSchema,
  approvalActionSchema,
} from "./quotations.validations.js";
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

export default function quotationRoutes(app, prefix) {
  // Pending Approvals (Manager / Finance / Admin)
  app.route(
    "GET",
    `${prefix}/quotations/approvals/pending`,
    authenticateEmployee,
    authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.FINANCE),
    getPendingApprovals
  );

  // Header operations
  app.route(
    "POST",
    `${prefix}/quotations`,
    authenticateEmployee,
    authorize(ROLES.SALES_REP, ROLES.ADMIN),
    validate(createQuotationSchema),
    createQuotation
  );

  app.route(
    "GET",
    `${prefix}/quotations`,
    authenticateEmployee,
    authorize(...ALL_EMPLOYEE_ROLES),
    getQuotations
  );

  app.route(
    "GET",
    `${prefix}/quotations/:id`,
    authenticateEmployee,
    authorize(...ALL_EMPLOYEE_ROLES),
    getQuotationById
  );

  app.route(
    "PATCH",
    `${prefix}/quotations/:id`,
    authenticateEmployee,
    authorize(ROLES.SALES_REP, ROLES.ADMIN),
    validate(updateQuotationSchema),
    updateQuotation
  );

  // Line Items
  app.route(
    "POST",
    `${prefix}/quotations/:id/items`,
    authenticateEmployee,
    authorize(ROLES.SALES_REP, ROLES.ADMIN),
    validate(addQuotationItemSchema),
    addQuotationItem
  );

  app.route(
    "PATCH",
    `${prefix}/quotations/:id/items/:itemId`,
    authenticateEmployee,
    authorize(ROLES.SALES_REP, ROLES.ADMIN),
    validate(updateQuotationItemSchema),
    updateQuotationItem
  );

  app.route(
    "DELETE",
    `${prefix}/quotations/:id/items/:itemId`,
    authenticateEmployee,
    authorize(ROLES.SALES_REP, ROLES.ADMIN),
    deleteQuotationItem
  );

  // Submit & Approval Workflow
  app.route(
    "POST",
    `${prefix}/quotations/:id/submit`,
    authenticateEmployee,
    authorize(ROLES.SALES_REP, ROLES.ADMIN),
    submitQuotation
  );

  app.route(
    "POST",
    `${prefix}/quotations/:id/approve`,
    authenticateEmployee,
    authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.FINANCE),
    validate(approvalActionSchema),
    approveQuotation
  );

  app.route(
    "POST",
    `${prefix}/quotations/:id/reject`,
    authenticateEmployee,
    authorize(ROLES.ADMIN, ROLES.MANAGER, ROLES.FINANCE),
    validate(approvalActionSchema),
    rejectQuotation
  );
}
