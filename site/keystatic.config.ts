import { config, collection, fields } from '@keystatic/core';

export default config({
  storage: { kind: 'local' },

  collections: {
    pieces: collection({
      label: 'Projects',
      slugField: 'title',
      path: 'src/content/pieces/*',
      format: { contentField: 'body' },
      entryLayout: 'form',
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        number: fields.number({ label: 'Number' }),
        year: fields.number({ label: 'Year' }),
        category: fields.select({
          label: 'Category',
          options: [
            { label: 'Chairs & Stools', value: 'Chairs & Stools' },
            { label: 'Tables',          value: 'Tables' },
            { label: 'Lamps',           value: 'Lamps' },
            { label: 'Sculpture',       value: 'Sculpture' },
            { label: 'Whimsies',        value: 'Whimsies' },
            { label: 'Commission',      value: 'Commission' },
          ],
          defaultValue: 'Whimsies',
        }),
        materials: fields.array(
          fields.text({ label: 'Material' }),
          { label: 'Materials', itemLabel: p => p.value },
        ),
        description: fields.text({ label: 'Description', multiline: true }),
        images: fields.array(
          fields.image({
            label: 'Image',
            directory: 'public/images',
            publicPath: '/images/',
          }),
          { label: 'Images', itemLabel: (_, i) => `Image ${i + 1}` },
        ),
        featured: fields.checkbox({ label: 'Featured on home page', defaultValue: false }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Published', value: 'published' },
            { label: 'Draft',     value: 'draft' },
            { label: 'Archived',  value: 'archived' },
          ],
          defaultValue: 'published',
        }),
        order: fields.number({ label: 'Sort order (optional)' }),
        body: fields.markdoc({ label: 'Notes', extension: 'md' }),
      },
    }),
  },
});
