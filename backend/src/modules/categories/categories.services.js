import * as categoryRepo from "./categories.repository.js";
import AppError from "../../shared/errors/AppError.js";
import { withCache, invalidateCache } from "../../shared/utils/cacheHelper.js";

const CATEGORY_CACHE_KEY = "dealflow:categories:all";
const CATEGORY_CACHE_TTL = 3600; // 1 hour

export const createCategory = async (data) => {
  const existing = await categoryRepo.findCategoryByName(data.name);

  if (existing) {
    throw new AppError("Category with this name already exists", 409);
  }

  const category = await categoryRepo.createCategory(data);
  await invalidateCache("dealflow:categories:*");
  return category;
};

export const getAllCategories = async () => {
  return await withCache(CATEGORY_CACHE_KEY, CATEGORY_CACHE_TTL, async () => {
    return await categoryRepo.findAllCategories();
  });
};

export const getCategoryById = async (id) => {
  const cacheKey = `dealflow:categories:${id}`;
  return await withCache(cacheKey, 1800, async () => {
    const category = await categoryRepo.findCategoryById(id);
    if (!category) {
      throw new AppError("Category not found", 404);
    }
    return category;
  });
};

export const updateCategory = async (id, data) => {
  const category = await categoryRepo.findCategoryById(id);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  if (
    data.name !== undefined &&
    data.name.toLowerCase() !== category.name.toLowerCase()
  ) {
    const existing = await categoryRepo.findCategoryByName(data.name, id);

    if (existing) {
      throw new AppError("Category with this name already exists", 409);
    }
  }

  const updatedCategory = await categoryRepo.updateCategory(id, data);

  if (!updatedCategory) {
    throw new AppError("Category update failed", 500);
  }

  await invalidateCache("dealflow:categories:*");
  return updatedCategory;
};
