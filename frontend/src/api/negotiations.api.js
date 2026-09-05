import api from "./client";

export const createNegotiation = async (quotationId, data) => {
  const response = await api.post(`/quotations/${quotationId}/negotiations`, data);
  return response.data;
};

export const getNegotiationsByQuotation = async (quotationId) => {
  const response = await api.get(`/quotations/${quotationId}/negotiations`);
  return response.data;
};

export const getNegotiationById = async (id) => {
  const response = await api.get(`/negotiations/${id}`);
  return response.data;
};

export const submitNegotiation = async (id) => {
  const response = await api.post(`/negotiations/${id}/submit`);
  return response.data;
};

export const approveNegotiation = async (id, comments) => {
  const response = await api.post(`/negotiations/${id}/approve`, { comments });
  return response.data;
};

export const rejectNegotiation = async (id, comments) => {
  const response = await api.post(`/negotiations/${id}/reject`, { comments });
  return response.data;
};
