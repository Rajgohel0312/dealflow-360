import {
  insertOne,
  updateById,
  query,
} from "../../infrastructure/database/index.js";

export const createDiscountRule = async (data) => {
  return insertOne("discount_rules", data);
};

export const findDiscountRuleById = async (id) => {
  const result = await query(
    `SELECT dr.*, c.name as category_name 
     FROM discount_rules dr 
     JOIN product_categories c ON dr.category_id = c.id 
     WHERE dr.id = $1 LIMIT 1`,
    [id]
  );
  return result.rows[0] || null;
};

export const findDiscountRuleByTierAndCategory = async (
  customerTier,
  categoryId,
  excludeId = null
) => {
  let text = `
    SELECT * FROM discount_rules
    WHERE customer_tier = $1
      AND category_id = $2
  `;
  const params = [customerTier, categoryId];
  if (excludeId) {
    params.push(excludeId);
    text += ` AND id <> $3`;
  }
  text += ` LIMIT 1`;

  const result = await query(text, params);
  return result.rows[0] || null;
};

export const findAllDiscountRules = async (filters = {}) => {
  let queryText = `
    SELECT dr.*, c.name as category_name 
    FROM discount_rules dr 
    JOIN product_categories c ON dr.category_id = c.id
  `;
  const conditions = [];
  const params = [];

  if (filters.customer_tier) {
    params.push(filters.customer_tier);
    conditions.push(`dr.customer_tier = $${params.length}`);
  }

  if (filters.category_id) {
    params.push(filters.category_id);
    conditions.push(`dr.category_id = $${params.length}`);
  }

  if (filters.is_active !== undefined) {
    params.push(filters.is_active);
    conditions.push(`dr.is_active = $${params.length}`);
  }

  if (conditions.length > 0) {
    queryText += ` WHERE ${conditions.join(" AND ")}`;
  }

  queryText += ` ORDER BY dr.customer_tier ASC, c.name ASC`;

  const result = await query(queryText, params);
  return result.rows;
};

export const updateDiscountRule = async (id, data) => {
  return updateById("discount_rules", id, data);
};

export const deleteDiscountRule = async (id) => {
  const result = await query("DELETE FROM discount_rules WHERE id = $1 RETURNING *", [id]);
  return result.rows[0] || null;
};
