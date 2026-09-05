CREATE TABLE discount_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    customer_tier VARCHAR(20) NOT NULL,

    category_id UUID NOT NULL,

    max_discount_percent NUMERIC(5,2) NOT NULL,

    risk_level VARCHAR(20) NOT NULL DEFAULT 'NORMAL',

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_discount_rules_category
        FOREIGN KEY (category_id)
        REFERENCES product_categories(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_discount_rules_tier
        CHECK (
            customer_tier IN ('Bronze', 'Silver', 'Gold')
        ),

    CONSTRAINT chk_discount_rules_discount
        CHECK (
            max_discount_percent >= 0
            AND max_discount_percent <= 100
        ),

    CONSTRAINT chk_discount_rules_risk
        CHECK (
            risk_level IN ('NORMAL', 'MANAGER', 'FINANCE')
        ),

    CONSTRAINT uq_discount_rule
        UNIQUE (customer_tier, category_id)
);