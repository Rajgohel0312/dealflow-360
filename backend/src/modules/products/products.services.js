import * as productRepo from "./products.repository.js";
import { findCategoryById } from "../categories/categories.repository.js";
import AppError from "../../shared/errors/AppError.js";
import { withCache, invalidateCache } from "../../shared/utils/cacheHelper.js";

export const createProduct = async (data) => {
  const category = await findCategoryById(data.category_id);
  if (!category) {
    throw new AppError("Product category not found", 404);
  }

  const existingSku = await productRepo.findProductBySku(data.sku);
  if (existingSku) {
    throw new AppError("Product SKU already exists", 409);
  }

  const product = await productRepo.createProduct(data);
  await invalidateCache("dealflow:products:*");
  return product;
};

export const getAllProducts = async (filters = {}) => {
  const filterKey = JSON.stringify(filters);
  const cacheKey = `dealflow:products:list:${filterKey}`;
  return await withCache(cacheKey, 900, async () => {
    return await productRepo.findAllProducts(filters);
  });
};

export const getProductById = async (id) => {
  const cacheKey = `dealflow:products:${id}`;
  return await withCache(cacheKey, 1800, async () => {
    const product = await productRepo.findProductById(id);
    if (!product) {
      throw new AppError("Product not found", 404);
    }
    return product;
  });
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

  const updatedProduct = await productRepo.updateProduct(id, data);
  await invalidateCache("dealflow:products:*");
  return updatedProduct;
};
