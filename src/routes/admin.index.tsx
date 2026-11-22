import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Stethoscope,
  FlaskConical,
  CalendarCheck,
  FolderOpen,
  Briefcase,
  TrendingUp,
  Clock,
  Phone,
  ArrowRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { adminGetDashboardStats } from "@/lib/admin-server-functions";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

interface Stats {
  doctors: number;
  tests: number;
  categories: number;
  appointments: number;
  services: number;
  todayAppointments: number;
}

interface RecentAppointment {
  id: string;
  patient_name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  status: string;
  created_at: string;
  doctors?: { name: string } | null;
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  new: { label: "Yangi", variant: "default" },
  confirmed: { label: "Tasdiqlangan", variant: "secondary" },
  completed: { label: "Bajarilgan", variant: "outline" },
  canceled: { label: "Bekor qilingan", variant: "destructive" },
};

function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<RecentAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { stats: s, recentAppointments: recent } = await adminGetDashboardStats();
        setStats(s);
        setRecentAppointments(recent as RecentAppointment[]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const statCards = [
    { title: "Shifokorlar", count: stats?.doctors ?? 0, icon: Stethoscope, color: "text-blue-600 bg-blue-50", to: "/admin/doctors" as const },
    { title: "Tahlillar", count: stats?.tests ?? 0, icon: FlaskConical, color: "text-emerald-600 bg-emerald-50", to: "/admin/tests" as const },
    { title: "Kategoriyalar", count: stats?.categories ?? 0, icon: FolderOpen, color: "text-amber-600 bg-amber-50", to: "/admin/categories" as const },
    { title: "Xizmatlar", count: stats?.services ?? 0, icon: Briefcase, color: "text-purple-600 bg-purple-50", to: "/admin/services" as const },
    { title: "Uchrashuvlar", count: stats?.appointments ?? 0, icon: CalendarCheck, color: "text-rose-600 bg-rose-50", to: "/admin/appointments" as const },
    { title: "Bugungi uchrashuvlar", count: stats?.todayAppointments ?? 0, icon: TrendingUp, color: "text-cyan-600 bg-cyan-50", to: "/admin/appointments" as const },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Yashfaa Clinic umumiy ko'rinishi</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {statCards.map((s) => (
          <Link key={s.title} to={s.to}>
            <Card className="group cursor-pointer border-0 shadow-sm transition-all hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.color}`}>
                  <s.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{s.title}</p>
                  <p className="text-2xl font-bold">{s.count}</p>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Appointments */}
      <Card className="border-0 shadow-sm">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="font-semibold">So'nggi uchrashuvlar</h2>
            <p className="text-xs text-muted-foreground">Oxirgi 5 ta uchrashuv</p>
          </div>
          <Link to="/admin/appointments" className="text-xs font-medium text-primary hover:underline">
            Barchasini ko'rish →
          </Link>
        </div>
        <CardContent className="p-0">
          {recentAppointments.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <CalendarCheck className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">Hali uchrashuvlar yo'q</p>
            </div>
          ) : (
            <div className="divide-y">
              {recentAppointments.map((apt) => {
                const s = statusMap[apt.status] ?? statusMap.new;
                return (
                  <div key={apt.id} className="flex items-center gap-4 px-6 py-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {apt.patient_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-medium">{apt.patient_name}</p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" /> {apt.phone}
                        <span className="text-border">|</span>
                        <Clock className="h-3 w-3" /> {apt.date} {apt.time}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {apt.doctors?.name && (
                        <span className="hidden text-xs text-muted-foreground sm:block">{apt.doctors.name}</span>
                      )}
                      <Badge variant={s.variant}>{s.label}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
