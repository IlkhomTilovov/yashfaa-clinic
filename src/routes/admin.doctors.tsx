import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useMemo } from "react";
import { adminGetDoctorsAdmin, adminUpsertDoctor, adminDeleteDoctor } from "@/lib/admin-server-functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Search, Stethoscope, User, Globe, MapPin } from "lucide-react";
import { toast } from "sonner";
import { DoctorFormDialog, emptyForm } from "@/components/admin/DoctorFormDialog";
import type { DoctorFormData } from "@/components/admin/DoctorFormDialog";

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
  branch: string | null;
  schedule: string | null;
  consultation_price: number | null;
  languages: string[] | null;
  services_offered: string[] | null;
  slug: string | null;
  online_available: boolean;
}

function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<DoctorFormData>({ ...emptyForm });

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminGetDoctorsAdmin();
      setDoctors(data as Doctor[]);
    } catch (err: any) {
      toast.error("Xatolik: " + err.message);
    } finally {
      setLoading(false);
    }
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
    setForm({ ...emptyForm });
    setDialogOpen(true);
  };

  const openEdit = (doc: Doctor) => {
    setEditing(doc);
    setForm({
      name: doc.name,
      specialization: doc.specialization,
      experience_years: doc.experience_years ? String(doc.experience_years) : "",
      branch: doc.branch ?? "",
      schedule: doc.schedule ?? "",
      consultation_price: doc.consultation_price ? String(doc.consultation_price) : "",
      languages: doc.languages ?? [],
      services_offered: doc.services_offered ?? [],
      image_url: doc.image_url ?? "",
      bio: doc.bio ?? "",
      slug: doc.slug ?? "",
      online_available: doc.online_available ?? false,
      is_active: doc.is_active,
      phone: doc.phone ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      name: form.name,
      specialization: form.specialization,
      experience_years: form.experience_years ? Number(form.experience_years) : null,
      branch: form.branch || null,
      schedule: form.schedule || null,
      consultation_price: form.consultation_price ? Number(form.consultation_price) : null,
      languages: form.languages.length > 0 ? form.languages : null,
      services_offered: form.services_offered.length > 0 ? form.services_offered : null,
      image_url: form.image_url || null,
      bio: form.bio || null,
      slug: form.slug || null,
      online_available: form.online_available,
      is_active: form.is_active,
      phone: form.phone || null,
    };
    try {
      await adminUpsertDoctor({ data: editing ? { id: editing.id, ...payload } : payload });
      toast.success(editing ? "Shifokor yangilandi" : "Shifokor qo'shildi");
      setDialogOpen(false);
      fetchDoctors();
    } catch (err: any) {
      toast.error("Xatolik: " + err.message);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminDeleteDoctor({ data: { id: deleteId } });
      toast.success("Shifokor o'chirildi");
      fetchDoctors();
    } catch (err: any) {
      toast.error("Xatolik: " + err.message);
    }
    setDeleteId(null);
  };

  const formatCurrency = (n: number | null) => {
    if (!n) return null;
    return Number(n).toLocaleString("uz-UZ") + " so'm";
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
            <Skeleton key={i} className="h-52 rounded-xl" />
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
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                      <User className="h-7 w-7 text-primary/60" />
                    </div>
                  )}
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-semibold">{doc.name}</h3>
                      {!doc.is_active && <Badge variant="secondary" className="text-[10px]">Nofaol</Badge>}
                      {doc.online_available && (
                        <Globe className="h-3.5 w-3.5 text-primary" />
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-primary">{doc.specialization}</p>
                    {doc.experience_years && (
                      <p className="text-xs text-muted-foreground">{doc.experience_years} yil tajriba</p>
                    )}
                    {doc.branch && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {doc.branch}
                      </p>
                    )}
                  </div>
                </div>
                {/* Tags row */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {doc.consultation_price ? (
                    <Badge variant="outline" className="text-[10px]">{formatCurrency(doc.consultation_price)}</Badge>
                  ) : null}
                  {doc.languages?.map((l) => (
                    <Badge key={l} variant="secondary" className="text-[10px]">{l}</Badge>
                  ))}
                </div>
                {doc.bio && (
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{doc.bio}</p>
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

      {/* Form Dialog */}
      <DoctorFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        form={form}
        setForm={setForm}
        editing={!!editing}
        saving={saving}
        onSave={handleSave}
      />

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
