import api from "./client";

export const getWarehouses = async (params = {}) => {
  const response = await api.get("/warehouses", { params });
  return response.data;
};

export const getWarehouseById = async (id) => {
  const response = await api.get(`/warehouses/${id}`);
  return response.data;
};

export const createWarehouse = async (data) => {
  const response = await api.post("/warehouses", data);
  return response.data;
};

export const updateWarehouse = async (id, data) => {
  const response = await api.patch(`/warehouses/${id}`, data);
  return response.data;
};

export const getInventory = async (params = {}) => {
  const response = await api.get("/inventory", { params });
  return response.data;
};

export const getInventoryByProduct = async (productId) => {
  const response = await api.get(`/inventory/${productId}`);
  return response.data;
};

export const addStock = async (data) => {
  const response = await api.post("/inventory", data);
  return response.data;
};

export const reserveStock = async (productId, data) => {
  const response = await api.post(`/inventory/${productId}/reserve`, data);
  return response.data;
};

export const getMovements = async (params = {}) => {
  const response = await api.get("/inventory/movements", { params });
  return response.data;
};
