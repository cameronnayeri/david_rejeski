import { marked } from 'marked';

// Renders a single paragraph of Markdown (links, emphasis, etc.) to inline HTML
// — no wrapping <p>, since each field already sits inside its own styled <p>.
// External links open in a new tab.
export function mdInline(src: string): string {
  const html = marked.parseInline(src ?? '', { async: false }) as string;
  return html.replace(
    /<a href="(https?:\/\/[^"]+)"/g,
    '<a href="$1" target="_blank" rel="noopener"',
  );
}
