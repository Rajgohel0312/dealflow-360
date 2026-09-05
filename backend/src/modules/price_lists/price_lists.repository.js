import {
  insertOne,
  findOne,
  updateById,
  deleteById,
  query,
} from "../../infrastructure/database/index.js";

// ==========================================
// PRICE LISTS
// ==========================================

export const createPriceList = async (data) => {
  return insertOne("price_lists", data);
};

export const findPriceListById = async (id) => {
  return findOne("price_lists", { id });
};

export const findPriceListByName = async (name, excludeId = null) => {
  let text = `
    SELECT * FROM price_lists
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

export const findAllPriceLists = async (filters = {}) => {
  let queryText = `SELECT * FROM price_lists`;
  const conditions = [];
  const params = [];

  if (filters.is_active !== undefined) {
    params.push(filters.is_active);
    conditions.push(`is_active = $${params.length}`);
  }

  if (conditions.length > 0) {
    queryText += ` WHERE ${conditions.join(" AND ")}`;
  }

  queryText += ` ORDER BY created_at DESC`;

  const result = await query(queryText, params);
  return result.rows;
};

export const updatePriceList = async (id, data) => {
  return updateById("price_lists", id, data);
};

// ==========================================
// PRICE LIST ITEMS
// ==========================================

export const createPriceListItem = async (data) => {
  return insertOne("price_list_items", data);
};

export const findPriceListItemById = async (id) => {
  const result = await query(
    `SELECT pli.*, p.name as product_name, p.sku as product_sku, p.unit as product_unit, p.base_price as product_base_price
     FROM price_list_items pli
     JOIN products p ON pli.product_id = p.id
     WHERE pli.id = $1 LIMIT 1`,
    [id]
  );
  return result.rows[0] || null;
};

export const findPriceListItemsByPriceListId = async (priceListId) => {
  const result = await query(
    `SELECT pli.*, p.name as product_name, p.sku as product_sku, p.unit as product_unit, p.base_price as product_base_price
     FROM price_list_items pli
     JOIN products p ON pli.product_id = p.id
     WHERE pli.price_list_id = $1
     ORDER BY p.name ASC, pli.minimum_quantity ASC`,
    [priceListId]
  );
  return result.rows;
};

export const findPriceListItemByUniqueKey = async (
  priceListId,
  productId,
  minimumQuantity,
  excludeId = null
) => {
  let text = `
    SELECT * FROM price_list_items
    WHERE price_list_id = $1
      AND product_id = $2
      AND minimum_quantity = $3
  `;
  const params = [priceListId, productId, minimumQuantity];
  if (excludeId) {
    params.push(excludeId);
    text += ` AND id <> $4`;
  }
  text += ` LIMIT 1`;

  const result = await query(text, params);
  return result.rows[0] || null;
};

export const updatePriceListItem = async (id, data) => {
  return updateById("price_list_items", id, data);
};

export const deletePriceListItem = async (id) => {
  return deleteById("price_list_items", id);
};
