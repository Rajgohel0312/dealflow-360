/**
 * DealFlow-360 — Admin-Only Seed Script
 * Run: node src/scripts/seed_admin_only.js
 *
 * ⚠ DESTRUCTIVE — wipes ALL data, then seeds ONLY roles + one Admin user.
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

    // ─── TRUNCATE ALL DATA TABLES ───────────────────────────────────
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

    // ─── SEED ROLES ──────────────────────────────────────────────────
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
    console.log("  Roles seeded:", Object.keys(roles).join(", "));

    // ─── SEED ADMIN USER ONLY ────────────────────────────────────────
    console.log("\n👤 Seeding Admin user...");
    const passwordHash = await bcrypt.hash("Password123!", 10);

    await client.query(
      `INSERT INTO users (name, email, password_hash, role_id)
       VALUES ($1, $2, $3, $4)`,
      ["Super Admin", "admin@dealflow.com", passwordHash, roles["Admin"]]
    );

    await client.query("COMMIT");

    console.log("\n" + "=".repeat(50));
    console.log("✅ ADMIN SEED COMPLETE");
    console.log("=".repeat(50));
    console.log(`
🔑 Admin Login:
   URL:      http://localhost:5173/login
   Email:    admin@dealflow.com
   Password: Password123!
`);

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("\n❌ SEED FAILED — rolled back:", err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
