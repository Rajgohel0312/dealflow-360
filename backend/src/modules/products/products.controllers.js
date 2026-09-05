import * as productService from "./products.services.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/utils/response.js";

export const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  return sendSuccess(res, { product }, "Product created successfully", 201);
});

export const getProducts = asyncHandler(async (req, res) => {
  const filters = {
    category_id: req.query.category_id,
    search: req.query.search,
  };

  if (req.query.is_active !== undefined) {
    filters.is_active = req.query.is_active === "true";
  }

  const products = await productService.getAllProducts(filters);
  return sendSuccess(res, { products }, "Products fetched successfully");
});

export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await productService.getProductById(id);
  return sendSuccess(res, { product }, "Product fetched successfully");
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedProduct = await productService.updateProduct(id, req.body);
  return sendSuccess(res, { product: updatedProduct }, "Product updated successfully");
});
