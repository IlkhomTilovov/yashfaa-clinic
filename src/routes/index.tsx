import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart,
  FlaskConical,
  Stethoscope,
  Calendar,
  ArrowRight,
  Users,
  Clock,
  Award,
  ShieldCheck,
  Zap,
  Star,
  Phone,
  MessageCircle,
  CheckCircle,
  Activity,
  Sparkles,
  Quote,
} from "lucide-react";
import { getDoctors, getTests, getServices } from "@/lib/server-functions";
import { HeroSearch } from "@/components/HeroSearch";
import heroDoctor from "@/assets/hero-doctor.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Yashfaa Clinic — Zamonaviy tibbiy xizmatlar" },
      {
        name: "description",
        content:
          "Yashfaa Clinic — Toshkentdagi zamonaviy tibbiy klinika. Laboratoriya tahlillari, diagnostika, shifokorlar va onlayn qabulga yozilish.",
      },
      { property: "og:title", content: "Yashfaa Clinic — Zamonaviy tibbiy xizmatlar" },
      {
        property: "og:description",
        content:
          "Toshkentdagi zamonaviy tibbiy klinika. Tajribali shifokorlar, laboratoriya va diagnostika xizmatlari.",
      },
    ],
  }),
  loader: async () => {
    const [doctors, tests, services] = await Promise.all([getDoctors(), getTests(), getServices()]);
    return {
      doctors: (doctors ?? []).filter((d) => d.is_active).slice(0, 4),
      tests: (tests ?? []).filter((t) => t.is_active).slice(0, 6),
      allDoctors: (doctors ?? []).filter((d) => d.is_active),
      allServices: (services ?? []).filter((s: any) => s.is_active),
      allTests: (tests ?? []).filter((t) => t.is_active),
    };
  },
  component: HomePage,
});

const services = [
  {
    icon: FlaskConical,
    title: "Laboratoriya",
    desc: "Zamonaviy uskunalarda 100+ turdagi tahlillar",
    link: "/tests" as const,
    color: "bg-blue-50 text-blue-600",
    hoverColor: "group-hover:bg-blue-600 group-hover:text-white",
  },
  {
    icon: Stethoscope,
    title: "Diagnostika",
    desc: "UZI, EKG, rentgen va MRT tekshiruvlari",
    link: "/services" as const,
    color: "bg-emerald-50 text-emerald-600",
    hoverColor: "group-hover:bg-emerald-600 group-hover:text-white",
  },
  {
    icon: Heart,
    title: "Kosmetologiya",
    desc: "Yuz tozalash, lazer epilyatsiya, botoks",
    link: "/services" as const,
    color: "bg-rose-50 text-rose-600",
    hoverColor: "group-hover:bg-rose-600 group-hover:text-white",
  },
  {
    icon: Calendar,
    title: "Qabul",
    desc: "Onlayn shifokorga yozilish xizmati",
    link: "/appointment" as const,
    color: "bg-amber-50 text-amber-600",
    hoverColor: "group-hover:bg-amber-600 group-hover:text-white",
  },
];

const stats = [
  { icon: Users, value: "50+", label: "Tajribali shifokorlar" },
  { icon: Activity, value: "10,000+", label: "Mamnun bemorlar" },
  { icon: FlaskConical, value: "200+", label: "Tahlil turlari" },
  { icon: Clock, value: "24/7", label: "Biz doim siz bilan" },
];

const advantages = [
  {
    icon: Award,
    title: "Tajribali shifokorlar",
    desc: "10+ yillik tajribaga ega mutaxassislar jamoasi",
  },
  {
    icon: Sparkles,
    title: "Zamonaviy uskunalar",
    desc: "Germaniya va Yaponiyadan keltirilgan tibbiy jihozlar",
  },
  {
    icon: Zap,
    title: "Tezkor natijalar",
    desc: "Tahlil natijalari 1-3 kun ichida tayyor",
  },
  {
    icon: ShieldCheck,
    title: "Ishonchli xizmat",
    desc: "Xalqaro standartlar asosida sifat nazorati",
  },
];

const testimonials = [
  {
    text: "Yashfaa Clinic'da davolanganimdan juda mamnunman. Shifokorlar e'tiborli va professional. Tahlil natijalari tez chiqdi.",
    name: "Dilnoza Karimova",
    role: "Bemor",
  },
  {
    text: "Bolam uchun pediatr qidirayotgan edik. Bu yerda juda yaxshi mutaxassis topdik. Klinika toza va zamonaviy.",
    name: "Sardor Alimov",
    role: "Bemor",
  },
  {
    text: "Laboratoriya xizmati a'lo darajada. Barcha tahlillarni bitta joyda topshirdim va natijalar sifatli chiqdi.",
    name: "Madina Rahimova",
    role: "Bemor",
  },
];

function HomePage() {
  const { doctors, tests, allDoctors, allServices, allTests } = Route.useLoaderData();

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="mx-auto flex max-w-7xl flex-col-reverse items-center gap-8 px-4 py-16 md:flex-row md:py-24 lg:py-28">
          {/* Left */}
          <div className="flex-1 text-center md:text-left">
            <Badge variant="secondary" className="mb-4 gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium">
              <ShieldCheck className="h-4 w-4" />
              Ishonchli tibbiy markaz
            </Badge>
            <h1 className="text-4xl font-extrabold leading-tight text-foreground md:text-5xl lg:text-6xl">
              Sog'lom hayot —{" "}
              <span className="text-primary">bizning maqsadimiz</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground md:text-xl">
              Zamonaviy tibbiy asbob-uskunalar va tajribali shifokorlar jamoasi
              bilan siz va oilangiz salomatligi uchun xizmat qilamiz.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4 md:justify-start">
              <Button size="lg" className="rounded-full px-8 shadow-lg shadow-primary/25" asChild>
                <Link to="/appointment">
                  <Calendar className="mr-2 h-5 w-5" />
                  Qabulga yozilish
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8" asChild>
                <Link to="/services">
                  Xizmatlar
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            {/* Quick contact */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground md:justify-start">
              <a href="tel:+998711234567" className="flex items-center gap-2 hover:text-primary">
                <Phone className="h-4 w-4 text-primary" />
                +998 71 123 45 67
              </a>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Dush–Shan: 8:00–20:00
              </span>
            </div>

            {/* Search bar */}
            <div className="mt-8">
              <HeroSearch
                doctors={allDoctors as any}
                services={allServices as any}
                tests={allTests as any}
              />
            </div>
          </div>

          {/* Right — Doctor image */}
          <div className="flex flex-1 justify-center">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-primary/10 blur-3xl" />
              <img
                src={heroDoctor}
                alt="Yashfaa Clinic shifokor"
                width={480}
                height={560}
                className="relative z-10 h-auto max-h-[500px] w-auto object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="relative -mt-8 z-20 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-4 rounded-2xl border bg-card p-6 shadow-xl md:grid-cols-4 md:gap-6 md:p-8">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <s.icon className="h-6 w-6" />
                </div>
                <span className="text-2xl font-extrabold text-foreground md:text-3xl">{s.value}</span>
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
            <Badge variant="outline" className="mb-3 rounded-full px-4 py-1">Xizmatlar</Badge>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">Bizning xizmatlar</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Yuqori sifatli tibbiy xizmatlarni zamonaviy uskunalar yordamida taqdim etamiz
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => (
              <Link key={s.title} to={s.link}>
                <Card className="group h-full border-0 bg-card shadow-md transition-all hover:-translate-y-1 hover:shadow-xl">
                  <CardContent className="flex flex-col items-center p-8 text-center">
                    <div
                      className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl transition-colors ${s.color} ${s.hoverColor}`}
                    >
                      <s.icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-bold">{s.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                    <span className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      Batafsil <ArrowRight className="h-4 w-4" />
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
                <Badge variant="outline" className="mb-3 rounded-full px-4 py-1">Shifokorlar</Badge>
                <h2 className="text-3xl font-bold text-foreground md:text-4xl">Bizning mutaxassislar</h2>
                <p className="mt-3 max-w-lg text-muted-foreground">
                  Yuqori malakali va tajribali shifokorlar jamoasi
                </p>
              </div>
              <Button variant="outline" className="rounded-full" asChild>
                <Link to="/doctors">
                  Barcha shifokorlar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {doctors.map((doc) => (
                <Link key={doc.id} to="/doctors/$doctorId" params={{ doctorId: doc.id }}>
                  <Card className="group h-full overflow-hidden border-0 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl">
                    <div className="relative h-56 overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                      {doc.image_url ? (
                        <img
                          src={doc.image_url}
                          alt={doc.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Avatar className="h-24 w-24">
                            <AvatarFallback className="bg-primary/20 text-2xl font-bold text-primary">
                              {doc.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <h3 className="text-lg font-bold text-foreground">{doc.name}</h3>
                      <p className="mt-1 text-sm text-primary">{doc.specialization}</p>
                      {doc.experience_years && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {doc.experience_years} yillik tajriba
                        </p>
                      )}
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
                <Badge variant="outline" className="mb-3 rounded-full px-4 py-1">Tahlillar</Badge>
                <h2 className="text-3xl font-bold text-foreground md:text-4xl">Ommabop tahlillar</h2>
                <p className="mt-3 max-w-lg text-muted-foreground">
                  Eng ko'p buyurtma qilinadigan laboratoriya tahlillari
                </p>
              </div>
              <Button variant="outline" className="rounded-full" asChild>
                <Link to="/tests">
                  Barcha tahlillar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {tests.map((test) => (
                <Link
                  key={test.id}
                  to="/tahlil/$slug"
                  params={{ slug: test.slug ?? test.id }}
                >
                  <Card className="group h-full border transition-all hover:-translate-y-0.5 hover:shadow-lg">
                    <CardContent className="flex items-start gap-4 p-5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <FlaskConical className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground line-clamp-1">{test.name}</h3>
                        {test.categories && (
                          <Badge variant="secondary" className="mt-1.5 text-xs">
                            {(test.categories as any).name}
                          </Badge>
                        )}
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          {test.result_time && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" /> {test.result_time}
                            </span>
                          )}
                          {test.is_recommended && (
                            <span className="flex items-center gap-1 text-amber-600">
                              <Star className="h-3.5 w-3.5" /> Tavsiya
                            </span>
                          )}
                        </div>
                        <p className="mt-3 text-sm font-medium text-primary">
                          Murojaat qiling →
                        </p>
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
            <Badge variant="outline" className="mb-3 rounded-full px-4 py-1">Afzalliklar</Badge>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">Nega aynan biz?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Bemorlarimiz bizni tanlashining sabablari
            </p>
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {advantages.map((a) => (
              <div key={a.title} className="flex flex-col items-center text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                  <a.icon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{a.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="px-4 py-20 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <Badge variant="outline" className="mb-3 rounded-full px-4 py-1">Izohlar</Badge>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">Bemorlar fikri</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Bizning xizmatlarimiz haqida bemorlarimiz nima deyishadi
            </p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <Card key={i} className="relative border-0 bg-card shadow-md">
                <CardContent className="p-7">
                  <Quote className="mb-4 h-8 w-8 text-primary/20" />
                  <p className="text-sm leading-relaxed text-muted-foreground">{t.text}</p>
                  <div className="mt-6 flex items-center gap-3 border-t pt-5">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                        {t.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                    <div className="ml-auto flex gap-0.5 text-amber-400">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="h-3.5 w-3.5 fill-current" />
                      ))}
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
            Bugun sog'lig'ingizni tekshiring
          </h2>
          <p className="mt-5 text-lg text-primary-foreground/80">
            Shifokorimiz bilan maslahat olish uchun hoziroq murojaat qiling.
            Sog'liq — eng qimmatli boylik!
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" className="rounded-full px-8 shadow-lg" asChild>
              <Link to="/appointment">
                <Calendar className="mr-2 h-5 w-5" />
                Qabulga yozilish
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-primary-foreground/30 px-8 text-primary-foreground hover:bg-primary-foreground/10"
              asChild
            >
              <a href="tel:+998711234567">
                <Phone className="mr-2 h-5 w-5" />
                Qo'ng'iroq qilish
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
