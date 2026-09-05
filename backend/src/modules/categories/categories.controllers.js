import * as categoryService from "./categories.services.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/utils/response.js";

export const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  return sendSuccess(res, { category }, "Product category created successfully", 201);
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getAllCategories();
  return sendSuccess(res, { categories }, "Categories fetched successfully");
});

export const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await categoryService.getCategoryById(id);
  return sendSuccess(res, { category }, "Category fetched successfully");
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedCategory = await categoryService.updateCategory(id, req.body);
  return sendSuccess(res, { category: updatedCategory }, "Product category updated successfully");
});
