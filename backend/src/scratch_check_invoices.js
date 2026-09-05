import { query } from "./infrastructure/database/index.js";

async function checkInvoices() {
  console.log("=== INVOICE DIAGNOSTIC ===");

  const invoices = await query("SELECT * FROM invoices", []);
  console.log("\n1. INVOICES IN DB:", JSON.stringify(invoices.rows, null, 2));

  const orders = await query("SELECT id, order_number, status FROM orders", []);
  console.log("\n2. ORDERS IN DB:", JSON.stringify(orders.rows, null, 2));

  process.exit(0);
}

checkInvoices().catch(err => {
  console.error("Diagnostic error:", err);
  process.exit(1);
});
