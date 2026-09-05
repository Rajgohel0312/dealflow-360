CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    category_id UUID NOT NULL,

    name VARCHAR(255) NOT NULL,

    sku VARCHAR(100) NOT NULL UNIQUE,

    description TEXT,

    base_price NUMERIC(15,2) NOT NULL,

    cost_price NUMERIC(15,2) NOT NULL,

    unit VARCHAR(50) NOT NULL DEFAULT 'unit',

    tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0,

    product_type VARCHAR(20) NOT NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id)
        REFERENCES product_categories(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_products_base_price
        CHECK (base_price >= 0),

    CONSTRAINT chk_products_cost_price
        CHECK (cost_price >= 0),

    CONSTRAINT chk_products_tax_rate
        CHECK (
            tax_rate >= 0
            AND tax_rate <= 100
        ),

    CONSTRAINT chk_products_type
        CHECK (
            product_type IN ('ONE_TIME', 'SUBSCRIPTION')
        )
);