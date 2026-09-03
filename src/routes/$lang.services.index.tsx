import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone, Clock, MapPin, Star, Globe, Briefcase } from "lucide-react";
import { getServices, getCategories, getDoctors } from "@/lib/server-functions";
import { useLang, getLocalizedField } from "@/hooks/useLang";
import { CLINIC_PHONE_DISPLAY, CLINIC_PHONE_TEL } from "@/lib/contact";
import { reportConversion } from "@/lib/gtag";
import { EditableText } from "@/components/EditableText";
import { useSiteContent } from "@/hooks/useSiteContent";
import { buildMeta } from "@/lib/seo";

export const Route = createFileRoute("/$lang/services/")({
  head: ({ params }) => {
    const isRu = params.lang === "ru";
    const lang = (params.lang === "ru" ? "ru" : "uz") as "uz" | "ru";
    const title = isRu
      ? "Медицинские услуги в Ташкенте — Yashfaa Clinic"
      : "Toshkentda tibbiy xizmatlar — Yashfaa Clinic";
    const description = isRu
      ? "Полный список медицинских услуг Yashfaa Clinic в Ташкенте: консультации врачей, диагностика, УЗИ, ЭКГ, лечение и онлайн запись."
      : "Yashfaa Clinic Toshkentdagi to'liq tibbiy xizmatlar: shifokor maslahati, diagnostika, UZI, EKG, davolash va onlayn yozilish.";
    return { meta: buildMeta({ title, description, pathWithoutLang: "/services", lang }) };
  },
  loader: async () => {
    const [services, categories, doctors] = await Promise.all([
      getServices().catch(() => []),
      getCategories().catch(() => []),
      getDoctors().catch(() => []),
    ]);
    return { services, categories, doctors };
  },
  component: ServicesPage,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    const { t } = useTranslation();
    return (
      <div className="px-4 py-16 text-center">
        <h2 className="text-2xl font-bold">{t("common.error")}</h2>
        <p className="mt-2 text-muted-foreground">Ma'lumotni yuklashda xatolik yuz berdi. Iltimos, sahifani yangilang.</p>
        <Button className="mt-4" onClick={() => { router.invalidate(); reset(); }}>{t("common.retry")}</Button>
      </div>
    );
  },
  pendingComponent: () => (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-5xl space-y-4">
        <Skeleton className="mx-auto h-10 w-64" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (<Skeleton key={i} className="h-48 rounded-xl" />))}
        </div>
      </div>
    </section>
  ),
});

const LOCATION_LABELS_UZ: Record<string, string> = { clinic: "Klinikada", home: "Uyga chiqib", online: "Online", clinic_home: "Klinikada / Uyga chiqib" };
const LOCATION_LABELS_RU: Record<string, string> = { clinic: "В клинике", home: "На дом", online: "Онлайн", clinic_home: "В клинике / На дом" };

function ServicesPage() {
  const { services, categories, doctors } = Route.useLoaderData();
  const lang = useLang();
  const { t } = useTranslation();
  const { get } = useSiteContent();
  const locationLabels = lang === "ru" ? LOCATION_LABELS_RU : LOCATION_LABELS_UZ;

  const activeServices = (services as any[]).filter((s: any) => s.is_active);
  const featuredServices = activeServices.filter((s: any) => s.is_featured);
  const regularServices = activeServices.filter((s: any) => !s.is_featured);

  const getDoctorName = (id: string) => {
    const doc = (doctors as any[]).find((d: any) => d.id === id);
    return doc ? getLocalizedField(doc, "name", lang) : null;
  };

  const renderServiceCard = (svc: any) => {
    const card = (
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardContent className="flex h-full flex-col p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{getLocalizedField(svc, "name", lang)}</h3>
                {svc.is_online && <Globe className="h-3.5 w-3.5 text-primary" />}
              </div>
              {svc.categories?.name && <Badge variant="outline" className="mt-1 text-[10px]">{getLocalizedField(svc.categories, "name", lang) || svc.categories.name}</Badge>}
            </div>
          </div>
          {svc.description && <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{getLocalizedField(svc, "description", lang)}</p>}
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
            {svc.duration && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {svc.duration}</span>}
            {svc.location_type && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {locationLabels[svc.location_type] ?? svc.location_type}</span>}
          </div>
          {svc.doctor_ids?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {svc.doctor_ids.map((id: string) => { const name = getDoctorName(id); return name ? <Badge key={id} variant="secondary" className="text-[10px]">{name}</Badge> : null; })}
            </div>
          )}
          {svc.preparation_requirements && <p className="mt-2 text-xs text-muted-foreground/70 italic">📋 {getLocalizedField(svc, "preparation_requirements", lang)}</p>}
          <div className="mt-auto flex gap-2 pt-4">
            <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">{t("pages.view_details")}</span>
          </div>
        </CardContent>
      </Card>
    );

    if (svc.slug) {
      return <Link key={svc.id} to="/$lang/services/$slug" params={{ lang, slug: svc.slug }} className="block">{card}</Link>;
    }
    return <div key={svc.id}>{card}</div>;
  };

  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold md:text-4xl">
            <EditableText contentKey="services.title" fallback={get("services.title", t("pages.services_title"))}>
              {get("services.title", t("pages.services_title"))}
            </EditableText>
          </h1>
          <p className="mt-3 text-muted-foreground">
            <EditableText contentKey="services.subtitle" fallback={get("services.subtitle", t("pages.services_subtitle"))} multiline>
              {get("services.subtitle", t("pages.services_subtitle"))}
            </EditableText>
          </p>
        </div>
        {featuredServices.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold"><Star className="h-5 w-5 fill-primary text-primary" /> {t("pages.featured_services")}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{featuredServices.map(renderServiceCard)}</div>
          </div>
        )}
        <div className="mt-12">
          {featuredServices.length > 0 && <h2 className="mb-4 text-lg font-semibold">{t("pages.all_services")}</h2>}
          {regularServices.length === 0 && featuredServices.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed py-16 text-center">
              <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">{t("pages.no_services")}</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{regularServices.map(renderServiceCard)}</div>
          )}
        </div>
        <div className="mt-12 rounded-xl bg-muted/50 p-6 text-center">
          <h3 className="text-lg font-semibold">
            <EditableText contentKey="services.price_info_title" fallback={get("services.price_info_title", t("pages.price_info_title"))}>
              {get("services.price_info_title", t("pages.price_info_title"))}
            </EditableText>
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            <EditableText contentKey="services.price_info_subtitle" fallback={get("services.price_info_subtitle", t("pages.price_info_subtitle"))} multiline>
              {get("services.price_info_subtitle", t("pages.price_info_subtitle"))}
            </EditableText>
          </p>
          <a href={`tel:${CLINIC_PHONE_TEL}`} onClick={() => reportConversion()} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            <Phone className="h-5 w-5" /> {CLINIC_PHONE_DISPLAY}
          </a>
        </div>
      </div>
    </section>
  );
}
