CREATE TABLE IF NOT EXISTS creatures (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    source VARCHAR(50) NOT NULL DEFAULT 'gm',
    subgroup VARCHAR(255),
    summary TEXT NOT NULL,
    meta VARCHAR(100),
    portrait TEXT,
    tags JSONB,
    creature_stats JSONB,
    callouts JSONB,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);