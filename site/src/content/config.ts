import { defineCollection, z } from 'astro:content';

const pieces = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    number: z.number(),
    year: z.number(),
    category: z.enum([
      'Chairs & Stools',
      'Tables',
      'Lamps',
      'Sculpture',
      'Whimsies',
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
