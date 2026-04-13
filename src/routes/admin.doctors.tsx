import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/doctors")({
  component: AdminDoctorsPage,
});

type Doctor = Tables<"doctors">;

function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", specialization: "", image_url: "", bio: "" });

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("doctors").select("*").order("name");
    setDoctors(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", specialization: "", image_url: "", bio: "" });
    setDialogOpen(true);
  };

  const openEdit = (doc: Doctor) => {
    setEditing(doc);
    setForm({ name: doc.name, specialization: doc.specialization, image_url: doc.image_url ?? "", bio: doc.bio ?? "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    if (editing) {
      await supabase.from("doctors").update({
        name: form.name,
        specialization: form.specialization,
        image_url: form.image_url || null,
        bio: form.bio || null,
      }).eq("id", editing.id);
    } else {
      await supabase.from("doctors").insert({
        name: form.name,
        specialization: form.specialization,
        image_url: form.image_url || null,
        bio: form.bio || null,
      });
    }
    setSaving(false);
    setDialogOpen(false);
    fetchDoctors();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Shifokorni o'chirmoqchimisiz?")) return;
    await supabase.from("doctors").delete().eq("id", id);
    fetchDoctors();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Shifokorlar</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Qo'shish</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Tahrirlash" : "Yangi shifokor"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Ism</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Mutaxassislik</Label>
                <Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Rasm URL</Label>
                <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Biografiya</Label>
                <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} />
              </div>
              <Button onClick={handleSave} disabled={saving || !form.name || !form.specialization} className="w-full">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing ? "Saqlash" : "Qo'shish"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Yuklanmoqda...</p>
      ) : doctors.length === 0 ? (
        <p className="text-muted-foreground">Shifokorlar topilmadi</p>
      ) : (
        <div className="space-y-3">
          {doctors.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-4">
                  <img src={doc.image_url || "/placeholder.svg"} alt={doc.name} className="h-12 w-12 rounded-lg object-cover" />
                  <div>
                    <h3 className="font-medium">{doc.name}</h3>
                    <p className="text-sm text-muted-foreground">{doc.specialization}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(doc)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(doc.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
