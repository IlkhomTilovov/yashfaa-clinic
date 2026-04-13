import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Loader2, FolderOpen, Star } from "lucide-react";
import { DynamicIcon } from "@/components/DynamicIcon";
import { IconPicker } from "@/components/IconPicker";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategoriesPage,
});

interface Category {
  id: string;
  name: string;
  type: string;
  type_id: string | null;
  created_at: string;
  slug: string | null;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_featured: boolean;
  is_active: boolean;
  parent_id: string | null;
}

interface CategoryTypeItem {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
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
  type: string;
  type_id: string;
  custom_type: string;
  slug: string;
  description: string;
  icon: string;
  sort_order: string;
  is_featured: boolean;
  is_active: boolean;
  parent_id: string;
}

const emptyForm: FormData = {
  name: "",
  type: "others",
  type_id: "",
  custom_type: "",
  slug: "",
  description: "",
  icon: "folder",
  sort_order: "0",
  is_featured: false,
  is_active: true,
  parent_id: "",
};

function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({ ...emptyForm });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugManual, setSlugManual] = useState(false);

  const [categoryTypes, setCategoryTypes] = useState<CategoryTypeItem[]>([]);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const [catRes, typesRes] = await Promise.all([
      supabase.from("categories").select("*").order("sort_order").order("name"),
      supabase.from("category_types").select("*").order("created_at"),
    ]);
    setCategories((catRes.data ?? []) as Category[]);
    setCategoryTypes((typesRes.data ?? []) as CategoryTypeItem[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // Auto-slug
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

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      type: cat.type,
      type_id: cat.type_id ?? "",
      custom_type: "",
      slug: cat.slug ?? "",
      description: cat.description ?? "",
      icon: cat.icon ?? "folder",
      sort_order: String(cat.sort_order),
      is_featured: cat.is_featured,
      is_active: cat.is_active,
      parent_id: cat.parent_id ?? "",
    });
    setErrors({});
    setSlugManual(true);
    setDialogOpen(true);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Nomi kiritilishi shart";
    if (!form.type_id && form.type_id !== "__other") e.type_id = "Turi tanlanishi shart";
    if (form.type_id === "__other" && !form.custom_type.trim()) e.custom_type = "Yangi tur nomini kiriting";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    let typeId: string = form.type_id;
    let typeSlug = form.type;

    // If "Boshqa" selected, create new type in DB first
    if (form.type_id === "__other" && form.custom_type.trim()) {
      const newSlug = generateSlug(form.custom_type.trim());
      
      // Check if type with same slug already exists
      const { data: existing } = await supabase
        .from("category_types")
        .select("id, slug")
        .eq("slug", newSlug)
        .maybeSingle();
      
      if (existing) {
        typeId = existing.id;
        typeSlug = existing.slug;
      } else {
        const { data: newType, error: typeError } = await supabase
          .from("category_types")
          .insert({ name: form.custom_type.trim(), slug: newSlug })
          .select("id, slug")
          .single();
        if (typeError) {
          console.error("[categories] type insert error:", typeError);
          toast.error("Yangi tur qo'shishda xatolik: " + typeError.message);
          setSaving(false);
          return;
        }
        typeId = newType.id;
        typeSlug = newType.slug;
      }
    } else {
      const selectedType = categoryTypes.find(ct => ct.id === form.type_id);
      typeSlug = selectedType?.slug ?? form.type;
    }

    const payload = {
      name: form.name,
      type: typeSlug,
      type_id: (typeId && typeId !== "__other") ? typeId : null,
      slug: form.slug || null,
      description: form.description || null,
      icon: form.icon || null,
      sort_order: Number(form.sort_order) || 0,
      is_featured: form.is_featured,
      is_active: form.is_active,
      parent_id: form.parent_id || null,
    };
    const { error } = editing
      ? await supabase.from("categories").update(payload).eq("id", editing.id)
      : await supabase.from("categories").insert(payload);

    if (error) toast.error("Xatolik: " + error.message);
    else {
      toast.success(editing ? "Kategoriya yangilandi" : "Kategoriya qo'shildi");
      setDialogOpen(false);
      fetchCategories();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("categories").delete().eq("id", deleteId);
    if (error) toast.error("Xatolik: " + error.message);
    else { toast.success("Kategoriya o'chirildi"); fetchCategories(); }
    setDeleteId(null);
  };

  // Parent options: exclude self
  const parentOptions = categories.filter((c) => !editing || c.id !== editing.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kategoriyalar</h1>
          <p className="text-sm text-muted-foreground">{categories.length} ta kategoriya</p>
        </div>
        <Button onClick={openCreate} className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" /> Yangi kategoriya
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed py-16 text-center">
          <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <h3 className="mt-4 font-semibold">Kategoriyalar topilmadi</h3>
          <p className="mt-1 text-sm text-muted-foreground">Birinchi kategoriyani qo'shing</p>
          <Button onClick={openCreate} variant="outline" className="mt-4 gap-2">
            <Plus className="h-4 w-4" /> Qo'shish
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const typeLabel = categoryTypes.find(ct => ct.id === cat.type_id)?.name ?? cat.type;
            // icon rendered dynamically below
            const parent = cat.parent_id ? categories.find((c) => c.id === cat.parent_id) : null;
            return (
              <Card key={cat.id} className={`border-0 shadow-sm transition-all hover:shadow-md ${!cat.is_active ? "opacity-60" : ""}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <IconComp className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{cat.name}</h3>
                          {cat.is_featured && <Star className="h-3.5 w-3.5 fill-primary text-primary" />}
                          {!cat.is_active && <Badge variant="secondary" className="text-[10px]">Nofaol</Badge>}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[10px]">{typeLabel}</Badge>
                          {cat.sort_order > 0 && <span className="text-[10px] text-muted-foreground">#{cat.sort_order}</span>}
                        </div>
                        {parent && (
                          <p className="mt-1 text-xs text-muted-foreground">↳ {parent.name}</p>
                        )}
                        {cat.description && (
                          <p className="mt-1.5 line-clamp-1 text-xs text-muted-foreground">{cat.description}</p>
                        )}
                        {cat.slug && (
                          <p className="mt-0.5 font-mono text-[10px] text-muted-foreground/60">/{cat.slug}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(cat.id)}>
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Kategoriyani tahrirlash" : "Yangi kategoriya qo'shish"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-2">
            {/* Asosiy */}
            <fieldset className="space-y-4 rounded-lg border border-border/50 p-4">
              <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Asosiy ma'lumotlar
              </legend>
              <div className="space-y-1.5">
                <Label className="text-sm">Nomi <span className="text-destructive">*</span></Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Laboratoriya tahlillari"
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-sm">Turi <span className="text-destructive">*</span></Label>
                  <Select value={form.type_id || ""} onValueChange={(v) => setForm({ ...form, type_id: v, custom_type: "" })}>
                    <SelectTrigger className={errors.type_id ? "border-destructive" : ""}>
                      <SelectValue placeholder="Turni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryTypes.map((ct) => (
                        <SelectItem key={ct.id} value={ct.id}>{ct.name}</SelectItem>
                      ))}
                      <SelectItem value="__other">➕ Boshqa (yangi tur)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type_id && <p className="text-xs text-destructive">{errors.type_id}</p>}
                  {form.type_id === "__other" && (
                    <div className="mt-2 space-y-1.5">
                      <Input
                        value={form.custom_type}
                        onChange={(e) => setForm({ ...form, custom_type: e.target.value })}
                        placeholder="Yangi tur nomini kiriting..."
                        className={errors.custom_type ? "border-destructive" : ""}
                      />
                      {errors.custom_type && <p className="text-xs text-destructive">{errors.custom_type}</p>}
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <IconPicker value={form.icon} onChange={(v) => setForm({ ...form, icon: v })} />
                </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-sm">Slug (SEO)</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => {
                      setSlugManual(true);
                      setForm({ ...form, slug: e.target.value });
                    }}
                    placeholder="laboratoriya-tahlillari"
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Tartib raqami</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
            </fieldset>

            {/* Qo'shimcha */}
            <fieldset className="space-y-4 rounded-lg border border-border/50 p-4">
              <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Qo'shimcha
              </legend>
              <div className="space-y-1.5">
                <Label className="text-sm">Tavsif</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  placeholder="Turli laboratoriya tahlillari ushbu bo'limda jamlangan"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Parent kategoriya</Label>
                <Select value={form.parent_id || "none"} onValueChange={(v) => setForm({ ...form, parent_id: v === "none" ? "" : v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tanlanmagan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tanlanmagan (asosiy)</SelectItem>
                    {parentOptions.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </fieldset>

            {/* Sozlamalar */}
            <fieldset className="space-y-3 rounded-lg border border-border/50 p-4">
              <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Sozlamalar
              </legend>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Tavsiya etilgan</Label>
                  <p className="text-xs text-muted-foreground">Bosh sahifada ko'rsatiladi</p>
                </div>
                <Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Faol</Label>
                  <p className="text-xs text-muted-foreground">Saytda ko'rinadi</p>
                </div>
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              </div>
            </fieldset>

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
            <AlertDialogTitle>Kategoriyani o'chirish</AlertDialogTitle>
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
