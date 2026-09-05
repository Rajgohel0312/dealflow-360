import { query } from "./infrastructure/database/index.js";
import { createCategory } from "./modules/categories/categories.services.js";
import { createProduct } from "./modules/products/products.services.js";
import { registerCustomerUser } from "./modules/customers/customers.repository.js";
import { createQuotation, addQuotationItem, submitQuotation, getPendingApprovals } from "./modules/quotations/quotations.services.js";

async function testApprovalTrigger() {
  console.log("=== TESTING QUOTATION APPROVAL ESCALATION ===");

  // 1. Get Admin user ID
  const userRes = await query("SELECT id FROM users WHERE email = 'admin@dealflow.com' LIMIT 1", []);
  const adminId = userRes.rows[0].id;

  // 2. Create Category & Product
  const category = await createCategory({ name: `Hardware Category ${Date.now()}`, description: "Testing" });
  const product = await createProduct({
    category_id: category.id,
    name: "Enterprise Testing Server",
    sku: `SKU-TEST-${Date.now()}`,
    base_price: 100000,
    cost_price: 60000,
    unit: "unit",
    tax_rate: 18,
    product_type: "ONE_TIME",
  });

  // 3. Create Customer
  const customer = await registerCustomerUser({
    name: "High Discount Test Corp",
    email: `test_${Date.now()}@highdiscount.com`,
    customer_tier: "Bronze",
    sales_rep_id: adminId,
  });

  // 4. Create Draft Quotation (salesRepId, userRole, data)
  const quote = await createQuotation(adminId, "Admin", {
    customer_id: customer.id,
    notes: "High discount deal requiring Manager approval",
  });

  console.log(`\n1. Created Draft Quotation: ${quote.quotation_number}`);

  // 5. Add Line Item with 25% Discount (exceeds Bronze 5% limit)
  await addQuotationItem(quote.id, adminId, "Admin", {
    product_id: product.id,
    quantity: 2,
    discount_percent: 25, // 25% High Discount!
  });
  console.log("2. Added line item with 25% discount (Exceeds Bronze Tier 5% max allowed)");

  // 6. Submit Quotation for Review
  const submitRes = await submitQuotation(quote.id, adminId, "Admin");
  console.log("\n3. Submission Result:", submitRes);

  // 7. Fetch Pending Approvals for Manager
  const pending = await getPendingApprovals();
  console.log("\n4. Pending Approvals in Manager Queue:");
  console.log(JSON.stringify(pending, null, 2));

  console.log("\n✅ APPROVAL QUEUE TEST COMPLETED SUCCESSFULLY!");
  process.exit(0);
}

testApprovalTrigger().catch((err) => {
  console.error("❌ Approval test failed:", err);
  process.exit(1);
});
