import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, X, User } from "lucide-react";

const SPECIALIZATIONS = [
  "Kardiolog",
  "Nevrolog",
  "Terapevt",
  "Pediatr",
  "Ginekolog",
  "Urolog",
  "Dermatolog",
  "Otorinolaringolog (LOR)",
  "Oftalmolog",
  "Endokrinolog",
  "Gastroenterolog",
  "Pulmonolog",
  "Ortoped",
  "Travmatolog",
  "Xirurg",
  "Stomatolog",
  "Psixiatr",
  "Nefrologg",
  "Onkolog",
  "Allergolog",
  "Infeksionist",
  "Anesteziolog",
  "Radiolog",
  "Fizioterapevt",
];

const LANGUAGES = ["O'zbek", "Rus", "Ingliz", "Turk", "Arab", "Koreys"];

const SERVICES = [
  "Konsultatsiya",
  "Yurak tekshiruvi",
  "EKG",
  "UZI",
  "Qon tahlili",
  "Rentgen",
  "MRT",
  "KT",
  "Fizioterapiya",
  "Jarrohlik amaliyoti",
  "Lazerli davolash",
  "Endoskopiya",
];

export interface DoctorFormData {
  name: string;
  specialization: string;
  experience_years: string;
  branch: string;
  schedule: string;
  consultation_price: string;
  languages: string[];
  services_offered: string[];
  image_url: string;
  bio: string;
  slug: string;
  online_available: boolean;
  is_active: boolean;
  phone: string;
}

export const emptyForm: DoctorFormData = {
  name: "",
  specialization: "",
  experience_years: "",
  branch: "",
  schedule: "",
  consultation_price: "",
  languages: [],
  services_offered: [],
  image_url: "",
  bio: "",
  slug: "",
  online_available: false,
  is_active: true,
  phone: "",
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function formatPrice(value: string): string {
  const num = value.replace(/\D/g, "");
  if (!num) return "";
  return Number(num).toLocaleString("uz-UZ");
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: DoctorFormData;
  setForm: (form: DoctorFormData) => void;
  editing: boolean;
  saving: boolean;
  onSave: () => void;
}

export function DoctorFormDialog({ open, onOpenChange, form, setForm, editing, saving, onSave }: Props) {
  const [slugManual, setSlugManual] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-generate slug from name
  useEffect(() => {
    if (!slugManual && form.name) {
      setForm({ ...form, slug: "dr-" + generateSlug(form.name) });
    }
  }, [form.name, slugManual]);

  const toggleArrayItem = (field: "languages" | "services_offered", item: string) => {
    const arr = form[field];
    const updated = arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
    setForm({ ...form, [field]: updated });
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Ism kiritilishi shart";
    if (!form.specialization) e.specialization = "Mutaxassislik tanlanishi shart";
    if (!form.experience_years || Number(form.experience_years) < 0) e.experience_years = "Tajriba kiritilishi shart";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onSave();
  };

  const isValid = form.name.trim() && form.specialization && form.experience_years;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {editing ? "Shifokorni tahrirlash" : "Yangi shifokor qo'shish"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Image preview */}
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30">
              {form.image_url ? (
                <img
                  src={form.image_url}
                  alt="Preview"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <User className="h-8 w-8 text-muted-foreground/40" />
              )}
            </div>
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs text-muted-foreground">Rasm URL</Label>
              <Input
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://example.com/doctor.jpg"
                className="h-9 text-sm"
              />
            </div>
          </div>

          {/* Section: Asosiy ma'lumotlar */}
          <fieldset className="space-y-4 rounded-lg border border-border/50 p-4">
            <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Asosiy ma'lumotlar
            </legend>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-sm">
                  To'liq ism <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Aliyev Anvarjon Sobir o'g'li"
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">
                  Mutaxassislik <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.specialization}
                  onValueChange={(v) => setForm({ ...form, specialization: v })}
                >
                  <SelectTrigger className={errors.specialization ? "border-destructive" : ""}>
                    <SelectValue placeholder="Tanlang..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALIZATIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.specialization && <p className="text-xs text-destructive">{errors.specialization}</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-sm">
                  Tajriba (yil) <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={form.experience_years}
                  onChange={(e) => setForm({ ...form, experience_years: e.target.value })}
                  placeholder="10"
                  className={errors.experience_years ? "border-destructive" : ""}
                />
                {errors.experience_years && <p className="text-xs text-destructive">{errors.experience_years}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Ko'rik narxi</Label>
                <div className="relative">
                  <Input
                    value={formatPrice(form.consultation_price)}
                    onChange={(e) =>
                      setForm({ ...form, consultation_price: e.target.value.replace(/\D/g, "") })
                    }
                    placeholder="150 000"
                    className="pr-14"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    so'm
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Slug / ID</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => {
                    setSlugManual(true);
                    setForm({ ...form, slug: e.target.value });
                  }}
                  placeholder="dr-aliyev"
                  className="text-sm font-mono"
                />
              </div>
            </div>
          </fieldset>

          {/* Section: Qo'shimcha ma'lumotlar */}
          <fieldset className="space-y-4 rounded-lg border border-border/50 p-4">
            <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Qo'shimcha ma'lumotlar
            </legend>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-sm">Filial / Manzil</Label>
                <Input
                  value={form.branch}
                  onChange={(e) => setForm({ ...form, branch: e.target.value })}
                  placeholder="Toshkent, Chilonzor filiali"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Qabul vaqti / Ish jadvali</Label>
                <Input
                  value={form.schedule}
                  onChange={(e) => setForm({ ...form, schedule: e.target.value })}
                  placeholder="Dushanba–Juma 09:00–18:00"
                />
              </div>
            </div>

            {/* Languages */}
            <div className="space-y-2">
              <Label className="text-sm">Til bilishi</Label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => {
                  const selected = form.languages.includes(lang);
                  return (
                    <Badge
                      key={lang}
                      variant={selected ? "default" : "outline"}
                      className={`cursor-pointer select-none transition-colors ${
                        selected
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "hover:bg-accent"
                      }`}
                      onClick={() => toggleArrayItem("languages", lang)}
                    >
                      {lang}
                      {selected && <X className="ml-1 h-3 w-3" />}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Services */}
            <div className="space-y-2">
              <Label className="text-sm">Xizmatlar / Yo'nalishlar</Label>
              <div className="flex flex-wrap gap-2">
                {SERVICES.map((svc) => {
                  const selected = form.services_offered.includes(svc);
                  return (
                    <Badge
                      key={svc}
                      variant={selected ? "default" : "outline"}
                      className={`cursor-pointer select-none transition-colors ${
                        selected
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "hover:bg-accent"
                      }`}
                      onClick={() => toggleArrayItem("services_offered", svc)}
                    >
                      {svc}
                      {selected && <X className="ml-1 h-3 w-3" />}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <Label className="text-sm">Biografiya</Label>
              <Textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
                placeholder="Shifokor haqida qisqa ma'lumot..."
              />
            </div>
          </fieldset>

          {/* Section: Sozlamalar */}
          <fieldset className="space-y-3 rounded-lg border border-border/50 p-4">
            <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Sozlamalar
            </legend>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Online qabul mavjud</Label>
                <p className="text-xs text-muted-foreground">Bemorlar onlayn qabul olishi mumkin</p>
              </div>
              <Switch
                checked={form.online_available}
                onCheckedChange={(v) => setForm({ ...form, online_available: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Faol</Label>
                <p className="text-xs text-muted-foreground">Saytda ko'rinadi</p>
              </div>
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
            </div>
          </fieldset>

          {/* Submit */}
          <Button onClick={handleSubmit} disabled={saving || !isValid} className="w-full">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editing ? "Saqlash" : "Qo'shish"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
