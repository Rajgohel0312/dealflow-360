import {
  insertOne,
  findOne,
  updateById,
  query,
} from "../../infrastructure/database/index.js";

export const createNegotiation = async (data) => {
  return insertOne("negotiations", data);
};

export const createNegotiationItem = async (data) => {
  return insertOne("negotiation_items", data);
};

export const findNegotiationById = async (id) => {
  const result = await query(
    `SELECT n.*, q.quotation_number, c.name as customer_name
     FROM negotiations n
     JOIN quotations q ON n.quotation_id = q.id
     JOIN customers c ON n.customer_id = c.id
     WHERE n.id = $1 LIMIT 1`,
    [id]
  );
  if (result.rows.length === 0) return null;
  const negotiation = result.rows[0];

  const itemsRes = await query(
    `SELECT ni.*, p.name as product_name, p.sku as product_sku
     FROM negotiation_items ni
     LEFT JOIN products p ON ni.product_id = p.id
     WHERE ni.negotiation_id = $1`,
    [id]
  );
  negotiation.items = itemsRes.rows;

  return negotiation;
};

export const findNegotiationsByQuotation = async (quotationId) => {
  const result = await query(
    `SELECT * FROM negotiations WHERE quotation_id = $1 ORDER BY created_at DESC`,
    [quotationId]
  );
  return result.rows;
};

export const updateNegotiation = async (id, data) => {
  return updateById("negotiations", id, data);
};
