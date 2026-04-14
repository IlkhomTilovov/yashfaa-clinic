import { useParams } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { type Lang, isValidLang } from "@/lib/i18n";

export function useLang(): Lang {
  const params = useParams({ strict: false }) as { lang?: string };
  const lang = params.lang && isValidLang(params.lang) ? params.lang : "uz";
  const { i18n } = useTranslation();

  useEffect(() => {
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  // Also set synchronously for SSR
  if (i18n.language !== lang) {
    i18n.changeLanguage(lang);
  }

  return lang;
}

export function getLocalizedField<T extends Record<string, any>>(
  item: T,
  field: string,
  lang: Lang,
): string {
  const localizedKey = `${field}_${lang}`;
  const fallbackKey = `${field}_uz`;
  return (item[localizedKey] as string) || (item[fallbackKey] as string) || (item[field] as string) || "";
}
