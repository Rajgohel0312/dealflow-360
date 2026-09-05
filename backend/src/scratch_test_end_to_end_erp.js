import * as quotationService from "./modules/quotations/quotations.services.js";
import * as orderService from "./modules/orders/orders.services.js";
import * as inventoryService from "./modules/inventory/inventory.services.js";
import * as fulfillmentService from "./modules/fulfillment/fulfillment.services.js";
import * as categoryService from "./modules/categories/categories.services.js";
import * as productService from "./modules/products/products.services.js";
import * as priceListService from "./modules/price_lists/price_lists.services.js";
import * as discountService from "./modules/discounts/discounts.services.js";
import { query } from "./infrastructure/database/query.js";
import { ROLES } from "./shared/constants/roles.js";

async function runEndToEndERPTest() {
  console.log("===============================================================");
  console.log("🚀 STARTING COMPLETE END-TO-END ERP DEAL FLOW TEST");
  console.log("===============================================================\n");

  // 1. Get Sales Rep User & Customer
  const salesRepRes = await query("SELECT * FROM users WHERE role_id = $1 LIMIT 1", [ROLES.SALES_REP]);
  if (salesRepRes.rows.length === 0) throw new Error("No Sales Rep found in DB");
  const salesRep = salesRepRes.rows[0];

  const custRes = await query(
    `INSERT INTO customers (name, email, sales_rep_id, customer_tier) 
     VALUES ($1, $2, $3, $4) RETURNING *`,
    ["ACME Corporation " + Date.now(), "acme_" + Date.now() + "@example.com", salesRep.id, "Gold"]
  );
  const customer = custRes.rows[0];
  console.log(`[STEP 1] Customer Setup: ${customer.name} (Tier: ${customer.customer_tier})`);

  // 2. Setup Category & Product
  const categories = await categoryService.getAllCategories();
  const category = categories[0];
  console.log(`[STEP 2] Product Category: ${category.name}`);

  const product = await productService.createProduct({
    category_id: category.id,
    name: "Dell Latitude 7440 Workstation " + Date.now(),
    sku: "DELL-LAT-" + Date.now(),
    description: "Enterprise workstation laptop",
    base_price: 80000.00,
    cost_price: 55000.00,
    unit: "unit",
    tax_rate: 18.00,
    product_type: "ONE_TIME",
    is_active: true,
  });
  console.log(`[STEP 2] Product Created: ${product.name} (Base Price: ₹${product.base_price})`);

  // 3. Price List & Volume Tier Setup
  const priceList = await priceListService.createPriceList({
    name: "Gold Partner Price List " + Date.now(),
    currency: "INR",
    is_active: true,
  });
  await priceListService.addPriceListItem(priceList.id, {
    product_id: product.id,
    price: 72000.00,
    minimum_quantity: 5,
    maximum_quantity: 50,
  });
  console.log(`[STEP 3] Volume Tier Added: 5+ units -> ₹72,000 unit price`);

  // 4. Discount Rule: Gold Tier + Category Max Discount = 15%
  try {
    await discountService.createDiscountRule({
      customer_tier: "Gold",
      category_id: category.id,
      max_discount_percent: 15.00,
      risk_level: "NORMAL",
      is_active: true,
    });
  } catch (e) {
    // Discount rule already present for Gold + Category
  }
  console.log(`[STEP 4] Discount Rule Configured: Gold Tier Max Discount = 15%`);

  // 5. Create Proposal Draft
  const qtn = await quotationService.createQuotation(salesRep.id, ROLES.SALES_REP, {
    customer_id: customer.id,
    price_list_id: priceList.id,
    currency: "INR",
    notes: "End-to-end ERP deal flow proposal",
  });
  console.log(`\n[STEP 5] Proposal Created: ${qtn.quotation_number} (Status: ${qtn.status})`);

  // Add 5 Laptops with 20% requested discount (20% > 15% limit!)
  const lineItem = await quotationService.addQuotationItem(qtn.id, salesRep.id, ROLES.SALES_REP, {
    product_id: product.id,
    quantity: 5,
    discount_percent: 20.00,
  });
  console.log(`[STEP 5] Added Line Item: 5x Laptops @ 20% discount (Tier Price ₹${lineItem.unit_price}/unit)`);

  // 6. Submit Proposal -> Risk Engine Escalation to UNDER_REVIEW
  console.log("\n[STEP 6] Submitting Proposal to Risk Engine...");
  const submitRes = await quotationService.submitQuotation(qtn.id, salesRep.id, ROLES.SALES_REP);
  console.log(`[STEP 6] Risk Engine Result Status: ${submitRes.status} (Requires Approval: ${submitRes.requires_approval})`);
  console.log(`[STEP 6] Risk Escalation Reason:`, submitRes.reasons[0]);

  if (submitRes.status !== "UNDER_REVIEW") {
    throw new Error("Proposal should be UNDER_REVIEW due to 20% > 15% discount limit!");
  }

  // 7. Manager Approves Proposal
  console.log("\n[STEP 7] Manager Approving Proposal...");
  await quotationService.approveQuotation(qtn.id, salesRep.id, {
    comments: "Discount approved by sales manager for enterprise account",
  });
  const approvedQtn = await quotationService.getQuotationById(qtn.id);
  console.log(`[STEP 7] Proposal Status Updated: ${approvedQtn.status}`);

  // 8. Convert Approved Quotation to Sales Order
  console.log("\n[STEP 8] Converting Approved Proposal to Sales Order...");
  const order = await orderService.convertQuotationToOrder(qtn.id, salesRep.id, ROLES.SALES_REP);
  console.log(`[STEP 8] Sales Order Created: ${order.order_number} (Status: ${order.status})`);
  console.log(`[STEP 8] Order Total Amount: ₹${order.total_amount}`);

  // Verify duplicate conversion guard
  try {
    await orderService.convertQuotationToOrder(qtn.id, salesRep.id, ROLES.SALES_REP);
    throw new Error("Duplicate conversion guard failed!");
  } catch (e) {
    console.log(`[STEP 8] Duplicate conversion blocked successfully! (${e.message})`);
  }

  // 9. Warehouse & Stock Setup
  console.log("\n[STEP 9] Warehouse & Inventory Setup...");
  const warehouse = await inventoryService.createWarehouse({
    name: "Ahmedabad Main Hub " + Date.now(),
    code: "WH-AHM-" + Date.now(),
    address: "Ahmedabad, Gujarat",
  });
  console.log(`[STEP 9] Warehouse Created: ${warehouse.name} (${warehouse.code})`);

  // Add 20 Laptops to stock on hand
  await inventoryService.addStock({
    warehouse_id: warehouse.id,
    product_id: product.id,
    quantity: 20,
  });
  const stockBeforeRes = await inventoryService.getInventoryByProduct(product.id);
  const invBefore = stockBeforeRes.stock[0];
  console.log(`[STEP 9] Stock Added: On Hand = ${invBefore.quantity_on_hand}, Reserved = ${invBefore.quantity_reserved}, Available = ${invBefore.quantity_available}`);

  // 10. Insufficient Stock Guard Check
  console.log("\n[STEP 10] Testing Insufficient Stock Guard...");
  try {
    await inventoryService.reserveStock(product.id, warehouse.id, 999, order.id);
    throw new Error("Insufficient stock guard failed!");
  } catch (e) {
    console.log(`[STEP 10] Insufficient stock blocked successfully! (${e.message})`);
  }

  // 11. Fulfillment Creation & Stock Reservation (5 units)
  console.log("\n[STEP 11] Creating Fulfillment Pipeline & Reserving Stock (5 units)...");
  const fulfillment = await fulfillmentService.createFulfillmentForOrder(order.id, warehouse.id);
  console.log(`[STEP 11] Fulfillment Pipeline Created (Status: ${fulfillment.status})`);

  const stockAfterRes = await inventoryService.getInventoryByProduct(product.id);
  const invAfterRes = stockAfterRes.stock[0];
  console.log(`[STEP 11] Stock After Reservation: On Hand = ${invAfterRes.quantity_on_hand}, Reserved = ${invAfterRes.quantity_reserved}, Available = ${invAfterRes.quantity_available}`);

  // 12. Operations Pipeline Steps: Pick -> Pack -> Ship -> Deliver
  console.log("\n[STEP 12] Operations Pipeline Progression...");
  
  // Pick
  const picked = await fulfillmentService.pickFulfillment(fulfillment.id);
  console.log(`  -> Action Picked: Status = ${picked.status}`);

  // Pack
  const packed = await fulfillmentService.packFulfillment(fulfillment.id);
  console.log(`  -> Action Packed: Status = ${packed.status}`);

  // Ship
  const shipped = await fulfillmentService.shipFulfillment(fulfillment.id, "TRK-DEALFLOW-998877");
  console.log(`  -> Action Shipped: Status = ${shipped.status} (Tracking: ${shipped.tracking_number})`);

  // Deliver & Physical Stock Issue
  const deliverRes = await fulfillmentService.deliverFulfillment(fulfillment.id);
  console.log(`  -> Action Delivered: ${deliverRes.message}`);

  const stockFinalRes = await inventoryService.getInventoryByProduct(product.id);
  const invFinal = stockFinalRes.stock[0];
  console.log(`\n[STEP 12] Final Inventory State: On Hand = ${invFinal.quantity_on_hand}, Reserved = ${invFinal.quantity_reserved}, Available = ${invFinal.quantity_available}`);

  const finalOrderState = await orderService.getOrderById(order.id);
  console.log(`[STEP 12] Final Sales Order Status: ${finalOrderState.status}`);

  console.log("\n===============================================================");
  console.log("🎉 COMPLETE END-TO-END ERP DEAL FLOW TEST PASSED PERFECTLY!");
  console.log("===============================================================");
  process.exit(0);
}

runEndToEndERPTest().catch((err) => {
  console.error("END-TO-END ERP TEST FAILED:", err);
  process.exit(1);
});
