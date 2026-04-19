import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Star, Zap, Clock, FlaskConical, AlertTriangle, MapPin, ArrowLeft, Send } from "lucide-react";
import { getTestBySlug } from "@/lib/server-functions";
import { useLang, getLocalizedField } from "@/hooks/useLang";
import { CLINIC_PHONE_TEL, CLINIC_TELEGRAM } from "@/lib/contact";
import { buildMeta, jsonLdScript, pickLang, truncate, SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/$lang/tahlil/$slug")({
  head: ({ params, loaderData }) => {
    const lang = (params.lang === "ru" ? "ru" : "uz") as "uz" | "ru";
    const isRu = lang === "ru";
    const test: any = loaderData;
    const name = test ? pickLang(test, "name", lang) : (isRu ? "Анализ" : "Tahlil");
    const desc = test ? pickLang(test, "description", lang) : "";
    const title = `${name} — Yashfaa Clinic Toshkent`;
    const description = desc
      ? truncate(desc, 160)
      : isRu
        ? `${name} — лабораторный анализ в Yashfaa Clinic Ташкент. Быстрые результаты, доступные цены.`
        : `${name} — Yashfaa Clinic Toshkentda laboratoriya tahlili. Tezkor natijalar, hamyonbop narxlar.`;
    const meta = buildMeta({ title, description, pathWithoutLang: `/tahlil/${params.slug}`, lang, type: "article" });
    const scripts = test
      ? [
          jsonLdScript({
            "@context": "https://schema.org",
            "@type": "MedicalTest",
            name,
            description: truncate(desc, 300) || name,
            url: `${SITE_URL}/${lang}/tahlil/${params.slug}`,
            usedToDiagnose: test.biomaterial_type || undefined,
            inLanguage: lang,
          }),
        ]
      : undefined;
    return scripts ? { meta, scripts } : { meta };
  },
  loader: async ({ params }: any) => getTestBySlug({ data: { slug: params.slug } }),
  component: TestDetailPage,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    const { t } = useTranslation();
    return (
      <div className="px-4 py-16 text-center">
        <FlaskConical className="mx-auto h-12 w-12 text-muted-foreground/30" />
        <h2 className="mt-4 text-2xl font-bold">{t("detail.test_not_found")}</h2>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="outline" onClick={() => window.history.back()}><ArrowLeft className="mr-2 h-4 w-4" />{t("detail.back_tests")}</Button>
          <Button onClick={() => { router.invalidate(); reset(); }}>{t("common.retry")}</Button>
        </div>
      </div>
    );
  },
  pendingComponent: () => (
    <section className="px-4 py-12"><div className="mx-auto max-w-3xl space-y-6"><Skeleton className="h-6 w-32" /><Skeleton className="h-10 w-3/4" /><Skeleton className="h-32 w-full rounded-xl" /></div></section>
  ),
});

function TestDetailPage() {
  const test = Route.useLoaderData() as any;
  const lang = useLang();
  const { t } = useTranslation();
  if (!test) return null;

  return (
    <section className="px-4 py-8 md:py-12">
      <div className="mx-auto max-w-3xl">
        <Link to="/$lang/tests" params={{ lang }} className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> {t("detail.back_tests")}
        </Link>
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {test.categories?.name && <Badge variant="outline">{test.categories.name}</Badge>}
            {test.is_recommended && <Badge variant="secondary" className="gap-1"><Star className="h-3 w-3 fill-current" /> {t("detail.recommended")}</Badge>}
            {test.is_urgent && <Badge variant="outline" className="gap-1"><Zap className="h-3 w-3" /> {t("detail.urgent_result")}</Badge>}
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{getLocalizedField(test, "name", lang)}</h1>
        </div>
        <div className="space-y-4">
          {test.description && (
            <Card><CardContent className="p-5"><h2 className="mb-2 text-lg font-semibold">{t("detail.about_test")}</h2><p className="text-muted-foreground leading-relaxed">{getLocalizedField(test, "description", lang)}</p></CardContent></Card>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {test.biomaterial_type && (<Card><CardContent className="flex items-start gap-3 p-4"><div className="rounded-lg bg-primary/10 p-2"><FlaskConical className="h-5 w-5 text-primary" /></div><div><p className="text-xs text-muted-foreground">{t("detail.biomaterial")}</p><p className="font-medium">{test.biomaterial_type}</p></div></CardContent></Card>)}
            {test.result_time && (<Card><CardContent className="flex items-start gap-3 p-4"><div className="rounded-lg bg-primary/10 p-2"><Clock className="h-5 w-5 text-primary" /></div><div><p className="text-xs text-muted-foreground">{t("detail.result_time")}</p><p className="font-medium">{test.result_time}</p></div></CardContent></Card>)}
            <Card><CardContent className="flex items-start gap-3 p-4"><div className="rounded-lg bg-primary/10 p-2"><MapPin className="h-5 w-5 text-primary" /></div><div><p className="text-xs text-muted-foreground">{t("detail.where")}</p><p className="font-medium">{t("detail.at_clinic")}</p></div></CardContent></Card>
          </div>
          {test.preparation_requirements && (
            <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
              <CardContent className="p-5"><div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" /><div><h2 className="mb-1 font-semibold text-amber-900 dark:text-amber-200">{t("detail.preparation")}</h2><p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">{test.preparation_requirements}</p></div></div></CardContent>
            </Card>
          )}
        </div>
        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardContent className="p-6 md:p-8 text-center">
            <h2 className="text-xl font-bold md:text-2xl">{t("detail.book_test")}</h2>
            <p className="mt-2 text-muted-foreground">{t("detail.book_info")}</p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <a href={`tel:${CLINIC_PHONE_TEL}`} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground sm:w-auto"><Phone className="h-5 w-5" />{t("detail.call")}</a>
              <a href={CLINIC_TELEGRAM} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0088cc] px-6 py-3 font-medium text-white sm:w-auto"><Send className="h-5 w-5" />{t("detail.telegram")}</a>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
