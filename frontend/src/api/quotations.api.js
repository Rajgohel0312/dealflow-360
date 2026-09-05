import api from "./client";

export const getQuotations = async (params = {}) => {
  const response = await api.get("/quotations", { params });
  return response.data;
};

export const getQuotationById = async (id) => {
  const response = await api.get(`/quotations/${id}`);
  return response.data;
};

export const createQuotation = async (data) => {
  const response = await api.post("/quotations", data);
  return response.data;
};

export const updateQuotation = async (id, data) => {
  const response = await api.patch(`/quotations/${id}`, data);
  return response.data;
};

export const addQuotationItem = async (id, data) => {
  const response = await api.post(`/quotations/${id}/items`, data);
  return response.data;
};

export const updateQuotationItem = async (id, itemId, data) => {
  const response = await api.patch(`/quotations/${id}/items/${itemId}`, data);
  return response.data;
};

export const deleteQuotationItem = async (id, itemId) => {
  const response = await api.delete(`/quotations/${id}/items/${itemId}`);
  return response.data;
};

export const submitQuotation = async (id) => {
  const response = await api.post(`/quotations/${id}/submit`);
  return response.data;
};

export const getPendingApprovals = async () => {
  const response = await api.get("/quotations/approvals/pending");
  return response.data;
};

export const approveQuotation = async (id, data) => {
  const response = await api.post(`/quotations/${id}/approve`, data);
  return response.data;
};

export const rejectQuotation = async (id, data) => {
  const response = await api.post(`/quotations/${id}/reject`, data);
  return response.data;
};
