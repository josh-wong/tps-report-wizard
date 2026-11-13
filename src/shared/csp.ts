/**
 * Content Security Policy shared by the main process (response headers) and
 * the Vite dev server (the <meta> tag in index.html).
 *
 * Production always uses the strict policy. Development additionally allows
 * inline scripts because @vitejs/plugin-react injects an inline React Fast
 * Refresh preamble into index.html, and without it the renderer never starts.
 */
export function buildContentSecurityPolicy(isDev: boolean): string {
  const scriptSrc = isDev ? "script-src 'self' 'unsafe-inline'" : "script-src 'self'"
  return `default-src 'self'; ${scriptSrc}; style-src 'self' 'unsafe-inline'; img-src 'self' data:`
}
