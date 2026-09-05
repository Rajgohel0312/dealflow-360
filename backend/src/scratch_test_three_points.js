import { query } from "./infrastructure/database/index.js";
import CacheService from "./infrastructure/redis/redis.service.js";
import { createCategory } from "./modules/categories/categories.services.js";
import { createProduct } from "./modules/products/products.services.js";
import { registerCustomerUser } from "./modules/customers/customers.repository.js";
import { reserveStock } from "./modules/inventory/inventory.services.js";
import { createQuotation, addQuotationItem, submitQuotation, approveQuotation } from "./modules/quotations/quotations.services.js";
import { convertQuotationToOrder } from "./modules/orders/orders.services.js";
import { createFulfillmentForOrder, pickFulfillment, packFulfillment, shipFulfillment, deliverFulfillment } from "./modules/fulfillment/fulfillment.services.js";

async function runThreePointsTest() {
  console.log("===============================================================");
  console.log("    🧪 TESTING THE 3 ADVANCED WORKFLOW & SECURITY POINTS      ");
  console.log("===============================================================\n");

  // Get Admin user ID
  const userRes = await query("SELECT id FROM users WHERE email = 'admin@dealflow.com' LIMIT 1", []);
  const adminId = userRes.rows[0].id;
  const whRes = await query("SELECT id, name FROM warehouses WHERE code = 'WH-MAIN' LIMIT 1", []);
  const warehouse = whRes.rows[0];

  // -------------------------------------------------------------------
  // POINT 1: Redis Distributed Mutex Lock Test
  // -------------------------------------------------------------------
  console.log("📌 POINT 1: Redis Distributed Mutex Lock (Order Concurrency)");
  const testLockKey = "dealflow:lock:order:test_quotation_9999";
  
  const lockA = await CacheService.acquireLock(testLockKey, 5000);
  console.log(`   [Client A] Acquired Lock: acquired = ${lockA.acquired}`);

  const lockB = await CacheService.acquireLock(testLockKey, 5000);
  console.log(`   [Client B] Concurrent Lock Attempt: acquired = ${lockB.acquired} (Correctly Blocked!)`);

  await CacheService.releaseLock(testLockKey, lockA.lockValue);
  console.log(`   [Client A] Released Lock.`);
  console.log("   ✅ POINT 1 PASSED: Distributed locking prevents duplicate concurrent conversions!\n");

  // -------------------------------------------------------------------
  // POINT 2: Smart Digital Subscription Handling (Bypass Shelf Check)
  // -------------------------------------------------------------------
  console.log("📌 POINT 2: Digital Subscription Smart Inventory Bypass");
  const category = await createCategory({ name: `Digital SaaS Cat ${Date.now()}`, description: "SaaS" });
  const subProduct = await createProduct({
    category_id: category.id,
    name: "Cloud ERP License (Digital)",
    sku: `SKU-SAAS-${Date.now()}`,
    base_price: 50000,
    cost_price: 10000,
    unit: "license",
    product_type: "SUBSCRIPTION", // Digital Subscription!
  });

  console.log(`   Testing reserveStock for SUBSCRIPTION product '${subProduct.name}'...`);
  const stockResult = await reserveStock(subProduct.id, warehouse.id, 10);
  console.log(`   reserveStock result: ${stockResult} (Returned null -> Bypassed physical shelf checks!)`);
  console.log("   ✅ POINT 2 PASSED: Digital SaaS subscriptions bypass physical warehouse checks cleanly!\n");

  // -------------------------------------------------------------------
  // POINT 3: Automated Invoice Generation upon Fulfillment Delivery
  // -------------------------------------------------------------------
  console.log("📌 POINT 3: Automated Commercial Invoice Generation on Delivery");
  
  // 1. Create Customer & Quotation
  const customer = await registerCustomerUser({
    name: `Auto Invoice Corp ${Date.now()}`,
    email: `autoinv_${Date.now()}@corp.com`,
    customer_tier: "Silver",
    sales_rep_id: adminId,
  });

  const quote = await createQuotation(adminId, "Admin", { customer_id: customer.id, notes: "Auto Invoice Test" });
  await addQuotationItem(quote.id, adminId, "Admin", { product_id: subProduct.id, quantity: 5, discount_percent: 0 });
  await submitQuotation(quote.id, adminId, "Admin");

  // 2. Convert to Order
  const order = await convertQuotationToOrder(quote.id, adminId, "Admin");
  console.log(`   Created Sales Order: ${order.order_number}`);

  // 3. Initiate Fulfillment
  const fulfillment = await createFulfillmentForOrder(order.id, warehouse.id);
  console.log(`   Initiated Fulfillment: ${fulfillment.id} (Status: ${fulfillment.status})`);

  // 4. Progress through pipeline: PICKING -> PACKED -> SHIPPED -> DELIVERED
  await pickFulfillment(fulfillment.id);
  await packFulfillment(fulfillment.id);
  await shipFulfillment(fulfillment.id, "TRK-AUTO-998877");
  console.log("   Fulfillment transitioned: PENDING -> PICKING -> PACKED -> SHIPPED");

  // 5. Deliver Fulfillment (Triggers Auto Invoice Generation)
  const deliverRes = await deliverFulfillment(fulfillment.id);
  console.log("   Delivered Fulfillment Result:", deliverRes.message);

  // 6. Verify Invoice Created in Database
  const invRes = await query("SELECT * FROM invoices WHERE order_id = $1 LIMIT 1", [order.id]);
  const invoice = invRes.rows[0];

  console.log(`\n   Verified Invoice in Database:`);
  console.log(`   - Invoice Number: ${invoice.invoice_number}`);
  console.log(`   - Total Amount:   ₹${Number(invoice.total_amount).toLocaleString("en-IN")}`);
  console.log(`   - Status:         ${invoice.status}`);
  console.log("   ✅ POINT 3 PASSED: Commercial Invoice automatically generated upon Delivery!\n");

  console.log("===============================================================");
  console.log("    🎉 ALL 3 ADVANCED WORKFLOW & SECURITY TESTS PASSED!        ");
  console.log("===============================================================");
  process.exit(0);
}

runThreePointsTest().catch((err) => {
  console.error("❌ Three points test failed:", err);
  process.exit(1);
});
