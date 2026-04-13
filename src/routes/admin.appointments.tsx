import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Phone, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/appointments")({
  component: AdminAppointmentsPage,
});

interface Appointment {
  id: string;
  patient_name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  created_at: string;
  doctor_id: string | null;
  doctors?: { name: string } | null;
}

function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("appointments")
      .select("*, doctors(name)")
      .order("created_at", { ascending: false });
    setAppointments((data as Appointment[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAppointments();

    // Realtime subscription
    const channel = supabase
      .channel("admin-appointments")
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, () => {
        fetchAppointments();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchAppointments]);

  const handleDelete = async (id: string) => {
    if (!confirm("Uchrashuvni o'chirmoqchimisiz?")) return;
    await supabase.from("appointments").delete().eq("id", id);
    fetchAppointments();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Uchrashuvlar</h1>
        <Badge variant="secondary">{appointments.length} ta</Badge>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Yuklanmoqda...</p>
      ) : appointments.length === 0 ? (
        <p className="text-muted-foreground">Uchrashuvlar topilmadi</p>
      ) : (
        <div className="space-y-3">
          {appointments.map((apt) => (
            <Card key={apt.id}>
              <CardContent className="px-5 py-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{apt.patient_name}</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" /> {apt.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> {apt.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {apt.time}
                      </span>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Badge variant="outline">{apt.service}</Badge>
                      {apt.doctors?.name && (
                        <Badge variant="secondary">{apt.doctors.name}</Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(apt.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
