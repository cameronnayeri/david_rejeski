import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// Cloudflare Pages (SSR). Project content + images live in D1 + R2,
// so pages render at request time. Purely static pages opt in with
// `export const prerender = true`.
export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    platformProxy: { enabled: true }, // local D1/R2 bindings during `astro dev`
    imageService: 'passthrough', // we serve images straight from R2, not CF Images
  }),
});
