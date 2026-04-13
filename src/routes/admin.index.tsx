import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, FlaskConical, CalendarCheck, FolderOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [stats, setStats] = useState({ doctors: 0, tests: 0, categories: 0, appointments: 0 });

  useEffect(() => {
    async function fetchStats() {
      const [d, t, c, a] = await Promise.all([
        supabase.from("doctors").select("id", { count: "exact", head: true }),
        supabase.from("tests").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("appointments").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        doctors: d.count ?? 0,
        tests: t.count ?? 0,
        categories: c.count ?? 0,
        appointments: a.count ?? 0,
      });
    }
    fetchStats();
  }, []);

  const cards = [
    { title: "Shifokorlar", count: stats.doctors, icon: Stethoscope },
    { title: "Tahlillar", count: stats.tests, icon: FlaskConical },
    { title: "Kategoriyalar", count: stats.categories, icon: FolderOpen },
    { title: "Uchrashuvlar", count: stats.appointments, icon: CalendarCheck },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
              <c.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{c.count}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
