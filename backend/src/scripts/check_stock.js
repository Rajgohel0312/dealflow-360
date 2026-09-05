import { query } from "../infrastructure/database/index.js";

async function checkStockNeeds() {
  const orders = await query(
    `SELECT o.id, o.order_number, c.name as customer_name 
     FROM orders o 
     JOIN customers c ON o.customer_id = c.id 
     WHERE o.status = 'CONFIRMED'`,
    []
  );

  console.log("=== CONFIRMED SALES ORDERS & REQUIRED PRODUCTS ===");
  const totalRequired = {};

  for (const o of orders.rows) {
    const items = await query(
      `SELECT oi.*, p.id as product_id, p.name as product_name, p.sku as product_sku 
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = $1`,
      [o.id]
    );

    console.log(`\n📦 ${o.order_number} (Customer: ${o.customer_name}):`);
    for (const item of items.rows) {
      console.log(
        `   • Product: ${item.product_name} (${item.product_sku}) | Qty Needed: ${item.quantity}`
      );
      if (!totalRequired[item.product_sku]) {
        totalRequired[item.product_sku] = {
          product_id: item.product_id,
          name: item.product_name,
          sku: item.product_sku,
          qtyNeeded: 0,
        };
      }
      totalRequired[item.product_sku].qtyNeeded += Number(item.quantity);
    }
  }

  const warehouses = await query(`SELECT * FROM warehouses WHERE is_active = true ORDER BY name ASC`, []);
  console.log("\n=== ACTIVE WAREHOUSES ===");
  for (const w of warehouses.rows) {
    console.log(`🏢 Warehouse: ${w.name} (Code: ${w.code}) | ID: ${w.id}`);
  }

  const inventory = await query(
    `SELECT i.*, p.sku as product_sku, w.name as warehouse_name 
     FROM inventory i 
     JOIN products p ON i.product_id = p.id 
     JOIN warehouses w ON i.warehouse_id = w.id`,
    []
  );

  console.log("\n=== CURRENT WAREHOUSE STOCK ===");
  if (inventory.rows.length === 0) {
    console.log("⚠️ No stock currently added to any warehouse!");
  } else {
    for (const inv of inventory.rows) {
      console.log(
        `   • Warehouse: ${inv.warehouse_name} | SKU: ${inv.product_sku} | On Hand: ${inv.quantity_on_hand} | Reserved: ${inv.quantity_reserved}`
      );
    }
  }

  console.log("\n=== SUMMARY OF STOCK TO ADD IN INVENTORY ===");
  console.table(Object.values(totalRequired));

  process.exit(0);
}

checkStockNeeds().catch(console.error);
