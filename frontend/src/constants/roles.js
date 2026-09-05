/**
 * Role name strings — match the `name` column in the roles table.
 * Use role_name from user object (returned by login API) instead of UUIDs.
 */
export const ROLE_NAMES = {
  ADMIN: "Admin",
  SALES_REP: "Sales Rep",
  MANAGER: "Manager",
  FINANCE: "Finance",
  OPERATIONS: "Operations",
};

/**
 * Helper: check if a user has a given role by name.
 * Works regardless of UUID changes from re-seeds.
 */
export const hasRole = (user, roleName) =>
  user?.role_name === roleName || user?.role === roleName;
