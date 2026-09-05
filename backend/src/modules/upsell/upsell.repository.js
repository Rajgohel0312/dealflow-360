import {
  insertOne,
  query,
} from "../../infrastructure/database/index.js";

export const findRecommendationsByProducts = async (productIds = []) => {
  if (!productIds || productIds.length === 0) return [];
  const placeholders = productIds.map((_, i) => `$${i + 1}`).join(", ");
  const result = await query(
    `SELECT pr.*, 
            p1.name as source_product_name,
            p2.id as recommended_product_id, p2.name as recommended_product_name, 
            p2.sku as recommended_product_sku, p2.base_price as recommended_base_price
     FROM product_recommendations pr
     JOIN products p1 ON pr.product_id = p1.id
     JOIN products p2 ON pr.recommended_product_id = p2.id
     WHERE pr.product_id IN (${placeholders}) AND pr.is_active = TRUE AND p2.is_active = TRUE
     ORDER BY pr.priority ASC`,
    productIds
  );
  return result.rows;
};

export const findPurchasedProductIdsByCustomer = async (customerId) => {
  const result = await query(
    `SELECT DISTINCT oi.product_id
     FROM orders o
     JOIN order_items oi ON o.id = oi.order_id
     WHERE o.customer_id = $1`,
    [customerId]
  );
  return result.rows.map((r) => r.product_id);
};

export const createRecommendationRule = async (data) => {
  return insertOne("product_recommendations", data);
};
