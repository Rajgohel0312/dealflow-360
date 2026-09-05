import * as categoryService from "./categories.services.js";

export const createCategory = async (req, res) => {
  const category = await categoryService.createCategory(req.body);

  return res.status(201).json({
    success: true,
    message: "Product category created successfully",
    category,
  });
};

export const getCategories = async (req, res) => {
  const categories = await categoryService.getAllCategories();

  return res.status(200).json({
    success: true,
    categories,
  });
};

export const getCategoryById = async (req, res) => {
  const { id } = req.params;
  const category = await categoryService.getCategoryById(id);

  return res.status(200).json({
    success: true,
    category,
  });
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const updatedCategory = await categoryService.updateCategory(id, req.body);

  return res.status(200).json({
    success: true,
    message: "Product category updated successfully",
    category: updatedCategory,
  });
};
