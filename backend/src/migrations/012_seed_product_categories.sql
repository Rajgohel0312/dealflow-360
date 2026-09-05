INSERT INTO product_categories (
    name,
    description,
    default_discount_limit
)
VALUES
    (
        'Hardware',
        'Physical hardware products',
        5.00
    ),
    (
        'Services',
        'Professional and business services',
        10.00
    ),
    (
        'Subscription',
        'Recurring subscription products',
        10.00
    ),
    (
        'Software',
        'Software products and licenses',
        15.00
    )
ON CONFLICT (name) DO NOTHING;