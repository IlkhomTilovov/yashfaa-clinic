import { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Search, X, Stethoscope, FlaskConical, User, ArrowRight } from "lucide-react";
import { useLang } from "@/hooks/useLang";

interface SearchItem {
  id: string;
  name: string;
  type: "doctor" | "service" | "test";
  subtitle?: string;
  slug?: string | null;
}

interface HeroSearchProps {
  doctors: Array<{ id: string; name: string; specialization: string; slug?: string | null }>;
  services: Array<{ id: string; name: string; slug?: string | null; categories?: { name: string } | null }>;
  tests: Array<{ id: string; name: string; slug?: string | null; categories?: { name: string } | null }>;
}

export function HeroSearch({ doctors, services, tests }: HeroSearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lang = useLang();
  const { t } = useTranslation();

  const TYPE_CONFIG = {
    doctor: { icon: User, label: t("search.doctor"), color: "bg-emerald-50 text-emerald-600" },
    service: { icon: Stethoscope, label: t("search.service"), color: "bg-blue-50 text-blue-600" },
    test: { icon: FlaskConical, label: t("search.test"), color: "bg-amber-50 text-amber-600" },
  } as const;

  const allItems = useMemo<SearchItem[]>(() => {
    const items: SearchItem[] = [];
    for (const d of doctors) items.push({ id: d.id, name: d.name, type: "doctor", subtitle: d.specialization, slug: d.slug });
    for (const s of services) items.push({ id: s.id, name: s.name, type: "service", subtitle: (s.categories as any)?.name, slug: s.slug });
    for (const tt of tests) items.push({ id: tt.id, name: tt.name, type: "test", subtitle: (tt.categories as any)?.name, slug: tt.slug });
    return items;
  }, [doctors, services, tests]);

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return allItems.filter((item) => item.name.toLowerCase().includes(q) || item.subtitle?.toLowerCase().includes(q)).slice(0, 8);
  }, [query, allItems]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getLink = (item: SearchItem) => {
    switch (item.type) {
      case "doctor": return { to: `/${lang}/doctors/${item.id}` as any, params: {} };
      case "service": return item.slug ? { to: `/${lang}/services/${item.slug}` as any, params: {} } : { to: `/${lang}/services` as any, params: {} };
      case "test": return { to: `/${lang}/tahlil/${item.slug ?? item.id}` as any, params: {} };
    }
  };

  return (
    <div ref={containerRef} className="relative z-50 w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef} type="text" value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => query.trim() && setOpen(true)}
          placeholder={t("hero.search_placeholder")}
          className="h-14 w-full rounded-2xl border border-border bg-card pl-12 pr-12 text-base shadow-lg shadow-primary/5 outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        {query && (
          <button onClick={() => { setQuery(""); setOpen(false); inputRef.current?.focus(); }} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && query.trim() && (
        <div className="absolute top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border bg-card shadow-xl">
          {filtered.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <Search className="mx-auto h-8 w-8 text-muted-foreground/30" />
              <p className="mt-2 text-sm text-muted-foreground">"{query}" {t("search.no_results")}</p>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((item) => {
                const config = TYPE_CONFIG[item.type];
                const Icon = config.icon;
                const link = getLink(item);
                return (
                  <Link key={`${item.type}-${item.id}`} to={link.to} onClick={() => { setOpen(false); setQuery(""); }} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.color}`}><Icon className="h-5 w-5" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">{item.name}</p>
                      {item.subtitle && <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>}
                    </div>
                    <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">{config.label}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                  </Link>
                );
              })}
            </div>
          )}
          <div className="flex items-center justify-center gap-4 border-t bg-muted/30 px-4 py-3">
            <Link to={`/${lang}/doctors` as any} onClick={() => { setOpen(false); setQuery(""); }} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary"><User className="h-3.5 w-3.5" /> {t("nav.doctors")}</Link>
            <Link to={`/${lang}/services` as any} onClick={() => { setOpen(false); setQuery(""); }} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary"><Stethoscope className="h-3.5 w-3.5" /> {t("nav.services")}</Link>
            <Link to={`/${lang}/tests` as any} onClick={() => { setOpen(false); setQuery(""); }} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary"><FlaskConical className="h-3.5 w-3.5" /> {t("nav.tests")}</Link>
          </div>
        </div>
      )}
    </div>
  );
}
