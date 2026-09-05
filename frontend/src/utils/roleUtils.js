export const getUserRole = (user) => {
  if (!user) return "CUSTOMER";
  const email = (user.email || "").toLowerCase();
  if (email === "admin@dealflow.com") return "ADMIN";
  if (email === "sales@dealflow.com") return "SALES_REP";
  if (email === "manager@dealflow.com") return "MANAGER";
  if (email === "finance@dealflow.com") return "FINANCE";
  if (email === "ops@dealflow.com") return "OPERATIONS";

  if (user.role_name) {
    const r = user.role_name.toUpperCase();
    if (r.includes("ADMIN")) return "ADMIN";
    if (r.includes("SALES")) return "SALES_REP";
    if (r.includes("MANAGER")) return "MANAGER";
    if (r.includes("FINANCE")) return "FINANCE";
    if (r.includes("OPERAT")) return "OPERATIONS";
    if (r.includes("CUSTOMER")) return "CUSTOMER";
  }

  if (user.role) {
    const r = user.role.toUpperCase();
    if (r.includes("ADMIN")) return "ADMIN";
    if (r.includes("SALES")) return "SALES_REP";
    if (r.includes("MANAGER")) return "MANAGER";
    if (r.includes("FINANCE")) return "FINANCE";
    if (r.includes("OPERAT")) return "OPERATIONS";
    if (r.includes("CUSTOMER")) return "CUSTOMER";
  }

  if (user.customer_id) return "CUSTOMER";

  return "OPERATIONS";
};
