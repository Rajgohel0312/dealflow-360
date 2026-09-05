import { useAuth } from "../../context/AuthContext";
import SalesRepDashboard from "../customers/SalesRepDashboard";
import ManagerDashboard from "./ManagerDashboard";
import FinanceDashboard from "./FinanceDashboard";
import OperationsDashboard from "./OperationsDashboard";
import AdminDashboard from "./AdminDashboard";
import CustomerPortalDashboard from "../customerPortal/CustomerPortalDashboard";

export default function DashboardRouter() {
  const { user } = useAuth();

  const getNormalizedRole = () => {
    const email = (user?.email || "").toLowerCase();
    if (email === "admin@dealflow.com") return "ADMIN";
    if (email === "sales@dealflow.com") return "SALES_REP";
    if (email === "manager@dealflow.com") return "MANAGER";
    if (email === "finance@dealflow.com") return "FINANCE";
    if (email === "ops@dealflow.com") return "OPERATIONS";

    if (user?.role_name) {
      const r = user.role_name.toUpperCase();
      if (r.includes("ADMIN")) return "ADMIN";
      if (r.includes("SALES")) return "SALES_REP";
      if (r.includes("MANAGER")) return "MANAGER";
      if (r.includes("FINANCE")) return "FINANCE";
      if (r.includes("OPERAT")) return "OPERATIONS";
      if (r.includes("CUSTOMER")) return "CUSTOMER";
    }
    if (user?.role) {
      const r = user.role.toUpperCase();
      if (r.includes("ADMIN")) return "ADMIN";
      if (r.includes("SALES")) return "SALES_REP";
      if (r.includes("MANAGER")) return "MANAGER";
      if (r.includes("FINANCE")) return "FINANCE";
      if (r.includes("OPERAT")) return "OPERATIONS";
      if (r.includes("CUSTOMER")) return "CUSTOMER";
    }
    return "OPERATIONS";
  };

  const role = getNormalizedRole();

  switch (role) {
    case "ADMIN":
      return <AdminDashboard />;
    case "SALES_REP":
      return <SalesRepDashboard />;
    case "MANAGER":
      return <ManagerDashboard />;
    case "FINANCE":
      return <FinanceDashboard />;
    case "OPERATIONS":
      return <OperationsDashboard />;
    case "CUSTOMER":
      return <CustomerPortalDashboard />;
    default:
      return <SalesRepDashboard />;
  }
}
