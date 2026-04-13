import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, CheckCircle2, Loader2 } from "lucide-react";
import { getDoctors } from "@/lib/server-functions";
import { createAppointment } from "@/lib/server-functions";

export const Route = createFileRoute("/appointment")({
  head: () => ({
    meta: [
      { title: "Qabulga yozilish — MedClinic" },
      { name: "description", content: "MedClinic onlayn qabulga yozilish. Shifokor va qulay vaqtni tanlang." },
      { property: "og:title", content: "Qabulga yozilish — MedClinic" },
      { property: "og:description", content: "Onlayn shifokorga yozilish. Qulay vaqtni tanlang." },
    ],
  }),
  loader: () => getDoctors(),
  component: AppointmentPage,
});

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
];

const serviceOptions = [
  "Umumiy ko'rik",
  "Laboratoriya tahlili",
  "UZI diagnostikasi",
  "EKG tekshiruvi",
  "Kosmetologiya",
  "Maslahat",
];

function AppointmentPage() {
  const doctors = Route.useLoaderData();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    patient_name: "",
    phone: "",
    doctor_id: "",
    service: "",
    date: "",
    time: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createAppointment({ data: form });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <section className="px-4 py-16">
        <div className="mx-auto max-w-lg text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-primary" />
          <h2 className="mt-4 text-2xl font-bold">Muvaffaqiyatli yuborildi!</h2>
          <p className="mt-2 text-muted-foreground">
            Sizning so'rovingiz qabul qilindi. Tez orada siz bilan bog'lanamiz.
          </p>
        </div>
      </section>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold md:text-4xl">Qabulga yozilish</h1>
          <p className="mt-3 text-muted-foreground">
            Qulay vaqtni tanlang va shifokor bilan uchrashuvingizni bron qiling
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Qabul ma'lumotlari
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">To'liq ism</Label>
                <Input
                  id="name"
                  required
                  placeholder="Ismingizni kiriting"
                  value={form.patient_name}
                  onChange={(e) => setForm({ ...form, patient_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefon raqam</Label>
                <Input
                  id="phone"
                  required
                  type="tel"
                  placeholder="+998 90 123 45 67"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Shifokor</Label>
                <Select
                  value={form.doctor_id}
                  onValueChange={(v) => setForm({ ...form, doctor_id: v })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Shifokorni tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name} — {d.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Xizmat turi</Label>
                <Select
                  value={form.service}
                  onValueChange={(v) => setForm({ ...form, service: v })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Xizmatni tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceOptions.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Sana</Label>
                  <Input
                    id="date"
                    required
                    type="date"
                    min={today}
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Vaqt</Label>
                  <Select
                    value={form.time}
                    onValueChange={(v) => setForm({ ...form, time: v })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Vaqtni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Yuborish
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
