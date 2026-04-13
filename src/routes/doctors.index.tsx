import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDoctors } from "@/lib/server-functions";

export const Route = createFileRoute("/doctors")({
  head: () => ({
    meta: [
      { title: "Shifokorlar — MedClinic" },
      { name: "description", content: "MedClinic shifokorlari — tajribali mutaxassislar jamoasi." },
      { property: "og:title", content: "Shifokorlar — MedClinic" },
      { property: "og:description", content: "MedClinic shifokorlari — tajribali mutaxassislar jamoasi." },
    ],
  }),
  loader: () => getDoctors(),
  component: DoctorsPage,
});

function DoctorsPage() {
  const doctors = Route.useLoaderData();

  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold md:text-4xl">Shifokorlarimiz</h1>
          <p className="mt-3 text-muted-foreground">
            Tajribali va malakali shifokorlar jamoasi
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {doctors.map((doc) => (
            <Link
              key={doc.id}
              to="/doctors/$doctorId"
              params={{ doctorId: doc.id }}
            >
              <Card className="group h-full overflow-hidden transition-shadow hover:shadow-lg">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={doc.image_url || "/placeholder.svg"}
                    alt={doc.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <CardContent className="p-5">
                  <h3 className="font-semibold">{doc.name}</h3>
                  <p className="mt-1 text-sm text-primary">{doc.specialization}</p>
                  <Button variant="outline" size="sm" className="mt-3 w-full">
                    Batafsil
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
