import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLang } from "@/hooks/useLang";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EditableTextProps {
  contentKey: string;
  fallback?: string;
  multiline?: boolean;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Inline editable text. Renders as plain text for visitors.
 * Admins see a hover pencil; click to edit in place; saves to site_content.
 */
export function EditableText({
  contentKey,
  fallback = "",
  multiline = false,
  as: Tag = "span",
  className,
  children,
}: EditableTextProps) {
  const { isAdmin } = useAuth();
  const lang = useLang();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [value, setValue] = useState<string>("");
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  // Display value: prefer children (already-resolved text from useSiteContent), else fallback
  const displayed = (typeof children === "string" ? children : (children as any)) ?? fallback;

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      // place caret at end
      const el = inputRef.current as HTMLTextAreaElement;
      el.selectionStart = el.selectionEnd = el.value.length;
    }
  }, [editing]);

  const startEdit = () => {
    setValue(typeof displayed === "string" ? displayed : "");
    setEditing(true);
  };

  const cancel = () => {
    setEditing(false);
    setValue("");
  };

  const save = async () => {
    setSaving(true);
    try {
      const field = lang === "ru" ? "value_ru" : "value_uz";
      // Try update; if no row, insert
      const { data: existing } = await supabase
        .from("site_content")
        .select("id")
        .eq("key", contentKey)
        .maybeSingle();

      if (existing?.id) {
        const { error } = await supabase
          .from("site_content")
          .update({ [field]: value })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("site_content")
          .insert({ key: contentKey, [field]: value, value_type: "text" });
        if (error) throw error;
      }

      await qc.invalidateQueries({ queryKey: ["site_content"] });
      toast.success("Saqlandi");
      setEditing(false);
    } catch (e: any) {
      toast.error("Xatolik: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  // Visitor view (or non-admin) — just render the text
  if (!isAdmin) {
    return <Tag className={className}>{displayed}</Tag>;
  }

  if (editing) {
    return (
      <span className="relative inline-flex items-start gap-2 align-top">
        {multiline ? (
          <textarea
            ref={inputRef as any}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={3}
            className={cn(
              "min-w-[280px] max-w-full rounded-md border-2 border-primary bg-background px-2 py-1 text-foreground shadow-lg outline-none",
              className,
            )}
            onKeyDown={(e) => {
              if (e.key === "Escape") cancel();
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save();
            }}
          />
        ) : (
          <input
            ref={inputRef as any}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={cn(
              "min-w-[200px] rounded-md border-2 border-primary bg-background px-2 py-1 text-foreground shadow-lg outline-none",
              className,
            )}
            onKeyDown={(e) => {
              if (e.key === "Escape") cancel();
              if (e.key === "Enter") save();
            }}
          />
        )}
        <span className="mt-1 inline-flex gap-1">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-md hover:bg-primary/90 disabled:opacity-50"
            title="Saqlash (Enter)"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={cancel}
            disabled={saving}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-foreground shadow-md hover:bg-muted/80"
            title="Bekor qilish (Esc)"
          >
            <X className="h-4 w-4" />
          </button>
        </span>
      </span>
    );
  }

  return (
    <Tag
      className={cn(
        "group/editable relative cursor-pointer rounded-sm outline-2 outline-dashed outline-transparent transition-all hover:bg-primary/5 hover:outline-primary/40",
        className,
      )}
      onClick={startEdit}
      title="Tahrirlash uchun bosing"
    >
      {displayed}
      <span className="pointer-events-none absolute -right-1 -top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md group-hover/editable:flex">
        <Pencil className="h-3 w-3" />
      </span>
    </Tag>
  );
}
