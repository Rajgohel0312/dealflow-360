import * as customerRepo from "./customers.repository.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerCustomerUser = async (data) => {
  const registerCompany = await customerRepo.registerCustomerUser(data);

  return registerCompany;
};

export const createCustomerEmp = async (data) => {
  const customer = await customerRepo.findCustomerByIdForSalesRep(
    data.customer_id,
    data.sales_rep_id,
  );

  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  const existingUser = await customerRepo.findCustomerUserByCustomerAndEmail(
    data.customer_id,
    data.email,
  );

  if (existingUser) {
    throw new AppError("Customer user with this email already exists", 409);
  }

  const password_hash = await bcrypt.hash(data.password, 10);

  const customerUser = await customerRepo.createCustomerUser({
    customer_id: data.customer_id,
    name: data.name,
    email: data.email,
    password_hash,
  });

  return customerUser;
};

export const loginCustomerUserByEmail = async (email, password) => {
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

    return {
      must_change_password: true,
      change_password_token: changePasswordToken,
      customerUser: {
        id: customer.id,
        customer_id: customer.customer_id,
        name: customer.name,
        email: customer.email,
      },
    };
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

  return {
    must_change_password: false,
    token,
    customerUser: {
      id: customer.id,
      customer_id: customer.customer_id,
      name: customer.name,
      email: customer.email,
    },
  };
};

export const changeCustomerPassword = async (
  customerUserId,
  currentPassword,
  newPassword,
) => {
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

  return {
    token,
    customerUser: {
      id: updatedCustomer.id,
      customer_id: updatedCustomer.customer_id,
      name: updatedCustomer.name,
      email: updatedCustomer.email,
    },
  };
};

export const findCustomersBySalesRepId = async (salesRepId) => {
  const customer = await customerRepo.findCustomerForSalesRep(salesRepId);
  if (salesRepId !== customer.sales_rep_id) {
    throw new AppError("Not Authorized to access", 404);
  }
  if (!customer) {
    throw new AppError("Sorry No Customer Avaiable", 404);
  }

  return customer;
};

export const findCustomerForSalesByCustomerId = async (
  customerId,
  salesRepId,
) => {
  const customer = await customerRepo.findCustomerByIdForSalesRep(
    customerId,
    salesRepId,
  );
 
  if (!customer) {
    throw new AppError("Sorry No Customer Avaiable", 404);
  }

  return customer;
};

export const updateCustomerByIdForSalesRep = async (
  customerId,
  salesRepId,
  data,
) => {
  const customer = await customerRepo.findCustomerByIdForSalesRep(
    customerId,
    salesRepId,
  );
  if (!customer) {
    throw new AppError("Customer not found", 404);
  }
  if (data.email !== undefined && data.email !== customer.email) {
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
    salesRepId,
    data,
  );
  if (!updatedCustomer) {
    throw new AppError("Customer update failed", 500);
  }
  return updatedCustomer;
};
