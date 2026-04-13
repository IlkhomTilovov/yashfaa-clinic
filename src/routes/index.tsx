import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, FlaskConical, Stethoscope, Calendar, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MedClinic — Zamonaviy tibbiy xizmatlar" },
      { name: "description", content: "MedClinic — Toshkentdagi zamonaviy tibbiy klinika. Laboratoriya tahlillari, diagnostika, shifokorlar va onlayn qabulga yozilish." },
      { property: "og:title", content: "MedClinic — Zamonaviy tibbiy xizmatlar" },
      { property: "og:description", content: "Toshkentdagi zamonaviy tibbiy klinika. Tajribali shifokorlar, laboratoriya va diagnostika xizmatlari." },
    ],
  }),
  component: HomePage,
});

const services = [
  { icon: FlaskConical, title: "Laboratoriya", desc: "Zamonaviy uskunalarda 100+ turdagi tahlillar", link: "/tests" as const },
  { icon: Stethoscope, title: "Diagnostika", desc: "UZI, EKG, rentgen va MRT tekshiruvlari", link: "/tests" as const },
  { icon: Heart, title: "Kosmetologiya", desc: "Yuz tozalash, lazer epilyatsiya, botoks", link: "/tests" as const },
  { icon: Calendar, title: "Qabul", desc: "Onlayn shifokorga yozilish xizmati", link: "/appointment" as const },
];

function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 px-4 py-20 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold leading-tight text-foreground md:text-5xl lg:text-6xl">
              Sog'lom hayot — <span className="text-primary">bizning maqsadimiz</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Zamonaviy tibbiy asbob-uskunalar va tajribali shifokorlar jamoasi
              bilan siz va oilangiz salomatligi uchun xizmat qilamiz.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link to="/appointment">
                  <Calendar className="mr-2 h-5 w-5" />
                  Qabulga yozilish
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/tests">
                  Tahlillar va narxlar
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">Bizning xizmatlar</h2>
            <p className="mt-3 text-muted-foreground">
              Yuqori sifatli tibbiy xizmatlarni qulay narxlarda taqdim etamiz
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => (
              <Link key={s.title} to={s.link}>
                <Card className="group h-full transition-shadow hover:shadow-lg">
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <s.icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-semibold">{s.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary px-4 py-16 text-primary-foreground">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold">Hoziroq qabulga yoziling!</h2>
          <p className="mt-4 text-primary-foreground/80">
            Shifokorimiz bilan maslahat olish uchun qulay vaqtni tanlang
          </p>
          <Button size="lg" variant="secondary" className="mt-8" asChild>
            <Link to="/appointment">Qabulga yozilish</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
