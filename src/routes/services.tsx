import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { FlaskConical, Stethoscope, Heart, Microscope, Pill, Baby } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Xizmatlar — MedClinic" },
      { name: "description", content: "MedClinic tibbiy xizmatlari: laboratoriya, diagnostika, kosmetologiya, pediatriya va boshqalar." },
      { property: "og:title", content: "Xizmatlar — MedClinic" },
      { property: "og:description", content: "MedClinic tibbiy xizmatlari: laboratoriya, diagnostika, kosmetologiya." },
    ],
  }),
  component: ServicesPage,
});

const servicesList = [
  { icon: FlaskConical, title: "Laboratoriya tahlillari", desc: "Umumiy qon, siydik, gormon, jigar fermentlari va boshqa tahlillar zamonaviy uskunalarda o'tkaziladi.", link: "/tests" as const },
  { icon: Stethoscope, title: "Diagnostika", desc: "UZI, EKG, rentgen va MRT tekshiruvlari tajribali mutaxassislar tomonidan amalga oshiriladi.", link: "/tests" as const },
  { icon: Heart, title: "Kosmetologiya", desc: "Yuz tozalash, lazer epilyatsiya, botoks in'ektsiyasi va boshqa estetik muolajalar.", link: "/tests" as const },
  { icon: Microscope, title: "Umumiy tekshiruv", desc: "To'liq tibbiy ko'rik — profilaktika va kasalliklarni erta aniqlash uchun.", link: "/appointment" as const },
  { icon: Pill, title: "Terapiya", desc: "Ichki kasalliklar bo'yicha diagnostika va davolash. Tajribali terapevt maslahati.", link: "/doctors" as const },
  { icon: Baby, title: "Pediatriya", desc: "Bolalar salomatligi uchun maxsus xizmatlar va maslahatlар.", link: "/doctors" as const },
];

function ServicesPage() {
  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold md:text-4xl">Bizning xizmatlar</h1>
          <p className="mt-3 text-muted-foreground">
            Klinikamizda taqdim etiladigan tibbiy xizmatlar ro'yxati
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {servicesList.map((s) => (
            <Link key={s.title} to={s.link}>
              <Card className="group h-full transition-shadow hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <s.icon className="h-6 w-6" />
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
  );
}
