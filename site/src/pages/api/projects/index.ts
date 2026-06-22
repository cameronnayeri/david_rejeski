import type { APIRoute } from 'astro';
import {
  CATEGORIES,
  STATUSES,
  createProject,
  getProjectBySlug,
  slugify,
  type ProjectInput,
} from '../../../lib/db';
import { env } from '../../../lib/env';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null);
  const parsed = parseInput(body);
  if ('error' in parsed) return json({ error: parsed.error }, 400);

  parsed.value.slug = await uniqueSlug(env.DB, parsed.value.slug);
  const id = await createProject(env.DB, parsed.value);
  return json({ ok: true, id });
};

export function parseInput(
  body: any,
): { value: ProjectInput } | { error: string } {
  if (!body || typeof body !== 'object') return { error: 'Invalid request body.' };
  const title = String(body.title ?? '').trim();
  if (!title) return { error: 'Title is required.' };

  const category = CATEGORIES.includes(body.category) ? body.category : 'Whimsies';
  const status = STATUSES.includes(body.status) ? body.status : 'published';

  return {
    value: {
      title,
      slug: body.slug ? slugify(String(body.slug)) : slugify(title),
      number: numOrNull(body.number),
      year: numOrNull(body.year),
      category,
      materials: Array.isArray(body.materials)
        ? body.materials.map((m: unknown) => String(m).trim()).filter(Boolean)
        : [],
      description: strOrNull(body.description),
      caption: strOrNull(body.caption),
      images: Array.isArray(body.images) ? body.images.map((i: unknown) => String(i)) : [],
      featured: !!body.featured,
      status,
    },
  };
}

function numOrNull(v: unknown): number | null {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function strOrNull(v: unknown): string | null {
  const s = String(v ?? '').trim();
  return s ? s : null;
}

export async function uniqueSlug(db: D1Database, base: string, ignoreId?: number): Promise<string> {
  let slug = base || 'project';
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await getProjectBySlug(db, slug);
    if (!existing || existing.id === ignoreId) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
