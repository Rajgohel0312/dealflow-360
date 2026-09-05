import { createFulfillmentForOrder } from "./modules/fulfillment/fulfillment.services.js";
import { query } from "./infrastructure/database/index.js";

async function testFulfillment() {
  console.log("=== TESTING FULFILLMENT CREATION FOR SO-000001 ===");

  const orderRes = await query("SELECT id, order_number FROM orders WHERE order_number = 'SO-000001' LIMIT 1", []);
  if (orderRes.rows.length === 0) {
    console.log("No order SO-000001 found.");
    process.exit(0);
  }

  const order = orderRes.rows[0];
  const whRes = await query("SELECT id, name FROM warehouses WHERE code = 'WH-MAIN' LIMIT 1", []);
  const warehouse = whRes.rows[0];

  console.log(`Order: ${order.order_number} (${order.id})`);
  console.log(`Warehouse: ${warehouse.name} (${warehouse.id})`);

  const fulfillment = await createFulfillmentForOrder(order.id, warehouse.id);
  console.log("\n✅ FULFILLMENT CREATED SUCCESSFULLY:", fulfillment);
  process.exit(0);
}

testFulfillment().catch(err => {
  console.error("❌ Fulfillment test error:", err.message);
  process.exit(1);
});
