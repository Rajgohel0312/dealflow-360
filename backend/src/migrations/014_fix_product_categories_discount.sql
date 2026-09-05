ALTER TABLE product_categories
DROP CONSTRAINT IF EXISTS chk_product_category_discount;

ALTER TABLE product_categories
DROP COLUMN IF EXISTS default_discount_limit;