CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(255) NOT NULL,

    email VARCHAR(255),

    phone VARCHAR(50),

    address TEXT,

    customer_tier VARCHAR(20) NOT NULL DEFAULT 'Bronze',

    currency VARCHAR(3) NOT NULL DEFAULT 'INR',

    sales_rep_id UUID,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_customers_sales_rep
        FOREIGN KEY (sales_rep_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT chk_customer_tier
        CHECK (customer_tier IN ('Bronze', 'Silver', 'Gold')),

    CONSTRAINT chk_customer_currency
        CHECK (currency ~ '^[A-Z]{3}$')
);