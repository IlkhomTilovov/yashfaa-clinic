import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Trash2, Search, CalendarCheck, Phone, Calendar, Clock, Eye } from "lucide-react";
import { toast } from "sonner";

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
  status: string;
  notes: string | null;
  created_at: string;
  doctor_id: string | null;
  doctors?: { name: string } | null;
}

const statusOptions = [
  { value: "new", label: "Yangi", variant: "default" as const },
  { value: "confirmed", label: "Tasdiqlangan", variant: "secondary" as const },
  { value: "completed", label: "Bajarilgan", variant: "outline" as const },
  { value: "canceled", label: "Bekor qilingan", variant: "destructive" as const },
];

function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<Appointment | null>(null);

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
    const interval = setInterval(fetchAppointments, 30000);
    return () => clearInterval(interval);
  }, [fetchAppointments]);

  const filtered = useMemo(() => {
    let result = appointments;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a =>
        a.patient_name.toLowerCase().includes(q) || a.phone.includes(q)
      );
    }
    if (filterStatus !== "all") {
      result = result.filter(a => a.status === filterStatus);
    }
    if (filterDate) {
      result = result.filter(a => a.date === filterDate);
    }
    return result;
  }, [appointments, search, filterStatus, filterDate]);

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) toast.error("Xatolik: " + error.message);
    else {
      toast.success("Status yangilandi");
      fetchAppointments();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("appointments").delete().eq("id", deleteId);
    if (error) toast.error("Xatolik: " + error.message);
    else { toast.success("Uchrashuv o'chirildi"); fetchAppointments(); }
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Uchrashuvlar</h1>
          <p className="text-sm text-muted-foreground">{appointments.length} ta uchrashuv</p>
        </div>
        <Badge variant="secondary" className="text-sm">{filtered.length} ta ko'rsatilmoqda</Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Ism yoki telefon..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barchasi</SelectItem>
            {statusOptions.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-40" />
        {filterDate && (
          <Button variant="ghost" size="sm" onClick={() => setFilterDate("")}>Tozalash</Button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed py-16 text-center">
          <CalendarCheck className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <h3 className="mt-4 font-semibold">Uchrashuvlar topilmadi</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {search || filterStatus !== "all" || filterDate ? "Filtr natijasi topilmadi" : "Hali uchrashuvlar yo'q"}
          </p>
        </div>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="divide-y">
              {filtered.map((apt) => {
                const statusInfo = statusOptions.find(s => s.value === apt.status) ?? statusOptions[0];
                return (
                  <div key={apt.id} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {apt.patient_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate font-semibold">{apt.patient_name}</p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{apt.phone}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{apt.date}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{apt.time}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <Badge variant="outline" className="text-[10px]">{apt.service}</Badge>
                        {apt.doctors?.name && <Badge variant="secondary" className="text-[10px]">{apt.doctors.name}</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={apt.status} onValueChange={(v) => handleStatusChange(apt.id, v)}>
                        <SelectTrigger className="h-8 w-32 text-xs">
                          <Badge variant={statusInfo.variant} className="text-[10px]">{statusInfo.label}</Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewItem(apt)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(apt.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Dialog */}
      <Dialog open={!!viewItem} onOpenChange={(o) => !o && setViewItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uchrashuv tafsilotlari</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Bemor:</span> <strong>{viewItem.patient_name}</strong></div>
                <div><span className="text-muted-foreground">Telefon:</span> <strong>{viewItem.phone}</strong></div>
                <div><span className="text-muted-foreground">Xizmat:</span> <strong>{viewItem.service}</strong></div>
                <div><span className="text-muted-foreground">Shifokor:</span> <strong>{viewItem.doctors?.name ?? "—"}</strong></div>
                <div><span className="text-muted-foreground">Sana:</span> <strong>{viewItem.date}</strong></div>
                <div><span className="text-muted-foreground">Vaqt:</span> <strong>{viewItem.time}</strong></div>
                <div><span className="text-muted-foreground">Status:</span> <Badge variant={statusOptions.find(s => s.value === viewItem.status)?.variant ?? "default"} className="ml-1">
                  {statusOptions.find(s => s.value === viewItem.status)?.label}
                </Badge></div>
                <div><span className="text-muted-foreground">Yaratilgan:</span> <strong>{new Date(viewItem.created_at).toLocaleString("uz-UZ")}</strong></div>
              </div>
              {viewItem.notes && (
                <div className="rounded-lg bg-muted/50 p-3 text-sm">
                  <span className="text-muted-foreground">Eslatma:</span> {viewItem.notes}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Uchrashuvni o'chirish</AlertDialogTitle>
            <AlertDialogDescription>Bu amalni ortga qaytarib bo'lmaydi.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">O'chirish</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
