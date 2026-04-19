import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/hooks/useLang";

export type SiteContentRow = {
  key: string;
  value_uz: string | null;
  value_ru: string | null;
  value_type: string;
};

async function fetchSiteContent(): Promise<Record<string, SiteContentRow>> {
  const { data, error } = await supabase
    .from("site_content")
    .select("key, value_uz, value_ru, value_type");
  if (error) throw new Error(error.message);
  const map: Record<string, SiteContentRow> = {};
  for (const row of data ?? []) {
    map[row.key] = row as SiteContentRow;
  }
  return map;
}

/**
 * Hook to read editable site content from the `site_content` table.
 * Falls back gracefully to provided defaults if a key is missing.
 */
export function useSiteContent() {
  const lang = useLang();
  const { data, isLoading } = useQuery({
    queryKey: ["site_content"],
    queryFn: fetchSiteContent,
    staleTime: 60_000,
  });

  const get = (key: string, fallback = ""): string => {
    const row = data?.[key];
    if (!row) return fallback;
    const localized = lang === "ru" ? row.value_ru : row.value_uz;
    return (localized ?? row.value_uz ?? fallback) || fallback;
  };

  return { get, isLoading, raw: data };
}
