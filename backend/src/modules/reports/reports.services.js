import { query } from "../../infrastructure/database/index.js";

export const getSalesReport = async () => {
  const qtnStats = await query(
    `SELECT 
        COUNT(*)::int as total_quotations,
        COUNT(CASE WHEN status = 'APPROVED' THEN 1 END)::int as approved_count,
        COUNT(CASE WHEN status = 'REJECTED' THEN 1 END)::int as rejected_count,
        COUNT(CASE WHEN status = 'DRAFT' THEN 1 END)::int as draft_count,
        COUNT(CASE WHEN status = 'UNDER_REVIEW' THEN 1 END)::int as review_count,
        COALESCE(SUM(total_amount), 0)::numeric as total_quotation_value
     FROM quotations`,
    []
  );

  const orderStats = await query(
    `SELECT 
        COUNT(*)::int as total_orders,
        COALESCE(SUM(total_amount), 0)::numeric as total_order_value
     FROM orders`,
    []
  );

  const q = qtnStats.rows[0];
  const o = orderStats.rows[0];
  const conversionRate = q.total_quotations > 0 ? ((q.approved_count / q.total_quotations) * 100).toFixed(1) : "0.0";

  return {
    quotations: q,
    orders: o,
    conversion_rate_percent: parseFloat(conversionRate),
  };
};

export const getRevenueReport = async () => {
  const invoiceStats = await query(
    `SELECT 
        COUNT(*)::int as total_invoices,
        COALESCE(SUM(total_amount), 0)::numeric as total_invoiced,
        COALESCE(SUM(amount_paid), 0)::numeric as total_paid,
        COALESCE(SUM(amount_due), 0)::numeric as total_outstanding,
        COUNT(CASE WHEN status = 'PAID' THEN 1 END)::int as paid_count,
        COUNT(CASE WHEN status = 'PARTIALLY_PAID' THEN 1 END)::int as partial_count,
        COUNT(CASE WHEN status = 'OVERDUE' THEN 1 END)::int as overdue_count
     FROM invoices`,
    []
  );

  return invoiceStats.rows[0];
};

export const getDiscountReport = async () => {
  const discStats = await query(
    `SELECT 
        COALESCE(AVG(discount_percent), 0)::numeric as avg_discount_percent,
        COALESCE(MAX(discount_percent), 0)::numeric as max_discount_percent,
        COALESCE(SUM(discount_amount), 0)::numeric as total_discount_given
     FROM quotation_items`,
    []
  );

  return discStats.rows[0];
};

export const getInventoryReport = async () => {
  const invStats = await query(
    `SELECT 
        COALESCE(SUM(quantity_on_hand), 0)::numeric as total_on_hand,
        COALESCE(SUM(quantity_reserved), 0)::numeric as total_reserved,
        COALESCE(SUM(quantity_on_hand - quantity_reserved), 0)::numeric as total_available,
        COUNT(CASE WHEN (quantity_on_hand - quantity_reserved) <= 5 THEN 1 END)::int as low_stock_items
     FROM inventory`,
    []
  );

  return invStats.rows[0];
};

export const getFulfillmentReport = async () => {
  const fulfillStats = await query(
    `SELECT 
        COUNT(*)::int as total_fulfillments,
        COUNT(CASE WHEN status = 'PENDING' THEN 1 END)::int as pending_count,
        COUNT(CASE WHEN status = 'PICKING' THEN 1 END)::int as picking_count,
        COUNT(CASE WHEN status = 'PACKED' THEN 1 END)::int as packed_count,
        COUNT(CASE WHEN status = 'SHIPPED' THEN 1 END)::int as shipped_count,
        COUNT(CASE WHEN status = 'DELIVERED' THEN 1 END)::int as delivered_count
     FROM fulfillments`,
    []
  );

  return fulfillStats.rows[0];
};
