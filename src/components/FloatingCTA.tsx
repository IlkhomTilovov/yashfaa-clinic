import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Phone, Calendar, MessageCircle } from "lucide-react";
import { useLang } from "@/hooks/useLang";

export function FloatingCTA() {
  const lang = useLang();
  const { t } = useTranslation();

  return (
    <>
      {/* Floating WhatsApp Button — desktop & mobile */}
      <a
        href="https://wa.me/998711234567"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 transition-transform hover:scale-110 md:bottom-6 md:right-6 md:h-16 md:w-16"
        aria-label="WhatsApp"
      >
        <MessageCircle className="h-7 w-7 md:h-8 md:w-8" />
      </a>

      {/* Sticky Bottom Bar — mobile only */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-card/95 px-3 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] backdrop-blur-sm md:hidden">
        <div className="flex items-center gap-2">
          <Link
            to="/$lang/appointment"
            params={{ lang }}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md"
          >
            <Calendar className="h-4 w-4" />
            {t("hero.cta_appointment")}
          </Link>
          <a
            href="tel:+998711234567"
            className="flex items-center justify-center gap-2 rounded-lg border border-primary bg-primary/10 px-4 py-3 text-sm font-semibold text-primary"
          >
            <Phone className="h-4 w-4" />
            {t("hero.cta_call")}
          </a>
        </div>
      </div>
    </>
  );
}
