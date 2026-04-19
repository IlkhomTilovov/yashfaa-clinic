/**
 * ET — qisqartirilgan EditableText helper.
 * Foydalanish: <ET k="hero.title">{t("hero.title")}</ET>
 *   yoki:    <ET k="hero.title" t="hero.title" />
 *
 * `k` — site_content kaliti (saqlash uchun).
 * `t` — i18n tarjima kaliti (fallback uchun, ixtiyoriy).
 * `multiline` — ko'p qatorli matn uchun.
 */
import { useTranslation } from "react-i18next";
import { useSiteContent } from "@/hooks/useSiteContent";
import { EditableText } from "@/components/EditableText";
import type { ElementType, ReactNode } from "react";

interface ETProps {
  k: string;
  t?: string;
  multiline?: boolean;
  as?: ElementType;
  className?: string;
  children?: ReactNode;
}

export function ET({ k, t: tKey, multiline, as, className, children }: ETProps) {
  const { t } = useTranslation();
  const { get } = useSiteContent();
  const fallback =
    typeof children === "string"
      ? children
      : tKey
      ? t(tKey)
      : "";
  const value = get(k, fallback);
  return (
    <EditableText contentKey={k} fallback={value} multiline={multiline} as={as} className={className}>
      {value}
    </EditableText>
  );
}
