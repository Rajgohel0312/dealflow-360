import * as categoryRepo from "./categories.repository.js";
import AppError from "../../shared/errors/AppError.js";

export const createCategory = async (data) => {
  const existing = await categoryRepo.findCategoryByName(data.name);

  if (existing) {
    throw new AppError("Category with this name already exists", 409);
  }

  const category = await categoryRepo.createCategory(data);
  return category;
};

export const getAllCategories = async () => {
  const categories = await categoryRepo.findAllCategories();
  return categories;
};

export const getCategoryById = async (id) => {
  const category = await categoryRepo.findCategoryById(id);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return category;
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

  return updatedCategory;
};
