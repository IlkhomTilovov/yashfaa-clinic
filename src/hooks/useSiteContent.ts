import { useQuery } from "@tanstack/react-query";
import { useLang } from "@/hooks/useLang";
import { getSiteContent } from "@/lib/server-functions";

export type SiteContentRow = {
  key: string;
  value_uz: string | null;
  value_ru: string | null;
  value_type: string;
};

/**
 * Hook to read editable site content from the `site_content` table.
 *
 * IMPORTANT: This data is SSR-prefetched in `__root.tsx` loader, so on the
 * first paint the cache is already hydrated. This means `data` is available
 * synchronously on the very first render — NO flash of stale/fallback content.
 *
 * Fallbacks are still supported (i18n translations remain as defaults for
 * keys that admin has not overridden in the DB), but the cached DB value
 * always wins when present.
 */
export function useSiteContent() {
  const lang = useLang();
  const { data, isLoading } = useQuery({
    queryKey: ["site_content"],
    queryFn: () => getSiteContent(),
    staleTime: 5 * 60_000, // 5 min — admin edits invalidate manually
    refetchOnWindowFocus: false,
    refetchOnMount: false, // SSR already provided fresh data
  });

  const get = (key: string, fallback = ""): string => {
    const row = (data as Record<string, SiteContentRow> | undefined)?.[key];
    if (!row) return fallback;
    const localized = lang === "ru" ? row.value_ru : row.value_uz;
    return (localized ?? row.value_uz ?? fallback) || fallback;
  };

  return { get, isLoading, raw: data as Record<string, SiteContentRow> | undefined };
}
