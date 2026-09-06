import api from "./client";

// ==========================================
// CATEGORIES
// ==========================================
export const getCategories = async () => {
  const response = await api.get("/categories");
  return response.data;
};

export const getCategoryById = async (id) => {
  const response = await api.get(`/categories/${id}`);
  return response.data;
};

export const createCategory = async (data) => {
  const response = await api.post("/categories", data);
  return response.data;
};

export const updateCategory = async (id, data) => {
  const response = await api.patch(`/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};

// ==========================================
// PRODUCTS
// ==========================================
export const getProducts = async (params = {}) => {
  const response = await api.get("/products", { params });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (data) => {
  const response = await api.post("/products", data);
  return response.data;
};

export const updateProduct = async (id, data) => {
  const response = await api.patch(`/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

// ==========================================
// PRICE LISTS & ITEMS
// ==========================================
export const getPriceLists = async (params = {}) => {
  const response = await api.get("/price-lists", { params });
  return response.data;
};

export const getPriceListById = async (id) => {
  const response = await api.get(`/price-lists/${id}`);
  return response.data;
};

export const createPriceList = async (data) => {
  const response = await api.post("/price-lists", data);
  return response.data;
};

export const updatePriceList = async (id, data) => {
  const response = await api.patch(`/price-lists/${id}`, data);
  return response.data;
};

export const deletePriceList = async (id) => {
  const response = await api.delete(`/price-lists/${id}`);
  return response.data;
};

export const getPriceListItems = async (priceListId) => {
  const response = await api.get(`/price-lists/${priceListId}/items`);
  return response.data;
};

export const addPriceListItem = async (priceListId, data) => {
  const response = await api.post(`/price-lists/${priceListId}/items`, data);
  return response.data;
};

export const updatePriceListItem = async (priceListId, itemId, data) => {
  const response = await api.patch(`/price-lists/${priceListId}/items/${itemId}`, data);
  return response.data;
};

export const deletePriceListItem = async (priceListId, itemId) => {
  const response = await api.delete(`/price-lists/${priceListId}/items/${itemId}`);
  return response.data;
};

// ==========================================
// DISCOUNT RULES
// ==========================================
export const getDiscountRules = async (params = {}) => {
  const response = await api.get("/discount-rules", { params });
  return response.data;
};

export const getDiscountRuleById = async (id) => {
  const response = await api.get(`/discount-rules/${id}`);
  return response.data;
};

export const createDiscountRule = async (data) => {
  const response = await api.post("/discount-rules", data);
  return response.data;
};

export const updateDiscountRule = async (id, data) => {
  const response = await api.patch(`/discount-rules/${id}`, data);
  return response.data;
};

export const deleteDiscountRule = async (id) => {
  const response = await api.delete(`/discount-rules/${id}`);
  return response.data;
};
