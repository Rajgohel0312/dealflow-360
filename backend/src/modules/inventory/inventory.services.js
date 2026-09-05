import * as inventoryRepo from "./inventory.repository.js";
import { findProductById } from "../products/products.repository.js";
import AppError from "../../shared/errors/AppError.js";

// ==========================================
// WAREHOUSES
// ==========================================

export const createWarehouse = async (data) => {
  const existingCode = await inventoryRepo.findWarehouseByCode(data.code);
  if (existingCode) {
    throw new AppError(`Warehouse with code '${data.code}' already exists`, 409);
  }
  return inventoryRepo.createWarehouse(data);
};

export const getAllWarehouses = async (filters = {}) => {
  return inventoryRepo.findAllWarehouses(filters);
};

export const getWarehouseById = async (id) => {
  const warehouse = await inventoryRepo.findWarehouseById(id);
  if (!warehouse) {
    throw new AppError("Warehouse not found", 404);
  }
  return warehouse;
};

export const updateWarehouse = async (id, data) => {
  const existing = await inventoryRepo.findWarehouseById(id);
  if (!existing) {
    throw new AppError("Warehouse not found", 404);
  }
  return inventoryRepo.updateWarehouse(id, data);
};

// ==========================================
// INVENTORY STOCK & MOVEMENTS
// ==========================================

export const addStock = async (data) => {
  const warehouse = await inventoryRepo.findWarehouseById(data.warehouse_id);
  if (!warehouse || !warehouse.is_active) {
    throw new AppError("Warehouse not found or inactive", 400);
  }

  const product = await findProductById(data.product_id);
  if (!product || !product.is_active) {
    throw new AppError("Product not found or inactive", 400);
  }

  const stockRecord = await inventoryRepo.upsertInventory(
    data.warehouse_id,
    data.product_id,
    data.quantity
  );

  await inventoryRepo.createMovement({
    warehouse_id: data.warehouse_id,
    product_id: data.product_id,
    movement_type: "RECEIPT",
    quantity: Number(data.quantity),
    reference_type: "MANUAL_RECEIPT",
    reference_id: null,
  });

  return stockRecord;
};

export const reserveStock = async (productId, warehouseId, quantity, referenceId = null) => {

  const prod = await findProductById(productId);
  if (prod && prod.product_type === "SUBSCRIPTION") {
    // Digital subscriptions bypass physical warehouse stock reservation
    return null;
  }

  let inv = await inventoryRepo.findInventoryByWarehouseAndProduct(warehouseId, productId);
  if (!inv) {
    await inventoryRepo.upsertInventory(warehouseId, productId, 0);
    inv = await inventoryRepo.findInventoryByWarehouseAndProduct(warehouseId, productId);
  }

  const onHand = Number(inv?.quantity_on_hand || 0);
  const reserved = Number(inv?.quantity_reserved || 0);
  const available = onHand - reserved;
  const reqQty = Number(quantity);

  if (available < reqQty) {
    const prodName = inv?.product_name || prod?.name || "Product";
    throw new AppError(
      `Insufficient stock for '${prodName}'! Stock Available: ${available}, Requested: ${reqQty}. Please receive/adjust stock under Operations -> Inventory.`,
      400
    );
  }



  const newReserved = reserved + reqQty;
  await inventoryRepo.updateInventory(inv.id, {
    quantity_reserved: newReserved,
  });

  await inventoryRepo.createMovement({
    warehouse_id: warehouseId,
    product_id: productId,
    movement_type: "RESERVATION",
    quantity: reqQty,
    reference_type: "ORDER",
    reference_id: referenceId,
  });

  return {
    quantity_on_hand: onHand,
    quantity_reserved: newReserved,
    quantity_available: onHand - newReserved,
  };
};

export const getAllInventory = async (filters = {}) => {
  return inventoryRepo.findAllInventory(filters);
};

export const getInventoryByProduct = async (productId) => {
  const stock = await inventoryRepo.findAllInventory({ product_id: productId });
  const movements = await inventoryRepo.findMovementsByProduct(productId);
  return {
    stock,
    movements,
  };
};

export const getAllMovements = async () => {
  return inventoryRepo.findAllMovements();
};
