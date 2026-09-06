import api from "./client";

export const createInvoiceFromOrder = async (orderId) => {
  const response = await api.post(`/orders/${orderId}/invoice`);
  return response.data;
};

export const getInvoices = async (params = {}) => {
  const response = await api.get("/invoices", { params });
  return response.data;
};

export const getInvoiceById = async (id) => {
  const response = await api.get(`/invoices/${id}`);
  return response.data;
};

export const issueInvoice = async (id) => {
  const response = await api.post(`/invoices/${id}/issue`);
  return response.data;
};

export const sendInvoiceEmail = async (id, data = {}) => {
  const response = await api.post(`/invoices/${id}/send-email`, data);
  return response.data;
};
