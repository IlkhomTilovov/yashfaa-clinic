import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, CheckCircle2, Loader2 } from "lucide-react";
import { getDoctors, createAppointment, getCategories, getActiveServices } from "@/lib/server-functions";
import { useLang, getLocalizedField } from "@/hooks/useLang";
import { ET } from "@/components/ET";
import { buildMeta } from "@/lib/seo";

export const Route = createFileRoute("/$lang/appointment")({
  validateSearch: (search: Record<string, unknown>) => ({
    doctor_id: typeof search.doctor_id === "string" ? search.doctor_id : undefined,
  }),
  head: ({ params }) => {
    const isRu = params.lang === "ru";
    const lang = (params.lang === "ru" ? "ru" : "uz") as "uz" | "ru";
    const title = isRu
      ? "Онлайн запись на приём — Yashfaa Clinic в Ташкенте"
      : "Onlayn qabulga yozilish — Toshkentdagi Yashfaa Clinic";
    const description = isRu
      ? "Запишитесь на приём к врачам Yashfaa Clinic онлайн за минуту. Удобное время, опытные специалисты, доступные цены в Ташкенте."
      : "Yashfaa Clinic shifokorlariga onlayn qabulga bir daqiqada yoziling. Qulay vaqt, tajribali mutaxassislar, Toshkentda hamyonbop narxlar.";
    return { meta: buildMeta({ title, description, pathWithoutLang: "/appointment", lang }) };
  },
  loader: async () => {
    const [doctors, categories, services] = await Promise.all([
      getDoctors(),
      getCategories(),
      getActiveServices(),
    ]);
    return { doctors, categories, services };
  },
  component: AppointmentPage,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    const { t } = useTranslation();
    return (
      <div className="px-4 py-16 text-center">
        <h2 className="text-2xl font-bold">{t("common.error")}</h2>
        <p className="mt-2 text-muted-foreground">Ma{error.message}#39;lumotni yuklashda xatolik. Iltimos, sahifani yangilang.</p>
        <Button className="mt-4" onClick={() => { router.invalidate(); reset(); }}>{t("common.retry")}</Button>
      </div>
    );
  },
  pendingComponent: () => (
    <section className="px-4 py-16"><div className="mx-auto max-w-2xl space-y-4"><Skeleton className="mx-auto h-10 w-64" /><Skeleton className="h-96 w-full rounded-xl" /></div></section>
  ),
});

const DEFAULT_START = "09:00";
const DEFAULT_END = "14:00";

function generateTimeSlots(start: string, end: string, stepMin = 30): string[] {
  const toMin = (s: string) => {
    const [h, m] = s.split(":").map(Number);
    return h * 60 + (m || 0);
  };
  const fmt = (n: number) => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
  const s = toMin(start);
  const e = toMin(end);
  if (isNaN(s) || isNaN(e) || e <= s) return [];
  const out: string[] = [];
  for (let t = s; t <= e; t += stepMin) out.push(fmt(t));
  return out;
}

function parseSchedule(schedule?: string | null): { start: string; end: string } {
  const m = (schedule || "").match(/(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})/);
  return { start: m?.[1] ?? DEFAULT_START, end: m?.[2] ?? DEFAULT_END };
}

function AppointmentPage() {
  const { doctors, services } = Route.useLoaderData();
  const lang = useLang();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const search = Route.useSearch();
  const [form, setForm] = useState({ patient_name: "", phone: "", doctor_id: "", service: "", date: "", time: "" });

  useEffect(() => {
    if (search.doctor_id && doctors.some((d: any) => d.id === search.doctor_id)) {
      setForm((f) => (f.doctor_id === search.doctor_id ? f : { ...f, doctor_id: search.doctor_id!, service: "", time: "" }));
    }
  }, [search.doctor_id, doctors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createAppointment({ data: form });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <section className="px-4 py-16">
        <div className="mx-auto max-w-lg text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-primary" />
          <h2 className="mt-4 text-2xl font-bold">
            <ET k="appointment.success_title" t="appointment_page.success_title" />
          </h2>
          <p className="mt-2 text-muted-foreground">
            <ET k="appointment.success_message" t="appointment_page.success_message" multiline />
          </p>
        </div>
      </section>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const selectedDoctor = doctors.find((d: any) => d.id === form.doctor_id);
  const doctorServiceNames: string[] = selectedDoctor?.services_offered ?? [];
  const doctorServices = doctorServiceNames.length
    ? services.filter((s: any) => {
        const nm = (s.name_uz || s.name || "").trim().toLowerCase();
        return doctorServiceNames.some((n) => n.trim().toLowerCase() === nm);
      })
    : [];
  const doctorSchedule = parseSchedule(selectedDoctor?.schedule);
  const timeSlots = selectedDoctor ? generateTimeSlots(doctorSchedule.start, doctorSchedule.end) : [];
  const scheduleHint = selectedDoctor
    ? (lang === "ru"
        ? `Пн–Сб: ${doctorSchedule.start}–${doctorSchedule.end} (воскресенье — выходной)`
        : `Dush–Shan: ${doctorSchedule.start}–${doctorSchedule.end} (yakshanba — dam olish kuni)`)
    : (lang === "ru" ? "Сначала выберите врача" : "Avval shifokorni tanlang");

  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold md:text-4xl">
            <ET k="appointment.title" t="appointment_page.title" />
          </h1>
          <p className="mt-3 text-muted-foreground">
            <ET k="appointment.subtitle" t="appointment_page.subtitle" multiline />
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" />
              <ET k="appointment.form_title" t="appointment_page.form_title" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">{t("appointment_page.full_name")}</Label>
                <Input id="name" required placeholder={t("appointment_page.name_placeholder")} value={form.patient_name} onChange={(e) => setForm({ ...form, patient_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t("appointment_page.phone")}</Label>
                <Input id="phone" required type="tel" placeholder={t("appointment_page.phone_placeholder")} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t("appointment_page.doctor")}</Label>
                <Select value={form.doctor_id} onValueChange={(v) => setForm({ ...form, doctor_id: v, service: "", time: "" })} required>
                  <SelectTrigger><SelectValue placeholder={t("appointment_page.select_doctor")} /></SelectTrigger>
                  <SelectContent>
                    {doctors.map((d: any) => (
                      <SelectItem key={d.id} value={d.id}>{getLocalizedField(d, "name", lang)} — {getLocalizedField(d, "specialization", lang)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("appointment_page.service_type")}</Label>
                <Select value={form.service} onValueChange={(v) => setForm({ ...form, service: v })} required disabled={!form.doctor_id}>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !form.doctor_id
                        ? (lang === "ru" ? "Сначала выберите врача" : "Avval shifokorni tanlang")
                        : doctorServices.length === 0
                          ? (lang === "ru" ? "У врача нет услуг" : "Shifokorda xizmatlar yo'q")
                          : t("appointment_page.select_service")
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {doctorServices.map((s: any) => {
                      const name = getLocalizedField(s, "name", lang);
                      return <SelectItem key={s.id} value={name}>{name}</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">{t("appointment_page.date")}</Label>
                  <Input id="date" required type="date" min={today} value={form.date} onChange={(e) => {
                    const v = e.target.value;
                    if (v && new Date(v).getDay() === 0) {
                      setError(lang === "ru" ? "Воскресенье — выходной день" : "Yakshanba — dam olish kuni");
                      setForm({ ...form, date: "" });
                      return;
                    }
                    setError("");
                    setForm({ ...form, date: v });
                  }} />
                  <p className="text-xs text-muted-foreground">{scheduleHint}</p>
                </div>
                <div className="space-y-2">
                  <Label>{t("appointment_page.time")}</Label>
                  <Select value={form.time} onValueChange={(v) => setForm({ ...form, time: v })} required disabled={!selectedDoctor}>
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !selectedDoctor
                          ? (lang === "ru" ? "Сначала выберите врача" : "Avval shifokorni tanlang")
                          : t("appointment_page.select_time")
                      } />
                    </SelectTrigger>
                    <SelectContent>{timeSlots.map((tm) => (<SelectItem key={tm} value={tm}>{tm}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <ET k="appointment.submit" t="appointment_page.submit" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
