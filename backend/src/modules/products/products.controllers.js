import * as productService from "./products.services.js";

export const createProduct = async (req, res) => {
  const product = await productService.createProduct(req.body);

  return res.status(201).json({
    success: true,
    message: "Product created successfully",
    product,
  });
};

export const getProducts = async (req, res) => {
  const filters = {
    category_id: req.query.category_id,
    search: req.query.search,
  };

  if (req.query.is_active !== undefined) {
    filters.is_active = req.query.is_active === "true";
  }

  const products = await productService.getAllProducts(filters);

  return res.status(200).json({
    success: true,
    products,
  });
};

export const getProductById = async (req, res) => {
  const { id } = req.params;
  const product = await productService.getProductById(id);

  return res.status(200).json({
    success: true,
    product,
  });
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const updatedProduct = await productService.updateProduct(id, req.body);

  return res.status(200).json({
    success: true,
    message: "Product updated successfully",
    product: updatedProduct,
  });
};
