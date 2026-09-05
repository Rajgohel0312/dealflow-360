import * as customerRepo from "./customers.repository.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ROLES } from "../../shared/constants/roles.js";

/**
 * Fetch customer based on user role (Admins can access any customer, Sales Reps can only access assigned customers)
 */
async function getCustomerForUser(customerId, user) {
  if (user?.role_id === ROLES.ADMIN) {
    return customerRepo.findCustomerById(customerId);
  }
  return customerRepo.findCustomerByIdForSalesRep(customerId, user?.id);
}

/*
|--------------------------------------------------------------------------
| CUSTOMER COMPANY
|--------------------------------------------------------------------------
*/

/**
 * Create Customer Company
 */
export const registerCustomerUser = async (req, res) => {
  const payload = {
    ...req.body,
    sales_rep_id: req.user?.id,
  };

  const existingCustomer = await customerRepo.findCustomerByEmail(payload.email);

  if (existingCustomer) {
    throw new AppError("Customer with this email already exists", 409);
  }

  const customer = await customerRepo.registerCustomerUser(payload);

  return res.status(201).json({
    success: true,
    message: "Customer company registered successfully",
    customer,
  });
};

/**
 * Get all customers for logged-in Sales Rep / Admin
 */
export const findCustomersBySalesRepId = async (req, res) => {
  let customers;
  if (req.user?.role_id === ROLES.ADMIN) {
    customers = await customerRepo.findAllCustomers();
  } else {
    customers = await customerRepo.findCustomerForSalesRep(req.user.id);
  }


  return res.status(200).json({
    success: true,
    customers,
  });
};

/**
 * Get single customer for logged-in Sales Rep / Admin
 */
export const findCustomerForSalesByCustomerId = async (req, res) => {
  const { customerId } = req.params;

  const customer = await getCustomerForUser(customerId, req.user);

  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  return res.status(200).json({
    success: true,
    customer,
  });
};

/**
 * Update customer company
 */
export const updateCustomerByIdForSalesRep = async (req, res) => {
  const { customerId } = req.params;
  const data = req.body;

  const customer = await getCustomerForUser(customerId, req.user);

  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  if (
    data.email !== undefined &&
    data.email !== null &&
    data.email !== "" &&
    data.email.toLowerCase() !== customer.email?.toLowerCase()
  ) {
    const existingCustomer = await customerRepo.findCustomerByEmail(
      data.email,
      customerId,
    );

    if (existingCustomer) {
      throw new AppError("Customer with this email already exists", 409);
    }
  }

  const updatedCustomer = await customerRepo.updateCustomerByIdForSalesRep(
    customerId,
    customer.sales_rep_id,
    data,
  );

  if (!updatedCustomer) {
    throw new AppError("Customer update failed", 500);
  }

  return res.status(200).json({
    success: true,
    message: "Customer updated successfully",
    customer: updatedCustomer,
  });
};

/*
|--------------------------------------------------------------------------
| CUSTOMER USER
|--------------------------------------------------------------------------
*/

/**
 * Create Customer User under a customer company
 */
export const createCustomerEmp = async (req, res) => {
  const { customerId } = req.params;
  const data = req.body;

  const customer = await getCustomerForUser(customerId, req.user);

  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  /*
   * Check duplicate email globally across all customer users.
   */
  const existingUser = await customerRepo.findCustomerUserByEmail(data.email);

  if (existingUser) {
    throw new AppError("Customer user with this email already exists", 409);
  }

  const password_hash = await bcrypt.hash(data.password, 10);

  const customerUser = await customerRepo.createCustomerUser({
    customer_id: customerId,
    name: data.name,
    email: data.email,
    password_hash,
  });

  return res.status(201).json({
    success: true,
    message: "Customer user created successfully",
    customerUser,
  });
};

/**
 * Get all users belonging to a customer
 */
export const getCustomerUsers = async (req, res) => {
  const { customerId } = req.params;

  const customer = await getCustomerForUser(customerId, req.user);

  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  const customerUsers = await customerRepo.getCustomerUsers(customerId);

  return res.status(200).json({
    success: true,
    customerUsers,
  });
};

/**
 * Get one customer user
 */
export const getCustomerUserById = async (req, res) => {
  const { customerId, userId } = req.params;

  const customer = await getCustomerForUser(customerId, req.user);

  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  const customerUser = await customerRepo.findCustomerUserById(
    userId,
    customerId,
  );

  if (!customerUser) {
    throw new AppError("Customer user not found", 404);
  }

  return res.status(200).json({
    success: true,
    customerUser,
  });
};

/**
 * Update Customer User
 */
export const updateCustomerUser = async (req, res) => {
  const { customerId, userId } = req.params;
  const data = req.body;

  const customer = await getCustomerForUser(customerId, req.user);

  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  const customerUser = await customerRepo.findCustomerUserById(
    userId,
    customerId,
  );

  if (!customerUser) {
    throw new AppError("Customer user not found", 404);
  }

  if (
    data.email !== undefined &&
    data.email.toLowerCase() !== customerUser.email.toLowerCase()
  ) {
    const existingUser = await customerRepo.findCustomerUserByEmail(data.email);

    if (existingUser && existingUser.id !== userId) {
      throw new AppError("Customer user with this email already exists", 409);
    }
  }

  const updatedUser = await customerRepo.updateCustomerUser(
    userId,
    customerId,
    data,
  );

  if (!updatedUser) {
    throw new AppError("Customer user update failed", 500);
  }

  return res.status(200).json({
    success: true,
    message: "Customer user updated successfully",
    customerUser: updatedUser,
  });
};

/*
|--------------------------------------------------------------------------
| CUSTOMER USER LOGIN
|--------------------------------------------------------------------------
*/

export const loginCustomerUser = async (req, res) => {
  const { email, password } = req.body;

  const customer = await customerRepo.findCustomerUserByEmail(email);

  if (!customer) {
    throw new AppError("Invalid Credentials", 401);
  }

  if (!customer.is_active) {
    throw new AppError("Customer user is inactive", 403);
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    customer.password_hash,
  );

  if (!isPasswordValid) {
    throw new AppError("Invalid Credentials", 401);
  }

  if (customer.must_change_password) {
    const changePasswordToken = jwt.sign(
      {
        customer_id: customer.customer_id,
        user_type: "CUSTOMER",
        purpose: "CHANGE_PASSWORD",
      },
      process.env.JWT_SECRET,
      {
        subject: customer.id,
        expiresIn: "15m",
      },
    );

    return res.status(200).json({
      success: true,
      message: "Password change required",
      must_change_password: true,
      change_password_token: changePasswordToken,
      customerUser: {
        id: customer.id,
        customer_id: customer.customer_id,
        name: customer.name,
        email: customer.email,
      },
    });
  }

  const token = jwt.sign(
    {
      customer_id: customer.customer_id,
      user_type: "CUSTOMER",
    },
    process.env.JWT_SECRET,
    {
      subject: customer.id,
      expiresIn: "1d",
    },
  );

  return res.status(200).json({
    success: true,
    message: "Customer login successful",
    must_change_password: false,
    token,
    customerUser: {
      id: customer.id,
      customer_id: customer.customer_id,
      name: customer.name,
      email: customer.email,
    },
  });
};

/*
|--------------------------------------------------------------------------
| CUSTOMER PASSWORD CHANGE
|--------------------------------------------------------------------------
*/

/**
 * Change Customer User Password
 */
export const changeCustomerPassword = async (req, res) => {
  const customerUserId = req.user.id;
  const currentPassword = req.body.current_password || req.body.currentPassword;
  const newPassword = req.body.new_password || req.body.newPassword;

  if (!currentPassword || !newPassword) {
    throw new AppError("current_password and new_password are required", 400);
  }

  const customer =
    await customerRepo.findCustomerUserForPasswordChange(customerUserId);

  if (!customer) {
    throw new AppError("Customer user not found", 404);
  }

  if (!customer.is_active) {
    throw new AppError("Customer user is inactive", 403);
  }

  const isCurrentPasswordValid = await bcrypt.compare(
    currentPassword,
    customer.password_hash,
  );

  if (!isCurrentPasswordValid) {
    throw new AppError("Current password is incorrect", 401);
  }

  const isSamePassword = await bcrypt.compare(
    newPassword,
    customer.password_hash,
  );

  if (isSamePassword) {
    throw new AppError(
      "New password must be different from current password",
      400,
    );
  }

  const password_hash = await bcrypt.hash(newPassword, 10);

  const updatedCustomer = await customerRepo.changeCustomerPassword(
    customerUserId,
    password_hash,
  );

  if (!updatedCustomer) {
    throw new AppError("Password update failed", 500);
  }

  const token = jwt.sign(
    {
      customer_id: updatedCustomer.customer_id,
      user_type: "CUSTOMER",
    },
    process.env.JWT_SECRET,
    {
      subject: updatedCustomer.id,
      expiresIn: "1d",
    },
  );

  return res.status(200).json({
    success: true,
    message: "Password changed successfully",
    token,
    customerUser: {
      id: updatedCustomer.id,
      customer_id: updatedCustomer.customer_id,
      name: updatedCustomer.name,
      email: updatedCustomer.email,
    },
  });
};
