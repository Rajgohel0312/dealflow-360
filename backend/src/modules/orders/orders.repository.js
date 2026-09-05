import {
  insertOne,
  findOne,
  updateById,
  query,
} from "../../infrastructure/database/index.js";

export const generateNextOrderNumber = async () => {
  const result = await query(
    `SELECT order_number FROM orders ORDER BY created_at DESC LIMIT 1`,
    []
  );

  let nextSeq = 1;
  if (result.rows.length > 0) {
    const lastNum = result.rows[0].order_number;
    const match = lastNum.match(/SO-(\d+)/);
    if (match) {
      nextSeq = parseInt(match[1], 10) + 1;
    }
  }

  const padded = String(nextSeq).padStart(6, "0");
  return `SO-${padded}`;
};

export const createOrder = async (data) => {
  return insertOne("orders", data);
};

export const findOrderById = async (id) => {
  const result = await query(
    `SELECT o.*, 
            c.name as customer_name, c.customer_tier, c.email as customer_email,
            u.name as sales_rep_name,
            q.quotation_number,
            i.id as invoice_id, i.invoice_number, i.status as invoice_status
     FROM orders o
     JOIN customers c ON o.customer_id = c.id
     JOIN users u ON o.sales_rep_id = u.id
     LEFT JOIN quotations q ON o.quotation_id = q.id
     LEFT JOIN invoices i ON i.order_id = o.id
     WHERE o.id = $1 LIMIT 1`,
    [id]
  );
  return result.rows[0] || null;
};

export const findOrderByQuotationId = async (quotationId) => {
  const result = await query(
    `SELECT * FROM orders WHERE quotation_id = $1 LIMIT 1`,
    [quotationId]
  );
  return result.rows[0] || null;
};

export const findAllOrders = async (filters = {}) => {
  let queryText = `
    SELECT o.*, 
           c.name as customer_name, c.customer_tier,
           u.name as sales_rep_name,
           q.quotation_number,
           i.id as invoice_id, i.invoice_number, i.status as invoice_status
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    JOIN users u ON o.sales_rep_id = u.id
    LEFT JOIN quotations q ON o.quotation_id = q.id
    LEFT JOIN invoices i ON i.order_id = o.id
  `;
  const conditions = [];
  const params = [];

  if (filters.sales_rep_id) {
    params.push(filters.sales_rep_id);
    conditions.push(`o.sales_rep_id = $${params.length}`);
  }

  if (filters.customer_id) {
    params.push(filters.customer_id);
    conditions.push(`o.customer_id = $${params.length}`);
  }

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`o.status = $${params.length}`);
  }

  if (conditions.length > 0) {
    queryText += ` WHERE ${conditions.join(" AND ")}`;
  }

  queryText += ` ORDER BY o.created_at DESC`;

  const result = await query(queryText, params);
  return result.rows;
};

export const updateOrder = async (id, data) => {
  return updateById("orders", id, data);
};

export const createOrderItem = async (data) => {
  return insertOne("order_items", data);
};

export const findOrderItemsByOrderId = async (orderId) => {
  const result = await query(
    `SELECT oi.*, p.name as product_name, p.sku as product_sku, p.unit as product_unit
     FROM order_items oi
     JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id = $1
     ORDER BY oi.created_at ASC`,
    [orderId]
  );
  return result.rows;
};
