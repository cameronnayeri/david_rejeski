import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const pieces = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pieces' }),
  schema: z.object({
    title: z.string(),
    number: z.number(),
    year: z.number(),
    category: z.enum([
      'Chairs & Stools',
      'Tables',
      'Lamps',
      'Sculpture',
      'Explorations',
      'Commission',
    ]),
    materials: z.array(z.string()),
    description: z.string().optional(),
    caption: z.string().optional(),
    images: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    status: z.enum(['published', 'draft', 'archived']).default('published'),
    order: z.number().optional(),
  }),
});

export const collections = { pieces };
