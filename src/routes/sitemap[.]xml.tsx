import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/seo";

/**
 * Dynamic sitemap.xml — auto-generated from Supabase content.
 * Includes static pages (home, services, doctors, tests, contact, appointment)
 * plus every active service, doctor, and test in both `uz` and `ru`.
 *
 * Cached at the edge for 1 hour.
 */
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { supabase } = await import("@/integrations/supabase/client");

        const [{ data: services }, { data: doctors }, { data: tests }] = await Promise.all([
          supabase.from("services").select("slug").eq("is_active", true),
          supabase.from("doctors").select("id, slug").eq("is_active", true),
          supabase.from("tests").select("slug").eq("is_active", true),
        ]);

        const langs: Array<"uz" | "ru"> = ["uz", "ru"];
        const staticPaths = ["", "/services", "/doctors", "/tests", "/contact", "/appointment"];

        type UrlEntry = { loc: string; priority: string; changefreq: string; alternates: Array<{ hreflang: string; href: string }> };
        const urls: UrlEntry[] = [];

        const pushBoth = (path: string, priority: string, changefreq: string) => {
          const alternates = [
            { hreflang: "uz", href: `${SITE_URL}/uz${path}` },
            { hreflang: "ru", href: `${SITE_URL}/ru${path}` },
            { hreflang: "x-default", href: `${SITE_URL}/uz${path}` },
          ];
          for (const lang of langs) {
            urls.push({ loc: `${SITE_URL}/${lang}${path}`, priority, changefreq, alternates });
          }
        };

        for (const p of staticPaths) {
          pushBoth(p, p === "" ? "1.0" : "0.8", p === "" ? "weekly" : "monthly");
        }

        for (const s of services ?? []) {
          if (s.slug) pushBoth(`/services/${s.slug}`, "0.7", "monthly");
        }
        for (const t of tests ?? []) {
          if (t.slug) pushBoth(`/tahlil/${t.slug}`, "0.7", "monthly");
        }
        for (const d of doctors ?? []) {
          // doctor route uses :doctorId param (id, not slug)
          if (d.id) pushBoth(`/doctors/${d.id}`, "0.6", "monthly");
        }

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
${u.alternates.map((a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}" />`).join("\n")}
  </url>`,
  )
  .join("\n")}
</urlset>`;

        return new Response(xml, {
          status: 200,
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
          },
        });
      },
    },
  },
});
