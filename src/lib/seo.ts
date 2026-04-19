/**
 * Centralized SEO helpers for Yashfaa Clinic.
 *
 * - SITE_URL: canonical production origin (no trailing slash)
 * - buildMeta(): generates the standard meta array (title, description,
 *   OG, Twitter, canonical, hreflang) for any route
 * - truncate(): keeps descriptions within Google's ~160 char window
 */

export const SITE_URL = "https://yashfaa-clinic.uz";
export const SITE_NAME = "Yashfaa Clinic";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`;

export type Lang = "uz" | "ru";

export function truncate(text: string | null | undefined, max = 160): string {
  if (!text) return "";
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).trimEnd() + "…";
}

export function absoluteUrl(path: string): string {
  if (!path) return SITE_URL;
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export interface BuildMetaOptions {
  title: string;
  description: string;
  /** Path WITHOUT lang prefix, e.g. "/services/terapiya" or "" for home */
  pathWithoutLang: string;
  lang: Lang;
  image?: string | null;
  type?: "website" | "article" | "profile";
  /** Additional meta entries to append (e.g. article:published_time) */
  extra?: Array<Record<string, string>>;
}

/**
 * Builds the full meta array used by TanStack Router's `head()`.
 *
 * Includes: title, description, robots, canonical, hreflang (uz/ru/x-default),
 * Open Graph, Twitter card. The image defaults to the site OG image; pass
 * an absolute or relative URL to override.
 */
export function buildMeta(opts: BuildMetaOptions): Array<Record<string, string>> {
  const { title, description, pathWithoutLang, lang, image, type = "website", extra = [] } = opts;
  const desc = truncate(description, 160);
  const ogImage = absoluteUrl(image || DEFAULT_OG_IMAGE);
  const path = pathWithoutLang.startsWith("/") || pathWithoutLang === "" ? pathWithoutLang : `/${pathWithoutLang}`;
  const canonical = `${SITE_URL}/${lang}${path}`;
  const altUz = `${SITE_URL}/uz${path}`;
  const altRu = `${SITE_URL}/ru${path}`;
  const ogLocale = lang === "ru" ? "ru_RU" : "uz_UZ";

  return [
    { title },
    { name: "description", content: desc },
    { name: "robots", content: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" },
    { rel: "canonical", href: canonical },
    { rel: "alternate", hrefLang: "uz", href: altUz },
    { rel: "alternate", hrefLang: "ru", href: altRu },
    { rel: "alternate", hrefLang: "x-default", href: altUz },
    { property: "og:type", content: type },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:locale", content: ogLocale },
    { property: "og:locale:alternate", content: lang === "ru" ? "uz_UZ" : "ru_RU" },
    { property: "og:title", content: title },
    { property: "og:description", content: desc },
    { property: "og:url", content: canonical },
    { property: "og:image", content: ogImage },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: desc },
    { name: "twitter:image", content: ogImage },
    ...extra,
  ];
}

/** Helper to inject JSON-LD via TanStack head().scripts */
export function jsonLdScript(data: Record<string, any>) {
  return {
    type: "application/ld+json",
    children: JSON.stringify(data),
  };
}

/** Picks localized text with safe fallbacks. */
export function pickLang<T extends Record<string, any>>(
  obj: T,
  field: string,
  lang: Lang,
): string {
  return (
    (obj?.[`${field}_${lang}`] as string) ||
    (obj?.[`${field}_uz`] as string) ||
    (obj?.[field] as string) ||
    ""
  );
}
