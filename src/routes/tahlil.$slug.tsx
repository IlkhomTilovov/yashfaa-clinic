import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Phone,
  Star,
  Zap,
  Clock,
  FlaskConical,
  AlertTriangle,
  MapPin,
  ArrowLeft,
  MessageCircle,
} from "lucide-react";
import { getTestBySlug } from "@/lib/server-functions";

export const Route = createFileRoute("/tahlil/$slug")({
  head: ({ loaderData }) => {
    const test = loaderData;
    return {
      meta: [
        { title: `${test?.name ?? "Tahlil"} — Yashfaa Clinic` },
        {
          name: "description",
          content:
            test?.description ??
            "Yashfaa Clinic laboratoriya tahlili haqida batafsil ma'lumot.",
        },
        {
          property: "og:title",
          content: `${test?.name ?? "Tahlil"} — Yashfaa Clinic`,
        },
        {
          property: "og:description",
          content:
            test?.description ??
            "Laboratoriya tahlili haqida batafsil ma'lumot.",
        },
      ],
    };
  },
  loader: async ({ params }) => {
    return getTestBySlug({ data: { slug: params.slug } });
  },
  component: TestDetailPage,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="px-4 py-16 text-center">
        <FlaskConical className="mx-auto h-12 w-12 text-muted-foreground/30" />
        <h2 className="mt-4 text-2xl font-bold">Tahlil topilmadi</h2>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/tests">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tahlillar ro'yxati
            </Button>
          </Link>
          <Button
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            Qayta urinish
          </Button>
        </div>
      </div>
    );
  },
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

function TestDetailPage() {
  const test = Route.useLoaderData();

  return (
    <section className="px-4 py-8 md:py-12">
      <div className="mx-auto max-w-3xl">
        {/* Breadcrumb */}
        <Link
          to="/tests"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Tahlillar ro'yxati
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {test.categories?.name && (
              <Badge variant="outline">{test.categories.name}</Badge>
            )}
            {test.is_recommended && (
              <Badge variant="secondary" className="gap-1">
                <Star className="h-3 w-3 fill-current" /> Tavsiya etiladi
              </Badge>
            )}
            {test.is_urgent && (
              <Badge variant="outline" className="gap-1">
                <Zap className="h-3 w-3" /> Tezkor natija
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {test.name}
          </h1>
        </div>

        {/* Info Cards */}
        <div className="space-y-4">
          {/* Description */}
          {test.description && (
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-2 text-lg font-semibold">Tahlil haqida</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {test.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Quick Info Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {test.biomaterial_type && (
              <Card>
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <FlaskConical className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Biomaterial</p>
                    <p className="font-medium">{test.biomaterial_type}</p>
                  </div>
                </CardContent>
              </Card>
            )}
            {test.result_time && (
              <Card>
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Natija vaqti
                    </p>
                    <p className="font-medium">{test.result_time}</p>
                  </div>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardContent className="flex items-start gap-3 p-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Qayerda</p>
                  <p className="font-medium">Klinikada topshiriladi</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preparation */}
          {test.preparation_requirements && (
            <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div>
                    <h2 className="mb-1 font-semibold text-amber-900 dark:text-amber-200">
                      Tayyorgarlik talablari
                    </h2>
                    <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                      {test.preparation_requirements}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* CTA Block */}
        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardContent className="p-6 md:p-8 text-center">
            <h2 className="text-xl font-bold md:text-2xl">
              Tahlilga yozilish
            </h2>
            <p className="mt-2 text-muted-foreground">
              Batafsil ma'lumot va yozilish uchun mutaxassisimiz bilan
              bog'laning
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
                href="https://wa.me/998711234567"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-green-600 bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700 sm:w-auto"
              >
                <MessageCircle className="h-5 w-5" />
                WhatsApp orqali yozish
              </a>
              <a
                href="tel:+998711234567"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border px-6 py-3 font-medium transition-colors hover:bg-muted sm:w-auto"
              >
                <Phone className="h-5 w-5" />
                Murojaat qiling
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
