import {
  createCustomerEmp,
  loginCustomerUser,
  registerCustomerUser,
  changeCustomerPassword,
  findCustomerForSalesByCustomerId,
  findCustomersBySalesRepId,
  updateCustomerByIdForSalesRep,
  getCustomerUsers,
  getCustomerUserById,
  updateCustomerUser,
  getCustomerPortalSummary,
} from "./customers.controllers.js";

import { validate } from "../../middleware/validate.js";
import {
  changeCustomerPasswordSchema,
  createCustomerEmpSchema,
  createCustomerSchema,
  customerLoginSchema,
  updateCustomerSchema,
  updateCustomerUserSchema,
} from "./customers.validations.js";

import {
  authenticateEmployee,
  authenticateCustomer,
  authenticateCustomerPasswordChange,
  authorize,
} from "../../middleware/auth.middleware.js";

const ALL_ROLES = ["Admin", "Sales Rep", "Manager", "Finance", "Operations"];
const CUSTOMER_MGMT = ["Admin", "Sales Rep", "Manager"];

export default function customerRoutes(app, prefix) {
  // ── Customer Company ──────────────────────────────────────────────
  app.route("POST",  `${prefix}/customer/company`,               authenticateEmployee, authorize(...CUSTOMER_MGMT), validate(createCustomerSchema), registerCustomerUser);
  app.route("GET",   `${prefix}/customer/company`,               authenticateEmployee, authorize(...ALL_ROLES), findCustomersBySalesRepId);
  app.route("GET",   `${prefix}/customer/company/:customerId`,   authenticateEmployee, authorize(...ALL_ROLES), findCustomerForSalesByCustomerId);
  app.route("PATCH", `${prefix}/customer/company/:customerId`,   authenticateEmployee, authorize(...CUSTOMER_MGMT), validate(updateCustomerSchema), updateCustomerByIdForSalesRep);

  // ── Customer Users ────────────────────────────────────────────────
  app.route("POST",  `${prefix}/customer/:customerId/users`,                     authenticateEmployee, authorize(...CUSTOMER_MGMT), validate(createCustomerEmpSchema), createCustomerEmp);
  app.route("GET",   `${prefix}/customer/:customerId/users`,                     authenticateEmployee, authorize(...ALL_ROLES), getCustomerUsers);
  app.route("GET",   `${prefix}/customer/:customerId/users/:userId`,             authenticateEmployee, authorize(...ALL_ROLES), getCustomerUserById);
  app.route("PATCH", `${prefix}/customer/:customerId/users/:userId`,             authenticateEmployee, authorize(...CUSTOMER_MGMT), validate(updateCustomerUserSchema), updateCustomerUser);

  // ── Customer Auth (no employee auth required) ─────────────────────
  app.route("POST", `${prefix}/customer/auth/login`,           validate(customerLoginSchema), loginCustomerUser);
  app.route("POST", `${prefix}/customer/auth/change-password`, authenticateCustomerPasswordChange, validate(changeCustomerPasswordSchema), changeCustomerPassword);

  // ── Customer Portal ───────────────────────────────────────────────
  app.route("GET",  `${prefix}/customer/portal/summary`,       authenticateCustomer, getCustomerPortalSummary);
}
