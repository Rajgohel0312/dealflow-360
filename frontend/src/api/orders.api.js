import api from "./client";

export const convertQuotationToOrder = async (quotationId) => {
  const response = await api.post(`/orders/from-quotation/${quotationId}`);
  return response.data;
};

export const getOrders = async (params = {}) => {
  const response = await api.get("/orders", { params });
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};
