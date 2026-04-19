import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, FlaskConical, Star, Zap, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getTests, getCategories } from "@/lib/server-functions";
import { useLang, getLocalizedField } from "@/hooks/useLang";
import { CLINIC_PHONE_DISPLAY, CLINIC_PHONE_TEL } from "@/lib/contact";
import { ET } from "@/components/ET";

export const Route = createFileRoute("/$lang/tests")({
  head: ({ params }) => {
    const isRu = params.lang === "ru";
    return {
      meta: [
        { title: isRu ? "Анализы — Yashfaa Clinic" : "Tahlillar — Yashfaa Clinic" },
        { name: "description", content: isRu ? "Список лабораторных анализов Yashfaa Clinic." : "Yashfaa Clinic laboratoriya tahlillari ro'yxati." },
        { rel: "alternate", hrefLang: "uz", href: "/uz/tests" },
        { rel: "alternate", hrefLang: "ru", href: "/ru/tests" },
      ],
    };
  },
  loader: async () => {
    const [tests, categories] = await Promise.all([getTests(), getCategories()]);
    return { tests, categories };
  },
  component: TestsPage,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    const { t } = useTranslation();
    return (
      <div className="px-4 py-16 text-center">
        <h2 className="text-2xl font-bold">{t("common.error")}</h2>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
        <Button className="mt-4" onClick={() => { router.invalidate(); reset(); }}>{t("common.retry")}</Button>
      </div>
    );
  },
  pendingComponent: () => (
    <section className="px-4 py-16"><div className="mx-auto max-w-5xl space-y-4"><Skeleton className="mx-auto h-10 w-64" /><Skeleton className="h-10 w-full" /><div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => (<Skeleton key={i} className="h-20 w-full rounded-xl" />))}</div></div></section>
  ),
});

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => { const timer = setTimeout(() => setDebounced(value), delay); return () => clearTimeout(timer); }, [value, delay]);
  return debounced;
}

function TestsPage() {
  const { tests, categories } = Route.useLoaderData();
  const lang = useLang();
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const filtered = useMemo(() => tests.filter((test: any) => {
    const name = getLocalizedField(test, "name", lang).toLowerCase();
    const matchesSearch = name.includes(debouncedSearch.toLowerCase());
    const matchesCategory = !activeCategory || test.category_id === activeCategory;
    return matchesSearch && matchesCategory && test.is_active;
  }), [tests, debouncedSearch, activeCategory, lang]);

  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold md:text-4xl">
            <ET k="tests.title" t="pages.tests_title" />
          </h1>
          <p className="mt-3 text-muted-foreground">
            <ET k="tests.subtitle" t="pages.tests_subtitle" multiline />
          </p>
        </div>
        <div className="mt-10 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={t("pages.search_tests")} className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant={activeCategory === null ? "default" : "outline"} size="sm" onClick={() => setActiveCategory(null)}>{t("pages.all")}</Button>
            {categories.map((cat: any) => (
              <Button key={cat.id} variant={activeCategory === cat.id ? "default" : "outline"} size="sm" onClick={() => setActiveCategory(cat.id)}>
                {getLocalizedField(cat, "name", lang)}
              </Button>
            ))}
          </div>
        </div>
        <div className="mt-8 space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed py-16 text-center">
              <FlaskConical className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">{t("pages.no_results")}</p>
            </div>
          ) : (
            filtered.map((test: any) => (
              <Link key={test.id} to="/$lang/tahlil/$slug" params={{ lang, slug: test.slug ?? test.id }} className="block">
                <Card className="transition-all hover:shadow-md hover:border-primary/30 cursor-pointer">
                  <CardContent className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{getLocalizedField(test, "name", lang)}</h3>
                        {test.is_recommended && <Badge variant="secondary" className="gap-1 text-[10px]"><Star className="h-3 w-3 fill-current" /> {t("tests_section.recommended")}</Badge>}
                        {test.is_urgent && <Badge variant="outline" className="gap-1 text-[10px]"><Zap className="h-3 w-3" /> {t("pages.urgent")}</Badge>}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {test.categories?.name && <Badge variant="outline" className="text-[10px]">{test.categories.name}</Badge>}
                        {test.biomaterial_type && <span>{test.biomaterial_type}</span>}
                        {test.result_time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {test.result_time}</span>}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <a href={`tel:${CLINIC_PHONE_TEL}`} onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                        <Phone className="h-4 w-4" /> {t("tests_section.contact_us")}
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
        <div className="mt-12 rounded-xl bg-muted/50 p-6 text-center">
          <h3 className="text-lg font-semibold">
            <ET k="tests.price_info_title" t="pages.price_info_title" />
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            <ET k="tests.price_info_subtitle" t="pages.price_info_subtitle" multiline />
          </p>
          <a href={`tel:${CLINIC_PHONE_TEL}`} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"><Phone className="h-5 w-5" /> {CLINIC_PHONE_DISPLAY}</a>
        </div>
      </div>
    </section>
  );
}
