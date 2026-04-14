import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Award, Phone, Send } from "lucide-react";
import { getDoctorById } from "@/lib/server-functions";
import { useLang, getLocalizedField } from "@/hooks/useLang";

export const Route = createFileRoute("/$lang/doctors/$doctorId")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.lang === "ru" ? "Врач" : "Shifokor"} — Yashfaa Clinic` },
      { rel: "alternate", hrefLang: "uz", href: `/uz/doctors/${params.doctorId}` },
      { rel: "alternate", hrefLang: "ru", href: `/ru/doctors/${params.doctorId}` },
    ],
  }),
  loader: async ({ params }) => {
    try { return await getDoctorById({ data: { id: params.doctorId } }); }
    catch { throw notFound(); }
  },
  component: DoctorProfilePage,
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
  notFoundComponent: () => {
    const { t } = useTranslation();
    return (
      <div className="px-4 py-16 text-center">
        <h2 className="text-2xl font-bold">{t("detail.doctor_not_found")}</h2>
      </div>
    );
  },
  pendingComponent: () => (
    <section className="px-4 py-16"><div className="mx-auto max-w-4xl"><Card><CardContent className="p-6 md:p-8"><div className="flex flex-col gap-8 md:flex-row"><Skeleton className="h-64 w-64 rounded-xl" /><div className="flex-1 space-y-4"><Skeleton className="h-8 w-3/4" /><Skeleton className="h-5 w-1/2" /><Skeleton className="h-20 w-full" /></div></div></CardContent></Card></div></section>
  ),
});

function DoctorProfilePage() {
  const doctor = Route.useLoaderData() as any;
  const lang = useLang();
  const { t } = useTranslation();
  if (!doctor) return null;

  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <Link to="/$lang/doctors" params={{ lang }} className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> {t("detail.back_doctors")}
        </Link>
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col gap-8 md:flex-row">
              <div className="shrink-0">
                <img src={doctor.image_url || "/placeholder.svg"} alt={getLocalizedField(doctor, "name", lang)} className="h-64 w-64 rounded-xl object-cover" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold md:text-3xl">{getLocalizedField(doctor, "name", lang)}</h1>
                <p className="mt-2 text-lg text-primary">{getLocalizedField(doctor, "specialization", lang)}</p>
                {doctor.experience_years && (
                  <Badge className="mt-3 gap-1.5">
                    <Award className="h-3.5 w-3.5" />
                    {doctor.experience_years} {t("doctors_section.experience")}
                  </Badge>
                )}
                {(doctor.bio || doctor.bio_uz || doctor.bio_ru) && <p className="mt-4 text-muted-foreground">{getLocalizedField(doctor, "bio", lang)}</p>}
                
                {/* CTA Buttons */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button size="lg" asChild>
                    <Link to={"/$lang/appointment" as any} params={{ lang } as any}>
                      <Calendar className="mr-2 h-5 w-5" />{t("hero.cta_appointment")}
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-[#0088cc] text-[#0088cc] hover:bg-[#0088cc] hover:text-white" asChild>
                    <a href="https://t.me/yashfaa_clinic" target="_blank" rel="noopener noreferrer">
                      <Send className="mr-2 h-5 w-5" />
                      {t("cta.telegram")}
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <a href="tel:+998711234567">
                      <Phone className="mr-2 h-5 w-5" />
                      {t("hero.cta_call")}
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
