CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(150) NOT NULL UNIQUE,

    description TEXT,

    default_discount_limit NUMERIC(5,2) NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_product_category_discount
        CHECK (
            default_discount_limit >= 0
            AND default_discount_limit <= 100
        )
);