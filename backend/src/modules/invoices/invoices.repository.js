import {
  insertOne,
  findOne,
  updateById,
  query,
} from "../../infrastructure/database/index.js";

export const generateNextInvoiceNumber = async () => {
  const result = await query(
    `SELECT invoice_number FROM invoices ORDER BY created_at DESC LIMIT 1`,
    []
  );
  if (result.rows.length === 0) return "INV-000001";
  const lastNum = result.rows[0].invoice_number;
  const match = lastNum.match(/INV-(\d+)/);
  if (!match) return "INV-000001";
  const nextSeq = parseInt(match[1], 10) + 1;
  return `INV-${String(nextSeq).padStart(6, "0")}`;
};

export const createInvoice = async (data) => {
  return insertOne("invoices", data);
};

export const createInvoiceItem = async (data) => {
  return insertOne("invoice_items", data);
};

export const findInvoiceById = async (id) => {
  const invoiceRes = await query(
    `SELECT i.*, 
            o.order_number, 
            c.name as customer_name, c.email as customer_email
     FROM invoices i
     JOIN orders o ON i.order_id = o.id
     JOIN customers c ON i.customer_id = c.id
     WHERE i.id = $1 LIMIT 1`,
    [id]
  );
  if (invoiceRes.rows.length === 0) return null;
  const invoice = invoiceRes.rows[0];

  const itemsRes = await query(
    `SELECT ii.*, p.name as product_name, p.sku as product_sku
     FROM invoice_items ii
     LEFT JOIN products p ON ii.product_id = p.id
     WHERE ii.invoice_id = $1
     ORDER BY ii.created_at ASC`,
    [id]
  );
  invoice.items = itemsRes.rows;

  const paymentsRes = await query(
    `SELECT * FROM payments WHERE invoice_id = $1 ORDER BY paid_at DESC`,
    [id]
  );
  invoice.payments = paymentsRes.rows;

  return invoice;
};

export const findInvoiceByOrderId = async (orderId) => {
  const result = await query(
    `SELECT * FROM invoices WHERE order_id = $1 LIMIT 1`,
    [orderId]
  );
  return result.rows[0] || null;
};

export const findAllInvoices = async (filters = {}) => {
  let queryText = `
    SELECT i.*, 
           o.order_number, 
           c.name as customer_name
    FROM invoices i
    JOIN orders o ON i.order_id = o.id
    JOIN customers c ON i.customer_id = c.id
  `;
  const conditions = [];
  const params = [];

  if (filters.customer_id) {
    params.push(filters.customer_id);
    conditions.push(`i.customer_id = $${params.length}`);
  }

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`i.status = $${params.length}`);
  }

  if (conditions.length > 0) {
    queryText += ` WHERE ${conditions.join(" AND ")}`;
  }

  queryText += ` ORDER BY i.created_at DESC`;

  const result = await query(queryText, params);
  return result.rows;
};

export const updateInvoice = async (id, data) => {
  return updateById("invoices", id, data);
};
