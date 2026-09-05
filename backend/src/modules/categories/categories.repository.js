import {
  insertOne,
  updateById,
  findOne,
  findMany,
  query,
} from "../../infrastructure/database/index.js";

/**
 * Create a new product category
 */
export const createCategory = (data) =>
  insertOne("product_categories", data);

/**
 * Find category by ID
 */
export const findCategoryById = (id) =>
  findOne("product_categories", { id });

/**
 * Find category by name (for duplicate checking)
 */
export const findCategoryByName = async (name, excludeId = null) => {
  let text = `
    SELECT *
    FROM product_categories
    WHERE LOWER(name) = LOWER($1)
  `;
  const params = [name];
  if (excludeId) {
    params.push(excludeId);
    text += ` AND id <> $2`;
  }
  text += ` LIMIT 1`;
  const result = await query(text, params);
  return result.rows[0] || null;
};

/**
 * Find all product categories
 */
export const findAllCategories = () =>
  findMany("product_categories", {}, "*", {
    orderBy: "name ASC",
  });

/**
 * Update product category
 */
export const updateCategory = (id, data) =>
  updateById("product_categories", id, data);
