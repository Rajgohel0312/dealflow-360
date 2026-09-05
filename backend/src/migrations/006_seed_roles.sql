INSERT INTO roles (name, description)
VALUES
    ('Admin', 'System administrator'),
    ('Sales Rep', 'Manages customers and sales activities'),
    ('Manager', 'Reviews and approves business operations'),
    ('Finance', 'Handles financial operations'),
    ('Operations', 'Handles operational activities')
ON CONFLICT (name) DO NOTHING;