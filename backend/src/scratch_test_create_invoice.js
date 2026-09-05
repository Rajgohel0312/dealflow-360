import { createInvoiceFromOrder } from "./modules/invoices/invoices.services.js";
import { query } from "./infrastructure/database/index.js";

async function testInvoiceGen() {
  console.log("=== TESTING COMMERCIAL INVOICE GENERATION FOR SO-000001 ===");

  const orderRes = await query("SELECT id, order_number FROM orders WHERE order_number = 'SO-000001' LIMIT 1", []);
  if (orderRes.rows.length === 0) {
    console.log("No order SO-000001 found.");
    process.exit(0);
  }

  const order = orderRes.rows[0];
  const invoice = await createInvoiceFromOrder(order.id);
  console.log("\n✅ COMMERCIAL INVOICE CREATED SUCCESSFULLY:", invoice);
  process.exit(0);
}

testInvoiceGen().catch(err => {
  console.error("❌ Invoice test error:", err.message);
  process.exit(1);
});
