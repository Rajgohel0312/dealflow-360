CREATE INDEX idx_products_category_id
    ON products(category_id);

CREATE INDEX idx_products_is_active
    ON products(is_active);

CREATE INDEX idx_products_product_type
    ON products(product_type);

CREATE INDEX idx_price_list_items_price_list_id
    ON price_list_items(price_list_id);

CREATE INDEX idx_price_list_items_product_id
    ON price_list_items(product_id);

CREATE INDEX idx_product_categories_name
    ON product_categories(name);