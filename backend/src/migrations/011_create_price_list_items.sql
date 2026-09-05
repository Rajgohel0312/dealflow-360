CREATE TABLE price_list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    price_list_id UUID NOT NULL,

    product_id UUID NOT NULL,

    price NUMERIC(15,2) NOT NULL,

    minimum_quantity NUMERIC(15,2) NOT NULL DEFAULT 1,

    maximum_quantity NUMERIC(15,2),

    CONSTRAINT fk_price_list_items_price_list
        FOREIGN KEY (price_list_id)
        REFERENCES price_lists(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_price_list_items_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_price_list_item_price
        CHECK (price >= 0),

    CONSTRAINT chk_minimum_quantity
        CHECK (minimum_quantity > 0),

    CONSTRAINT chk_maximum_quantity
        CHECK (
            maximum_quantity IS NULL
            OR maximum_quantity >= minimum_quantity
        ),

    CONSTRAINT uq_price_list_product_quantity
        UNIQUE (
            price_list_id,
            product_id,
            minimum_quantity
        )
);