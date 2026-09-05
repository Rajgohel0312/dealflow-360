import * as inventoryService from "./inventory.services.js";

export const createWarehouse = async (req, res) => {
  const warehouse = await inventoryService.createWarehouse(req.body);

  return res.status(201).json({
    success: true,
    message: "Warehouse created successfully",
    warehouse,
  });
};

export const getWarehouses = async (req, res) => {
  const filters = {};
  if (req.query.is_active !== undefined) {
    filters.is_active = req.query.is_active === "true";
  }

  const warehouses = await inventoryService.getAllWarehouses(filters);

  return res.status(200).json({
    success: true,
    warehouses,
  });
};

export const getWarehouseById = async (req, res) => {
  const { id } = req.params;
  const warehouse = await inventoryService.getWarehouseById(id);

  return res.status(200).json({
    success: true,
    warehouse,
  });
};

export const updateWarehouse = async (req, res) => {
  const { id } = req.params;
  const updatedWarehouse = await inventoryService.updateWarehouse(id, req.body);

  return res.status(200).json({
    success: true,
    message: "Warehouse updated successfully",
    warehouse: updatedWarehouse,
  });
};

export const addStock = async (req, res) => {
  const inventory = await inventoryService.addStock(req.body);

  return res.status(201).json({
    success: true,
    message: "Stock added to warehouse successfully",
    inventory,
  });
};

export const getInventory = async (req, res) => {
  const filters = {
    warehouse_id: req.query.warehouse_id,
    product_id: req.query.product_id,
  };

  const inventory = await inventoryService.getAllInventory(filters);

  return res.status(200).json({
    success: true,
    inventory,
  });
};

export const getInventoryByProduct = async (req, res) => {
  const { productId } = req.params;
  const result = await inventoryService.getInventoryByProduct(productId);

  return res.status(200).json({
    success: true,
    ...result,
  });
};

export const reserveStock = async (req, res) => {
  const { productId } = req.params;
  const { warehouse_id, quantity, reference_id } = req.body;

  const result = await inventoryService.reserveStock(
    productId,
    warehouse_id,
    quantity,
    reference_id
  );

  return res.status(200).json({
    success: true,
    message: "Stock reserved successfully",
    ...result,
  });
};

export const getMovements = async (req, res) => {
  const movements = await inventoryService.getAllMovements();

  return res.status(200).json({
    success: true,
    movements,
  });
};
