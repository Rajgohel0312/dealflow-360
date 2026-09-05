import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../features/auth/Login";
import Register from "../features/auth/Register";

// Dashboard Router
import DashboardRouter from "../features/dashboard/DashboardRouter";
import CustomerCompanyList from "../features/customers/CustomerCompanyList";
import CustomerCompanyDetails from "../features/customers/CustomerCompanyDetails";

// Catalog & Pricing Master Data Features
import CategoryList from "../features/catalog/CategoryList";
import ProductList from "../features/catalog/ProductList";
import PriceListManagement from "../features/catalog/PriceListManagement";
import DiscountRuleList from "../features/catalog/DiscountRuleList";

// Quotation Engine & Approval Features
import QuotationList from "../features/quotations/QuotationList";
import QuotationDetails from "../features/quotations/QuotationDetails";
import ApprovalDashboard from "../features/quotations/ApprovalDashboard";
import NegotiationList from "../features/negotiations/NegotiationList";

// Orders, Inventory & Fulfillment Features
import OrderList from "../features/orders/OrderList";
import OrderDetails from "../features/orders/OrderDetails";
import InventoryManagement from "../features/inventory/InventoryManagement";
import FulfillmentPipeline from "../features/fulfillment/FulfillmentPipeline";

// Billing & Financial Invoices Features
import InvoiceList from "../features/invoices/InvoiceList";
import InvoiceDetails from "../features/invoices/InvoiceDetails";

// Executive Reports & Analytics Features
import ExecutiveReports from "../features/reports/ExecutiveReports";

// System Admin & User Management
import UserManagement from "../features/admin/UserManagement";

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
        <Route path="/dashboard" element={<DashboardRouter />} />
        <Route path="/dashboard/companies" element={<CustomerCompanyList />} />
        <Route
          path="/dashboard/companies/:customerId"
          element={<CustomerCompanyDetails />}
        />
        <Route path="/dashboard/categories" element={<CategoryList />} />
        <Route path="/dashboard/products" element={<ProductList />} />
        <Route path="/dashboard/price-lists" element={<PriceListManagement />} />
        <Route path="/dashboard/discount-rules" element={<DiscountRuleList />} />
        <Route path="/dashboard/quotations" element={<QuotationList />} />
        <Route path="/dashboard/quotations/:id" element={<QuotationDetails />} />
        <Route path="/dashboard/approvals" element={<ApprovalDashboard />} />
        <Route path="/dashboard/negotiations" element={<NegotiationList />} />
        <Route path="/dashboard/orders" element={<OrderList />} />
        <Route path="/dashboard/orders/:id" element={<OrderDetails />} />
        <Route path="/dashboard/inventory" element={<InventoryManagement />} />
        <Route path="/dashboard/fulfillment" element={<FulfillmentPipeline />} />
        <Route path="/dashboard/invoices" element={<InvoiceList />} />
        <Route path="/dashboard/invoices/:id" element={<InvoiceDetails />} />
        <Route path="/dashboard/reports" element={<ExecutiveReports />} />
        <Route path="/dashboard/users" element={<UserManagement />} />
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
