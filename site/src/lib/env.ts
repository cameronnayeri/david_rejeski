// Astro v6 + @astrojs/cloudflare expose bindings via the `cloudflare:workers`
// virtual module instead of `Astro.locals.runtime.env`. The `env` proxy
// resolves per-request, so importing it once at module load is fine.
import { env as cfEnv } from 'cloudflare:workers';

export const env = cfEnv as unknown as CloudflareEnv;
