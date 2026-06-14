import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Award } from "lucide-react";
import { getDoctors } from "@/lib/server-functions";
import { useLang, getLocalizedField } from "@/hooks/useLang";
import { EditableText } from "@/components/EditableText";
import { useSiteContent } from "@/hooks/useSiteContent";
import { buildMeta } from "@/lib/seo";

export const Route = createFileRoute("/$lang/doctors/")({
  head: ({ params }) => {
    const isRu = params.lang === "ru";
    const lang = (params.lang === "ru" ? "ru" : "uz") as "uz" | "ru";
    const title = isRu
      ? "Опытные врачи в Ташкенте — Yashfaa Clinic"
      : "Toshkentdagi malakali shifokorlar — Yashfaa Clinic";
    const description = isRu
      ? "Команда опытных врачей Yashfaa Clinic в Ташкенте. Терапия, диагностика, узкие специалисты. Онлайн запись на приём."
      : "Yashfaa Clinic Toshkentdagi malakali shifokorlar jamoasi. Terapiya, diagnostika, tor mutaxassislar. Onlayn qabulga yozilish.";
    return { meta: buildMeta({ title, description, pathWithoutLang: "/doctors", lang }) };
  },
  loader: () => getDoctors(),
  component: DoctorsPage,
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
    <section className="px-4 py-16"><div className="mx-auto max-w-7xl"><Skeleton className="mx-auto h-10 w-48" /><div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => (<div key={i} className="space-y-3"><Skeleton className="aspect-square w-full rounded-xl" /><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /></div>))}</div></div></section>
  ),
});

function DoctorsPage() {
  const doctors = Route.useLoaderData();
  const lang = useLang();
  const { t } = useTranslation();
  const { get } = useSiteContent();

  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold md:text-4xl">
            <EditableText contentKey="doctors.title" fallback={get("doctors.title", t("pages.doctors_title"))}>
              {get("doctors.title", t("pages.doctors_title"))}
            </EditableText>
          </h1>
          <p className="mt-3 text-muted-foreground">
            <EditableText contentKey="doctors.subtitle" fallback={get("doctors.subtitle", t("pages.doctors_subtitle"))} multiline>
              {get("doctors.subtitle", t("pages.doctors_subtitle"))}
            </EditableText>
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {doctors.map((doc: any) => (
            <Card key={doc.id} className="group h-full overflow-hidden transition-shadow hover:shadow-lg">
              <Link to="/$lang/doctors/$doctorId" params={{ lang, doctorId: doc.id }} className="block">
                <div className="relative aspect-square overflow-hidden">
                  <img src={doc.image_url || "/placeholder.svg"} alt={getLocalizedField(doc, "name", lang)} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                  {doc.experience_years && (
                    <Badge className="absolute left-3 top-3 gap-1 bg-card/90 text-foreground backdrop-blur-sm">
                      <Award className="h-3 w-3" /> {doc.experience_years} {t("doctors_section.experience")}
                    </Badge>
                  )}
                </div>
              </Link>
              <CardContent className="p-5">
                <Link to="/$lang/doctors/$doctorId" params={{ lang, doctorId: doc.id }}>
                  <h3 className="font-semibold">{getLocalizedField(doc, "name", lang)}</h3>
                  <p className="mt-1 text-sm text-primary">{getLocalizedField(doc, "specialization", lang)}</p>
                </Link>
                <Link to="/$lang/appointment" params={{ lang }} search={{ doctor_id: doc.id }} className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                  <Calendar className="h-4 w-4" />
                  {t("hero.cta_appointment")}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
