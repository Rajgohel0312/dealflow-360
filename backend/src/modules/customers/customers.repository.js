import {
  sql,
  insertOne,
  updateById,
  findOne,
  findMany,
} from "../../infrastructure/database/index.js";

/*
|--------------------------------------------------------------------------
| CUSTOMER COMPANY
|--------------------------------------------------------------------------
*/

/**
 * Create customer company
 */
export const registerCustomerUser = (data) => insertOne("customers", data);

/**
 * Find customer by ID (Admin / Direct lookup)
 */
export const findCustomerById = (customerId) =>
  findOne("customers", { id: customerId });

/**
 * Find all customers (Admin view)
 */
export const findAllCustomers = () =>
  findMany("customers", {}, "*", {
    orderBy: "created_at DESC",
  });

/**
 * Find one customer belonging to a Sales Rep
 */
export const findCustomerByIdForSalesRep = (customerId, salesRepId) =>
  findOne("customers", { id: customerId, sales_rep_id: salesRepId });



/**
 * Find all customers belonging to a Sales Rep
 */
export const findCustomerForSalesRep = (salesRepId) =>
  findMany("customers", { sales_rep_id: salesRepId }, "*", {
    orderBy: "created_at DESC",
  });

/**
 * Find customer by email
 *
 * Used for duplicate customer checking.
 */
export const findCustomerByEmail = async (
  email,
  excludeCustomerId = null,
) => {
  const result = await sql`
    SELECT id, name, email
    FROM customers
    WHERE LOWER(email) = LOWER(${email})
      AND (
        ${excludeCustomerId}::uuid IS NULL
        OR id <> ${excludeCustomerId}
      )
    LIMIT 1
  `;

  return result.rows[0] || null;
};

/**
 * Update customer company
 *
 * Only updates fields supplied in the request.
 */
export const updateCustomerByIdForSalesRep = async (
  customerId,
  salesRepId,
  data,
) => {
  const customer = await findOne("customers", {
    id: customerId,
    sales_rep_id: salesRepId,
  });
  if (!customer) return null;
  return updateById("customers", customerId, data);
};

/*
|--------------------------------------------------------------------------
| CUSTOMER USER
|--------------------------------------------------------------------------
*/

/**
 * Create customer user
 */
export const createCustomerUser = (data) =>
  insertOne("customer_users", {
    ...data,
    must_change_password: true,
  });

/**
 * Find customer user by ID
 */
export const findCustomerUserById = (customerUserId, customerId) =>
  findOne("customer_users", { id: customerUserId, customer_id: customerId });

/**
 * Find customer user by email
 */
export const findCustomerUserByEmail = async (email) => {
  const result = await sql`
    SELECT
      id,
      customer_id,
      name,
      email,
      password_hash,
      is_active,
      must_change_password
    FROM customer_users
    WHERE LOWER(email) = LOWER(${email})
    LIMIT 1
  `;

  return result.rows[0] || null;
};

/**
 * Find customer user by customer + email
 */
export const findCustomerUserByCustomerAndEmail = async (
  customerId,
  email,
  excludeUserId = null,
) => {
  const result = await sql`
    SELECT id, customer_id, name, email
    FROM customer_users
    WHERE customer_id = ${customerId}
      AND LOWER(email) = LOWER(${email})
      AND (
        ${excludeUserId}::uuid IS NULL
        OR id <> ${excludeUserId}
      )
    LIMIT 1
  `;

  return result.rows[0] || null;
};

/**
 * Get all users belonging to a customer
 */
export const getCustomerUsers = (customerId) =>
  findMany("customer_users", { customer_id: customerId }, "*", {
    orderBy: "created_at DESC",
  });

/**
 * Update customer user
 */
export const updateCustomerUser = async (customerUserId, customerId, data) => {
  const user = await findOne("customer_users", {
    id: customerUserId,
    customer_id: customerId,
  });
  if (!user) return null;
  return updateById("customer_users", customerUserId, data);
};

/*
|--------------------------------------------------------------------------
| CUSTOMER PASSWORD
|--------------------------------------------------------------------------
*/

/**
 * Find customer user for password change
 */
export const findCustomerUserForPasswordChange = (customerUserId) =>
  findOne("customer_users", { id: customerUserId });

/**
 * Change customer password
 */
export const changeCustomerPassword = (customerUserId, passwordHash) =>
  updateById("customer_users", customerUserId, {
    password_hash: passwordHash,
    must_change_password: false,
  });
