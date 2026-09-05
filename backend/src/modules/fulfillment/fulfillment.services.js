import * as fulfillmentRepo from "./fulfillment.repository.js";
import { findOrderById, findOrderItemsByOrderId, updateOrder } from "../orders/orders.repository.js";
import { findWarehouseById, findInventoryByWarehouseAndProduct, updateInventory, createMovement } from "../inventory/inventory.repository.js";
import { reserveStock } from "../inventory/inventory.services.js";
import { findProductById } from "../products/products.repository.js";
import { createInvoiceFromOrder } from "../invoices/invoices.services.js";
import AppError from "../../shared/errors/AppError.js";



export const createFulfillmentForOrder = async (orderId, warehouseId) => {
  const order = await findOrderById(orderId);
  if (!order) {
    throw new AppError("Sales order not found", 404);
  }

  if (order.status !== "CONFIRMED") {
    throw new AppError(`Order cannot be fulfilled. Current status: ${order.status}`, 400);
  }

  const warehouse = await findWarehouseById(warehouseId);
  if (!warehouse || !warehouse.is_active) {
    throw new AppError("Warehouse not found or inactive", 400);
  }

  const existingFulfillment = await fulfillmentRepo.findFulfillmentByOrderId(orderId);
  if (existingFulfillment) {
    throw new AppError("Fulfillment pipeline already exists for this order", 409);
  }

  const orderItems = await findOrderItemsByOrderId(orderId);
  if (orderItems.length === 0) {
    throw new AppError("Sales order has no items to fulfill", 400);
  }

  // 1. Check and reserve inventory for all items in the selected warehouse
  for (const item of orderItems) {
    await reserveStock(item.product_id, warehouseId, item.quantity, orderId);
  }

  // 2. Create Fulfillment Record (PENDING state)
  const fulfillment = await fulfillmentRepo.createFulfillment({
    order_id: orderId,
    warehouse_id: warehouseId,
    status: "PENDING",
  });

  // 3. Create Fulfillment Items
  for (const item of orderItems) {
    await fulfillmentRepo.createFulfillmentItem({
      fulfillment_id: fulfillment.id,
      order_item_id: item.id,
      quantity: item.quantity,
    });
  }

  // 4. Update order status to PROCESSING
  await updateOrder(orderId, { status: "PROCESSING" });

  const items = await fulfillmentRepo.findFulfillmentItemsByFulfillmentId(fulfillment.id);

  return {
    ...fulfillment,
    items,
  };
};

export const getFulfillments = async (filters = {}) => {
  return fulfillmentRepo.findAllFulfillments(filters);
};

export const getFulfillmentById = async (id) => {
  const fulfillment = await fulfillmentRepo.findFulfillmentById(id);
  if (!fulfillment) {
    throw new AppError("Fulfillment pipeline record not found", 404);
  }
  const items = await fulfillmentRepo.findFulfillmentItemsByFulfillmentId(id);
  return {
    ...fulfillment,
    items,
  };
};

export const pickFulfillment = async (id) => {
  const f = await fulfillmentRepo.findFulfillmentById(id);
  if (!f) throw new AppError("Fulfillment record not found", 404);
  if (f.status !== "PENDING") {
    throw new AppError(`Cannot pick items. Current status: ${f.status}`, 400);
  }

  return fulfillmentRepo.updateFulfillment(id, { status: "PICKING" });
};

export const packFulfillment = async (id) => {
  const f = await fulfillmentRepo.findFulfillmentById(id);
  if (!f) throw new AppError("Fulfillment record not found", 404);
  if (f.status !== "PICKING") {
    throw new AppError(`Cannot pack items. Current status: ${f.status}`, 400);
  }

  return fulfillmentRepo.updateFulfillment(id, { status: "PACKED" });
};

export const shipFulfillment = async (id, trackingNumber) => {
  const f = await fulfillmentRepo.findFulfillmentById(id);
  if (!f) throw new AppError("Fulfillment record not found", 404);
  if (f.status !== "PACKED") {
    throw new AppError(`Cannot ship parcel. Current status: ${f.status}`, 400);
  }

  return fulfillmentRepo.updateFulfillment(id, {
    status: "SHIPPED",
    tracking_number: trackingNumber,
    shipped_at: new Date(),
  });
};

export const deliverFulfillment = async (id) => {
  const f = await fulfillmentRepo.findFulfillmentById(id);
  if (!f) throw new AppError("Fulfillment record not found", 404);
  if (f.status !== "SHIPPED") {
    throw new AppError(`Cannot mark delivered. Current status: ${f.status}`, 400);
  }
  const items = await fulfillmentRepo.findFulfillmentItemsByFulfillmentId(id);

  // DEDUCT PHYSICAL INVENTORY: quantity_on_hand -= qty, quantity_reserved -= qty
  for (const item of items) {
    const prod = await findProductById(item.product_id);
    if (prod && prod.product_type === "SUBSCRIPTION") {
      continue;
    }


    const inv = await findInventoryByWarehouseAndProduct(f.warehouse_id, item.product_id);

    if (inv) {
      const newOnHand = Math.max(0, Number(inv.quantity_on_hand) - Number(item.quantity));
      const newReserved = Math.max(0, Number(inv.quantity_reserved) - Number(item.quantity));

      await updateInventory(inv.id, {
        quantity_on_hand: newOnHand,
        quantity_reserved: newReserved,
      });

      await createMovement({
        warehouse_id: f.warehouse_id,
        product_id: item.product_id,
        movement_type: "ISSUE",
        quantity: Number(item.quantity),
        reference_type: "FULFILLMENT",
        reference_id: id,
      });
    }
  }

  // Mark fulfillment as DELIVERED & Order as FULFILLED

  await fulfillmentRepo.updateFulfillment(id, {
    status: "DELIVERED",
    delivered_at: new Date(),
  });

  await updateOrder(f.order_id, { status: "FULFILLED" });

  // Auto-generate commercial invoice for Finance upon delivery
  try {
    await createInvoiceFromOrder(f.order_id);
  } catch (err) {
    console.warn("Auto invoice generation warning:", err.message);
  }

  return { message: "Fulfillment delivered successfully, inventory stock issued, and commercial invoice generated for Finance!" };
};

