import { defineConfig } from 'astro/config';
import { mkdirSync, writeFileSync } from 'node:fs';
import react from '@astrojs/react';

// Custom integration: sets up the virtual:keystatic-config module without
// injecting routes (injected routes with prerender:false are broken in Astro v6
// static mode dev server). Local page files handle the routes instead.
function keystaticSetup() {
  return {
    name: 'keystatic-setup',
    hooks: {
      'astro:config:setup': ({ updateConfig, config }) => {
        updateConfig({
          vite: {
            plugins: [{
              name: 'keystatic-virtual',
              resolveId(id) {
                if (id === 'virtual:keystatic-config') {
                  return this.resolve('./keystatic.config', './a');
                }
                return null;
              }
            }],
            optimizeDeps: { entries: ['keystatic.config.*'] }
          }
        });
        const dotAstroDir = new URL('./.astro/', config.root);
        mkdirSync(dotAstroDir, { recursive: true });
        writeFileSync(new URL('keystatic-imports.js', dotAstroDir),
          `import "@keystatic/astro/ui";\nimport "@keystatic/astro/api";\nimport "@keystatic/core/ui";\n`
        );
      }
    }
  };
}

export default defineConfig({
  output: 'static',
  site: 'https://cameronnayeri.github.io',
  base: '/david_rejeski',
  integrations: [keystaticSetup(), react()],
});
