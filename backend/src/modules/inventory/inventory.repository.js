import {
  insertOne,
  findOne,
  updateById,
  query,
} from "../../infrastructure/database/index.js";

// ==========================================
// WAREHOUSES
// ==========================================

export const createWarehouse = async (data) => {
  return insertOne("warehouses", data);
};

export const findWarehouseById = async (id) => {
  return findOne("warehouses", { id });
};

export const findWarehouseByCode = async (code) => {
  const result = await query(
    `SELECT * FROM warehouses WHERE UPPER(code) = UPPER($1) LIMIT 1`,
    [code]
  );
  return result.rows[0] || null;
};

export const findAllWarehouses = async (filters = {}) => {
  let queryText = `SELECT * FROM warehouses`;
  const conditions = [];
  const params = [];

  if (filters.is_active !== undefined) {
    params.push(filters.is_active);
    conditions.push(`is_active = $${params.length}`);
  }

  if (conditions.length > 0) {
    queryText += ` WHERE ${conditions.join(" AND ")}`;
  }

  queryText += ` ORDER BY name ASC`;

  const result = await query(queryText, params);
  return result.rows;
};

export const updateWarehouse = async (id, data) => {
  return updateById("warehouses", id, data);
};

// ==========================================
// INVENTORY STOCK
// ==========================================

export const findInventoryByWarehouseAndProduct = async (warehouseId, productId) => {
  const result = await query(
    `SELECT i.*, 
            w.name as warehouse_name, w.code as warehouse_code,
            p.name as product_name, p.sku as product_sku
     FROM inventory i
     JOIN warehouses w ON i.warehouse_id = w.id
     JOIN products p ON i.product_id = p.id
     WHERE i.warehouse_id = $1 AND i.product_id = $2 LIMIT 1`,
    [warehouseId, productId]
  );
  return result.rows[0] || null;
};

export const findAllInventory = async (filters = {}) => {
  let queryText = `
    SELECT i.*, 
           w.name as warehouse_name, w.code as warehouse_code,
           p.name as product_name, p.sku as product_sku,
           (i.quantity_on_hand - i.quantity_reserved) as quantity_available
    FROM inventory i
    JOIN warehouses w ON i.warehouse_id = w.id
    JOIN products p ON i.product_id = p.id
  `;
  const conditions = [];
  const params = [];

  if (filters.warehouse_id) {
    params.push(filters.warehouse_id);
    conditions.push(`i.warehouse_id = $${params.length}`);
  }

  if (filters.product_id) {
    params.push(filters.product_id);
    conditions.push(`i.product_id = $${params.length}`);
  }

  if (conditions.length > 0) {
    queryText += ` WHERE ${conditions.join(" AND ")}`;
  }

  queryText += ` ORDER BY p.name ASC, w.name ASC`;

  const result = await query(queryText, params);
  return result.rows;
};

export const upsertInventory = async (warehouseId, productId, qtyOnHandToAdd) => {
  const existing = await findInventoryByWarehouseAndProduct(warehouseId, productId);

  if (existing) {
    const newQty = Number(existing.quantity_on_hand) + Number(qtyOnHandToAdd);
    return updateById("inventory", existing.id, { quantity_on_hand: newQty });
  }

  return insertOne("inventory", {
    warehouse_id: warehouseId,
    product_id: productId,
    quantity_on_hand: Number(qtyOnHandToAdd),
    quantity_reserved: 0,
  });
};

export const updateInventory = async (id, data) => {
  return updateById("inventory", id, data);
};

// ==========================================
// INVENTORY MOVEMENTS AUDIT TRAIL
// ==========================================

export const createMovement = async (data) => {
  return insertOne("inventory_movements", data);
};

export const findMovementsByProduct = async (productId) => {
  const result = await query(
    `SELECT im.*, w.name as warehouse_name, p.name as product_name
     FROM inventory_movements im
     JOIN warehouses w ON im.warehouse_id = w.id
     JOIN products p ON im.product_id = p.id
     WHERE im.product_id = $1
     ORDER BY im.created_at DESC`,
    [productId]
  );
  return result.rows;
};

export const findAllMovements = async (limit = 100) => {
  const result = await query(
    `SELECT im.*, w.name as warehouse_name, p.name as product_name
     FROM inventory_movements im
     JOIN warehouses w ON im.warehouse_id = w.id
     JOIN products p ON im.product_id = p.id
     ORDER BY im.created_at DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
};
