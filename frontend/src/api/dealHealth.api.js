import api from "./client";

export const getDealHealth = async (quotationId) => {
  const response = await api.get(`/quotations/${quotationId}/health`);
  return response.data;
};
