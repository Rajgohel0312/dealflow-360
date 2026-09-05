import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Building2,
  Users,
  LayoutDashboard,
  LogOut,
  User,
  ChevronRight,
  Tag,
  Package,
  Receipt,
  Percent,
  FileText,
  CheckSquare,
  ShoppingBag,
  Boxes,
  Truck,
  Shield,
  BarChart3,
  MessageSquare,
} from "lucide-react";

export function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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

  const normalizedRole = getNormalizedRole();

  const getRoleBadgeLabel = () => {
    const email = (user?.email || "").toLowerCase();
    if (email === "admin@dealflow.com") return "Admin";
    if (email === "sales@dealflow.com") return "Sales Rep";
    if (email === "manager@dealflow.com") return "Manager";
    if (email === "finance@dealflow.com") return "Finance";
    if (email === "ops@dealflow.com") return "Operations";

    if (user?.role_name) return user.role_name;
    if (user?.role) return user.role;
    return "Operations";
  };

  const userRoleName = getRoleBadgeLabel();

  const allNavItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      rolesAllowed: ["ADMIN", "SALES_REP", "MANAGER", "FINANCE", "OPERATIONS", "CUSTOMER"],
    },
    {
      label: "Users Management",
      path: "/dashboard/users",
      icon: Users,
      rolesAllowed: ["ADMIN"], // Only Admin manages users
    },
    {
      label: "Customer Companies",
      path: "/dashboard/companies",
      icon: Building2,
      rolesAllowed: ["ADMIN", "SALES_REP", "MANAGER", "FINANCE", "CUSTOMER"], // Ops does not manage customers
    },
    {
      label: "Categories",
      path: "/dashboard/categories",
      icon: Tag,
      rolesAllowed: ["ADMIN", "SALES_REP"], // Admin & Sales Rep view catalog master data
    },
    {
      label: "Products",
      path: "/dashboard/products",
      icon: Package,
      rolesAllowed: ["ADMIN", "SALES_REP"], // Admin & Sales Rep view products
    },
    {
      label: "Price Lists",
      path: "/dashboard/price-lists",
      icon: Receipt,
      rolesAllowed: ["ADMIN", "SALES_REP"], // Admin & Sales Rep view pricing
    },
    {
      label: "Discount Rules",
      path: "/dashboard/discount-rules",
      icon: Percent,
      rolesAllowed: ["ADMIN"], // Admin manages rules
    },
    {
      label: "Quotations",
      path: "/dashboard/quotations",
      icon: FileText,
      rolesAllowed: ["ADMIN", "SALES_REP", "MANAGER", "FINANCE", "CUSTOMER"], // Ops does not alter commercial quotations
    },
    {
      label: "Approvals Queue",
      path: "/dashboard/approvals",
      icon: CheckSquare,
      rolesAllowed: ["ADMIN", "MANAGER"], // Manager & Admin review approvals
    },
    {
      label: "Deal Negotiations",
      path: "/dashboard/negotiations",
      icon: MessageSquare,
      rolesAllowed: ["ADMIN", "SALES_REP", "MANAGER", "FINANCE", "CUSTOMER"],
    },
    {
      label: "Sales Orders",
      path: "/dashboard/orders",
      icon: ShoppingBag,
      rolesAllowed: ["ADMIN", "SALES_REP", "MANAGER", "FINANCE", "OPERATIONS", "CUSTOMER"],
    },
    {
      label: "Inventory & Stock",
      path: "/dashboard/inventory",
      icon: Boxes,
      rolesAllowed: ["ADMIN", "MANAGER", "OPERATIONS"], // Manager & Ops handle stock
    },
    {
      label: "Fulfillment Pipeline",
      path: "/dashboard/fulfillment",
      icon: Truck,
      rolesAllowed: ["ADMIN", "MANAGER", "OPERATIONS", "CUSTOMER"],
    },
    {
      label: "Invoices & Billing",
      path: "/dashboard/invoices",
      icon: Receipt,
      rolesAllowed: ["ADMIN", "MANAGER", "FINANCE", "CUSTOMER"], // Finance handles invoices
    },
    {
      label: "Executive Reports",
      path: "/dashboard/reports",
      icon: BarChart3,
      rolesAllowed: ["ADMIN", "SALES_REP", "MANAGER", "FINANCE", "OPERATIONS"],
    },
  ];

  const visibleNavItems = allNavItems.filter((item) =>
    item.rolesAllowed.includes(normalizedRole)
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-border bg-surface flex flex-col h-full">
        {/* Logo Brand (Fixed at top) */}
        <div className="p-6 border-b border-border/60 flex-shrink-0">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-700 font-bold text-white shadow-md shadow-primary-700/20">
              D
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-text-primary">
                DealFlow360
              </h1>
              <p className="text-xs font-semibold text-primary-700">{userRoleName} Portal</p>
            </div>
          </Link>
        </div>

        {/* Navigation Links (Scrollable Area) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin">
          <nav className="space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-primary-50 text-primary-700 shadow-xs"
                      : "text-text-secondary hover:bg-neutral-100 hover:text-text-primary"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? "text-primary-700" : "text-text-muted"}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-primary-700" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-border bg-neutral-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-bold text-sm flex-shrink-0">
                {user?.name ? user.name[0].toUpperCase() : "U"}
              </div>
              <div className="truncate">
                <p className="text-sm font-bold text-text-primary truncate">
                  {user?.name || "User"}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-primary-100 text-primary-800 rounded border border-primary-200">
                    Role: {userRoleName}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-text-muted hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-surface px-8 flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">
            Internal Enterprise Dashboard
          </h2>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200">
              <Shield className="w-3.5 h-3.5 text-primary-600" /> Active Role: {userRoleName}
            </span>
          </div>
        </header>

        {/* Main Scrollable View */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
