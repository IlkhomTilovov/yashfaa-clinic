import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
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
  MessageCircle,
  AlertTriangle,
  Star,
  Zap,
  Briefcase,
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
  head: () => ({
    meta: [
      { title: "Xizmat — Yashfaa Clinic" },
      { name: "description", content: "Yashfaa Clinic tibbiy xizmati haqida batafsil ma'lumot." },
      { property: "og:title", content: "Xizmat — Yashfaa Clinic" },
      { property: "og:description", content: "Yashfaa Clinic tibbiy xizmati haqida batafsil ma'lumot." },
    ],
  }),
  loader: async ({ params }) => {
    const [service, doctors] = await Promise.all([
      getServiceBySlug({ data: { slug: params.slug } }),
      getDoctors(),
    ]);
    return { service, doctors };
  },
  component: ServiceDetailPage,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="px-4 py-16 text-center">
        <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/30" />
        <h2 className="mt-4 text-2xl font-bold">Xizmat topilmadi</h2>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/services">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Xizmatlar ro'yxati
            </Button>
          </Link>
          <Button onClick={() => { router.invalidate(); reset(); }}>
            Qayta urinish
          </Button>
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
    <section className="px-4 py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
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
    <section className="px-4 py-8 md:py-12">
      <div className="mx-auto max-w-3xl">
        {/* Breadcrumb */}
        <Link
          to="/services"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Xizmatlar ro'yxati
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {svc.categories?.name && (
              <Badge variant="outline">{svc.categories.name}</Badge>
            )}
            {svc.is_featured && (
              <Badge variant="secondary" className="gap-1">
                <Star className="h-3 w-3 fill-current" /> Tavsiya etiladi
              </Badge>
            )}
            {svc.is_online && (
              <Badge variant="outline" className="gap-1">
                <Globe className="h-3 w-3" /> Online
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {svc.name}
          </h1>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Description */}
          {svc.description && (
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-2 text-lg font-semibold">Xizmat haqida</h2>
                <p className="leading-relaxed text-muted-foreground">
                  {svc.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Quick Info Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {svc.duration && (
              <Card>
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="rounded-lg bg-primary/10 p-2">
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
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Qayerda</p>
                    <p className="font-medium">
                      {LOCATION_LABELS[svc.location_type] ?? svc.location_type}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            {svc.result_info && (
              <Card>
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Natija vaqti</p>
                    <p className="font-medium">{svc.result_info}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Preparation */}
          {svc.preparation_requirements && (
            <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div>
                    <h2 className="mb-1 font-semibold text-amber-900 dark:text-amber-200">
                      Tayyorgarlik talablari
                    </h2>
                    <p className="text-sm leading-relaxed text-amber-800 dark:text-amber-300">
                      {svc.preparation_requirements}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Doctors */}
          {linkedDoctors.length > 0 && (
            <div>
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
                          <p className="text-sm text-muted-foreground">
                            {doc.specialization}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CTA Block */}
        <Card className="mt-8 border-primary/20 bg-primary/5">
          <CardContent className="p-6 text-center md:p-8">
            <h2 className="text-xl font-bold md:text-2xl">Qabulga yozilish</h2>
            <p className="mt-2 text-muted-foreground">
              Batafsil ma'lumot va yozilish uchun mutaxassisimiz bilan bog'laning
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <a
                href="tel:+998711234567"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
              >
                <Phone className="h-5 w-5" />
                Qo'ng'iroq qilish
              </a>
              <a
                href="https://t.me/yashfaa_clinic"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-primary bg-background px-6 py-3 font-medium text-primary transition-colors hover:bg-primary/5 sm:w-auto"
              >
                <MessageCircle className="h-5 w-5" />
                Telegram
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
