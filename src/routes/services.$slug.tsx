import { createFileRoute, Link, useRouter, notFound } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Phone,
  Clock,
  MapPin,
  Globe,
  ArrowLeft,
  CalendarPlus,
  MessageCircle,
  ClipboardList,
  Timer,
  User,
} from "lucide-react";
import { getServiceBySlug, getDoctors } from "@/lib/server-functions";

const LOCATION_LABELS: Record<string, string> = {
  clinic: "Klinikada",
  home: "Uyga chiqib",
  online: "Online",
  clinic_home: "Klinikada / Uyga chiqib",
};

export const Route = createFileRoute("/services/$slug")({
  head: ({ loaderData }) => {
    const name = loaderData?.service?.name ?? "Xizmat";
    const desc = loaderData?.service?.description ?? "Yashfaa Clinic tibbiy xizmati haqida batafsil ma'lumot.";
    return {
      meta: [
        { title: `${name} — Yashfaa Clinic` },
        { name: "description", content: desc.slice(0, 160) },
        { property: "og:title", content: `${name} — Yashfaa Clinic` },
        { property: "og:description", content: desc.slice(0, 160) },
      ],
    };
  },
  loader: async ({ params }) => {
    const [service, doctors] = await Promise.all([
      getServiceBySlug({ data: { slug: params.slug } }),
      getDoctors(),
    ]);
    return { service, doctors };
  },
  component: ServiceDetailPage,
  errorComponent: ({ error }) => {
    const router = useRouter();
    return (
      <div className="px-4 py-16 text-center">
        <h2 className="text-2xl font-bold">Xizmat topilmadi</h2>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="outline" onClick={() => router.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Ortga
          </Button>
          <Link to="/services">
            <Button>Barcha xizmatlar</Button>
          </Link>
        </div>
      </div>
    );
  },
  notFoundComponent: () => (
    <div className="px-4 py-16 text-center">
      <h2 className="text-2xl font-bold">Xizmat topilmadi</h2>
      <p className="mt-2 text-muted-foreground">Bu xizmat mavjud emas yoki o'chirilgan.</p>
      <Link to="/services" className="mt-6 inline-block">
        <Button>Barcha xizmatlar</Button>
      </Link>
    </div>
  ),
  pendingComponent: () => (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    </section>
  ),
});

function ServiceDetailPage() {
  const { service, doctors } = Route.useLoaderData();
  const svc = service as any;
  const allDoctors = doctors as any[];

  const linkedDoctors = svc.doctor_ids?.length
    ? allDoctors.filter((d: any) => svc.doctor_ids.includes(d.id))
    : [];

  return (
    <section className="px-4 py-10">
      <div className="mx-auto max-w-3xl">
        {/* Back */}
        <Link
          to="/services"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Barcha xizmatlar
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold md:text-3xl">{svc.name}</h1>
            {svc.is_online && (
              <Badge variant="secondary" className="gap-1">
                <Globe className="h-3 w-3" /> Online
              </Badge>
            )}
          </div>
          {svc.categories?.name && (
            <Badge variant="outline" className="mt-2">{svc.categories.name}</Badge>
          )}
        </div>

        {/* Description */}
        {svc.description && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <p className="leading-relaxed text-foreground">{svc.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Info Grid */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          {svc.duration && (
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Davomiyligi</p>
                  <p className="font-medium">{svc.duration}</p>
                </div>
              </CardContent>
            </Card>
          )}
          {svc.location_type && (
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Joylashuv</p>
                  <p className="font-medium">{LOCATION_LABELS[svc.location_type] ?? svc.location_type}</p>
                </div>
              </CardContent>
            </Card>
          )}
          {svc.result_info && (
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Timer className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Natija</p>
                  <p className="font-medium">{svc.result_info}</p>
                </div>
              </CardContent>
            </Card>
          )}
          {svc.price != null && svc.price > 0 && (
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <ClipboardList className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Narxi</p>
                  <p className="font-medium">{Number(svc.price).toLocaleString()} so'm</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Doctors */}
        {linkedDoctors.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-lg font-semibold">Shifokorlar</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {linkedDoctors.map((doc: any) => (
                <Link key={doc.id} to="/doctors/$doctorId" params={{ doctorId: doc.id }}>
                  <Card className="transition-shadow hover:shadow-md">
                    <CardContent className="flex items-center gap-3 p-4">
                      {doc.image_url ? (
                        <img
                          src={doc.image_url}
                          alt={doc.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">{doc.specialization}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Preparation */}
        {svc.preparation_requirements && (
          <Card className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
            <CardContent className="p-6">
              <h2 className="mb-2 flex items-center gap-2 font-semibold">
                📋 Tayyorgarlik ko'rsatmalari
              </h2>
              <p className="text-sm leading-relaxed text-foreground/80">{svc.preparation_requirements}</p>
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to="/appointment" className="flex-1">
            <Button size="lg" className="w-full gap-2">
              <CalendarPlus className="h-5 w-5" /> Qabulga yozilish
            </Button>
          </Link>
          <a href="tel:+998711234567" className="flex-1">
            <Button size="lg" variant="outline" className="w-full gap-2">
              <Phone className="h-5 w-5" /> Qo'ng'iroq qilish
            </Button>
          </a>
          <a href="https://t.me/yashfaa_clinic" target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button size="lg" variant="outline" className="w-full gap-2">
              <MessageCircle className="h-5 w-5" /> Telegram
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
