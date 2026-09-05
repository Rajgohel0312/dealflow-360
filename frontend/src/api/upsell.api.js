import api from "./client";

export const getRecommendationsForCustomer = async (customerId) => {
  const response = await api.get(`/customers/${customerId}/recommendations`);
  return response.data;
};

export const createQuotationFromRecommendation = async (customerId, productIds) => {
  const response = await api.post("/recommendations/create-quotation", {
    customer_id: customerId,
    product_ids: productIds,
  });
  return response.data;
};
