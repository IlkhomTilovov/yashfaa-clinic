import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/seo";

/**
 * /robots.txt — allows all crawlers, points to sitemap, blocks admin & auth.
 */
export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /login
Disallow: /setup

Sitemap: ${SITE_URL}/sitemap.xml
`;
        return new Response(body, {
          status: 200,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
