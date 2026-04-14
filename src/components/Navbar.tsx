import { Link, useParams, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Menu, X, Phone, Clock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/hooks/useLang";
import logoSvg from "@/assets/logo.svg";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const lang = useLang();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const navLinks = [
    { to: `/${lang}` as any, label: t("nav.home") },
    { to: `/${lang}/services` as any, label: t("nav.services") },
    { to: `/${lang}/doctors` as any, label: t("nav.doctors") },
    { to: `/${lang}/tests` as any, label: t("nav.tests") },
    { to: `/${lang}/appointment` as any, label: t("nav.appointment") },
    { to: `/${lang}/contact` as any, label: t("nav.contact") },
  ];

  const switchLang = (newLang: string) => {
    if (newLang === lang) return;
    const currentPath = window.location.pathname;
    const searchAndHash = window.location.search + window.location.hash;
    const newPath = currentPath.replace(`/${lang}`, `/${newLang}`) || `/${newLang}`;
    navigate({ to: newPath as any, resetScroll: false } as any);
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="hidden border-b bg-primary px-4 py-1.5 text-primary-foreground md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> +998 71 123 45 67</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {t("hero.working_hours")}</span>
          </div>
          <span>Toshkent, O'zbekiston</span>
        </div>
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to={`/${lang}` as any} className="flex items-center gap-2">
          <img src={logoSvg} alt="Yashfaa Clinic" className="h-9" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" activeProps={{ className: "bg-accent text-foreground" }}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {/* Language Switcher */}
          <div className="flex items-center rounded-full border p-0.5">
            <button onClick={() => switchLang("uz")} className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${lang === "uz" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              🇺🇿 UZ
            </button>
            <button onClick={() => switchLang("ru")} className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${lang === "ru" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              🇷🇺 RU
            </button>
          </div>
          <Button asChild>
            <Link to={`/${lang}/appointment` as any}>{t("nav.appointment")}</Link>
          </Button>
        </div>

        <button className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menyu">
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t bg-card px-4 pb-4 lg:hidden">
          <nav className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" activeProps={{ className: "bg-accent text-foreground" }} onClick={() => setMobileOpen(false)}>
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              <button onClick={() => { switchLang("uz"); setMobileOpen(false); }} className={`flex-1 rounded-lg py-2 text-sm font-medium ${lang === "uz" ? "bg-primary text-primary-foreground" : "border"}`}>🇺🇿 O'zbek</button>
              <button onClick={() => { switchLang("ru"); setMobileOpen(false); }} className={`flex-1 rounded-lg py-2 text-sm font-medium ${lang === "ru" ? "bg-primary text-primary-foreground" : "border"}`}>🇷🇺 Русский</button>
            </div>
            <Button asChild className="mt-2">
              <Link to={`/${lang}/appointment` as any} onClick={() => setMobileOpen(false)}>{t("nav.appointment")}</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
