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
import { Plus, Pencil, Trash2, Loader2, Search, Briefcase, Star, Globe, Clock, MapPin, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/services")({
  component: AdminServicesPage,
});

interface Service {
  id: string;
  name: string;
  name_uz: string | null;
  name_ru: string | null;
  description: string | null;
  description_uz: string | null;
  description_ru: string | null;
  price: number;
  category_id: string | null;
  is_active: boolean;
  created_at: string;
  duration: string | null;
  location_type: string | null;
  preparation_requirements: string | null;
  preparation_requirements_uz: string | null;
  preparation_requirements_ru: string | null;
  result_info: string | null;
  result_info_uz: string | null;
  result_info_ru: string | null;
  is_featured: boolean;
  is_online: boolean;
  doctor_ids: string[] | null;
  categories?: { name: string } | null;
}

interface Category { id: string; name: string; }
interface Doctor { id: string; name: string; specialization: string; }

const DURATIONS = ["15 daqiqa", "20 daqiqa", "30 daqiqa", "45 daqiqa", "1 soat", "1.5 soat", "2 soat"];
const LOCATIONS = [
  { value: "clinic", label: "Klinikada" },
  { value: "home", label: "Uyga chiqib" },
  { value: "online", label: "Online" },
  { value: "clinic_home", label: "Klinikada / Uyga chiqib" },
];

interface FormData {
  name_uz: string;
  name_ru: string;
  category_id: string;
  description_uz: string;
  description_ru: string;
  duration: string;
  location_type: string;
  doctor_ids: string[];
  preparation_requirements_uz: string;
  preparation_requirements_ru: string;
  result_info_uz: string;
  result_info_ru: string;
  is_featured: boolean;
  is_online: boolean;
  is_active: boolean;
  price: string;
}

const emptyForm: FormData = {
  name_uz: "",
  name_ru: "",
  category_id: "",
  description_uz: "",
  description_ru: "",
  duration: "",
  location_type: "",
  doctor_ids: [],
  preparation_requirements_uz: "",
  preparation_requirements_ru: "",
  result_info_uz: "",
  result_info_ru: "",
  is_featured: false,
  is_online: false,
  is_active: true,
  price: "",
};

function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({ ...emptyForm });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [s, c, d] = await Promise.all([
      supabase.from("services").select("*, categories(name)").order("name"),
      supabase.from("categories").select("id, name").order("name"),
      supabase.from("doctors").select("id, name, specialization").eq("is_active", true).order("name"),
    ]);
    setServices((s.data ?? []) as Service[]);
    setCategories(c.data ?? []);
    setDoctors((d.data ?? []) as Doctor[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() => {
    if (!search) return services;
    const q = search.toLowerCase();
    return services.filter(s => s.name.toLowerCase().includes(q));
  }, [services, search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (svc: Service) => {
    setEditing(svc);
    setForm({
      name_uz: svc.name_uz ?? svc.name ?? "",
      name_ru: svc.name_ru ?? "",
      category_id: svc.category_id ?? "",
      description_uz: svc.description_uz ?? svc.description ?? "",
      description_ru: svc.description_ru ?? "",
      duration: svc.duration ?? "",
      location_type: svc.location_type ?? "",
      doctor_ids: svc.doctor_ids ?? [],
      preparation_requirements_uz: svc.preparation_requirements_uz ?? svc.preparation_requirements ?? "",
      preparation_requirements_ru: svc.preparation_requirements_ru ?? "",
      result_info_uz: svc.result_info_uz ?? svc.result_info ?? "",
      result_info_ru: svc.result_info_ru ?? "",
      is_featured: svc.is_featured,
      is_online: svc.is_online,
      is_active: svc.is_active,
      price: svc.price ? String(svc.price) : "",
    });
    setErrors({});
    setDialogOpen(true);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name_uz.trim()) e.name_uz = "Nomi kiritilishi shart";
    if (!form.category_id) e.category_id = "Kategoriya tanlanishi shart";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const toggleDoctor = (id: string) => {
    const ids = form.doctor_ids.includes(id)
      ? form.doctor_ids.filter((d) => d !== id)
      : [...form.doctor_ids, id];
    setForm({ ...form, doctor_ids: ids });
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description || null,
      price: form.price ? Number(form.price) : 0,
      category_id: form.category_id || null,
      duration: form.duration || null,
      location_type: form.location_type || null,
      doctor_ids: form.doctor_ids.length > 0 ? form.doctor_ids : null,
      preparation_requirements: form.preparation_requirements || null,
      result_info: form.result_info || null,
      is_featured: form.is_featured,
      is_online: form.is_online,
      is_active: form.is_active,
    };
    const { error } = editing
      ? await supabase.from("services").update(payload).eq("id", editing.id)
      : await supabase.from("services").insert(payload);

    if (error) toast.error("Xatolik: " + error.message);
    else {
      toast.success(editing ? "Xizmat yangilandi" : "Xizmat qo'shildi");
      setDialogOpen(false);
      fetchData();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("services").delete().eq("id", deleteId);
    if (error) toast.error("Xatolik: " + error.message);
    else { toast.success("Xizmat o'chirildi"); fetchData(); }
    setDeleteId(null);
  };

  const getLocationLabel = (v: string | null) => LOCATIONS.find((l) => l.value === v)?.label ?? v;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Xizmatlar</h1>
          <p className="text-sm text-muted-foreground">{services.length} ta xizmat</p>
        </div>
        <Button onClick={openCreate} className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" /> Yangi xizmat
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Xizmat nomini qidirish..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed py-16 text-center">
          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <h3 className="mt-4 font-semibold">Xizmatlar topilmadi</h3>
          <p className="mt-1 text-sm text-muted-foreground">{search ? "Qidiruv natijasi topilmadi" : "Birinchi xizmatni qo'shing"}</p>
        </div>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="divide-y">
              {filtered.map((svc) => (
                <div key={svc.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/30">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{svc.name}</p>
                      {!svc.is_active && <Badge variant="secondary" className="text-[10px]">Nofaol</Badge>}
                      {svc.is_featured && <Star className="h-3.5 w-3.5 fill-primary text-primary" />}
                      {svc.is_online && <Globe className="h-3.5 w-3.5 text-primary" />}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      {svc.categories?.name && <Badge variant="outline" className="text-[10px]">{svc.categories.name}</Badge>}
                      {svc.duration && <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> {svc.duration}</span>}
                      {svc.location_type && <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {getLocationLabel(svc.location_type)}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(svc)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(svc.id)}>
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
            <DialogTitle>{editing ? "Xizmatni tahrirlash" : "Yangi xizmat qo'shish"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-2">
            {/* Asosiy */}
            <fieldset className="space-y-4 rounded-lg border border-border/50 p-4">
              <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Asosiy ma'lumotlar</legend>
              <div className="space-y-1.5">
                <Label className="text-sm">Nomi <span className="text-destructive">*</span></Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="UZI diagnostikasi"
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
                  <Label className="text-sm">Davomiyligi</Label>
                  <Select value={form.duration} onValueChange={(v) => setForm({ ...form, duration: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tanlang..." />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATIONS.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Qayerda amalga oshiriladi</Label>
                <Select value={form.location_type} onValueChange={(v) => setForm({ ...form, location_type: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tanlang..." />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((l) => (
                      <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </fieldset>

            {/* Qo'shimcha */}
            <fieldset className="space-y-4 rounded-lg border border-border/50 p-4">
              <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Qo'shimcha ma'lumotlar</legend>
              <div className="space-y-1.5">
                <Label className="text-sm">Tavsif</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  placeholder="Xizmat haqida qisqa ma'lumot..."
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Tayyorgarlik talablari</Label>
                <Textarea
                  value={form.preparation_requirements}
                  onChange={(e) => setForm({ ...form, preparation_requirements: e.target.value })}
                  rows={2}
                  placeholder="Och qoringa kelish kerak..."
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Natija / Effekt</Label>
                <Input
                  value={form.result_info}
                  onChange={(e) => setForm({ ...form, result_info: e.target.value })}
                  placeholder="Natija darhol beriladi"
                />
              </div>

              {/* Shifokorlar */}
              <div className="space-y-2">
                <Label className="text-sm">Bog'langan shifokorlar</Label>
                <div className="flex flex-wrap gap-2">
                  {doctors.map((doc) => {
                    const selected = form.doctor_ids.includes(doc.id);
                    return (
                      <Badge
                        key={doc.id}
                        variant={selected ? "default" : "outline"}
                        className={`cursor-pointer select-none transition-colors ${
                          selected ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-accent"
                        }`}
                        onClick={() => toggleDoctor(doc.id)}
                      >
                        {doc.name}
                        {selected && <X className="ml-1 h-3 w-3" />}
                      </Badge>
                    );
                  })}
                </div>
                {doctors.length === 0 && <p className="text-xs text-muted-foreground">Shifokorlar topilmadi</p>}
              </div>
            </fieldset>

            {/* Sozlamalar */}
            <fieldset className="space-y-3 rounded-lg border border-border/50 p-4">
              <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sozlamalar</legend>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Tavsiya etilgan</Label>
                  <p className="text-xs text-muted-foreground">Asosiy sahifada ko'rsatiladi</p>
                </div>
                <Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Online mavjud</Label>
                  <p className="text-xs text-muted-foreground">Online xizmat sifatida belgilanadi</p>
                </div>
                <Switch checked={form.is_online} onCheckedChange={(v) => setForm({ ...form, is_online: v })} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Faol</Label>
                  <p className="text-xs text-muted-foreground">Saytda ko'rinadi</p>
                </div>
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              </div>
            </fieldset>

            {/* Ichki */}
            <fieldset className="space-y-3 rounded-lg border border-dashed border-muted-foreground/20 bg-muted/20 p-4">
              <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ichki (faqat admin uchun)</legend>
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

            <Button onClick={handleSave} disabled={saving || !form.name.trim() || !form.category_id} className="w-full">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Saqlash" : "Qo'shish"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xizmatni o'chirish</AlertDialogTitle>
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
