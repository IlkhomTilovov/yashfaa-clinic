import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getDoctors } from "@/lib/server-functions";
import { useLang, getLocalizedField } from "@/hooks/useLang";

export const Route = createFileRoute("/$lang/doctors/")({
  head: ({ params }) => {
    const isRu = params.lang === "ru";
    return {
      meta: [
        { title: isRu ? "Врачи — Yashfaa Clinic" : "Shifokorlar — Yashfaa Clinic" },
        { name: "description", content: isRu ? "Врачи Yashfaa Clinic — опытная команда специалистов." : "Yashfaa Clinic shifokorlari — tajribali mutaxassislar jamoasi." },
        { rel: "alternate", hrefLang: "uz", href: "/uz/doctors" },
        { rel: "alternate", hrefLang: "ru", href: "/ru/doctors" },
      ],
    };
  },
  loader: () => getDoctors(),
  component: DoctorsPage,
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
  pendingComponent: () => (
    <section className="px-4 py-16"><div className="mx-auto max-w-7xl"><Skeleton className="mx-auto h-10 w-48" /><div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => (<div key={i} className="space-y-3"><Skeleton className="aspect-square w-full rounded-xl" /><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /></div>))}</div></div></section>
  ),
});

function DoctorsPage() {
  const doctors = Route.useLoaderData();
  const lang = useLang();
  const { t } = useTranslation();

  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold md:text-4xl">{t("pages.doctors_title")}</h1>
          <p className="mt-3 text-muted-foreground">{t("pages.doctors_subtitle")}</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {doctors.map((doc: any) => (
            <Link key={doc.id} to="/$lang/doctors/$doctorId" params={{ lang, doctorId: doc.id }}>
              <Card className="group h-full overflow-hidden transition-shadow hover:shadow-lg">
                <div className="aspect-square overflow-hidden">
                  <img src={doc.image_url || "/placeholder.svg"} alt={getLocalizedField(doc, "name", lang)} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                </div>
                <CardContent className="p-5">
                  <h3 className="font-semibold">{getLocalizedField(doc, "name", lang)}</h3>
                  <p className="mt-1 text-sm text-primary">{getLocalizedField(doc, "specialization", lang)}</p>
                  <Button variant="outline" size="sm" className="mt-3 w-full">{t("pages.detail")}</Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
