import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import logoSvg from "@/assets/logo.svg";

export function Footer() {
  const lang = useLang();
  const { t } = useTranslation();

  return (
    <footer className="border-t bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <img src={logoSvg} alt="Yashfaa Clinic" className="h-8" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{t("footer.about")}</p>
          </div>
            <p className="mt-3 text-sm text-muted-foreground">{t("footer.about")}</p>
          </div>
          <div>
            <h3 className="mb-3 font-semibold">{t("footer.quick_links")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to={`/${lang}/services` as any} className="hover:text-primary">{t("nav.services")}</Link></li>
              <li><Link to={`/${lang}/doctors` as any} className="hover:text-primary">{t("nav.doctors")}</Link></li>
              <li><Link to={`/${lang}/tests` as any} className="hover:text-primary">{t("nav.tests")}</Link></li>
              <li><Link to={`/${lang}/appointment` as any} className="hover:text-primary">{t("nav.appointment")}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-semibold">{t("footer.contact")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> +998 71 123 45 67</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> info@yashfaa.uz</li>
              <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-primary" /> Toshkent sh., Amir Temur ko'chasi, 10-uy</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-semibold">{t("footer.working_hours")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Dush–Juma: 8:00–20:00</li>
              <li className="pl-6">Shanba: 9:00–16:00</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Yashfaa Clinic. {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
}
