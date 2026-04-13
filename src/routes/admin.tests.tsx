import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/tests")({
  component: AdminTestsPage,
});

type Test = Tables<"tests"> & { categories?: { name: string } | null };
type Category = Tables<"categories">;

function formatPrice(price: number) {
  return new Intl.NumberFormat("uz-UZ").format(price) + " so'm";
}

function AdminTestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Test | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", category_id: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [t, c] = await Promise.all([
      supabase.from("tests").select("*, categories(name)").order("name"),
      supabase.from("categories").select("*").order("name"),
    ]);
    setTests((t.data ?? []) as Test[]);
    setCategories(c.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", price: "", category_id: "" });
    setDialogOpen(true);
  };

  const openEdit = (test: Test) => {
    setEditing(test);
    setForm({ name: test.name, price: String(test.price), category_id: test.category_id ?? "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      name: form.name,
      price: Number(form.price),
      category_id: form.category_id || null,
    };
    if (editing) {
      await supabase.from("tests").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("tests").insert(payload);
    }
    setSaving(false);
    setDialogOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tahlilni o'chirmoqchimisiz?")) return;
    await supabase.from("tests").delete().eq("id", id);
    fetchData();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tahlillar</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Qo'shish</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Tahrirlash" : "Yangi tahlil"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nomi</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Narxi (so'm)</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Kategoriya</Label>
                <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} disabled={saving || !form.name || !form.price} className="w-full">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing ? "Saqlash" : "Qo'shish"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Yuklanmoqda...</p>
      ) : tests.length === 0 ? (
        <p className="text-muted-foreground">Tahlillar topilmadi</p>
      ) : (
        <div className="space-y-3">
          {tests.map((test) => (
            <Card key={test.id}>
              <CardContent className="flex items-center justify-between px-5 py-4">
                <div>
                  <h3 className="font-medium">{test.name}</h3>
                  <p className="text-xs text-muted-foreground">{test.categories?.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-primary">{formatPrice(test.price)}</span>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(test)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(test.id)}>
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
