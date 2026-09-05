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
} from "lucide-react";

export function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Customer Companies",
      path: "/dashboard/companies",
      icon: Building2,
    },
    {
      label: "Categories",
      path: "/dashboard/categories",
      icon: Tag,
    },
    {
      label: "Products",
      path: "/dashboard/products",
      icon: Package,
    },
    {
      label: "Price Lists",
      path: "/dashboard/price-lists",
      icon: Receipt,
    },
    {
      label: "Discount Rules",
      path: "/dashboard/discount-rules",
      icon: Percent,
    },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-border bg-surface flex flex-col justify-between">
        <div>
          {/* Logo Brand */}
          <div className="p-6 border-b border-border/60">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-700 font-bold text-white shadow-md shadow-primary-700/20">
                D
              </div>
              <div>
                <h1 className="text-lg font-extrabold tracking-tight text-text-primary">
                  DealFlow360
                </h1>
                <p className="text-xs text-text-muted">Sales Rep Portal</p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
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
                {user?.name ? user.name[0].toUpperCase() : "S"}
              </div>
              <div className="truncate">
                <p className="text-sm font-bold text-text-primary truncate">
                  {user?.name || "Sales Rep"}
                </p>
                <p className="text-xs text-text-muted truncate">
                  {user?.email || "sales@dealflow360.com"}
                </p>
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
            Sales Representative Dashboard
          </h2>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200">
              Active Session
            </span>
          </div>
        </header>

        {/* Main Scrollable View */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
