import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { useSiteContent } from "@/hooks/useSiteContent";
import { EditableText } from "@/components/EditableText";
import logoSvg from "@/assets/logo.svg";
import { CLINIC_PHONE_DISPLAY, CLINIC_PHONE_TEL, CLINIC_EMAIL, CLINIC_ADDRESS, CLINIC_TELEGRAM, CLINIC_INSTAGRAM, CLINIC_FACEBOOK, CLINIC_BRANCHES } from "@/lib/contact";
import { reportConversion } from "@/lib/gtag";

export function Footer() {
  const lang = useLang();
  const { t } = useTranslation();
  const { get } = useSiteContent();

  return (
    <footer className="border-t bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <img src={logoSvg} alt="Yashfaa Clinic" className="h-8" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              <EditableText contentKey="footer.about" fallback={get("footer.about", t("footer.about"))} multiline>
                {get("footer.about", t("footer.about"))}
              </EditableText>
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a href={CLINIC_TELEGRAM} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0088cc]/10 text-[#0088cc] transition-colors hover:bg-[#0088cc] hover:text-white" aria-label="Telegram">
                <Send className="h-4 w-4" />
              </a>
              <a href={CLINIC_INSTAGRAM} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E4405F]/10 text-[#E4405F] transition-colors hover:bg-[#E4405F] hover:text-white" aria-label="Instagram">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href={CLINIC_FACEBOOK} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1877F2]/10 text-[#1877F2] transition-colors hover:bg-[#1877F2] hover:text-white" aria-label="Facebook">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            </div>
          </div>
          <div>
            <h3 className="mb-3 font-semibold">
              <EditableText contentKey="footer.quick_links" fallback={get("footer.quick_links", t("footer.quick_links"))}>
                {get("footer.quick_links", t("footer.quick_links"))}
              </EditableText>
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to={`/${lang}/services` as any} className="hover:text-primary">{t("nav.services")}</Link></li>
              <li><Link to={`/${lang}/doctors` as any} className="hover:text-primary">{t("nav.doctors")}</Link></li>
              <li><Link to={`/${lang}/tests` as any} className="hover:text-primary">{t("nav.tests")}</Link></li>
              <li><Link to={`/${lang}/appointment` as any} onClick={() => reportConversion()} className="hover:text-primary">{t("nav.appointment")}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-semibold">
              <EditableText contentKey="footer.contact" fallback={get("footer.contact", t("footer.contact"))}>
                {get("footer.contact", t("footer.contact"))}
              </EditableText>
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href={`tel:${CLINIC_PHONE_TEL}`} onClick={() => reportConversion()} className="flex items-center gap-2 hover:text-primary"><Phone className="h-4 w-4 text-primary" /> {CLINIC_PHONE_DISPLAY}</a></li>
              <li><a href={`mailto:${CLINIC_EMAIL}`} className="flex items-center gap-2 hover:text-primary"><Mail className="h-4 w-4 text-primary" /><span>{CLINIC_EMAIL}</span></a></li>
              <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-primary" /> {CLINIC_ADDRESS}</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-semibold">
              <EditableText contentKey="footer.working_hours" fallback={get("footer.working_hours", t("footer.working_hours"))}>
                {get("footer.working_hours", t("footer.working_hours"))}
              </EditableText>
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <div className="flex items-center gap-2 font-medium text-foreground"><Clock className="h-4 w-4 text-primary" /> {lang === "ru" ? CLINIC_BRANCHES[0].name_ru : CLINIC_BRANCHES[0].name}</div>
                <div className="pl-6">
                  <EditableText contentKey="footer.hours.branch1.weekdays" fallback={get("footer.hours.branch1.weekdays", lang === "ru" ? "Пн–Сб: 8:00–22:00" : "Dush–Shan: 8:00–22:00")}>
                    {get("footer.hours.branch1.weekdays", lang === "ru" ? "Пн–Сб: 8:00–22:00" : "Dush–Shan: 8:00–22:00")}
                  </EditableText>
                </div>
                <div className="pl-6">
                  <EditableText contentKey="footer.hours.branch1.sunday" fallback={get("footer.hours.branch1.sunday", lang === "ru" ? "Вс: выходной" : "Yakshanba: dam olish")}>
                    {get("footer.hours.branch1.sunday", lang === "ru" ? "Вс: выходной" : "Yakshanba: dam olish")}
                  </EditableText>
                </div>
              </li>
              <li>
                <div className="flex items-center gap-2 font-medium text-foreground"><Clock className="h-4 w-4 text-primary" /> {lang === "ru" ? CLINIC_BRANCHES[1].name_ru : CLINIC_BRANCHES[1].name}</div>
                <div className="pl-6">
                  <EditableText contentKey="footer.hours.branch2.weekdays" fallback={get("footer.hours.branch2.weekdays", lang === "ru" ? "Пн–Пт: 8:00–22:00" : "Dush–Juma: 8:00–22:00")}>
                    {get("footer.hours.branch2.weekdays", lang === "ru" ? "Пн–Пт: 8:00–22:00" : "Dush–Juma: 8:00–22:00")}
                  </EditableText>
                </div>
                <div className="pl-6">
                  <EditableText contentKey="footer.hours.branch2.saturday" fallback={get("footer.hours.branch2.saturday", lang === "ru" ? "Сб: выходной" : "Shanba: dam olish")}>
                    {get("footer.hours.branch2.saturday", lang === "ru" ? "Сб: выходной" : "Shanba: dam olish")}
                  </EditableText>
                </div>
                <div className="pl-6">
                  <EditableText contentKey="footer.hours.branch2.sunday" fallback={get("footer.hours.branch2.sunday", lang === "ru" ? "Вс: 8:00–14:00" : "Yakshanba: 8:00–14:00")}>
                    {get("footer.hours.branch2.sunday", lang === "ru" ? "Вс: 8:00–14:00" : "Yakshanba: 8:00–14:00")}
                  </EditableText>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t pt-6 text-center text-sm text-muted-foreground">
          <EditableText contentKey="footer.copyright" fallback={get("footer.copyright", `© 2026 Sell Soft. ${t("footer.rights")}`)} multiline>
            {get("footer.copyright", `© 2026 Sell Soft. ${t("footer.rights")}`)}
          </EditableText>
        </div>
      </div>
    </footer>
  );
}
