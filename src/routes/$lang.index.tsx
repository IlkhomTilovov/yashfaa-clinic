import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Heart, FlaskConical, Stethoscope, Calendar, ArrowRight,
  Users, Clock, Award, ShieldCheck, Zap, Star, Phone,
  CheckCircle, Activity, Sparkles, Quote, Send,
} from "lucide-react";
import { getDoctors, getTests, getServices } from "@/lib/server-functions";
import { HeroSearch } from "@/components/HeroSearch";
import { useLang, getLocalizedField } from "@/hooks/useLang";
import { useSiteContent } from "@/hooks/useSiteContent";
import { CLINIC_PHONE_DISPLAY, CLINIC_PHONE_TEL, CLINIC_TELEGRAM } from "@/lib/contact";
import { EditableText } from "@/components/EditableText";
import { ET } from "@/components/ET";
import heroLab from "@/assets/hero-lab.jpg";

export const Route = createFileRoute("/$lang/")({
  head: ({ params }) => {
    const isRu = params.lang === "ru";
    return {
      meta: [
        { title: isRu ? "Yashfaa Clinic — Современные медицинские услуги" : "Yashfaa Clinic — Zamonaviy tibbiy xizmatlar" },
        { name: "description", content: isRu
          ? "Yashfaa Clinic — современная клиника в Ташкенте. Лабораторные анализы, диагностика, врачи и онлайн запись."
          : "Yashfaa Clinic — Toshkentdagi zamonaviy tibbiy klinika. Laboratoriya tahlillari, diagnostika, shifokorlar va onlayn qabulga yozilish."
        },
        { property: "og:title", content: isRu ? "Yashfaa Clinic — Современные медицинские услуги" : "Yashfaa Clinic — Zamonaviy tibbiy xizmatlar" },
        { property: "og:description", content: isRu
          ? "Современная клиника в Ташкенте. Опытные врачи, лаборатория и диагностика."
          : "Toshkentdagi zamonaviy tibbiy klinika. Tajribali shifokorlar, laboratoriya va diagnostika xizmatlari."
        },
        { rel: "alternate", hrefLang: "uz", href: "/uz" },
        { rel: "alternate", hrefLang: "ru", href: "/ru" },
      ],
    };
  },
  loader: async () => {
    const [doctors, tests, services] = await Promise.all([getDoctors(), getTests(), getServices()]);
    return {
      doctors: (doctors ?? []).filter((d: any) => d.is_active).slice(0, 4),
      tests: (tests ?? []).filter((t: any) => t.is_active).slice(0, 6),
      allDoctors: (doctors ?? []).filter((d: any) => d.is_active),
      allServices: (services ?? []).filter((s: any) => s.is_active),
      allTests: (tests ?? []).filter((t: any) => t.is_active),
    };
  },
  component: HomePage,
});

function HomePage() {
  const { doctors, tests, allDoctors, allServices, allTests } = Route.useLoaderData();
  const lang = useLang();
  const { t } = useTranslation();
  const { get } = useSiteContent();

  // Editable content (DB → fallback to i18n)
  const heroTitle = get("hero.title", `${t("hero.title_1")} ${t("hero.title_2")}`);
  const heroSubtitle = get("hero.subtitle", t("hero.subtitle"));
  const heroImage = get("hero.image", "");
  const ctaTitle = get("cta.title", t("cta.title"));
  const ctaSubtitle = get("cta.subtitle", t("cta.subtitle"));

  const serviceCards = [
    { icon: FlaskConical, kBase: "services_section.lab", title: t("services_section.lab"), desc: t("services_section.lab_desc"), link: `/${lang}/tests` as const, color: "bg-blue-50 text-blue-600", hoverColor: "group-hover:bg-blue-600 group-hover:text-white" },
    { icon: Stethoscope, kBase: "services_section.diagnostics", title: t("services_section.diagnostics"), desc: t("services_section.diagnostics_desc"), link: `/${lang}/services` as const, color: "bg-emerald-50 text-emerald-600", hoverColor: "group-hover:bg-emerald-600 group-hover:text-white" },
    { icon: Heart, kBase: "services_section.cosmetology", title: t("services_section.cosmetology"), desc: t("services_section.cosmetology_desc"), link: `/${lang}/services` as const, color: "bg-rose-50 text-rose-600", hoverColor: "group-hover:bg-rose-600 group-hover:text-white" },
    { icon: Calendar, kBase: "services_section.reception", title: t("services_section.reception"), desc: t("services_section.reception_desc"), link: `/${lang}/appointment` as const, color: "bg-amber-50 text-amber-600", hoverColor: "group-hover:bg-amber-600 group-hover:text-white" },
  ];

  const statsData = [
    { icon: Users, value: get("stats.doctors", "50+"), label: t("stats.doctors"), contentKey: "stats.doctors" },
    { icon: Activity, value: get("stats.patients", "10,000+"), label: t("stats.patients"), contentKey: "stats.patients" },
    { icon: FlaskConical, value: get("stats.tests_count", "200+"), label: t("stats.tests"), contentKey: "stats.tests_count" },
    { icon: Clock, value: "24/7", label: t("stats.availability"), contentKey: "stats.availability_value" },
  ];

  const advantagesData = [
    { icon: Award, kBase: "advantages.experienced", title: t("advantages.experienced_title"), desc: t("advantages.experienced_desc") },
    { icon: Sparkles, kBase: "advantages.modern", title: t("advantages.modern_title"), desc: t("advantages.modern_desc") },
    { icon: Zap, kBase: "advantages.fast", title: t("advantages.fast_title"), desc: t("advantages.fast_desc") },
    { icon: ShieldCheck, kBase: "advantages.reliable", title: t("advantages.reliable_title"), desc: t("advantages.reliable_desc") },
  ];

  const testimonialsData = [
    { kBase: "testimonials.t1", text: lang === "ru" ? "Я очень довольна лечением в Yashfaa Clinic. Врачи внимательные и профессиональные. Результаты анализов были готовы быстро." : "Yashfaa Clinic'da davolanganimdan juda mamnunman. Shifokorlar e'tiborli va professional. Tahlil natijalari tez chiqdi.", name: "Dilnoza Karimova", role: t("testimonials.patient") },
    { kBase: "testimonials.t2", text: lang === "ru" ? "Искали педиатра для ребёнка. Здесь нашли отличного специалиста. Клиника чистая и современная." : "Bolam uchun pediatr qidirayotgan edik. Bu yerda juda yaxshi mutaxassis topdik. Klinika toza va zamonaviy.", name: "Sardor Alimov", role: t("testimonials.patient") },
    { kBase: "testimonials.t3", text: lang === "ru" ? "Лабораторный сервис на высшем уровне. Все анализы сдала в одном месте, результаты качественные." : "Laboratoriya xizmati a'lo darajada. Barcha tahlillarni bitta joyda topshirdim va natijalar sifatli chiqdi.", name: "Madina Rahimova", role: t("testimonials.patient") },
  ];

  return (
    <>
      {/* ─── HERO ─── */}
      <section
        className="relative w-screen overflow-hidden"
        style={{
          height: "100vh",
          backgroundImage: `url(${heroImage || heroLab})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/30" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative mx-auto flex h-full max-w-7xl items-center px-4">
          {/* LEFT — Text */}
          <div className="max-w-2xl text-center md:text-left">
            <Badge variant="secondary" className="mb-5 gap-1.5 rounded-full border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
              <ShieldCheck className="h-4 w-4" />
              {t("hero.badge")}
            </Badge>
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground md:text-5xl lg:text-[3.25rem]">
              <EditableText contentKey="hero.title" fallback={heroTitle}>{heroTitle}</EditableText>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
              <EditableText contentKey="hero.subtitle" fallback={heroSubtitle} multiline>{heroSubtitle}</EditableText>
            </p>

            {/* ─── Trust Badges ─── */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                {get("stats.rating", "4.9")} {lang === "ru" ? "рейтинг" : "reyting"}
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
                <Users className="h-4 w-4" />
                {get("stats.doctors", "50+")} {lang === "ru" ? "врачей" : "shifokor"}
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                <CheckCircle className="h-4 w-4" />
                {get("stats.patients", "10,000+")} {lang === "ru" ? "пациентов" : "bemor"}
              </div>
            </div>

            {/* ─── CTA Buttons ─── */}
            <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
              <Button size="lg" className="h-12 rounded-2xl px-8 text-base shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30" asChild>
                <Link to="/$lang/appointment" params={{ lang }}>
                  <Calendar className="mr-2 h-5 w-5" />
                  {t("hero.cta_appointment")}
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 rounded-2xl border-[#0088cc] bg-[#0088cc]/10 px-8 text-base text-[#0088cc] hover:bg-[#0088cc] hover:text-white" asChild>
                <a href={CLINIC_TELEGRAM} target="_blank" rel="noopener noreferrer">
                  <Send className="mr-2 h-5 w-5" />
                  {t("cta.telegram")}
                </a>
              </Button>
            </div>

            {/* ─── Urgency line ─── */}
            <p className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-emerald-600 md:justify-start">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              {lang === "ru" ? "Сегодня есть свободные места" : "Bugun bo'sh vaqtlar mavjud"}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-sm text-muted-foreground md:justify-start">
              <a href={`tel:${CLINIC_PHONE_TEL}`} className="flex items-center gap-2 transition-colors hover:text-primary">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10"><Phone className="h-3.5 w-3.5 text-primary" /></div>
                {CLINIC_PHONE_DISPLAY}
              </a>
              <span className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10"><Clock className="h-3.5 w-3.5 text-primary" /></div>
                {t("hero.working_hours")}
              </span>
            </div>

            <div className="mt-8">
              <HeroSearch doctors={allDoctors as any} services={allServices as any} tests={allTests as any} />
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="relative z-10 mt-12 px-4 md:mt-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-4 rounded-2xl border bg-card/80 p-6 shadow-xl backdrop-blur-sm md:grid-cols-4 md:gap-8 md:p-8">
            {statsData.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><s.icon className="h-6 w-6" /></div>
                <span className="text-2xl font-extrabold text-foreground md:text-3xl">
                  <EditableText contentKey={s.contentKey} fallback={s.value}>{s.value}</EditableText>
                </span>
                <span className="text-xs text-muted-foreground md:text-sm">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <section className="px-4 py-20 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <Badge variant="outline" className="mb-3 rounded-full px-4 py-1">
              <ET k="services_section.badge" t="services_section.badge" />
            </Badge>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              <ET k="services_section.title" t="services_section.title" />
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              <ET k="services_section.subtitle" t="services_section.subtitle" multiline />
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {serviceCards.map((s) => (
              <Link key={s.title} to={s.link as any}>
                <Card className="group h-full border-0 bg-card shadow-md transition-all hover:-translate-y-1 hover:shadow-xl">
                  <CardContent className="flex flex-col items-center p-8 text-center">
                    <div className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl transition-colors ${s.color} ${s.hoverColor}`}>
                      <s.icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-bold">
                      <ET k={`${s.kBase}.title`}>{s.title}</ET>
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      <ET k={`${s.kBase}.desc`} multiline>{s.desc}</ET>
                    </p>
                    <span className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      <ET k="services_section.details" t="services_section.details" /> <ArrowRight className="h-4 w-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DOCTORS ─── */}
      {doctors.length > 0 && (
        <section className="bg-muted/40 px-4 py-20 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div>
                <Badge variant="outline" className="mb-3 rounded-full px-4 py-1">
                  <ET k="doctors_section.badge" t="doctors_section.badge" />
                </Badge>
                <h2 className="text-3xl font-bold text-foreground md:text-4xl">
                  <ET k="doctors_section.title" t="doctors_section.title" />
                </h2>
                <p className="mt-3 max-w-lg text-muted-foreground">
                  <ET k="doctors_section.subtitle" t="doctors_section.subtitle" multiline />
                </p>
              </div>
              <Button variant="outline" className="rounded-full" asChild>
                <Link to="/$lang/doctors" params={{ lang }}>
                  {t("doctors_section.all_doctors")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {doctors.map((doc: any) => (
                <Link key={doc.id} to="/$lang/doctors/$doctorId" params={{ lang, doctorId: doc.id }}>
                  <Card className="group h-full overflow-hidden border-0 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl">
                    <div className="relative h-56 overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                      {doc.image_url ? (
                        <img src={doc.image_url} alt={getLocalizedField(doc, "name", lang)} loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Avatar className="h-24 w-24"><AvatarFallback className="bg-primary/20 text-2xl font-bold text-primary">{doc.name.charAt(0)}</AvatarFallback></Avatar>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <h3 className="text-lg font-bold text-foreground">{getLocalizedField(doc, "name", lang)}</h3>
                      <p className="mt-1 text-sm text-primary">{getLocalizedField(doc, "specialization", lang)}</p>
                      {doc.experience_years && (
                        <p className="mt-2 text-xs text-muted-foreground">{doc.experience_years} {t("doctors_section.experience")}</p>
                      )}
                      <div className="mt-3">
                        <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                          <Calendar className="h-4 w-4" />
                          {t("hero.cta_appointment")}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── POPULAR TESTS ─── */}
      {tests.length > 0 && (
        <section className="px-4 py-20 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div>
                <Badge variant="outline" className="mb-3 rounded-full px-4 py-1">
                  <ET k="tests_section.badge" t="tests_section.badge" />
                </Badge>
                <h2 className="text-3xl font-bold text-foreground md:text-4xl">
                  <ET k="tests_section.title" t="tests_section.title" />
                </h2>
                <p className="mt-3 max-w-lg text-muted-foreground">
                  <ET k="tests_section.subtitle" t="tests_section.subtitle" multiline />
                </p>
              </div>
              <Button variant="outline" className="rounded-full" asChild>
                <Link to="/$lang/tests" params={{ lang }}>
                  {t("tests_section.all_tests")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {tests.map((test: any) => (
                <Link key={test.id} to="/$lang/tahlil/$slug" params={{ lang, slug: test.slug ?? test.id }}>
                  <Card className="group h-full border transition-all hover:-translate-y-0.5 hover:shadow-lg">
                    <CardContent className="flex items-start gap-4 p-5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><FlaskConical className="h-6 w-6" /></div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground line-clamp-1">{getLocalizedField(test, "name", lang)}</h3>
                        {test.categories && <Badge variant="secondary" className="mt-1.5 text-xs">{(test.categories as any).name}</Badge>}
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          {test.result_time && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {test.result_time}</span>}
                          {test.is_recommended && <span className="flex items-center gap-1 text-amber-600"><Star className="h-3.5 w-3.5" /> {t("tests_section.recommended")}</span>}
                        </div>
                        <p className="mt-3 text-sm font-medium text-primary">{t("tests_section.contact_us")} →</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── WHY CHOOSE US ─── */}
      <section className="bg-muted/40 px-4 py-20 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <Badge variant="outline" className="mb-3 rounded-full px-4 py-1">
              <ET k="advantages.badge" t="advantages.badge" />
            </Badge>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              <ET k="advantages.title" t="advantages.title" />
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              <ET k="advantages.subtitle" t="advantages.subtitle" multiline />
            </p>
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {advantagesData.map((a) => (
              <div key={a.title} className="flex flex-col items-center text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25"><a.icon className="h-8 w-8" /></div>
                <h3 className="text-lg font-bold text-foreground">
                  <ET k={`${a.kBase}.title`}>{a.title}</ET>
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  <ET k={`${a.kBase}.desc`} multiline>{a.desc}</ET>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="px-4 py-20 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <Badge variant="outline" className="mb-3 rounded-full px-4 py-1">
              <ET k="testimonials.badge" t="testimonials.badge" />
            </Badge>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              <ET k="testimonials.title" t="testimonials.title" />
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              <ET k="testimonials.subtitle" t="testimonials.subtitle" multiline />
            </p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {testimonialsData.map((tm, i) => (
              <Card key={i} className="relative border-0 bg-card shadow-md">
                <CardContent className="p-7">
                  <Quote className="mb-4 h-8 w-8 text-primary/20" />
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    <ET k={`${tm.kBase}.text`} multiline>{tm.text}</ET>
                  </p>
                  <div className="mt-6 flex items-center gap-3 border-t pt-5">
                    <Avatar className="h-10 w-10"><AvatarFallback className="bg-primary/10 font-semibold text-primary">{tm.name.charAt(0)}</AvatarFallback></Avatar>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        <ET k={`${tm.kBase}.name`}>{tm.name}</ET>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <ET k={`${tm.kBase}.role`}>{tm.role}</ET>
                      </p>
                    </div>
                    <div className="ml-auto flex gap-0.5 text-amber-400">
                      {[...Array(5)].map((_, j) => (<Star key={j} className="h-3.5 w-3.5 fill-current" />))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative overflow-hidden bg-primary px-4 py-20 text-primary-foreground md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            <EditableText contentKey="cta.title" fallback={ctaTitle}>{ctaTitle}</EditableText>
          </h2>
          <p className="mt-5 text-lg text-primary-foreground/80">
            <EditableText contentKey="cta.subtitle" fallback={ctaSubtitle} multiline>{ctaSubtitle}</EditableText>
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" className="rounded-full px-8 shadow-lg" asChild>
              <Link to="/$lang/appointment" params={{ lang }}>
                <Calendar className="mr-2 h-5 w-5" />
                {t("cta.appointment")}
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full border-primary-foreground/40 bg-primary-foreground/10 px-8 text-primary-foreground" asChild>
              <a href={CLINIC_TELEGRAM} target="_blank" rel="noopener noreferrer">
                <Send className="mr-2 h-5 w-5" />
                {t("cta.telegram")}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
