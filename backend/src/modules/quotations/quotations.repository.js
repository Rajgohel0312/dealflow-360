import {
  insertOne,
  findOne,
  updateById,
  deleteById,
  query,
} from "../../infrastructure/database/index.js";

// ==========================================
// QUOTATION HEADERS
// ==========================================

export const generateNextQuotationNumber = async () => {
  const result = await query(
    `SELECT quotation_number FROM quotations 
     ORDER BY created_at DESC LIMIT 1`,
    []
  );

  let nextSeq = 1;
  if (result.rows.length > 0) {
    const lastNum = result.rows[0].quotation_number;
    const match = lastNum.match(/QTN-(\d+)/);
    if (match) {
      nextSeq = parseInt(match[1], 10) + 1;
    }
  }

  const padded = String(nextSeq).padStart(6, "0");
  return `QTN-${padded}`;
};

export const createQuotation = async (data) => {
  return insertOne("quotations", data);
};

export const findQuotationById = async (id) => {
  const result = await query(
    `SELECT q.*, 
            c.name as customer_name, c.customer_tier, c.email as customer_email,
            u.name as sales_rep_name, u.email as sales_rep_email,
            pl.name as price_list_name
     FROM quotations q
     JOIN customers c ON q.customer_id = c.id
     JOIN users u ON q.sales_rep_id = u.id
     LEFT JOIN price_lists pl ON q.price_list_id = pl.id
     WHERE q.id = $1 LIMIT 1`,
    [id]
  );
  return result.rows[0] || null;
};

export const findAllQuotations = async (filters = {}) => {
  let queryText = `
    SELECT q.*, 
           c.name as customer_name, c.customer_tier,
           u.name as sales_rep_name,
           pl.name as price_list_name
    FROM quotations q
    JOIN customers c ON q.customer_id = c.id
    JOIN users u ON q.sales_rep_id = u.id
    LEFT JOIN price_lists pl ON q.price_list_id = pl.id
  `;
  const conditions = [];
  const params = [];

  if (filters.sales_rep_id) {
    params.push(filters.sales_rep_id);
    conditions.push(`q.sales_rep_id = $${params.length}`);
  }

  if (filters.customer_id) {
    params.push(filters.customer_id);
    conditions.push(`q.customer_id = $${params.length}`);
  }

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`q.status = $${params.length}`);
  }

  if (conditions.length > 0) {
    queryText += ` WHERE ${conditions.join(" AND ")}`;
  }

  queryText += ` ORDER BY q.created_at DESC`;

  const result = await query(queryText, params);
  return result.rows;
};

export const updateQuotation = async (id, data) => {
  return updateById("quotations", id, data);
};

// ==========================================
// QUOTATION ITEMS
// ==========================================

export const createQuotationItem = async (data) => {
  return insertOne("quotation_items", data);
};

export const findQuotationItemById = async (id) => {
  const result = await query(
    `SELECT qi.*, p.name as product_name, p.sku as product_sku, p.category_id, cat.name as category_name
     FROM quotation_items qi
     JOIN products p ON qi.product_id = p.id
     JOIN product_categories cat ON p.category_id = cat.id
     WHERE qi.id = $1 LIMIT 1`,
    [id]
  );
  return result.rows[0] || null;
};

export const findQuotationItemsByQuotationId = async (quotationId) => {
  const result = await query(
    `SELECT qi.*, p.name as product_name, p.sku as product_sku, p.category_id, cat.name as category_name
     FROM quotation_items qi
     JOIN products p ON qi.product_id = p.id
     JOIN product_categories cat ON p.category_id = cat.id
     WHERE qi.quotation_id = $1
     ORDER BY qi.created_at ASC`,
    [quotationId]
  );
  return result.rows;
};

export const updateQuotationItem = async (id, data) => {
  return updateById("quotation_items", id, data);
};

export const deleteQuotationItem = async (id) => {
  return deleteById("quotation_items", id);
};

// ==========================================
// QUOTATION APPROVALS
// ==========================================

export const createQuotationApproval = async (data) => {
  return insertOne("quotation_approvals", data);
};

export const findPendingApprovals = async () => {
  const result = await query(
    `SELECT qa.*, 
            q.quotation_number, q.total_amount, q.risk_level, q.currency,
            c.name as customer_name, c.customer_tier,
            u.name as sales_rep_name
     FROM quotation_approvals qa
     JOIN quotations q ON qa.quotation_id = q.id
     JOIN customers c ON q.customer_id = c.id
     JOIN users u ON q.sales_rep_id = u.id
     WHERE qa.status = 'PENDING'
     ORDER BY qa.created_at ASC`,
    []
  );
  return result.rows;
};

export const findApprovalsByQuotationId = async (quotationId) => {
  const result = await query(
    `SELECT qa.*, u.name as approver_name
     FROM quotation_approvals qa
     LEFT JOIN users u ON qa.approver_id = u.id
     WHERE qa.quotation_id = $1
     ORDER BY qa.created_at DESC`,
    [quotationId]
  );
  return result.rows;
};

export const findPendingApprovalForQuotation = async (quotationId) => {
  const result = await query(
    `SELECT * FROM quotation_approvals 
     WHERE quotation_id = $1 AND status = 'PENDING' 
     LIMIT 1`,
    [quotationId]
  );
  return result.rows[0] || null;
};

export const updateQuotationApproval = async (id, data) => {
  return updateById("quotation_approvals", id, data);
};
