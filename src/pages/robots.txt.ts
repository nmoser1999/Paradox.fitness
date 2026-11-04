import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const enabled = import.meta.env.SITE_INDEXABLE === 'true';
  return new Response(
    `User-agent: *\n${enabled ? 'Allow: /\nDisallow: /thanks/\nDisallow: /design/' : 'Disallow: /'}\nSitemap: ${new URL('/sitemap-index.xml', site)}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
};
