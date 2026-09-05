-- 1. Create quotations table
CREATE TABLE IF NOT EXISTS quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    sales_rep_id UUID NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    price_list_id UUID REFERENCES price_lists(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    subtotal NUMERIC(15,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    valid_until TIMESTAMPTZ,
    notes TEXT,
    risk_level VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    requires_approval BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_quotation_status CHECK (
        status IN ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED', 'CONVERTED')
    ),
    CONSTRAINT chk_quotation_risk_level CHECK (
        risk_level IN ('NORMAL', 'MANAGER', 'FINANCE')
    )
);

-- 2. Create quotation_items table
CREATE TABLE IF NOT EXISTS quotation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID NOT NULL REFERENCES quotations(id) ON UPDATE CASCADE ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    quantity NUMERIC(15,2) NOT NULL DEFAULT 1,
    unit_price NUMERIC(15,2) NOT NULL DEFAULT 0,
    discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    line_total NUMERIC(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_quotation_item_qty CHECK (quantity > 0),
    CONSTRAINT chk_quotation_item_price CHECK (unit_price >= 0),
    CONSTRAINT chk_quotation_item_discount CHECK (discount_percent >= 0 AND discount_percent <= 100)
);

-- 3. Create quotation_approvals table
CREATE TABLE IF NOT EXISTS quotation_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID NOT NULL REFERENCES quotations(id) ON UPDATE CASCADE ON DELETE CASCADE,
    approver_id UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    approval_level VARCHAR(20) NOT NULL DEFAULT 'MANAGER',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    comments TEXT,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_approval_level CHECK (approval_level IN ('MANAGER', 'FINANCE')),
    CONSTRAINT chk_approval_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_quotations_customer_id ON quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotations_sales_rep_id ON quotations(sales_rep_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation_id ON quotation_items(quotation_id);
CREATE INDEX IF NOT EXISTS idx_quotation_approvals_quotation_id ON quotation_approvals(quotation_id);
CREATE INDEX IF NOT EXISTS idx_quotation_approvals_status ON quotation_approvals(status);
