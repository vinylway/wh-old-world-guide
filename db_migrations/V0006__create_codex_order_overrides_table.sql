CREATE TABLE IF NOT EXISTS codex_order_overrides (
    item_id VARCHAR(120) PRIMARY KEY,
    order_index INTEGER NOT NULL,
    updated_at TIMESTAMP DEFAULT now()
);