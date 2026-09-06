import api from "./client";

/*
|--------------------------------------------------------------------------
| CUSTOMER COMPANY API
|--------------------------------------------------------------------------
*/

export const registerCustomerCompany = async (data) => {
  const response = await api.post("/customer/company", data);
  return response.data;
};

export const getCustomersBySalesRep = async () => {
  const response = await api.get("/customer/company");
  return response.data;
};

export const getCustomerById = async (customerId) => {
  const response = await api.get(`/customer/company/${customerId}`);
  return response.data;
};

export const updateCustomerCompany = async (customerId, data) => {
  const response = await api.patch(`/customer/company/${customerId}`, data);
  return response.data;
};

export const sendCustomerCredentials = async (customerId) => {
  const response = await api.post(`/customer/company/${customerId}/send-credentials`);
  return response.data;
};

/*
|--------------------------------------------------------------------------
| CUSTOMER USERS API
|--------------------------------------------------------------------------
*/

export const createCustomerEmp = async (customerId, data) => {
  const response = await api.post(`/customer/${customerId}/users`, data);
  return response.data;
};

export const getCustomerUsers = async (customerId) => {
  const response = await api.get(`/customer/${customerId}/users`);
  return response.data;
};

export const getCustomerUserById = async (customerId, userId) => {
  const response = await api.get(`/customer/${customerId}/users/${userId}`);
  return response.data;
};

export const updateCustomerUser = async (customerId, userId, data) => {
  const response = await api.patch(
    `/customer/${customerId}/users/${userId}`,
    data
  );
  return response.data;
};

export const sendCustomerUserCredentials = async (customerId, userId) => {
  const response = await api.post(`/customer/${customerId}/users/${userId}/send-credentials`);
  return response.data;
};

/*
|--------------------------------------------------------------------------
| CUSTOMER AUTHENTICATION API
|--------------------------------------------------------------------------
*/

export const loginCustomerUser = async (data) => {
  const response = await api.post("/customer/auth/login", data);
  return response.data;
};

export const changeCustomerPassword = async (data, customToken = null) => {
  const headers = customToken
    ? { Authorization: `Bearer ${customToken}` }
    : undefined;
  const response = await api.post("/customer/auth/change-password", data, {
    headers,
  });
  return response.data;
};

export const getCustomerPortalSummary = async () => {
  const response = await api.get("/customer/portal/summary");
  return response.data;
};

