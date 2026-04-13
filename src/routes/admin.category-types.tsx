import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Loader2, Layers, FlaskConical, Microscope, Sparkles, Heart, Package, FolderOpen, Stethoscope } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/category-types")({
  component: AdminCategoryTypesPage,
});

interface CategoryType {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  created_at: string;
}

const ICON_OPTIONS = [
  { value: "flask", label: "Laboratoriya", icon: FlaskConical },
  { value: "microscope", label: "Mikroskop", icon: Microscope },
  { value: "heart", label: "Yurak", icon: Heart },
  { value: "sparkles", label: "Kosmetologiya", icon: Sparkles },
  { value: "stethoscope", label: "Stetoskop", icon: Stethoscope },
  { value: "package", label: "Paket", icon: Package },
  { value: "folder", label: "Papka", icon: FolderOpen },
];

function getIconComponent(iconName: string | null) {
  const found = ICON_OPTIONS.find((i) => i.value === iconName);
  return found ? found.icon : Layers;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

interface FormData {
  name: string;
  slug: string;
  icon: string;
}

const emptyForm: FormData = { name: "", slug: "", icon: "" };

function AdminCategoryTypesPage() {
  const [types, setTypes] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryType | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({ ...emptyForm });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugManual, setSlugManual] = useState(false);

  const fetchTypes = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("category_types").select("*").order("created_at");
    setTypes((data ?? []) as CategoryType[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchTypes(); }, [fetchTypes]);

  useEffect(() => {
    if (!slugManual && form.name && dialogOpen) {
      setForm((prev) => ({ ...prev, slug: generateSlug(prev.name) }));
    }
  }, [form.name, slugManual, dialogOpen]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setErrors({});
    setSlugManual(false);
    setDialogOpen(true);
  };

  const openEdit = (t: CategoryType) => {
    setEditing(t);
    setForm({ name: t.name, slug: t.slug, icon: t.icon ?? "" });
    setErrors({});
    setSlugManual(true);
    setDialogOpen(true);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Nomi kiritilishi shart";
    if (!form.slug.trim()) e.slug = "Slug kiritilishi shart";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      icon: form.icon || null,
    };
    const { error } = editing
      ? await supabase.from("category_types").update(payload).eq("id", editing.id)
      : await supabase.from("category_types").insert(payload);

    if (error) toast.error("Xatolik: " + error.message);
    else {
      toast.success(editing ? "Tur yangilandi" : "Yangi tur qo'shildi");
      setDialogOpen(false);
      fetchTypes();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("category_types").delete().eq("id", deleteId);
    if (error) toast.error("Xatolik: " + error.message);
    else { toast.success("Tur o'chirildi"); fetchTypes(); }
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kategoriya turlari</h1>
          <p className="text-sm text-muted-foreground">{types.length} ta tur</p>
        </div>
        <Button onClick={openCreate} className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" /> Yangi tur
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
      ) : types.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed py-16 text-center">
          <Layers className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <h3 className="mt-4 font-semibold">Turlar topilmadi</h3>
          <p className="mt-1 text-sm text-muted-foreground">Birinchi turni qo'shing</p>
          <Button onClick={openCreate} variant="outline" className="mt-4 gap-2">
            <Plus className="h-4 w-4" /> Qo'shish
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {types.map((t) => {
            const IconComp = getIconComponent(t.icon);
            return (
              <Card key={t.id} className="border-0 shadow-sm transition-all hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <IconComp className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{t.name}</h3>
                        <p className="font-mono text-xs text-muted-foreground">/{t.slug}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(t)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(t.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Turni tahrirlash" : "Yangi tur qo'shish"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-sm">Nomi <span className="text-destructive">*</span></Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Laboratoriya"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Slug <span className="text-destructive">*</span></Label>
              <Input
                value={form.slug}
                onChange={(e) => { setSlugManual(true); setForm({ ...form, slug: e.target.value }); }}
                placeholder="laboratoriya"
                className={`font-mono text-sm ${errors.slug ? "border-destructive" : ""}`}
              />
              {errors.slug && <p className="text-xs text-destructive">{errors.slug}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Icon</Label>
              <Select value={form.icon || "none"} onValueChange={(v) => setForm({ ...form, icon: v === "none" ? "" : v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Tanlanmagan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tanlanmagan</SelectItem>
                  {ICON_OPTIONS.map((ic) => {
                    const Ic = ic.icon;
                    return (
                      <SelectItem key={ic.value} value={ic.value}>
                        <span className="flex items-center gap-2">
                          <Ic className="h-4 w-4" /> {ic.label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSave} disabled={saving || !form.name.trim()} className="w-full">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Saqlash" : "Qo'shish"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Turni o'chirish</AlertDialogTitle>
            <AlertDialogDescription>Bu amalni ortga qaytarib bo'lmaydi. Ushbu turga bog'langan kategoriyalar ta'sirlanishi mumkin.</AlertDialogDescription>
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
