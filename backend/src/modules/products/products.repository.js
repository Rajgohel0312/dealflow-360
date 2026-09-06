import {
  insertOne,
  findOne,
  updateById,
  query,
} from "../../infrastructure/database/index.js";

export const createProduct = async (data) => {
  return insertOne("products", data);
};

export const findProductById = async (id) => {
  const result = await query(
    `SELECT p.*, c.name as category_name 
     FROM products p 
     JOIN product_categories c ON p.category_id = c.id 
     WHERE p.id = $1 LIMIT 1`,
    [id]
  );
  return result.rows[0] || null;
};

export const findProductBySku = async (sku) => {
  return findOne("products", { sku });
};

export const findAllProducts = async (filters = {}) => {
  let queryText = `
    SELECT p.*, c.name as category_name 
    FROM products p 
    JOIN product_categories c ON p.category_id = c.id
  `;
  const conditions = [];
  const params = [];

  if (filters.category_id) {
    params.push(filters.category_id);
    conditions.push(`p.category_id = $${params.length}`);
  }

  if (filters.is_active !== undefined) {
    params.push(filters.is_active);
    conditions.push(`p.is_active = $${params.length}`);
  }

  if (filters.search) {
    params.push(`%${filters.search}%`);
    conditions.push(
      `(p.name ILIKE $${params.length} OR p.sku ILIKE $${params.length})`
    );
  }

  if (conditions.length > 0) {
    queryText += ` WHERE ${conditions.join(" AND ")}`;
  }

  queryText += ` ORDER BY p.created_at DESC`;

  const result = await query(queryText, params);
  return result.rows;
};

export const updateProduct = async (id, data) => {
  return updateById("products", id, data);
};

export const deleteProduct = async (id) => {
  const result = await query("DELETE FROM products WHERE id = $1 RETURNING *", [id]);
  return result.rows[0] || null;
};

export const isProductUsedInQuotationsOrOrders = async (productId) => {
  const quoteItems = await query("SELECT id FROM quotation_items WHERE product_id = $1 LIMIT 1", [productId]);
  if (quoteItems.rows.length > 0) return "quotations";
  const orderItems = await query("SELECT id FROM order_items WHERE product_id = $1 LIMIT 1", [productId]);
  if (orderItems.rows.length > 0) return "orders";
  return null;
};
