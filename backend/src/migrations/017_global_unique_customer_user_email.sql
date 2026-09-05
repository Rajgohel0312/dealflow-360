ALTER TABLE customer_users
    DROP CONSTRAINT IF EXISTS uq_customer_user_email;

CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_users_email_unique
    ON customer_users (LOWER(email));
