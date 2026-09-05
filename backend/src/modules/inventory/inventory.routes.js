import {
  createWarehouse, getWarehouses, getWarehouseById, updateWarehouse,
  addStock, getInventory, getInventoryByProduct, reserveStock, getMovements,
} from "./inventory.controllers.js";
import { validate } from "../../middleware/validate.js";
import { createWarehouseSchema, updateWarehouseSchema, addStockSchema, reserveStockSchema } from "./inventory.validations.js";
import { authenticateEmployee, authorize } from "../../middleware/auth.middleware.js";

const ALL_ROLES = ["Admin", "Sales Rep", "Manager", "Finance", "Operations"];
const OPS       = ["Admin", "Operations"];
const CAN_RESERVE = ["Admin", "Operations", "Sales Rep"];

export default function inventoryRoutes(app, prefix) {
  // Warehouses
  app.route("POST",  `${prefix}/warehouses`,      authenticateEmployee, authorize(...OPS), validate(createWarehouseSchema), createWarehouse);
  app.route("GET",   `${prefix}/warehouses`,      authenticateEmployee, authorize(...ALL_ROLES), getWarehouses);
  app.route("GET",   `${prefix}/warehouses/:id`,  authenticateEmployee, authorize(...ALL_ROLES), getWarehouseById);
  app.route("PATCH", `${prefix}/warehouses/:id`,  authenticateEmployee, authorize(...OPS), validate(updateWarehouseSchema), updateWarehouse);
  // Inventory
  app.route("POST",  `${prefix}/inventory`,                       authenticateEmployee, authorize(...OPS), validate(addStockSchema), addStock);
  app.route("GET",   `${prefix}/inventory`,                       authenticateEmployee, authorize(...ALL_ROLES), getInventory);
  app.route("GET",   `${prefix}/inventory/movements`,             authenticateEmployee, authorize(...ALL_ROLES), getMovements);
  app.route("GET",   `${prefix}/inventory/:productId`,            authenticateEmployee, authorize(...ALL_ROLES), getInventoryByProduct);
  app.route("POST",  `${prefix}/inventory/:productId/reserve`,    authenticateEmployee, authorize(...CAN_RESERVE), validate(reserveStockSchema), reserveStock);
}
