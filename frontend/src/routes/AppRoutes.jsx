import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../features/auth/Login";
import Register from "../features/auth/Register";

// Sales Rep Features
import SalesRepDashboard from "../features/customers/SalesRepDashboard";
import CustomerCompanyList from "../features/customers/CustomerCompanyList";
import CustomerCompanyDetails from "../features/customers/CustomerCompanyDetails";

// Catalog & Pricing Master Data Features
import CategoryList from "../features/catalog/CategoryList";
import ProductList from "../features/catalog/ProductList";
import PriceListManagement from "../features/catalog/PriceListManagement";
import DiscountRuleList from "../features/catalog/DiscountRuleList";

// Customer Auth & Portal Features
import CustomerLogin from "../features/customerAuth/CustomerLogin";
import ChangePasswordModal from "../features/customerAuth/ChangePasswordModal";
import CustomerPortalDashboard from "../features/customerPortal/CustomerPortalDashboard";

// Route Guard
import { ProtectedRoute } from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public Sales Rep Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Sales Rep Routes */}
      <Route element={<ProtectedRoute allowedType="EMPLOYEE" />}>
        <Route path="/dashboard" element={<SalesRepDashboard />} />
        <Route path="/dashboard/companies" element={<CustomerCompanyList />} />
        <Route
          path="/dashboard/companies/:customerId"
          element={<CustomerCompanyDetails />}
        />
        <Route path="/dashboard/categories" element={<CategoryList />} />
        <Route path="/dashboard/products" element={<ProductList />} />
        <Route path="/dashboard/price-lists" element={<PriceListManagement />} />
        <Route path="/dashboard/discount-rules" element={<DiscountRuleList />} />
      </Route>

      {/* Public Customer Auth */}
      <Route path="/customer/login" element={<CustomerLogin />} />
      <Route path="/customer/change-password" element={<ChangePasswordModal />} />

      {/* Protected Customer Portal Routes */}
      <Route element={<ProtectedRoute allowedType="CUSTOMER" />}>
        <Route path="/customer/portal" element={<CustomerPortalDashboard />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
