CREATE INDEX idx_users_role_id
    ON users(role_id);

CREATE INDEX idx_users_is_active
    ON users(is_active);

CREATE INDEX idx_customers_sales_rep_id
    ON customers(sales_rep_id);

CREATE INDEX idx_customers_customer_tier
    ON customers(customer_tier);

CREATE INDEX idx_customers_is_active
    ON customers(is_active);

CREATE INDEX idx_customer_users_customer_id
    ON customer_users(customer_id);

CREATE INDEX idx_customer_users_is_active
    ON customer_users(is_active);