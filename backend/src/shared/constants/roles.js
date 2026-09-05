import { query } from "../../infrastructure/database/index.js";
import { withCache } from "../utils/cacheHelper.js";

/**
 * ROLES is populated at startup by loadRoles().
 * Keys: ADMIN | SALES_REP | MANAGER | FINANCE | OPERATIONS
 * Values: UUID from the roles table (survives re-seeds).
 */
export const ROLES = {};

export async function loadRoles() {
  const rolesData = await withCache("dealflow:roles:all", 86400, async () => {
    const result = await query("SELECT id, name FROM roles", []);
    return result.rows;
  });

  if (rolesData && Array.isArray(rolesData)) {
    for (const row of rolesData) {
      const key = row.name.toUpperCase().replace(/\s+/g, "_"); // "Sales Rep" -> SALES_REP
      ROLES[key] = row.id;
    }
  }

  console.log("✅ ROLES loaded:", Object.keys(ROLES).join(", "));
}