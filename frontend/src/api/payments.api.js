import api from "./client";

export const recordPayment = async (invoiceId, data) => {
  const response = await api.post(`/invoices/${invoiceId}/payments`, data);
  return response.data;
};

export const getPaymentsByInvoice = async (invoiceId) => {
  const response = await api.get(`/invoices/${invoiceId}/payments`);
  return response.data;
};

export const getPaymentById = async (id) => {
  const response = await api.get(`/payments/${id}`);
  return response.data;
};
