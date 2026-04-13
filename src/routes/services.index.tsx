import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone, Clock, MapPin, Star, Globe, Briefcase } from "lucide-react";
import { getServices, getCategories, getDoctors } from "@/lib/server-functions";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Xizmatlar — Yashfaa Clinic" },
      { name: "description", content: "Yashfaa Clinic tibbiy xizmatlari. Batafsil ma'lumot uchun murojaat qiling." },
      { property: "og:title", content: "Xizmatlar — Yashfaa Clinic" },
      { property: "og:description", content: "Yashfaa Clinic tibbiy xizmatlari. Narx va batafsil ma'lumot uchun bog'laning." },
    ],
  }),
  loader: async () => {
    const [services, categories, doctors] = await Promise.all([
      getServices(),
      getCategories(),
      getDoctors(),
    ]);
    return { services, categories, doctors };
  },
  component: ServicesPage,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="px-4 py-16 text-center">
        <h2 className="text-2xl font-bold">Xatolik yuz berdi</h2>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
        <Button className="mt-4" onClick={() => { router.invalidate(); reset(); }}>Qayta urinish</Button>
      </div>
    );
  },
  pendingComponent: () => (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-5xl space-y-4">
        <Skeleton className="mx-auto h-10 w-64" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    </section>
  ),
});

const LOCATION_LABELS: Record<string, string> = {
  clinic: "Klinikada",
  home: "Uyga chiqib",
  online: "Online",
  clinic_home: "Klinikada / Uyga chiqib",
};

function ServicesPage() {
  const { services, categories, doctors } = Route.useLoaderData();

  const activeServices = (services as any[]).filter((s: any) => s.is_active);
  const featuredServices = activeServices.filter((s: any) => s.is_featured);
  const regularServices = activeServices.filter((s: any) => !s.is_featured);

  const getDoctorName = (id: string) => {
    const doc = (doctors as any[]).find((d: any) => d.id === id);
    return doc?.name ?? null;
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
                <h3 className="font-semibold">{svc.name}</h3>
                {svc.is_online && <Globe className="h-3.5 w-3.5 text-primary" />}
              </div>
              {svc.categories?.name && (
                <Badge variant="outline" className="mt-1 text-[10px]">{svc.categories.name}</Badge>
              )}
            </div>
          </div>

          {svc.description && (
            <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{svc.description}</p>
          )}

          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
            {svc.duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {svc.duration}
              </span>
            )}
            {svc.location_type && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {LOCATION_LABELS[svc.location_type] ?? svc.location_type}
              </span>
            )}
          </div>

          {svc.doctor_ids && svc.doctor_ids.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {svc.doctor_ids.map((id: string) => {
                const name = getDoctorName(id);
                return name ? (
                  <Badge key={id} variant="secondary" className="text-[10px]">{name}</Badge>
                ) : null;
              })}
            </div>
          )}

          {svc.preparation_requirements && (
            <p className="mt-2 text-xs text-muted-foreground/70 italic">📋 {svc.preparation_requirements}</p>
          )}

          <div className="mt-auto pt-4">
            <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              Batafsil ko'rish
            </span>
          </div>
        </CardContent>
      </Card>
    );

    if (svc.slug) {
      return (
        <Link key={svc.id} to="/services/$slug" params={{ slug: svc.slug }} className="block">
          {card}
        </Link>
      );
    }

    return <div key={svc.id}>{card}</div>;
  };

  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold md:text-4xl">Bizning xizmatlar</h1>
          <p className="mt-3 text-muted-foreground">
            Klinikamizda taqdim etiladigan tibbiy xizmatlar. Narx va batafsil ma'lumot uchun murojaat qiling.
          </p>
        </div>

        {/* Featured */}
        {featuredServices.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Star className="h-5 w-5 fill-primary text-primary" /> Tavsiya etilgan xizmatlar
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredServices.map(renderServiceCard)}
            </div>
          </div>
        )}

        {/* All services */}
        <div className="mt-12">
          {featuredServices.length > 0 && <h2 className="mb-4 text-lg font-semibold">Barcha xizmatlar</h2>}
          {regularServices.length === 0 && featuredServices.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed py-16 text-center">
              <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">Hozircha xizmatlar mavjud emas</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {regularServices.map(renderServiceCard)}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-xl bg-muted/50 p-6 text-center">
          <h3 className="text-lg font-semibold">Narx va batafsil ma'lumot uchun</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Mutaxassis bilan bog'lanib, xizmat narxlari va tayyorgarlik haqida ma'lumot oling
          </p>
          <a
            href="tel:+998711234567"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Phone className="h-5 w-5" />
            +998 71 123 45 67
          </a>
        </div>
      </div>
    </section>
  );
}
