export const CATEGORIES = [
  'Chairs & Stools',
  'Tables',
  'Lamps',
  'Sculpture',
  'Bowls',
  'Explorations',
  'Commission',
] as const;

export const STATUSES = ['published', 'draft', 'archived'] as const;

export type Category = (typeof CATEGORIES)[number];
export type Status = (typeof STATUSES)[number];

export interface Project {
  id: number;
  title: string;
  slug: string;
  number: number | null;
  year: number | null;
  category: Category;
  materials: string[];
  description: string | null;
  caption: string | null;
  images: string[];
  status: Status;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Shape accepted when creating/updating (no id/timestamps).
export interface ProjectInput {
  title: string;
  slug: string;
  number: number | null;
  year: number | null;
  category: string;
  materials: string[];
  description: string | null;
  caption: string | null;
  images: string[];
  status: string;
  sort_order?: number;
}

interface ProjectRow {
  id: number;
  title: string;
  slug: string;
  number: number | null;
  year: number | null;
  category: string;
  materials: string;
  description: string | null;
  caption: string | null;
  images: string;
  status: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

function rowToProject(row: ProjectRow): Project {
  return {
    ...row,
    category: row.category as Category,
    status: row.status as Status,
    materials: safeJsonArray(row.materials),
    images: safeJsonArray(row.images),
  };
}

function safeJsonArray(s: string): string[] {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function listProjects(db: D1Database): Promise<Project[]> {
  const { results } = await db
    .prepare('SELECT * FROM projects ORDER BY sort_order ASC, id ASC')
    .all<ProjectRow>();
  return (results ?? []).map(rowToProject);
}

export async function listPublished(db: D1Database): Promise<Project[]> {
  const { results } = await db
    .prepare("SELECT * FROM projects WHERE status = 'published' ORDER BY sort_order ASC, id ASC")
    .all<ProjectRow>();
  return (results ?? []).map(rowToProject);
}

export async function getProject(db: D1Database, id: number): Promise<Project | null> {
  const row = await db.prepare('SELECT * FROM projects WHERE id = ?').bind(id).first<ProjectRow>();
  return row ? rowToProject(row) : null;
}

export async function getProjectBySlug(db: D1Database, slug: string): Promise<Project | null> {
  const row = await db
    .prepare('SELECT * FROM projects WHERE slug = ?')
    .bind(slug)
    .first<ProjectRow>();
  return row ? rowToProject(row) : null;
}

export async function createProject(db: D1Database, p: ProjectInput): Promise<number> {
  const sortOrder = p.sort_order ?? Math.random();
  const res = await db
    .prepare(
      `INSERT INTO projects
        (title, slug, number, year, category, materials, description, caption, images, status, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      p.title,
      p.slug,
      p.number,
      p.year,
      p.category,
      JSON.stringify(p.materials),
      p.description,
      p.caption,
      JSON.stringify(p.images),
      p.status,
      sortOrder,
    )
    .run();
  return res.meta.last_row_id as number;
}

export async function updateProject(db: D1Database, id: number, p: ProjectInput): Promise<void> {
  await db
    .prepare(
      `UPDATE projects SET
         title = ?, slug = ?, number = ?, year = ?, category = ?, materials = ?,
         description = ?, caption = ?, images = ?, status = ?,
         updated_at = datetime('now')
       WHERE id = ?`,
    )
    .bind(
      p.title,
      p.slug,
      p.number,
      p.year,
      p.category,
      JSON.stringify(p.materials),
      p.description,
      p.caption,
      JSON.stringify(p.images),
      p.status,
      id,
    )
    .run();
}

export async function deleteProject(db: D1Database, id: number): Promise<void> {
  await db.prepare('DELETE FROM projects WHERE id = ?').bind(id).run();
}

export async function countUsers(db: D1Database): Promise<number> {
  const row = await db.prepare('SELECT COUNT(*) AS n FROM users').first<{ n: number }>();
  return row?.n ?? 0;
}

// ── Sketches (title + single image) ──────────────────

export interface Sketch {
  id: number;
  title: string;
  image: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export async function listSketches(db: D1Database): Promise<Sketch[]> {
  const { results } = await db
    .prepare('SELECT * FROM sketches ORDER BY sort_order ASC, id ASC')
    .all<Sketch>();
  return results ?? [];
}

export async function getSketch(db: D1Database, id: number): Promise<Sketch | null> {
  return (
    (await db.prepare('SELECT * FROM sketches WHERE id = ?').bind(id).first<Sketch>()) ?? null
  );
}

export async function createSketch(
  db: D1Database,
  s: { title: string; image: string },
): Promise<number> {
  const res = await db
    .prepare('INSERT INTO sketches (title, image, sort_order) VALUES (?, ?, ?)')
    .bind(s.title, s.image, Math.random())
    .run();
  return res.meta.last_row_id as number;
}

export async function updateSketch(
  db: D1Database,
  id: number,
  s: { title: string; image: string },
): Promise<void> {
  await db
    .prepare("UPDATE sketches SET title = ?, image = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(s.title, s.image, id)
    .run();
}

export async function deleteSketch(db: D1Database, id: number): Promise<void> {
  await db.prepare('DELETE FROM sketches WHERE id = ?').bind(id).run();
}

// ── Settings (key/value editable text) ───────────────

export async function getSettings(db: D1Database): Promise<Record<string, string>> {
  const { results } = await db
    .prepare('SELECT key, value FROM settings')
    .all<{ key: string; value: string }>();
  const out: Record<string, string> = {};
  for (const row of results ?? []) out[row.key] = row.value;
  return out;
}

export async function setSettings(db: D1Database, values: Record<string, string>): Promise<void> {
  const stmt = db.prepare(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
  );
  const batch = Object.entries(values).map(([k, v]) => stmt.bind(k, v));
  if (batch.length) await db.batch(batch);
}
