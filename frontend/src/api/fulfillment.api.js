import api from "./client";

export const createFulfillmentForOrder = async (orderId, warehouseId) => {
  const response = await api.post(`/orders/${orderId}/fulfillment`, { warehouse_id: warehouseId });
  return response.data;
};

export const createFulfillment = createFulfillmentForOrder;

export const getFulfillments = async (params = {}) => {
  const response = await api.get("/fulfillments", { params });
  return response.data;
};

export const getFulfillmentById = async (id) => {
  const response = await api.get(`/fulfillments/${id}`);
  return response.data;
};

export const pickFulfillment = async (id) => {
  const response = await api.post(`/fulfillments/${id}/pick`);
  return response.data;
};

export const packFulfillment = async (id) => {
  const response = await api.post(`/fulfillments/${id}/pack`);
  return response.data;
};

export const shipFulfillment = async (id, trackingNumber) => {
  const response = await api.post(`/fulfillments/${id}/ship`, { tracking_number: trackingNumber });
  return response.data;
};

export const deliverFulfillment = async (id) => {
  const response = await api.post(`/fulfillments/${id}/deliver`);
  return response.data;
};
