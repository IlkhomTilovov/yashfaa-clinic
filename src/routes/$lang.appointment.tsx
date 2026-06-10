import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, CheckCircle2, Loader2 } from "lucide-react";
import { getDoctors, createAppointment } from "@/lib/server-functions";
import { useLang, getLocalizedField } from "@/hooks/useLang";
import { ET } from "@/components/ET";
import { buildMeta } from "@/lib/seo";

export const Route = createFileRoute("/$lang/appointment")({
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
  loader: () => getDoctors(),
  component: AppointmentPage,
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
    <section className="px-4 py-16"><div className="mx-auto max-w-2xl space-y-4"><Skeleton className="mx-auto h-10 w-64" /><Skeleton className="h-96 w-full rounded-xl" /></div></section>
  ),
});

const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00"];

const serviceOptions = {
  uz: ["Umumiy ko'rik", "Laboratoriya tahlili", "UZI diagnostikasi", "EKG tekshiruvi", "Kosmetologiya", "Maslahat"],
  ru: ["Общий осмотр", "Лабораторный анализ", "УЗИ диагностика", "ЭКГ обследование", "Косметология", "Консультация"],
};

function AppointmentPage() {
  const doctors = Route.useLoaderData();
  const lang = useLang();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ patient_name: "", phone: "", doctor_id: "", service: "", date: "", time: "" });

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
  const currentServiceOptions = serviceOptions[lang] || serviceOptions.uz;

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
                <Select value={form.doctor_id} onValueChange={(v) => setForm({ ...form, doctor_id: v })} required>
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
                <Select value={form.service} onValueChange={(v) => setForm({ ...form, service: v })} required>
                  <SelectTrigger><SelectValue placeholder={t("appointment_page.select_service")} /></SelectTrigger>
                  <SelectContent>
                    {currentServiceOptions.map((s: string) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">{t("appointment_page.date")}</Label>
                  <Input id="date" required type="date" min={today} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{t("appointment_page.time")}</Label>
                  <Select value={form.time} onValueChange={(v) => setForm({ ...form, time: v })} required>
                    <SelectTrigger><SelectValue placeholder={t("appointment_page.select_time")} /></SelectTrigger>
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
