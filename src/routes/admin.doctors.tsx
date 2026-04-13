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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Loader2, Search, Stethoscope, User } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/doctors")({
  component: AdminDoctorsPage,
});

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  bio: string | null;
  image_url: string | null;
  phone: string | null;
  experience_years: number | null;
  is_active: boolean;
  created_at: string;
}

function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", specialization: "", image_url: "", bio: "",
    phone: "", experience_years: "", is_active: true,
  });

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("doctors").select("*").order("name");
    setDoctors((data ?? []) as Doctor[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  const filtered = useMemo(() => {
    if (!search) return doctors;
    const q = search.toLowerCase();
    return doctors.filter(d =>
      d.name.toLowerCase().includes(q) || d.specialization.toLowerCase().includes(q)
    );
  }, [doctors, search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", specialization: "", image_url: "", bio: "", phone: "", experience_years: "", is_active: true });
    setDialogOpen(true);
  };

  const openEdit = (doc: Doctor) => {
    setEditing(doc);
    setForm({
      name: doc.name,
      specialization: doc.specialization,
      image_url: doc.image_url ?? "",
      bio: doc.bio ?? "",
      phone: doc.phone ?? "",
      experience_years: doc.experience_years ? String(doc.experience_years) : "",
      is_active: doc.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      name: form.name,
      specialization: form.specialization,
      image_url: form.image_url || null,
      bio: form.bio || null,
      phone: form.phone || null,
      experience_years: form.experience_years ? Number(form.experience_years) : null,
      is_active: form.is_active,
    };
    const { error } = editing
      ? await supabase.from("doctors").update(payload).eq("id", editing.id)
      : await supabase.from("doctors").insert(payload);

    if (error) {
      toast.error("Xatolik: " + error.message);
    } else {
      toast.success(editing ? "Shifokor yangilandi" : "Shifokor qo'shildi");
      setDialogOpen(false);
      fetchDoctors();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("doctors").delete().eq("id", deleteId);
    if (error) {
      toast.error("Xatolik: " + error.message);
    } else {
      toast.success("Shifokor o'chirildi");
      fetchDoctors();
    }
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Shifokorlar</h1>
          <p className="text-sm text-muted-foreground">{doctors.length} ta shifokor</p>
        </div>
        <Button onClick={openCreate} className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          Yangi shifokor
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Ism yoki mutaxassislik bo'yicha qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed py-16 text-center">
          <Stethoscope className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <h3 className="mt-4 font-semibold">Shifokorlar topilmadi</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {search ? "Qidiruv natijasi topilmadi" : "Birinchi shifokorni qo'shing"}
          </p>
          {!search && (
            <Button onClick={openCreate} variant="outline" className="mt-4 gap-2">
              <Plus className="h-4 w-4" /> Qo'shish
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((doc) => (
            <Card key={doc.id} className="group border-0 shadow-sm transition-all hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {doc.image_url ? (
                    <img
                      src={doc.image_url}
                      alt={doc.name}
                      className="h-14 w-14 rounded-xl object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); }}
                    />
                  ) : null}
                  <div className={`${doc.image_url ? 'hidden' : ''} flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10`}>
                    <User className="h-7 w-7 text-primary/60" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-semibold">{doc.name}</h3>
                      {!doc.is_active && <Badge variant="secondary" className="text-[10px]">Nofaol</Badge>}
                    </div>
                    <p className="mt-0.5 text-sm text-primary">{doc.specialization}</p>
                    {doc.phone && (
                      <p className="mt-1 text-xs text-muted-foreground">{doc.phone}</p>
                    )}
                    {doc.experience_years && (
                      <p className="text-xs text-muted-foreground">{doc.experience_years} yil tajriba</p>
                    )}
                  </div>
                </div>
                {doc.bio && (
                  <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">{doc.bio}</p>
                )}
                <div className="mt-4 flex items-center justify-end gap-1 border-t pt-3">
                  <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => openEdit(doc)}>
                    <Pencil className="h-3.5 w-3.5" /> Tahrirlash
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive" onClick={() => setDeleteId(doc.id)}>
                    <Trash2 className="h-3.5 w-3.5" /> O'chirish
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Shifokorni tahrirlash" : "Yangi shifokor qo'shish"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>To'liq ism *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Dr. Ism Familiya" />
              </div>
              <div className="space-y-2">
                <Label>Mutaxassislik *</Label>
                <Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="Kardiolog" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+998 90 123 45 67" />
              </div>
              <div className="space-y-2">
                <Label>Tajriba (yil)</Label>
                <Input type="number" value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: e.target.value })} placeholder="10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Rasm URL</Label>
              <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Biografiya</Label>
              <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} placeholder="Shifokor haqida qisqa ma'lumot..." />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>Faol</Label>
            </div>
            <Button onClick={handleSave} disabled={saving || !form.name || !form.specialization} className="w-full">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Saqlash" : "Qo'shish"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Shifokorni o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              Bu amalni ortga qaytarib bo'lmaydi. Shifokor butunlay o'chiriladi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              O'chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
