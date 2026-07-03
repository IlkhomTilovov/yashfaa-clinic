import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Clock, MapPin, Globe, ArrowLeft, MessageCircle, AlertTriangle, Star, Briefcase, User } from "lucide-react";
import { getServiceBySlug, getDoctors } from "@/lib/server-functions";
import { useLang, getLocalizedField } from "@/hooks/useLang";
import { CLINIC_PHONE_TEL, CLINIC_TELEGRAM } from "@/lib/contact";
import { buildMeta, jsonLdScript, pickLang, truncate, SITE_URL } from "@/lib/seo";

const LOCATION_LABELS_UZ: Record<string, string> = { clinic: "Klinikada", home: "Uyga chiqib", online: "Online", clinic_home: "Klinikada / Uyga chiqib" };
const LOCATION_LABELS_RU: Record<string, string> = { clinic: "В клинике", home: "На дом", online: "Онлайн", clinic_home: "В клинике / На дом" };

export const Route = createFileRoute("/$lang/services/$slug")({
  head: ({ params, loaderData }) => {
    const lang = (params.lang === "ru" ? "ru" : "uz") as "uz" | "ru";
    const isRu = lang === "ru";
    const svc: any = (loaderData as any)?.service;
    const baseName = svc ? pickLang(svc, "name", lang) : (isRu ? "Услуга" : "Xizmat");
    const baseDesc = svc ? pickLang(svc, "description", lang) : "";
    const title = `${baseName} — Yashfaa Clinic Toshkent`;
    const description = baseDesc
      ? truncate(baseDesc, 160)
      : isRu
        ? `${baseName} в клинике Yashfaa в Ташкенте. Опытные врачи, доступные цены, онлайн запись.`
        : `${baseName} — Yashfaa Clinic Toshkentda. Tajribali shifokorlar, hamyonbop narxlar, onlayn yozilish.`;
    const meta = buildMeta({ title, description, pathWithoutLang: `/services/${params.slug}`, lang, type: "article" });
    const scripts = svc
      ? [
          jsonLdScript({
            "@context": "https://schema.org",
            "@type": "MedicalProcedure",
            name: baseName,
            description: truncate(baseDesc, 300) || baseName,
            url: `${SITE_URL}/${lang}/services/${params.slug}`,
            inLanguage: lang,
          }),
        ]
      : undefined;
    return scripts ? { meta, scripts } : { meta };
  },
  loader: async ({ params }) => {
    const [service, doctors] = await Promise.all([getServiceBySlug({ data: { slug: params.slug } }), getDoctors()]);
    return { service, doctors };
  },
  component: ServiceDetailPage,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    const { t } = useTranslation();
    return (
      <div className="px-4 py-16 text-center">
        <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/30" />
        <h2 className="mt-4 text-2xl font-bold">{t("detail.service_not_found")}</h2>
        <p className="mt-2 text-muted-foreground">Ma{error.message}#39;lumotni yuklashda xatolik. Iltimos, sahifani yangilang.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="outline" onClick={() => window.history.back()}><ArrowLeft className="mr-2 h-4 w-4" />{t("detail.back_services")}</Button>
          <Button onClick={() => { router.invalidate(); reset(); }}>{t("common.retry")}</Button>
        </div>
      </div>
    );
  },
  pendingComponent: () => (
    <section className="px-4 py-12"><div className="mx-auto max-w-3xl space-y-6"><Skeleton className="h-6 w-32" /><Skeleton className="h-10 w-3/4" /><Skeleton className="h-32 w-full rounded-xl" /></div></section>
  ),
});

function ServiceDetailPage() {
  const { service, doctors } = Route.useLoaderData() as any;
  const lang = useLang();
  const { t } = useTranslation();
  const svc = service as any;
  const allDoctors = doctors as any[];
  const locationLabels = lang === "ru" ? LOCATION_LABELS_RU : LOCATION_LABELS_UZ;
  const linkedDoctors = svc.doctor_ids?.length ? allDoctors.filter((d: any) => svc.doctor_ids.includes(d.id)) : [];

  return (
    <section className="px-4 py-8 md:py-12">
      <div className="mx-auto max-w-3xl">
        <Link to="/$lang/services" params={{ lang }} className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> {t("detail.back_services")}
        </Link>
        <div className="mb-8">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {svc.categories?.name && <Badge variant="outline">{svc.categories.name}</Badge>}
            {svc.is_featured && <Badge variant="secondary" className="gap-1"><Star className="h-3 w-3 fill-current" /> {t("detail.recommended")}</Badge>}
            {svc.is_online && <Badge variant="outline" className="gap-1"><Globe className="h-3 w-3" /> {t("detail.online")}</Badge>}
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{getLocalizedField(svc, "name", lang)}</h1>
        </div>
        <div className="space-y-4">
          {svc.description && (
            <Card><CardContent className="p-5"><h2 className="mb-2 text-lg font-semibold">{t("detail.about_service")}</h2><p className="leading-relaxed text-muted-foreground">{getLocalizedField(svc, "description", lang)}</p></CardContent></Card>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {svc.duration && (<Card><CardContent className="flex items-start gap-3 p-4"><div className="rounded-lg bg-primary/10 p-2"><Clock className="h-5 w-5 text-primary" /></div><div><p className="text-xs text-muted-foreground">{t("detail.duration")}</p><p className="font-medium">{svc.duration}</p></div></CardContent></Card>)}
            {svc.location_type && (<Card><CardContent className="flex items-start gap-3 p-4"><div className="rounded-lg bg-primary/10 p-2"><MapPin className="h-5 w-5 text-primary" /></div><div><p className="text-xs text-muted-foreground">{t("detail.where")}</p><p className="font-medium">{locationLabels[svc.location_type] ?? svc.location_type}</p></div></CardContent></Card>)}
          </div>
          {svc.preparation_requirements && (
            <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
              <CardContent className="p-5"><div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" /><div><h2 className="mb-1 font-semibold text-amber-900 dark:text-amber-200">{t("detail.preparation")}</h2><p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">{svc.preparation_requirements}</p></div></div></CardContent>
            </Card>
          )}
          {linkedDoctors.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-semibold">{t("detail.doctors_label")}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {linkedDoctors.map((doc: any) => (
                  <Link key={doc.id} to="/$lang/doctors/$doctorId" params={{ lang, doctorId: doc.id }}>
                    <Card className="transition-shadow hover:shadow-md"><CardContent className="flex items-center gap-3 p-4">
                      {doc.image_url ? <img src={doc.image_url} alt={getLocalizedField(doc, "name", lang)} className="h-12 w-12 rounded-full object-cover" /> : <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10"><User className="h-6 w-6 text-primary" /></div>}
                      <div><p className="font-medium">{getLocalizedField(doc, "name", lang)}</p><p className="text-sm text-muted-foreground">{getLocalizedField(doc, "specialization", lang)}</p></div>
                    </CardContent></Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
        <Card className="mt-8 border-primary/20 bg-primary/5">
          <CardContent className="p-6 text-center md:p-8">
            <h2 className="text-xl font-bold md:text-2xl">{t("detail.book_service")}</h2>
            <p className="mt-2 text-muted-foreground">{t("detail.book_info")}</p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <a href={`tel:${CLINIC_PHONE_TEL}`} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground sm:w-auto"><Phone className="h-5 w-5" />{t("detail.call")}</a>
              <a href={CLINIC_TELEGRAM} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-primary bg-background px-6 py-3 font-medium text-primary sm:w-auto"><MessageCircle className="h-5 w-5" />{t("detail.telegram")}</a>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
