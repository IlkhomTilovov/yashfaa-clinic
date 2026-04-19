import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Phone, Calendar, Send } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { CLINIC_PHONE_TEL, CLINIC_TELEGRAM } from "@/lib/contact";

export function FloatingCTA() {
  const lang = useLang();
  const { t } = useTranslation();

  return (
    <>
      {/* Floating Telegram Button — desktop & mobile */}
      <a
        href={CLINIC_TELEGRAM}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#0088cc] text-white shadow-lg shadow-[#0088cc]/30 transition-transform hover:scale-110 md:bottom-6 md:right-6 md:h-16 md:w-16"
        aria-label="Telegram"
      >
        <Send className="h-6 w-6 md:h-7 md:w-7" />
      </a>

      {/* Sticky Bottom Bar — mobile only */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-card/95 px-3 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] backdrop-blur-sm md:hidden">
        <div className="flex items-center gap-2">
          <a
            href={`tel:${CLINIC_PHONE_TEL}`}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-3 text-sm font-semibold text-foreground"
          >
            <Phone className="h-4 w-4" />
          </a>
          <Link
            to="/$lang/appointment"
            params={{ lang }}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md"
          >
            <Calendar className="h-4 w-4" />
            {t("hero.cta_appointment")}
          </Link>
          <a
            href={CLINIC_TELEGRAM}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-lg bg-[#0088cc] px-3 py-3 text-sm font-semibold text-white"
          >
            <Send className="h-4 w-4" />
          </a>
        </div>
      </div>
    </>
  );
}
