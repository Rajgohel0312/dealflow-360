import {
  insertOne,
  findOne,
  updateById,
  query,
} from "../../infrastructure/database/index.js";

export const createFulfillment = async (data) => {
  return insertOne("fulfillments", data);
};

export const findFulfillmentById = async (id) => {
  const result = await query(
    `SELECT f.*, 
            o.order_number, o.customer_id, c.name as customer_name,
            w.name as warehouse_name, w.code as warehouse_code
     FROM fulfillments f
     JOIN orders o ON f.order_id = o.id
     JOIN customers c ON o.customer_id = c.id
     JOIN warehouses w ON f.warehouse_id = w.id
     WHERE f.id = $1 LIMIT 1`,
    [id]
  );
  return result.rows[0] || null;
};

export const findFulfillmentByOrderId = async (orderId) => {
  const result = await query(
    `SELECT * FROM fulfillments WHERE order_id = $1 LIMIT 1`,
    [orderId]
  );
  return result.rows[0] || null;
};

export const findFulfillmentsByOrderId = async (orderId) => {
  const result = await query(
    `SELECT * FROM fulfillments WHERE order_id = $1 ORDER BY created_at DESC`,
    [orderId]
  );
  return result.rows;
};

export const findAllFulfillments = async (filters = {}) => {
  let queryText = `
    SELECT f.*, 
           o.order_number, c.name as customer_name,
           w.name as warehouse_name, w.code as warehouse_code
    FROM fulfillments f
    JOIN orders o ON f.order_id = o.id
    JOIN customers c ON o.customer_id = c.id
    JOIN warehouses w ON f.warehouse_id = w.id
  `;
  const conditions = [];
  const params = [];

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`f.status = $${params.length}`);
  }

  if (filters.warehouse_id) {
    params.push(filters.warehouse_id);
    conditions.push(`f.warehouse_id = $${params.length}`);
  }

  if (conditions.length > 0) {
    queryText += ` WHERE ${conditions.join(" AND ")}`;
  }

  queryText += ` ORDER BY f.created_at DESC`;

  const result = await query(queryText, params);
  return result.rows;
};

export const updateFulfillment = async (id, data) => {
  return updateById("fulfillments", id, data);
};

export const createFulfillmentItem = async (data) => {
  return insertOne("fulfillment_items", data);
};

export const findFulfillmentItemsByFulfillmentId = async (fulfillmentId) => {
  const result = await query(
    `SELECT fi.*, oi.product_id, p.name as product_name, p.sku as product_sku
     FROM fulfillment_items fi
     JOIN order_items oi ON fi.order_item_id = oi.id
     JOIN products p ON oi.product_id = p.id
     WHERE fi.fulfillment_id = $1`,
    [fulfillmentId]
  );
  return result.rows;
};
