import * as productRepo from "./products.repository.js";
import { findCategoryById } from "../categories/categories.repository.js";
import AppError from "../../shared/errors/AppError.js";

export const createProduct = async (data) => {
  const category = await findCategoryById(data.category_id);
  if (!category) {
    throw new AppError("Product category not found", 404);
  }

  const existingSku = await productRepo.findProductBySku(data.sku);
  if (existingSku) {
    throw new AppError("Product SKU already exists", 409);
  }

  return productRepo.createProduct(data);
};

export const getAllProducts = async (filters = {}) => {
  return productRepo.findAllProducts(filters);
};

export const getProductById = async (id) => {
  const product = await productRepo.findProductById(id);
  if (!product) {
    throw new AppError("Product not found", 404);
  }
  return product;
};

export const updateProduct = async (id, data) => {
  const existingProduct = await productRepo.findProductById(id);
  if (!existingProduct) {
    throw new AppError("Product not found", 404);
  }

  if (data.category_id && data.category_id !== existingProduct.category_id) {
    const category = await findCategoryById(data.category_id);
    if (!category) {
      throw new AppError("Product category not found", 404);
    }
  }

  if (data.sku && data.sku !== existingProduct.sku) {
    const existingSku = await productRepo.findProductBySku(data.sku);
    if (existingSku) {
      throw new AppError("Product SKU already exists", 409);
    }
  }

  return productRepo.updateProduct(id, data);
};
