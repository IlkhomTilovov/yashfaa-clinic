import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useMemo } from "react";
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
import { Plus, Pencil, Trash2, Loader2, Search, FlaskConical, Star, Zap } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/tests")({
  component: AdminTestsPage,
});

interface Test {
  id: string;
  name: string;
  name_uz: string | null;
  name_ru: string | null;
  price: number;
  description: string | null;
  description_uz: string | null;
  description_ru: string | null;
  category_id: string | null;
  is_active: boolean;
  created_at: string;
  preparation_requirements: string | null;
  preparation_requirements_uz: string | null;
  preparation_requirements_ru: string | null;
  result_time: string | null;
  biomaterial_type: string | null;
  is_recommended: boolean;
  is_urgent: boolean;
  categories?: { name: string } | null;
}

interface Category { id: string; name: string; }

const RESULT_TIMES = ["1 kun", "2–3 kun", "3–5 kun", "5–7 kun", "1 hafta", "10 kun"];
const BIOMATERIALS = ["Qon", "Siydik", "So'lak", "Najas", "Surtma", "Tish nurash"];

interface FormData {
  name_uz: string;
  name_ru: string;
  category_id: string;
  description_uz: string;
  description_ru: string;
  preparation_requirements_uz: string;
  preparation_requirements_ru: string;
  result_time: string;
  biomaterial_type: string;
  is_recommended: boolean;
  is_urgent: boolean;
  is_active: boolean;
  price: string;
}

const emptyForm: FormData = {
  name_uz: "",
  name_ru: "",
  category_id: "",
  description_uz: "",
  description_ru: "",
  preparation_requirements_uz: "",
  preparation_requirements_ru: "",
  result_time: "",
  biomaterial_type: "",
  is_recommended: false,
  is_urgent: false,
  is_active: true,
  price: "",
};

function AdminTestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Test | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({ ...emptyForm });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [t, c] = await Promise.all([
      supabase.from("tests").select("*, categories(name)").order("name"),
      supabase.from("categories").select("id, name").order("name"),
    ]);
    setTests((t.data ?? []) as Test[]);
    setCategories(c.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() => {
    let result = tests;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t => t.name.toLowerCase().includes(q));
    }
    if (filterCategory !== "all") {
      result = result.filter(t => t.category_id === filterCategory);
    }
    return result;
  }, [tests, search, filterCategory]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (test: Test) => {
    setEditing(test);
    setForm({
      name: test.name,
      category_id: test.category_id ?? "",
      description: test.description ?? "",
      preparation_requirements: test.preparation_requirements ?? "",
      result_time: test.result_time ?? "",
      biomaterial_type: test.biomaterial_type ?? "",
      is_recommended: test.is_recommended,
      is_urgent: test.is_urgent,
      is_active: test.is_active,
      price: test.price ? String(test.price) : "",
    });
    setErrors({});
    setDialogOpen(true);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Nomi kiritilishi shart";
    if (!form.category_id) e.category_id = "Kategoriya tanlanishi shart";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const slug = form.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\u0400-\u04FF\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    const payload: any = {
      name: form.name,
      price: form.price ? Number(form.price) : 0,
      description: form.description || null,
      category_id: form.category_id || null,
      preparation_requirements: form.preparation_requirements || null,
      result_time: form.result_time || null,
      biomaterial_type: form.biomaterial_type || null,
      is_recommended: form.is_recommended,
      is_urgent: form.is_urgent,
      is_active: form.is_active,
      slug,
    };
    const { error } = editing
      ? await supabase.from("tests").update(payload).eq("id", editing.id)
      : await supabase.from("tests").insert(payload);

    if (error) {
      toast.error("Xatolik: " + error.message);
    } else {
      toast.success(editing ? "Tahlil yangilandi" : "Tahlil qo'shildi");
      setDialogOpen(false);
      fetchData();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("tests").delete().eq("id", deleteId);
    if (error) toast.error("Xatolik: " + error.message);
    else { toast.success("Tahlil o'chirildi"); fetchData(); }
    setDeleteId(null);
  };

  const isValid = form.name.trim() && form.category_id;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tahlillar</h1>
          <p className="text-sm text-muted-foreground">{tests.length} ta tahlil</p>
        </div>
        <Button onClick={openCreate} className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" /> Yangi tahlil
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Tahlil nomini qidirish..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Kategoriya" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barchasi</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed py-16 text-center">
          <FlaskConical className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <h3 className="mt-4 font-semibold">Tahlillar topilmadi</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {search || filterCategory !== "all" ? "Filtr natijasi topilmadi" : "Birinchi tahlilni qo'shing"}
          </p>
        </div>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="divide-y">
              {filtered.map((test) => (
                <div key={test.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/30">
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{test.name}</p>
                      {!test.is_active && <Badge variant="secondary" className="text-[10px]">Nofaol</Badge>}
                      {test.is_recommended && <Star className="h-3.5 w-3.5 text-primary fill-primary" />}
                      {test.is_urgent && <Zap className="h-3.5 w-3.5 text-primary" />}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      {test.categories?.name && <Badge variant="outline" className="text-[10px]">{test.categories.name}</Badge>}
                      {test.biomaterial_type && <span>{test.biomaterial_type}</span>}
                      {test.result_time && <span>• {test.result_time}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(test)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(test.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Tahlilni tahrirlash" : "Yangi tahlil qo'shish"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-2">
            {/* Asosiy ma'lumotlar */}
            <fieldset className="space-y-4 rounded-lg border border-border/50 p-4">
              <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Asosiy ma'lumotlar
              </legend>
              <div className="space-y-1.5">
                <Label className="text-sm">Nomi <span className="text-destructive">*</span></Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Umumiy qon tahlili"
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-sm">Kategoriya <span className="text-destructive">*</span></Label>
                  <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                    <SelectTrigger className={errors.category_id ? "border-destructive" : ""}>
                      <SelectValue placeholder="Tanlang..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category_id && <p className="text-xs text-destructive">{errors.category_id}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Biomaterial turi</Label>
                  <Select value={form.biomaterial_type} onValueChange={(v) => setForm({ ...form, biomaterial_type: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tanlang..." />
                    </SelectTrigger>
                    <SelectContent>
                      {BIOMATERIALS.map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Natija tayyor bo'lish vaqti</Label>
                <Select value={form.result_time} onValueChange={(v) => setForm({ ...form, result_time: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tanlang..." />
                  </SelectTrigger>
                  <SelectContent>
                    {RESULT_TIMES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </fieldset>

            {/* Qo'shimcha */}
            <fieldset className="space-y-4 rounded-lg border border-border/50 p-4">
              <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Qo'shimcha ma'lumotlar
              </legend>
              <div className="space-y-1.5">
                <Label className="text-sm">Tavsif</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  placeholder="Tahlil haqida qisqa ma'lumot..."
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Tayyorgarlik talablari</Label>
                <Textarea
                  value={form.preparation_requirements}
                  onChange={(e) => setForm({ ...form, preparation_requirements: e.target.value })}
                  rows={2}
                  placeholder="Och qoringa topshiriladi, 8 soat ovqat yemaslik..."
                />
              </div>
            </fieldset>

            {/* Sozlamalar */}
            <fieldset className="space-y-3 rounded-lg border border-border/50 p-4">
              <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Sozlamalar
              </legend>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Tavsiya etiladi</Label>
                  <p className="text-xs text-muted-foreground">Top tahlil sifatida ko'rsatiladi</p>
                </div>
                <Switch checked={form.is_recommended} onCheckedChange={(v) => setForm({ ...form, is_recommended: v })} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Tezkor (ekspress)</Label>
                  <p className="text-xs text-muted-foreground">Urgent tahlil sifatida belgilanadi</p>
                </div>
                <Switch checked={form.is_urgent} onCheckedChange={(v) => setForm({ ...form, is_urgent: v })} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Faol</Label>
                  <p className="text-xs text-muted-foreground">Saytda ko'rinadi</p>
                </div>
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              </div>
            </fieldset>

            {/* Ichki (admin) */}
            <fieldset className="space-y-3 rounded-lg border border-dashed border-muted-foreground/20 bg-muted/20 p-4">
              <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Ichki (faqat admin uchun)
              </legend>
              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">Narx (so'm)</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="Frontendda ko'rinmaydi"
                  className="max-w-xs"
                />
                <p className="text-xs text-muted-foreground">⚠️ Bu narx faqat ichki hisob-kitob uchun. Saytda ko'rsatilmaydi.</p>
              </div>
            </fieldset>

            <Button onClick={handleSave} disabled={saving || !isValid} className="w-full">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Saqlash" : "Qo'shish"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tahlilni o'chirish</AlertDialogTitle>
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
