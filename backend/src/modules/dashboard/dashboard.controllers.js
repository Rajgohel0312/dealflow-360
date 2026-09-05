import * as dashboardService from "./dashboard.services.js";

export const getDashboard = async (req, res) => {
  try {
    const roleName = (req.user?.role_name || req.user?.role || "").toUpperCase();
    const email = (req.user?.email || "").toLowerCase();

    let data = {};

    // Customer Portal User
    if (req.user?.customer_id || roleName.includes("CUSTOMER")) {
      const customerId = req.user?.customer_id || req.user?.id;
      data = await dashboardService.getCustomerDashboardData(customerId);
      return res.status(200).json({ success: true, role: "CUSTOMER_USER", dashboard: data });
    }

    // Employee Roles
    if (email === "admin@dealflow.com" || roleName.includes("ADMIN")) {
      data = await dashboardService.getAdminDashboardData();
      return res.status(200).json({ success: true, role: "ADMIN", dashboard: data });
    }

    if (email === "sales@dealflow.com" || roleName.includes("SALES")) {
      data = await dashboardService.getSalesRepDashboardData(req.user.id);
      return res.status(200).json({ success: true, role: "SALES_REP", dashboard: data });
    }

    if (email === "manager@dealflow.com" || roleName.includes("MANAGER")) {
      data = await dashboardService.getManagerDashboardData();
      return res.status(200).json({ success: true, role: "MANAGER", dashboard: data });
    }

    if (email === "finance@dealflow.com" || roleName.includes("FINANCE")) {
      data = await dashboardService.getFinanceDashboardData();
      return res.status(200).json({ success: true, role: "FINANCE", dashboard: data });
    }

    if (email === "ops@dealflow.com" || roleName.includes("OPERAT")) {
      data = await dashboardService.getOperationsDashboardData();
      return res.status(200).json({ success: true, role: "OPERATIONS", dashboard: data });
    }

    // Default fallback to Admin
    data = await dashboardService.getAdminDashboardData();
    return res.status(200).json({ success: true, role: "ADMIN", dashboard: data });
  } catch (err) {
    console.error("Dashboard Service Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
