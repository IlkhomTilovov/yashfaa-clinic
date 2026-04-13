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
import { Separator } from "@/components/ui/separator";
import { Trash2, Search, CalendarCheck, Phone, Calendar, Clock, Eye, User, Stethoscope, FileText, CheckCircle2, XCircle, AlertCircle, CircleDot, Filter, RotateCcw } from "lucide-react";
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
  { value: "new", label: "Yangi", color: "bg-blue-100 text-blue-700 border-blue-200", icon: CircleDot, dotColor: "bg-blue-500" },
  { value: "confirmed", label: "Tasdiqlangan", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2, dotColor: "bg-emerald-500" },
  { value: "completed", label: "Bajarilgan", color: "bg-violet-100 text-violet-700 border-violet-200", icon: CheckCircle2, dotColor: "bg-violet-500" },
  { value: "canceled", label: "Bekor qilingan", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle, dotColor: "bg-red-500" },
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

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: appointments.length };
    statusOptions.forEach(s => { counts[s.value] = 0; });
    appointments.forEach(a => { if (counts[a.status] !== undefined) counts[a.status]++; });
    return counts;
  }, [appointments]);

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

  const hasFilters = search || filterStatus !== "all" || filterDate;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("uz-UZ", { day: "numeric", month: "short", year: "numeric" });
    } catch { return dateStr; }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Uchrashuvlar</h1>
          <p className="mt-1 text-sm text-muted-foreground">Barcha uchrashuvlarni boshqaring va kuzating</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAppointments} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Yangilash
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <button
          onClick={() => setFilterStatus("all")}
          className={`rounded-xl border p-3.5 text-left transition-all hover:shadow-sm ${filterStatus === "all" ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card"}`}
        >
          <p className="text-xs font-medium text-muted-foreground">Jami</p>
          <p className="mt-1 text-2xl font-bold">{statusCounts.all}</p>
        </button>
        {statusOptions.map(s => (
          <button
            key={s.value}
            onClick={() => setFilterStatus(filterStatus === s.value ? "all" : s.value)}
            className={`rounded-xl border p-3.5 text-left transition-all hover:shadow-sm ${filterStatus === s.value ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card"}`}
          >
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${s.dotColor}`} />
              <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
            </div>
            <p className="mt-1 text-2xl font-bold">{statusCounts[s.value] ?? 0}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card className="border shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Filter className="h-4 w-4" />
              Filtr
            </div>
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Ism yoki telefon qidirish..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-44" />
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setFilterStatus("all"); setFilterDate(""); }} className="gap-1.5 text-muted-foreground">
                <XCircle className="h-3.5 w-3.5" />
                Tozalash
              </Button>
            )}
            <div className="ml-auto">
              <Badge variant="secondary" className="text-xs">{filtered.length} ta natija</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <CalendarCheck className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Uchrashuvlar topilmadi</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {hasFilters ? "Filtr natijasi topilmadi. Filtrni o'zgartiring." : "Hali uchrashuvlar yo'q"}
            </p>
            {hasFilters && (
              <Button variant="outline" size="sm" className="mt-4" onClick={() => { setSearch(""); setFilterStatus("all"); setFilterDate(""); }}>
                Filtrni tozalash
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((apt) => {
            const statusInfo = statusOptions.find(s => s.value === apt.status) ?? statusOptions[0];
            const StatusIcon = statusInfo.icon;
            return (
              <Card key={apt.id} className="group border shadow-sm transition-all hover:shadow-md">
                <CardContent className="p-0">
                  <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                    {/* Avatar */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-base font-bold text-primary">
                      {apt.patient_name.charAt(0).toUpperCase()}
                    </div>

                    {/* Main Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-base font-semibold">{apt.patient_name}</p>
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusInfo.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5" />
                          {apt.phone}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(apt.date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {apt.time}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Badge variant="outline" className="text-xs font-normal">
                          <Stethoscope className="mr-1 h-3 w-3" />
                          {apt.service}
                        </Badge>
                        {apt.doctors?.name && (
                          <Badge variant="secondary" className="text-xs font-normal">
                            <User className="mr-1 h-3 w-3" />
                            {apt.doctors.name}
                          </Badge>
                        )}
                        {apt.notes && (
                          <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                            <FileText className="mr-1 h-3 w-3" />
                            Eslatma bor
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-2">
                      <Select value={apt.status} onValueChange={(v) => handleStatusChange(apt.id, v)}>
                        <SelectTrigger className="h-9 w-40 text-xs">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((s) => {
                            const Icon = s.icon;
                            return (
                              <SelectItem key={s.value} value={s.value}>
                                <span className="flex items-center gap-2">
                                  <span className={`h-2 w-2 rounded-full ${s.dotColor}`} />
                                  {s.label}
                                </span>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setViewItem(apt)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => setDeleteId(apt.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={!!viewItem} onOpenChange={(o) => !o && setViewItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
              Uchrashuv tafsilotlari
            </DialogTitle>
          </DialogHeader>
          {viewItem && (() => {
            const statusInfo = statusOptions.find(s => s.value === viewItem.status) ?? statusOptions[0];
            const StatusIcon = statusInfo.icon;
            return (
              <div className="space-y-4 pt-2">
                {/* Patient Header */}
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                    {viewItem.patient_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{viewItem.patient_name}</p>
                    <p className="text-sm text-muted-foreground">{viewItem.phone}</p>
                  </div>
                </div>

                <Separator />

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-xs font-medium text-muted-foreground">Xizmat</p>
                    <p className="mt-1 text-sm font-semibold">{viewItem.service}</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-xs font-medium text-muted-foreground">Shifokor</p>
                    <p className="mt-1 text-sm font-semibold">{viewItem.doctors?.name ?? "—"}</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-xs font-medium text-muted-foreground">Sana</p>
                    <p className="mt-1 text-sm font-semibold">{formatDate(viewItem.date)}</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-xs font-medium text-muted-foreground">Vaqt</p>
                    <p className="mt-1 text-sm font-semibold">{viewItem.time}</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-xs font-medium text-muted-foreground">Status</p>
                    <span className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${statusInfo.color}`}>
                      <StatusIcon className="h-3 w-3" />
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-xs font-medium text-muted-foreground">Yaratilgan</p>
                    <p className="mt-1 text-sm font-semibold">{new Date(viewItem.created_at).toLocaleDateString("uz-UZ")}</p>
                  </div>
                </div>

                {viewItem.notes && (
                  <div className="rounded-lg border border-dashed p-3">
                    <p className="mb-1 text-xs font-medium text-muted-foreground">📝 Eslatma</p>
                    <p className="text-sm">{viewItem.notes}</p>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-center">Uchrashuvni o'chirish</AlertDialogTitle>
            <AlertDialogDescription className="text-center">Bu amalni ortga qaytarib bo'lmaydi. Uchrashuv ma'lumotlari butunlay o'chiriladi.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">O'chirish</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
