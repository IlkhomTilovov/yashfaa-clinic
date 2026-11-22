import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { adminGetSiteContentRows, adminUpdateSiteContentRow } from "@/lib/admin-server-functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Save, Upload, ImageIcon, Type, BarChart3, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/content")({
  head: () => ({
    meta: [
      { title: "Sayt mazmuni — Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminContentPage,
});

type Row = {
  id: string;
  key: string;
  value_uz: string | null;
  value_ru: string | null;
  value_type: string;
  description: string | null;
};

const SECTIONS: { title: string; icon: any; keys: { key: string; label: string; multiline?: boolean }[] }[] = [
  {
    title: "Hero bo'limi",
    icon: Type,
    keys: [
      { key: "hero.title", label: "Sarlavha" },
      { key: "hero.subtitle", label: "Qisqa tavsif", multiline: true },
      { key: "hero.image", label: "Hero rasmi (URL)" },
    ],
  },
  {
    title: "Statistika (Trust indicators)",
    icon: BarChart3,
    keys: [
      { key: "stats.rating", label: "Reyting" },
      { key: "stats.doctors", label: "Shifokorlar soni" },
      { key: "stats.patients", label: "Bemorlar soni" },
      { key: "stats.tests_count", label: "Tahlil turlari" },
    ],
  },
  {
    title: "CTA bo'limi (sayt oxiridagi chaqiriq)",
    icon: MessageSquare,
    keys: [
      { key: "cta.title", label: "Sarlavha" },
      { key: "cta.subtitle", label: "Tavsif", multiline: true },
    ],
  },
];

function AdminContentPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminGetSiteContentRows();
      setRows(data as Row[]);
    } catch (err: any) {
      toast.error("Xatolik: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const update = (key: string, field: "value_uz" | "value_ru", val: string) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: val } : r)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const r of rows) {
        await adminUpdateSiteContentRow({ data: { id: r.id, value_uz: r.value_uz, value_ru: r.value_ru } });
      }
      toast.success("Sayt mazmuni saqlandi");
    } catch (e: any) {
      toast.error("Xatolik: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (key: string, file: File) => {
    setUploadingKey(key);
    try {
      const ext = file.name.split(".").pop();
      const path = `${key.replace(/\./g, "-")}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("site-images").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("site-images").getPublicUrl(path);
      update(key, "value_uz", pub.publicUrl);
      update(key, "value_ru", pub.publicUrl);
      // Persist immediately
      const row = rows.find((r) => r.key === key);
      if (row) {
        await adminUpdateSiteContentRow({ data: { id: row.id, value_uz: pub.publicUrl, value_ru: pub.publicUrl } });
      }
      toast.success("Rasm yuklandi");
    } catch (e: any) {
      toast.error("Yuklashda xatolik: " + e.message);
    } finally {
      setUploadingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  const byKey = (k: string) => rows.find((r) => r.key === k);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sayt mazmuni</h1>
          <p className="text-sm text-muted-foreground">Bosh sahifadagi matn va rasmlarni tahrirlang</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2 shadow-sm">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Hammasini saqlash
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {SECTIONS.map((section) => (
          <Card key={section.title} className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <section.icon className="h-4 w-4 text-primary" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {section.keys.map((field) => {
                const row = byKey(field.key);
                if (!row) return null;
                const isImage = row.value_type === "image" || field.key.includes("image");
                if (isImage) {
                  return (
                    <ImageField
                      key={field.key}
                      label={field.label}
                      url={row.value_uz ?? ""}
                      uploading={uploadingKey === field.key}
                      onUpload={(file) => handleImageUpload(field.key, file)}
                      onClear={() => {
                        update(field.key, "value_uz", "");
                        update(field.key, "value_ru", "");
                      }}
                    />
                  );
                }
                return (
                  <div key={field.key} className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {field.label}
                    </Label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <FieldInput
                        flag="🇺🇿"
                        value={row.value_uz ?? ""}
                        onChange={(v) => update(field.key, "value_uz", v)}
                        multiline={field.multiline}
                      />
                      <FieldInput
                        flag="🇷🇺"
                        value={row.value_ru ?? ""}
                        onChange={(v) => update(field.key, "value_ru", v)}
                        multiline={field.multiline}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function FieldInput({
  flag,
  value,
  onChange,
  multiline,
}: {
  flag: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-2.5 text-xs">{flag}</span>
      {multiline ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="pl-9"
        />
      ) : (
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="pl-9" />
      )}
    </div>
  );
}

function ImageField({
  label,
  url,
  uploading,
  onUpload,
  onClear,
}: {
  label: string;
  url: string;
  uploading: boolean;
  onUpload: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="flex items-start gap-4 rounded-xl border bg-muted/30 p-3">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-card">
          {url ? (
            <img src={url} alt="preview" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Rasm yuklash
            </Button>
            {url && (
              <Button type="button" size="sm" variant="ghost" onClick={onClear}>
                Tozalash
              </Button>
            )}
          </div>
          {url && <p className="break-all text-[11px] text-muted-foreground">{url}</p>}
        </div>
      </div>
    </div>
  );
}
