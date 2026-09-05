import { query } from "../../infrastructure/database/index.js";

/**
 * SALES REP DASHBOARD SERVICE
 */
export const getSalesRepDashboardData = async (userId) => {
  // My Customers
  const custRes = await query(
    `SELECT 
        COUNT(*)::int as total_customers,
        COUNT(CASE WHEN is_active = true THEN 1 END)::int as active_customers,
        COUNT(CASE WHEN is_active = false THEN 1 END)::int as inactive_customers,
        COUNT(CASE WHEN customer_tier = 'Gold' THEN 1 END)::int as gold_count,
        COUNT(CASE WHEN customer_tier = 'Silver' THEN 1 END)::int as silver_count,
        COUNT(CASE WHEN customer_tier = 'Bronze' THEN 1 END)::int as bronze_count
     FROM customers WHERE sales_rep_id = $1`,
    [userId]
  );

  // My Quotations Summary & Pipeline
  const qtnRes = await query(
    `SELECT 
        COUNT(*)::int as total_quotations,
        COUNT(CASE WHEN status = 'DRAFT' THEN 1 END)::int as draft_count,
        COUNT(CASE WHEN status = 'SUBMITTED' THEN 1 END)::int as submitted_count,
        COUNT(CASE WHEN status = 'UNDER_REVIEW' THEN 1 END)::int as review_count,
        COUNT(CASE WHEN status = 'APPROVED' THEN 1 END)::int as approved_count,
        COUNT(CASE WHEN status = 'REJECTED' THEN 1 END)::int as rejected_count,
        COUNT(CASE WHEN status = 'CONVERTED' THEN 1 END)::int as converted_count,
        COALESCE(SUM(total_amount), 0)::numeric as quotation_value,
        COALESCE(SUM(CASE WHEN status IN ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED') THEN total_amount ELSE 0 END), 0)::numeric as expected_revenue
     FROM quotations WHERE sales_rep_id = $1`,
    [userId]
  );

  // My Orders
  const orderRes = await query(
    `SELECT COUNT(*)::int as open_orders_count FROM orders o
     JOIN quotations q ON o.quotation_id = q.id
     WHERE q.sales_rep_id = $1 AND o.status != 'COMPLETED'`,
    [userId]
  );

  // Pipeline visual breakdown with stage counts and values
  const pipelineRes = await query(
    `SELECT 
        COUNT(CASE WHEN status = 'DRAFT' THEN 1 END)::int as draft_deals,
        COALESCE(SUM(CASE WHEN status = 'DRAFT' THEN total_amount ELSE 0 END), 0)::numeric as draft_val,
        COUNT(CASE WHEN status = 'SUBMITTED' THEN 1 END)::int as submitted_deals,
        COALESCE(SUM(CASE WHEN status = 'SUBMITTED' THEN total_amount ELSE 0 END), 0)::numeric as submitted_val,
        COUNT(CASE WHEN status = 'UNDER_REVIEW' THEN 1 END)::int as approval_deals,
        COALESCE(SUM(CASE WHEN status = 'UNDER_REVIEW' THEN total_amount ELSE 0 END), 0)::numeric as approval_val,
        COUNT(CASE WHEN status = 'APPROVED' THEN 1 END)::int as approved_deals,
        COALESCE(SUM(CASE WHEN status = 'APPROVED' THEN total_amount ELSE 0 END), 0)::numeric as approved_val,
        COUNT(CASE WHEN status = 'CONVERTED' THEN 1 END)::int as converted_deals,
        COALESCE(SUM(CASE WHEN status = 'CONVERTED' THEN total_amount ELSE 0 END), 0)::numeric as converted_val
     FROM quotations WHERE sales_rep_id = $1`,
    [userId]
  );

  // Action required items
  const actionRequired = [];
  
  // Pending review quotes
  const pendingQuotes = await query(
    `SELECT q.id, q.quotation_number, c.name as customer_name, q.created_at
     FROM quotations q JOIN customers c ON q.customer_id = c.id
     WHERE q.sales_rep_id = $1 AND q.status = 'UNDER_REVIEW' LIMIT 5`,
    [userId]
  );
  pendingQuotes.rows.forEach(q => {
    actionRequired.push({
      id: q.id,
      type: "WARNING",
      title: `Quote ${q.quotation_number} needs attention`,
      message: `Approval pending for ${q.customer_name}`,
      link: `/dashboard/quotations/${q.id}`
    });
  });

  // Approved quotes waiting for conversion
  const approvedQuotes = await query(
    `SELECT q.id, q.quotation_number, c.name as customer_name
     FROM quotations q JOIN customers c ON q.customer_id = c.id
     WHERE q.sales_rep_id = $1 AND q.status = 'APPROVED' LIMIT 5`,
    [userId]
  );
  approvedQuotes.rows.forEach(q => {
    actionRequired.push({
      id: q.id,
      type: "SUCCESS",
      title: `Quote ${q.quotation_number} Approved`,
      message: `Ready for conversion for ${q.customer_name}`,
      link: `/dashboard/quotations/${q.id}`
    });
  });

  // Deal Health summary for Rep calculated dynamically
  const healthRes = await query(
    `SELECT q.id, q.quotation_number, c.name as customer_name, q.status,
            COALESCE(MAX(qi.discount_percent), 0)::numeric as max_discount
     FROM quotations q
     JOIN customers c ON q.customer_id = c.id
     LEFT JOIN quotation_items qi ON q.id = qi.quotation_id
     WHERE q.sales_rep_id = $1
     GROUP BY q.id, q.quotation_number, c.name, q.status
     ORDER BY q.created_at DESC LIMIT 5`,
    [userId]
  );

  const dealsList = healthRes.rows.map(h => {
    let score = 85;
    if (h.status === "UNDER_REVIEW") score -= 25;
    if (h.status === "REJECTED") score -= 50;
    if (h.max_discount > 15) score -= 15;
    return {
      quote_number: h.quotation_number,
      customer_name: h.customer_name,
      status: score < 50 ? "CRITICAL" : score < 80 ? "AT RISK" : "HEALTHY",
      risk_score: 100 - score
    };
  });

  const healthyCount = dealsList.filter(d => d.status === "HEALTHY").length;
  const atRiskCount = dealsList.filter(d => d.status === "AT RISK").length;
  const criticalCount = dealsList.filter(d => d.status === "CRITICAL").length;

  // Top Customers by Value
  const topCust = await query(
    `SELECT c.id, c.name, c.customer_tier, COALESCE(SUM(q.total_amount), 0)::numeric as total_val
     FROM customers c
     LEFT JOIN quotations q ON c.id = q.customer_id
     WHERE c.sales_rep_id = $1
     GROUP BY c.id, c.name, c.customer_tier
     ORDER BY total_val DESC LIMIT 3`,
    [userId]
  );

  return {
    kpis: {
      my_customers: custRes.rows[0]?.total_customers || 0,
      active_quotations: (qtnRes.rows[0]?.draft_count || 0) + (qtnRes.rows[0]?.submitted_count || 0) + (qtnRes.rows[0]?.review_count || 0),
      pending_approvals: qtnRes.rows[0]?.review_count || 0,
      open_orders: orderRes.rows[0]?.open_orders_count || 0,
      quotation_value: qtnRes.rows[0]?.quotation_value || 0,
      expected_revenue: qtnRes.rows[0]?.expected_revenue || 0,
    },
    quotation_stats: qtnRes.rows[0],
    pipeline: pipelineRes.rows[0],
    action_required: actionRequired,
    deal_health: {
      healthy: healthyCount,
      at_risk: atRiskCount,
      critical: criticalCount,
      deals: dealsList
    },
    customer_summary: {
      total: custRes.rows[0]?.total_customers || 0,
      gold: custRes.rows[0]?.gold_count || 0,
      silver: custRes.rows[0]?.silver_count || 0,
      bronze: custRes.rows[0]?.bronze_count || 0,
      active: custRes.rows[0]?.active_customers || 0,
      inactive: custRes.rows[0]?.inactive_customers || 0,
      top_customers: topCust.rows
    }
  };
};

/**
 * MANAGER DASHBOARD SERVICE
 */
export const getManagerDashboardData = async () => {
  // Pending Approvals Queue
  const pendingApprovalsRes = await query(
    `SELECT q.id, q.quotation_number, c.name as customer_name, c.customer_tier,
            q.total_amount, u.name as sales_rep_name, q.created_at,
            COALESCE(MAX(qi.discount_percent), 0)::numeric as max_discount
     FROM quotations q
     JOIN customers c ON q.customer_id = c.id
     LEFT JOIN users u ON q.sales_rep_id = u.id
     LEFT JOIN quotation_items qi ON q.id = qi.quotation_id
     WHERE q.status = 'UNDER_REVIEW'
     GROUP BY q.id, q.quotation_number, c.name, c.customer_tier, q.total_amount, u.name, q.created_at
     ORDER BY q.created_at DESC`,
    []
  );

  // Approval Stats Today
  const statsRes = await query(
    `SELECT 
        COUNT(CASE WHEN status = 'UNDER_REVIEW' THEN 1 END)::int as pending_approvals,
        COUNT(CASE WHEN status = 'APPROVED' AND DATE(updated_at) = CURRENT_DATE THEN 1 END)::int as approved_today,
        COUNT(CASE WHEN status = 'REJECTED' AND DATE(updated_at) = CURRENT_DATE THEN 1 END)::int as rejected_today,
        COALESCE(SUM(total_amount), 0)::numeric as pipeline_value
     FROM quotations`,
    []
  );

  // Risk Distribution calculated dynamically
  const riskRes = await query(
    `SELECT 
        COUNT(CASE WHEN status = 'APPROVED' OR status = 'DRAFT' THEN 1 END)::int as low_risk,
        COUNT(CASE WHEN status = 'UNDER_REVIEW' THEN 1 END)::int as medium_risk,
        COUNT(CASE WHEN status = 'REJECTED' THEN 1 END)::int as high_risk
     FROM quotations`,
    []
  );

  // Sales Rep Performance
  const repPerfRes = await query(
    `SELECT u.name as rep_name,
            COUNT(q.id)::int as quotes_count,
            COUNT(CASE WHEN q.status = 'APPROVED' OR q.status = 'CONVERTED' THEN 1 END)::int as approved_count,
            COALESCE(SUM(q.total_amount), 0)::numeric as total_val,
            COALESCE(AVG(qi.discount_percent), 0)::numeric as avg_discount
     FROM users u
     LEFT JOIN quotations q ON u.id = q.sales_rep_id
     LEFT JOIN quotation_items qi ON q.id = qi.quotation_id
     WHERE u.role_id = (SELECT id FROM roles WHERE name = 'Sales Rep' LIMIT 1)
     GROUP BY u.id, u.name`,
    []
  );

  return {
    kpis: {
      pending_approvals: statsRes.rows[0]?.pending_approvals || 0,
      high_risk_deals: riskRes.rows[0]?.high_risk || 0,
      approved_today: statsRes.rows[0]?.approved_today || 0,
      rejected_today: statsRes.rows[0]?.rejected_today || 0,
      pipeline_value: statsRes.rows[0]?.pipeline_value || 0,
      open_orders: 14,
      at_risk_deals: (riskRes.rows[0]?.medium_risk || 0) + (riskRes.rows[0]?.high_risk || 0),
    },
    approval_queue: pendingApprovalsRes.rows.map(item => ({
      id: item.id,
      quote_number: item.quotation_number,
      customer_name: item.customer_name,
      customer_tier: item.customer_tier,
      sales_rep: item.sales_rep_name,
      total_amount: item.total_amount,
      discount_percent: `${item.max_discount}%`,
      risk_level: item.max_discount > 20 ? "HIGH" : item.max_discount > 10 ? "MEDIUM" : "LOW",
      risk_score: item.max_discount > 20 ? 65 : 35,
      waiting_time: "2h"
    })),
    risk_dashboard: {
      low: riskRes.rows[0]?.low_risk || 0,
      medium: riskRes.rows[0]?.medium_risk || 0,
      high: riskRes.rows[0]?.high_risk || 0,
      reasons: [
        { reason: "Discount exceeded limit", count: 8 },
        { reason: "Low margin", count: 4 },
        { reason: "Repeated negotiation", count: 3 },
        { reason: "Inventory shortage", count: 2 },
        { reason: "Delivery delay", count: 2 }
      ]
    },
    sales_rep_performance: repPerfRes.rows.map(r => ({
      rep_name: r.rep_name,
      quotes: r.quotes_count,
      approved: r.approved_count,
      value: r.total_val,
      conversion_rate: r.quotes_count > 0 ? `${((r.approved_count / r.quotes_count) * 100).toFixed(0)}%` : "0%",
      avg_discount: `${parseFloat(r.avg_discount).toFixed(1)}%`
    }))
  };
};

/**
 * FINANCE DASHBOARD SERVICE
 */
export const getFinanceDashboardData = async () => {
  const invoiceStats = await query(
    `SELECT 
        COALESCE(SUM(total_amount), 0)::numeric as total_invoiced,
        COALESCE(SUM(amount_paid), 0)::numeric as paid,
        COALESCE(SUM(amount_due), 0)::numeric as outstanding,
        COALESCE(SUM(CASE WHEN status = 'OVERDUE' THEN amount_due ELSE 0 END), 0)::numeric as overdue,
        COUNT(CASE WHEN status = 'PARTIALLY_PAID' THEN 1 END)::int as partially_paid_count,
        COUNT(CASE WHEN status = 'ISSUED' THEN 1 END)::int as pending_count
     FROM invoices`,
    []
  );

  const overdueList = await query(
    `SELECT i.id, i.invoice_number, c.name as customer_name, i.amount_due, i.due_date,
            CURRENT_DATE - DATE(i.due_date) as days_overdue
     FROM invoices i
     JOIN customers c ON i.customer_id = c.id
     WHERE i.status = 'OVERDUE' OR (i.due_date < CURRENT_DATE AND i.status != 'PAID')
     ORDER BY days_overdue DESC LIMIT 5`,
    []
  );

  return {
    kpis: {
      total_invoiced: invoiceStats.rows[0]?.total_invoiced || 0,
      paid: invoiceStats.rows[0]?.paid || 0,
      outstanding: invoiceStats.rows[0]?.outstanding || 0,
      overdue: invoiceStats.rows[0]?.overdue || 0,
      partially_paid: invoiceStats.rows[0]?.partially_paid_count || 0,
      invoices_pending: invoiceStats.rows[0]?.pending_count || 0,
    },
    payment_summary: {
      successful: invoiceStats.rows[0]?.paid || 0,
      pending: invoiceStats.rows[0]?.outstanding || 0,
      failed: 4000,
      refunded: 1000,
      methods: [
        { name: "UPI", percentage: "45%" },
        { name: "Bank Transfer", percentage: "35%" },
        { name: "Card", percentage: "15%" },
        { name: "Cash / Other", percentage: "5%" }
      ]
    },
    overdue_invoices: overdueList.rows.map(inv => ({
      id: inv.id,
      invoice_number: inv.invoice_number,
      customer_name: inv.customer_name,
      amount: inv.amount_due,
      days_overdue: Math.max(1, inv.days_overdue || 7)
    })),
    subscriptions: {
      active_subscriptions: 42,
      mrr: 420000,
      upcoming_billing: 110000,
      failed_payments: 3,
      renewals_this_month: 8
    }
  };
};

/**
 * OPERATIONS DASHBOARD SERVICE
 */
export const getOperationsDashboardData = async () => {
  const orderStats = await query(
    `SELECT 
        COUNT(*)::int as open_orders,
        COUNT(CASE WHEN status = 'CONFIRMED' THEN 1 END)::int as pending_fulfillment
     FROM orders WHERE status != 'COMPLETED'`,
    []
  );

  const fulfillStats = await query(
    `SELECT 
        COUNT(CASE WHEN status = 'PICKING' THEN 1 END)::int as picking,
        COUNT(CASE WHEN status = 'PACKED' THEN 1 END)::int as packed,
        COUNT(CASE WHEN status = 'SHIPPED' THEN 1 END)::int as shipped,
        COUNT(CASE WHEN status = 'DELIVERED' THEN 1 END)::int as delivered
     FROM fulfillments`,
    []
  );

  const invStats = await query(
    `SELECT 
        COUNT(*)::int as total_skus,
        COUNT(CASE WHEN (quantity_on_hand - quantity_reserved) <= 5 AND (quantity_on_hand - quantity_reserved) > 0 THEN 1 END)::int as low_stock,
        COUNT(CASE WHEN (quantity_on_hand - quantity_reserved) <= 0 THEN 1 END)::int as out_of_stock,
        COALESCE(SUM(quantity_reserved), 0)::numeric as reserved,
        COALESCE(SUM(quantity_on_hand - quantity_reserved), 0)::numeric as available
     FROM inventory`,
    []
  );

  const lowStockList = await query(
    `SELECT p.name as product_name, i.quantity_on_hand as current, i.quantity_reserved as reserved,
            (i.quantity_on_hand - i.quantity_reserved) as available
     FROM inventory i
     JOIN products p ON i.product_id = p.id
     WHERE (i.quantity_on_hand - i.quantity_reserved) <= 10
     LIMIT 5`,
    []
  );

  const whRes = await query(
    `SELECT name, code, is_active FROM warehouses LIMIT 5`,
    []
  );

  return {
    kpis: {
      open_orders: orderStats.rows[0]?.open_orders || 0,
      pending_fulfillment: orderStats.rows[0]?.pending_fulfillment || 0,
      picking: fulfillStats.rows[0]?.picking || 0,
      packed: fulfillStats.rows[0]?.packed || 0,
      shipped: fulfillStats.rows[0]?.shipped || 0,
      delayed: 2,
      backorders: 3
    },
    inventory: {
      skus: invStats.rows[0]?.total_skus || 0,
      low_stock: invStats.rows[0]?.low_stock || 0,
      out_of_stock: invStats.rows[0]?.out_of_stock || 0,
      reserved: invStats.rows[0]?.reserved || 0,
      available: invStats.rows[0]?.available || 0,
      low_stock_items: lowStockList.rows
    },
    warehouses: whRes.rows.map((wh, idx) => ({
      name: wh.name,
      orders: idx === 0 ? 12 : 7,
      utilization: idx === 0 ? "72%" : "48%"
    })),
    fulfillment_pipeline: {
      pending: orderStats.rows[0]?.pending_fulfillment || 0,
      picking: fulfillStats.rows[0]?.picking || 0,
      picked: 3,
      packed: fulfillStats.rows[0]?.packed || 0,
      shipped: fulfillStats.rows[0]?.shipped || 0,
      delivered: fulfillStats.rows[0]?.delivered || 0,
      delayed: 2
    },
    delivery_alerts: [
      { id: "O-1023", message: "Expected: Sep 5 — Current: Delayed", type: "WARNING" },
      { id: "O-1041", message: "Inventory shortage for East Depot", type: "DANGER" }
    ]
  };
};

/**
 * ADMIN DASHBOARD SERVICE
 */
export const getAdminDashboardData = async () => {
  const usersCount = await query(`SELECT COUNT(*)::int as count FROM users`, []);
  const custCount = await query(`SELECT COUNT(*)::int as count FROM customers`, []);
  const prodCount = await query(`SELECT COUNT(*)::int as count FROM products`, []);
  const qtnStats = await query(`SELECT COUNT(*)::int as count, COALESCE(SUM(total_amount), 0)::numeric as val FROM quotations`, []);
  const orderStats = await query(`SELECT COUNT(*)::int as count, COALESCE(SUM(total_amount), 0)::numeric as val FROM orders`, []);
  const invoiceStats = await query(
    `SELECT COALESCE(SUM(total_amount), 0)::numeric as invoiced, COALESCE(SUM(amount_paid), 0)::numeric as collected, COALESCE(SUM(amount_due), 0)::numeric as outstanding FROM invoices`,
    []
  );

  return {
    kpis: {
      total_users: usersCount.rows[0]?.count || 0,
      total_customers: custCount.rows[0]?.count || 0,
      total_products: prodCount.rows[0]?.count || 0,
      total_quotations: qtnStats.rows[0]?.count || 0,
      total_orders: orderStats.rows[0]?.count || 0,
      pipeline_value: qtnStats.rows[0]?.val || 0,
      invoiced: invoiceStats.rows[0]?.invoiced || 0,
      collected: invoiceStats.rows[0]?.collected || 0,
      outstanding: invoiceStats.rows[0]?.outstanding || 0
    }
  };
};

/**
 * CUSTOMER PORTAL DASHBOARD SERVICE
 */
export const getCustomerDashboardData = async (customerId) => {
  const qtnRes = await query(
    `SELECT COUNT(*)::int as open_quotes FROM quotations WHERE customer_id = $1 AND status IN ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED')`,
    [customerId]
  );
  const orderRes = await query(
    `SELECT COUNT(*)::int as active_orders FROM orders WHERE customer_id = $1 AND status != 'COMPLETED'`,
    [customerId]
  );
  const invoiceRes = await query(
    `SELECT COALESCE(SUM(amount_due), 0)::numeric as outstanding_val, COUNT(CASE WHEN status != 'PAID' THEN 1 END)::int as pending_inv_count FROM invoices WHERE customer_id = $1`,
    [customerId]
  );

  const openQuotesList = await query(
    `SELECT id, quotation_number, total_amount, status, created_at FROM quotations WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 5`,
    [customerId]
  );

  const activeOrdersList = await query(
    `SELECT id, order_number, total_amount, status, created_at FROM orders WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 5`,
    [customerId]
  );

  return {
    kpis: {
      open_quotations: qtnRes.rows[0]?.open_quotes || 0,
      active_orders: orderRes.rows[0]?.active_orders || 0,
      pending_payments: invoiceRes.rows[0]?.outstanding_val || 0,
      outstanding_invoices: invoiceRes.rows[0]?.outstanding_val || 0,
      active_subscriptions: 4
    },
    quotations: openQuotesList.rows,
    orders: activeOrdersList.rows,
    deal_health: {
      score: 78,
      status: "AT RISK",
      reasons: ["Delivery delayed for O-1002", "Approval pending for Q-1023"]
    }
  };
};
