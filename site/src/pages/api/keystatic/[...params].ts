import { makeHandler } from '@keystatic/astro/api';
import config from 'virtual:keystatic-config';

// SSR in dev only — static build produces no files for this route
export const prerender = !import.meta.env.DEV;
export function getStaticPaths() { return []; }

const keystatic = makeHandler({ config });

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export const ALL = async (context: Parameters<typeof keystatic>[0]) => {
  if (!BASE) return keystatic(context);

  const url = new URL(context.request.url);
  if (url.pathname.startsWith(BASE)) {
    url.pathname = url.pathname.slice(BASE.length) || '/';
  }
  const request = new Request(url.toString(), context.request);
  return keystatic({ ...context, request });
};
