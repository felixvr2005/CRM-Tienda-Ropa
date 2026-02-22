import type { APIRoute } from 'astro';

const siteUrl = 'https://essentialforce.victoriafp.online';

const robotsTxt = `# robots.txt - ESSENTIAL FORCE
# https://essentialforce.victoriafp.online

User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /debug/
Disallow: /checkout/
Disallow: /cuenta/callback
Disallow: /cuenta/nueva-password

# Bloquear bots de IA
User-agent: Amazonbot
Disallow: /

User-agent: Applebot-Extended
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: GPTBot
Disallow: /

User-agent: meta-externalagent
Disallow: /

# Sitemap
Sitemap: ${siteUrl}/sitemap-index.xml
`.trim();

export const GET: APIRoute = () => {
  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
