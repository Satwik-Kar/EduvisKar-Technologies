CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS transactions (
    token UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    source_app VARCHAR(255) NOT NULL,
    return_url TEXT NOT NULL,
    webhook_url TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
