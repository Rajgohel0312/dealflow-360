import { query } from "../../infrastructure/database/index.js";

/**
 * ROLES is populated at startup by loadRoles().
 * Keys: ADMIN | SALES_REP | MANAGER | FINANCE | OPERATIONS
 * Values: UUID from the roles table (survives re-seeds).
 */
export const ROLES = {};

export async function loadRoles() {
  const result = await query("SELECT id, name FROM roles", []);

  for (const row of result.rows) {
    const key = row.name.toUpperCase().replace(/\s+/g, "_"); // "Sales Rep" → SALES_REP
    ROLES[key] = row.id;
  }

  console.log("✅ ROLES loaded from DB:", Object.keys(ROLES).join(", "));
}