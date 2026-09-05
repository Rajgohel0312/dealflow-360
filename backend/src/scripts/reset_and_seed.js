/**
 * DealFlow-360 — Full Database Reset & Seed Script
 * Run: node src/scripts/reset_and_seed.js
 *
 * ⚠ DESTRUCTIVE — wipes ALL data and re-seeds from scratch.
 */

import "dotenv/config";
import pg from "pg";
import bcrypt from "bcrypt";

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

async function run() {
  const client = await pool.connect();

  try {
    console.log("\n🔄 Connecting to database...");
    await client.query("BEGIN");

    // ─────────────────────────────────────────────
    // 1. TRUNCATE ALL TABLES (in safe FK order)
    // ─────────────────────────────────────────────
    console.log("🗑  Truncating all data tables...");
    await client.query(`
      TRUNCATE TABLE
        negotiation_items,
        negotiations,
        product_recommendations,
        payments,
        invoices,
        fulfillments,
        inventory_movements,
        inventory,
        order_items,
        orders,
        quotation_approvals,
        quotation_items,
        quotations,
        price_list_items,
        price_lists,
        discount_rules,
        products,
        product_categories,
        customer_users,
        customers,
        users,
        roles
      RESTART IDENTITY CASCADE;
    `);
    console.log("✅ All tables truncated.");

    // ─────────────────────────────────────────────
    // 2. ROLES
    // ─────────────────────────────────────────────
    console.log("\n📌 Seeding roles...");
    const rolesRes = await client.query(`
      INSERT INTO roles (name, description) VALUES
        ('Admin',      'System administrator with full access'),
        ('Sales Rep',  'Manages customers and creates quotations'),
        ('Manager',    'Reviews and approves quotations and deals'),
        ('Finance',    'Handles financial operations and high-risk approvals'),
        ('Operations', 'Manages order fulfillment and inventory')
      RETURNING id, name;
    `);

    const roles = {};
    for (const r of rolesRes.rows) roles[r.name] = r.id;
    console.log("  Roles:", Object.keys(roles).join(", "));

    // ─────────────────────────────────────────────
    // 3. SYSTEM USERS
    // ─────────────────────────────────────────────
    console.log("\n👤 Seeding system users...");
    const PASS = "Password123!";
    const hash = await bcrypt.hash(PASS, 10);

    const usersData = [
      { name: "Super Admin",    email: "admin@dealflow.com",     role: "Admin"      },
      { name: "Alice Sales",    email: "sales@dealflow.com",     role: "Sales Rep"  },
      { name: "Bob Manager",    email: "manager@dealflow.com",   role: "Manager"    },
      { name: "Carol Finance",  email: "finance@dealflow.com",   role: "Finance"    },
      { name: "Dave Ops",       email: "ops@dealflow.com",       role: "Operations" },
    ];

    const userIds = {};
    for (const u of usersData) {
      const res = await client.query(
        `INSERT INTO users (name, email, password_hash, role_id)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [u.name, u.email, hash, roles[u.role]]
      );
      userIds[u.role] = res.rows[0].id;
      console.log(`  ✅ ${u.role}: ${u.email}`);
    }

    // ─────────────────────────────────────────────
    // 4. PRODUCT CATEGORIES
    // ─────────────────────────────────────────────
    console.log("\n📦 Seeding product categories...");
    const catRes = await client.query(`
      INSERT INTO product_categories (name, description) VALUES
        ('Hardware',     'Physical hardware products'),
        ('Software',     'Software products and licenses'),
        ('Services',     'Professional and business services'),
        ('Subscription', 'Recurring subscription products')
      RETURNING id, name;
    `);
    const cats = {};
    for (const c of catRes.rows) cats[c.name] = c.id;
    console.log("  Categories:", Object.keys(cats).join(", "));

    // ─────────────────────────────────────────────
    // 5. PRODUCTS
    // ─────────────────────────────────────────────
    console.log("\n🛒 Seeding products...");
    const productsData = [
      // Hardware
      { cat: "Hardware",     name: "Industrial Server X1",     sku: "HW-SRV-001", base: 85000,  cost: 60000, unit: "unit",    tax: 18, type: "ONE_TIME" },
      { cat: "Hardware",     name: "Network Switch 48-Port",   sku: "HW-NSW-001", base: 32000,  cost: 22000, unit: "unit",    tax: 18, type: "ONE_TIME" },
      { cat: "Hardware",     name: "UPS 10KVA",                sku: "HW-UPS-001", base: 48000,  cost: 35000, unit: "unit",    tax: 18, type: "ONE_TIME" },
      // Software
      { cat: "Software",     name: "ERP Suite Pro (Per Seat)", sku: "SW-ERP-001", base: 12000,  cost:  6000, unit: "seat",   tax: 18, type: "ONE_TIME" },
      { cat: "Software",     name: "Security Suite Standard",  sku: "SW-SEC-001", base:  8500,  cost:  4000, unit: "license",tax: 18, type: "ONE_TIME" },
      { cat: "Software",     name: "Analytics Platform",       sku: "SW-ANL-001", base: 25000,  cost: 12000, unit: "license",tax: 18, type: "ONE_TIME" },
      // Services
      { cat: "Services",     name: "Implementation Services",  sku: "SV-IMP-001", base: 15000,  cost:  8000, unit: "day",    tax: 18, type: "ONE_TIME" },
      { cat: "Services",     name: "AMC Support (Annual)",     sku: "SV-AMC-001", base: 18000,  cost: 10000, unit: "year",   tax: 18, type: "ONE_TIME" },
      { cat: "Services",     name: "Training Workshop",        sku: "SV-TRN-001", base:  5000,  cost:  2500, unit: "day",    tax: 18, type: "ONE_TIME" },
      // Subscription
      { cat: "Subscription", name: "Cloud Storage 1TB/mo",     sku: "SUB-STG-001",base:  2500,  cost:  1200, unit: "month",  tax: 18, type: "SUBSCRIPTION" },
      { cat: "Subscription", name: "Managed IT Services/mo",   sku: "SUB-MIT-001",base: 35000,  cost: 20000, unit: "month",  tax: 18, type: "SUBSCRIPTION" },
    ];

    const productIds = {};
    for (const p of productsData) {
      const res = await client.query(
        `INSERT INTO products (category_id, name, sku, base_price, cost_price, unit, tax_rate, product_type, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true) RETURNING id, sku`,
        [cats[p.cat], p.name, p.sku, p.base, p.cost, p.unit, p.tax, p.type]
      );
      productIds[p.sku] = res.rows[0].id;
      console.log(`  ✅ ${p.name} (${p.sku}) ₹${p.base.toLocaleString()}`);
    }

    // ─────────────────────────────────────────────
    // 6. DISCOUNT RULES (Tier × Category)
    // ─────────────────────────────────────────────
    console.log("\n📊 Seeding discount rules...");
    const discountRules = [
      // Bronze tier — tightest
      { tier: "Bronze", cat: "Hardware",     max: 5,  risk: "NORMAL"  },
      { tier: "Bronze", cat: "Software",     max: 8,  risk: "NORMAL"  },
      { tier: "Bronze", cat: "Services",     max: 7,  risk: "NORMAL"  },
      { tier: "Bronze", cat: "Subscription", max: 5,  risk: "NORMAL"  },
      // Silver tier — moderate
      { tier: "Silver", cat: "Hardware",     max: 10, risk: "NORMAL"  },
      { tier: "Silver", cat: "Software",     max: 12, risk: "NORMAL"  },
      { tier: "Silver", cat: "Services",     max: 10, risk: "NORMAL"  },
      { tier: "Silver", cat: "Subscription", max: 8,  risk: "NORMAL"  },
      // Gold tier — most generous
      { tier: "Gold",   cat: "Hardware",     max: 15, risk: "NORMAL" },
      { tier: "Gold",   cat: "Software",     max: 20, risk: "NORMAL" },
      { tier: "Gold",   cat: "Services",     max: 18, risk: "NORMAL" },
      { tier: "Gold",   cat: "Subscription", max: 15, risk: "NORMAL" },
    ];

    for (const dr of discountRules) {
      await client.query(
        `INSERT INTO discount_rules (customer_tier, category_id, max_discount_percent, risk_level)
         VALUES ($1,$2,$3,$4)`,
        [dr.tier, cats[dr.cat], dr.max, dr.risk]
      );
    }
    console.log(`  ✅ ${discountRules.length} discount rules created.`);

    // ─────────────────────────────────────────────
    // 7. PRICE LISTS
    // ─────────────────────────────────────────────
    console.log("\n💰 Seeding price lists...");
    const plRes = await client.query(
      `INSERT INTO price_lists (name, currency, is_active)
       VALUES ($1,$2,true) RETURNING id`,
      ["Standard INR Price List", "INR"]
    );
    const priceListId = plRes.rows[0].id;

    // Volume tiers for a few products
    const priceItems = [
      { sku: "HW-SRV-001", minQty: 1,  price: 85000 },
      { sku: "HW-SRV-001", minQty: 5,  price: 80000 },
      { sku: "HW-SRV-001", minQty: 10, price: 75000 },
      { sku: "SW-ERP-001", minQty: 1,  price: 12000 },
      { sku: "SW-ERP-001", minQty: 10, price: 10500 },
      { sku: "SW-ERP-001", minQty: 50, price:  9500 },
      { sku: "SV-IMP-001", minQty: 1,  price: 15000 },
      { sku: "SV-IMP-001", minQty: 5,  price: 13000 },
      { sku: "SUB-MIT-001",minQty: 1,  price: 35000 },
      { sku: "SUB-MIT-001",minQty: 3,  price: 32000 },
    ];

    for (const pi of priceItems) {
      await client.query(
        `INSERT INTO price_list_items (price_list_id, product_id, minimum_quantity, price)
         VALUES ($1,$2,$3,$4)`,
        [priceListId, productIds[pi.sku], pi.minQty, pi.price]
      );
    }
    console.log(`  ✅ Price list: "Standard INR Price List" with ${priceItems.length} tier entries.`);

    // ─────────────────────────────────────────────
    // 8. CUSTOMER COMPANIES
    // ─────────────────────────────────────────────
    console.log("\n🏢 Seeding customer companies...");
    const customersData = [
      { name: "Acme Enterprises",    email: "contact@acme.com",     tier: "Gold",   currency: "INR", phone: "9000000001", address: "123 MG Road, Bangalore" },
      { name: "Beta Corp",           email: "info@betacorp.com",    tier: "Silver", currency: "INR", phone: "9000000002", address: "45 Park Street, Mumbai" },
      { name: "Gamma Solutions",     email: "hello@gamma.com",      tier: "Bronze", currency: "INR", phone: "9000000003", address: "67 IT Park, Hyderabad" },
    ];

    const customerIds = {};
    for (const c of customersData) {
      const res = await client.query(
        `INSERT INTO customers (name, email, phone, address, customer_tier, currency, sales_rep_id, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,true) RETURNING id`,
        [c.name, c.email, c.phone, c.address, c.tier, c.currency, userIds["Sales Rep"]]
      );
      customerIds[c.name] = res.rows[0].id;
      console.log(`  ✅ ${c.name} (${c.tier} Tier)`);
    }

    // ─────────────────────────────────────────────
    // 9. CUSTOMER USERS (Portal Credentials)
    // ─────────────────────────────────────────────
    console.log("\n🔑 Seeding customer portal users...");
    const CUST_PASS_HASH = await bcrypt.hash("CustPass123!", 10);

    const custUsers = [
      { custName: "Acme Enterprises",  name: "John Acme",   email: "john@acme.com"   },
      { custName: "Beta Corp",         name: "Jane Beta",   email: "jane@betacorp.com" },
      { custName: "Gamma Solutions",   name: "Gary Gamma",  email: "gary@gamma.com"  },
    ];

    for (const cu of custUsers) {
      await client.query(
        `INSERT INTO customer_users (customer_id, name, email, password_hash, is_active, must_change_password)
         VALUES ($1,$2,$3,$4,true,false)`,
        [customerIds[cu.custName], cu.name, cu.email, CUST_PASS_HASH]
      );
      console.log(`  ✅ ${cu.name} <${cu.email}> → ${cu.custName}`);
    }

    // ─────────────────────────────────────────────
    // COMMIT
    // ─────────────────────────────────────────────
    await client.query("COMMIT");

    console.log("\n" + "=".repeat(60));
    console.log("✅ DATABASE RESET & SEED COMPLETE");
    console.log("=".repeat(60));
    console.log(`
📋 ROLE IDs (for reference):
${Object.entries(roles).map(([n,id]) => `  ${n.padEnd(14)} → ${id}`).join("\n")}

👤 SYSTEM USER LOGINS (all passwords: Password123!):
  admin@dealflow.com   → Admin
  sales@dealflow.com   → Sales Rep
  manager@dealflow.com → Manager
  finance@dealflow.com → Finance
  ops@dealflow.com     → Operations

🏢 CUSTOMER PORTAL LOGINS (password: CustPass123!):
  john@acme.com        → Acme Enterprises (Gold)
  jane@betacorp.com    → Beta Corp (Silver)
  gary@gamma.com       → Gamma Solutions (Bronze)

📦 PRODUCTS: ${productsData.length} products across 4 categories
💰 PRICE LIST: Standard INR Price List (with volume tiers)
📊 DISCOUNT RULES: ${discountRules.length} rules (Bronze/Silver/Gold × 4 categories)
`);

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("\n❌ SEED FAILED — rolled back:", err.message);
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
