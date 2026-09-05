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
  authenticateCustomerPasswordChange,
  authorize,
} from "../../middleware/auth.middleware.js";

import { ROLES } from "../../shared/constants/roles.js";

export default function customerRoutes(app, prefix) {
  /*
  |--------------------------------------------------------------------------
  | CUSTOMER COMPANY
  |--------------------------------------------------------------------------
  */

  // Create customer company
  app.route(
    "POST",
    `${prefix}/customer/company`,
    authenticateEmployee,
    authorize(ROLES.ADMIN, ROLES.SALES_REP),
    validate(createCustomerSchema),
    registerCustomerUser,
  );

  // Get all customers belonging to Sales Rep / Admin
  app.route(
    "GET",
    `${prefix}/customer/company`,
    authenticateEmployee,
    authorize(ROLES.ADMIN, ROLES.SALES_REP),
    findCustomersBySalesRepId,
  );

  // Get one customer
  app.route(
    "GET",
    `${prefix}/customer/company/:customerId`,
    authenticateEmployee,
    authorize(ROLES.ADMIN, ROLES.SALES_REP),
    findCustomerForSalesByCustomerId,
  );

  // Update customer company
  app.route(
    "PATCH",
    `${prefix}/customer/company/:customerId`,
    authenticateEmployee,
    authorize(ROLES.ADMIN, ROLES.SALES_REP),
    validate(updateCustomerSchema),
    updateCustomerByIdForSalesRep,
  );


  /*
  |--------------------------------------------------------------------------
  | CUSTOMER USERS
  |--------------------------------------------------------------------------
  */

  // Create customer user
  app.route(
    "POST",
    `${prefix}/customer/:customerId/users`,
    authenticateEmployee,
    authorize(ROLES.ADMIN, ROLES.SALES_REP),
    validate(createCustomerEmpSchema),
    createCustomerEmp,
  );

  // Get all users of a customer
  app.route(
    "GET",
    `${prefix}/customer/:customerId/users`,
    authenticateEmployee,
    authorize(ROLES.ADMIN, ROLES.SALES_REP),
    getCustomerUsers,
  );

  // Get one customer user
  app.route(
    "GET",
    `${prefix}/customer/:customerId/users/:userId`,
    authenticateEmployee,
    authorize(ROLES.ADMIN, ROLES.SALES_REP),
    getCustomerUserById,
  );

  // Update customer user
  app.route(
    "PATCH",
    `${prefix}/customer/:customerId/users/:userId`,
    authenticateEmployee,
    authorize(ROLES.ADMIN, ROLES.SALES_REP),
    validate(updateCustomerUserSchema),
    updateCustomerUser,
  );

  /*
  |--------------------------------------------------------------------------
  | CUSTOMER AUTHENTICATION
  |--------------------------------------------------------------------------
  */

  // Customer login
  app.route(
    "POST",
    `${prefix}/customer/auth/login`,
    validate(customerLoginSchema),
    loginCustomerUser,
  );

  // Customer password change
  app.route(
    "POST",
    `${prefix}/customer/auth/change-password`,
    authenticateCustomerPasswordChange,
    validate(changeCustomerPasswordSchema),
    changeCustomerPassword,
  );
}
