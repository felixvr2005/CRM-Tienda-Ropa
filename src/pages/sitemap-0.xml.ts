import type { APIRoute } from 'astro';
import { supabase } from '../lib/supabase';

export const prerender = false;

const SITE = 'https://essentialforce.victoriafp.online';

// Static pages with priorities
const STATIC_PAGES: { path: string; priority: string; changefreq: string }[] = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/productos', priority: '0.9', changefreq: 'daily' },
  { path: '/categoria/novedades', priority: '0.8', changefreq: 'daily' },
  { path: '/categoria/ofertas', priority: '0.8', changefreq: 'daily' },
  { path: '/contacto', priority: '0.6', changefreq: 'monthly' },
  { path: '/sobre-nosotros', priority: '0.5', changefreq: 'monthly' },
  { path: '/envios', priority: '0.5', changefreq: 'monthly' },
  { path: '/terminos', priority: '0.3', changefreq: 'yearly' },
  { path: '/privacidad', priority: '0.3', changefreq: 'yearly' },
];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async () => {
  const now = new Date().toISOString();

  // Build static URLs
  const staticUrls = STATIC_PAGES.map(
    (p) => `  <url>
    <loc>${SITE}${p.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  );

  // Fetch active products from Supabase
  let productUrls: string[] = [];
  try {
    const { data: products } = await supabase
      .from('products')
      .select('slug, updated_at')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(5000);

    if (products && products.length > 0) {
      productUrls = products.map(
        (p: any) => `  <url>
    <loc>${SITE}/productos/${escapeXml(p.slug)}</loc>
    <lastmod>${p.updated_at || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
      );
    }
  } catch {
    // If DB query fails, continue with static-only sitemap
  }

  // Fetch categories
  let categoryUrls: string[] = [];
  try {
    const { data: categories } = await supabase
      .from('categories')
      .select('slug, updated_at')
      .order('name', { ascending: true });

    if (categories && categories.length > 0) {
      categoryUrls = categories.map(
        (c: any) => `  <url>
    <loc>${SITE}/categoria/${escapeXml(c.slug)}</loc>
    <lastmod>${c.updated_at || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
      );
    }
  } catch {
    // Continue without categories
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...categoryUrls, ...productUrls].join('\n')}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
