CREATE TABLE IF NOT EXISTS creature_overrides (
    id VARCHAR(50) PRIMARY KEY,
    data JSONB NOT NULL,
    is_removed BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMP DEFAULT now()
);