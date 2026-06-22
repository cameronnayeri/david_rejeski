-- Sketches (2D works) — title + single image
CREATE TABLE IF NOT EXISTS sketches (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  image       TEXT    NOT NULL DEFAULT '',
  sort_order  REAL    NOT NULL DEFAULT 0,   -- random by default
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
