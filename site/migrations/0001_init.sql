-- Projects (the only content type)
CREATE TABLE IF NOT EXISTS projects (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  title        TEXT    NOT NULL,
  slug         TEXT    NOT NULL UNIQUE,
  number       INTEGER,
  year         INTEGER,
  category     TEXT    NOT NULL DEFAULT 'Whimsies',
  materials    TEXT    NOT NULL DEFAULT '[]',  -- JSON array
  description  TEXT,
  caption      TEXT,
  images       TEXT    NOT NULL DEFAULT '[]',  -- JSON array of /img/* paths
  featured     INTEGER NOT NULL DEFAULT 0,     -- boolean
  status       TEXT    NOT NULL DEFAULT 'published',
  sort_order   REAL    NOT NULL DEFAULT 0,     -- random by default; lower = earlier
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);

-- Admin users (Cameron, then David)
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT    NOT NULL UNIQUE,
  password_hash TEXT    NOT NULL,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);
