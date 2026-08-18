CREATE TABLE IF NOT EXISTS codex_sources (
    id VARCHAR(60) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    icon VARCHAR(60) NOT NULL DEFAULT 'BookOpen',
    is_custom BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS codex_section_sources (
    section_id VARCHAR(60) NOT NULL,
    source_id VARCHAR(60) NOT NULL,
    PRIMARY KEY (section_id, source_id)
);

CREATE TABLE IF NOT EXISTS codex_subgroups (
    id VARCHAR(80) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    section_id VARCHAR(60) NOT NULL,
    source_id VARCHAR(60) NOT NULL,
    parent_id VARCHAR(80),
    created_at TIMESTAMP DEFAULT now()
);