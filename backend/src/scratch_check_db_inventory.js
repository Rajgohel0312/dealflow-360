import { query } from "./infrastructure/database/index.js";

async function checkDbInventory() {
  console.log("=== DB INVENTORY DIAGNOSTIC ===");

  const warehouses = await query("SELECT id, name, code FROM warehouses", []);
  console.log("\n1. WAREHOUSES:", JSON.stringify(warehouses.rows, null, 2));

  const products = await query("SELECT id, name, sku FROM products", []);
  console.log("\n2. PRODUCTS:", JSON.stringify(products.rows, null, 2));

  const inventory = await query(`
    SELECT i.*, w.name as warehouse_name, p.name as product_name 
    FROM inventory i 
    LEFT JOIN warehouses w ON i.warehouse_id = w.id 
    LEFT JOIN products p ON i.product_id = p.id
  `, []);
  console.log("\n3. INVENTORY TABLE ROWS:", JSON.stringify(inventory.rows, null, 2));

  const orders = await query(`
    SELECT o.id, o.order_number, oi.product_id, oi.quantity, p.name as product_name
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
  `, []);
  console.log("\n4. ORDERS & ORDER ITEMS:", JSON.stringify(orders.rows, null, 2));

  process.exit(0);
}

checkDbInventory().catch(err => {
  console.error("Diagnostic error:", err);
  process.exit(1);
});
