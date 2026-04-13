import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Settings, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettingsPage,
});

interface ClinicSettings {
  id: string;
  clinic_name: string;
  logo_url: string | null;
  phone: string | null;
  address: string | null;
  telegram: string | null;
  working_hours: string | null;
  instagram: string | null;
  facebook: string | null;
  updated_at: string;
}

function AdminSettingsPage() {
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    clinic_name: "",
    logo_url: "",
    phone: "",
    address: "",
    telegram: "",
    working_hours: "",
    instagram: "",
    facebook: "",
  });

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("clinic_settings").select("*").limit(1).single();
    if (data) {
      const s = data as ClinicSettings;
      setSettings(s);
      setForm({
        clinic_name: s.clinic_name,
        logo_url: s.logo_url ?? "",
        phone: s.phone ?? "",
        address: s.address ?? "",
        telegram: s.telegram ?? "",
        working_hours: s.working_hours ?? "",
        instagram: s.instagram ?? "",
        facebook: s.facebook ?? "",
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    const { error } = await supabase.from("clinic_settings").update({
      clinic_name: form.clinic_name,
      logo_url: form.logo_url || null,
      phone: form.phone || null,
      address: form.address || null,
      telegram: form.telegram || null,
      working_hours: form.working_hours || null,
      instagram: form.instagram || null,
      facebook: form.facebook || null,
    }).eq("id", settings.id);

    if (error) toast.error("Xatolik: " + error.message);
    else toast.success("Sozlamalar saqlandi");
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sozlamalar</h1>
          <p className="text-sm text-muted-foreground">Klinika umumiy sozlamalari</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2 shadow-sm">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Saqlash
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* General */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="h-4 w-4 text-primary" />
              Umumiy ma'lumotlar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Klinika nomi</Label>
              <Input value={form.clinic_name} onChange={(e) => setForm({ ...form, clinic_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Logo URL</Label>
              <Input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Telefon raqam</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+998 71 123 45 67" />
            </div>
            <div className="space-y-2">
              <Label>Manzil</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Toshkent, O'zbekiston" />
            </div>
            <div className="space-y-2">
              <Label>Ish vaqti</Label>
              <Input value={form.working_hours} onChange={(e) => setForm({ ...form, working_hours: e.target.value })} placeholder="Dush-Shan: 8:00-20:00" />
            </div>
          </CardContent>
        </Card>

        {/* Social */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Ijtimoiy tarmoqlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Telegram</Label>
              <Input value={form.telegram} onChange={(e) => setForm({ ...form, telegram: e.target.value })} placeholder="@yashfaa_clinic" />
            </div>
            <div className="space-y-2">
              <Label>Instagram</Label>
              <Input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="https://instagram.com/..." />
            </div>
            <div className="space-y-2">
              <Label>Facebook</Label>
              <Input value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} placeholder="https://facebook.com/..." />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
