CREATE TABLE IF NOT EXISTS map_categories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#b8860b',
  sort_order INTEGER NOT NULL DEFAULT 0
);
INSERT INTO map_categories (id, title, color, sort_order) VALUES
  ('realm', 'Государства', '#b8860b', 1),
  ('wild', 'Дикие земли', '#8b2e2e', 2),
  ('sea', 'Моря и океаны', '#2e6a8b', 3),
  ('custom', 'Мои метки', '#5b3a8b', 4)
ON CONFLICT (id) DO NOTHING;
CREATE TABLE IF NOT EXISTS map_hidden_markers (
  id TEXT PRIMARY KEY
);