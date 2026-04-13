import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar } from "lucide-react";
import { getDoctorById } from "@/lib/server-functions";

export const Route = createFileRoute("/doctors/$doctorId")({
  head: () => ({
    meta: [
      { title: "Shifokor — MedClinic" },
      { name: "description", content: "MedClinic shifokor profili." },
    ],
  }),
  loader: async ({ params }) => {
    try {
      return await getDoctorById({ data: { id: params.doctorId } });
    } catch {
      throw notFound();
    }
  },
  component: DoctorProfilePage,
  notFoundComponent: () => (
    <div className="px-4 py-16 text-center">
      <h2 className="text-2xl font-bold">Shifokor topilmadi</h2>
      <Link to="/doctors" className="mt-4 inline-block text-primary hover:underline">
        Shifokorlarga qaytish
      </Link>
    </div>
  ),
});

function DoctorProfilePage() {
  const doctor = Route.useLoaderData();

  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <Link to="/doctors" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Barcha shifokorlar
        </Link>
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col gap-8 md:flex-row">
              <div className="shrink-0">
                <img
                  src={doctor.image_url || "/placeholder.svg"}
                  alt={doctor.name}
                  className="h-64 w-64 rounded-xl object-cover"
                />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold md:text-3xl">{doctor.name}</h1>
                <p className="mt-2 text-lg text-primary">{doctor.specialization}</p>
                {doctor.bio && (
                  <p className="mt-4 text-muted-foreground">{doctor.bio}</p>
                )}
                <Button className="mt-6" size="lg" asChild>
                  <Link to="/appointment">
                    <Calendar className="mr-2 h-5 w-5" />
                    Qabulga yozilish
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
