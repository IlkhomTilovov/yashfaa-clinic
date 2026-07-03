import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Award, Phone, Send, Briefcase, ArrowRight } from "lucide-react";
import { getDoctorById, getServicesByDoctor } from "@/lib/server-functions";
import { useLang, getLocalizedField } from "@/hooks/useLang";
import { CLINIC_PHONE_TEL, CLINIC_TELEGRAM } from "@/lib/contact";
import { buildMeta, jsonLdScript, pickLang, truncate, SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/$lang/doctors/$doctorId")({
  head: ({ params, loaderData }) => {
    const lang = (params.lang === "ru" ? "ru" : "uz") as "uz" | "ru";
    const isRu = lang === "ru";
    const doc: any = (loaderData as any)?.doctor;
    const name = doc ? pickLang(doc, "name", lang) : (isRu ? "Врач" : "Shifokor");
    const spec = doc ? pickLang(doc, "specialization", lang) : "";
    const bio = doc ? pickLang(doc, "bio", lang) : "";
    const title = spec
      ? `${name} — ${spec} | Yashfaa Clinic Toshkent`
      : `${name} — Yashfaa Clinic Toshkent`;
    const description = bio
      ? truncate(bio, 160)
      : isRu
        ? `${name}${spec ? `, ${spec}` : ""} — врач Yashfaa Clinic в Ташкенте. Запишитесь на приём онлайн.`
        : `${name}${spec ? `, ${spec}` : ""} — Yashfaa Clinic shifokori Toshkentda. Onlayn qabulga yoziling.`;
    const meta = buildMeta({
      title,
      description,
      pathWithoutLang: `/doctors/${params.doctorId}`,
      lang,
      type: "profile",
      image: doc?.image_url || null,
    });
    const scripts = doc
      ? [
          jsonLdScript({
            "@context": "https://schema.org",
            "@type": "Physician",
            name,
            medicalSpecialty: spec || undefined,
            description: truncate(bio, 300) || undefined,
            image: doc.image_url || undefined,
            telephone: doc.phone || undefined,
            url: `${SITE_URL}/${lang}/doctors/${params.doctorId}`,
            inLanguage: lang,
          }),
        ]
      : undefined;
    return scripts ? { meta, scripts } : { meta };
  },
  loader: async ({ params }) => {
    let doctor: any = null;
    try {
      doctor = await getDoctorById({ data: { id: params.doctorId } });
    } catch {
      throw notFound();
    }
    if (!doctor) throw notFound();
    const services = await getServicesByDoctor({ data: { doctorId: params.doctorId } }).catch(() => []);
    return { doctor, services };
  },
  component: DoctorProfilePage,
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
  const { doctor, services } = Route.useLoaderData() as any;
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
                    <Link to={"/$lang/appointment" as any} params={{ lang } as any} search={{ doctor_id: doctor.id } as any}>
                      <Calendar className="mr-2 h-5 w-5" />{t("hero.cta_appointment")}
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-[#0088cc] text-[#0088cc] hover:bg-[#0088cc] hover:text-white" asChild>
                    <a href={CLINIC_TELEGRAM} target="_blank" rel="noopener noreferrer">
                      <Send className="mr-2 h-5 w-5" />
                      {t("cta.telegram")}
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <a href={`tel:${CLINIC_PHONE_TEL}`}>
                      <Phone className="mr-2 h-5 w-5" />
                      {t("hero.cta_call")}
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── Doctor's services ─── */}
        {services && services.length > 0 && (
          <div className="mt-10">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold md:text-2xl">
                  {lang === "ru" ? "Услуги врача" : "Shifokor xizmatlari"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {lang === "ru"
                    ? `${services.length} услуг(и) предоставляет этот врач`
                    : `${services.length} ta xizmat ushbu shifokor tomonidan taqdim etiladi`}
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {services.map((s: any) => (
                <Link
                  key={s.id}
                  to={"/$lang/services/$slug" as any}
                  params={{ lang, slug: s.slug } as any}
                  className="group"
                >
                  <Card className="h-full border transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground group-hover:text-primary">
                            {getLocalizedField(s, "name", lang)}
                          </h3>
                          {s.categories && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {getLocalizedField(s.categories, "name", lang) || s.categories.name}
                            </p>
                          )}
                          {(s.description || s.description_uz || s.description_ru) && (
                            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                              {getLocalizedField(s, "description", lang)}
                            </p>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
