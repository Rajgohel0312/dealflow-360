import {
  insertOne,
  findOne,
  query,
} from "../../infrastructure/database/index.js";

export const createPayment = async (data) => {
  return insertOne("payments", data);
};

export const findPaymentById = async (id) => {
  const result = await query(
    `SELECT p.*, i.invoice_number, c.name as customer_name
     FROM payments p
     JOIN invoices i ON p.invoice_id = i.id
     JOIN customers c ON p.customer_id = c.id
     WHERE p.id = $1 LIMIT 1`,
    [id]
  );
  return result.rows[0] || null;
};

export const findPaymentsByInvoiceId = async (invoiceId) => {
  const result = await query(
    `SELECT * FROM payments WHERE invoice_id = $1 ORDER BY paid_at DESC`,
    [invoiceId]
  );
  return result.rows;
};
