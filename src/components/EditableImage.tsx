import { useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { adminUploadImage } from "@/lib/upload-server-functions";
import { adminUpsertSiteContentByKey } from "@/lib/admin-server-functions";
import { useQueryClient } from "@tanstack/react-query";
import { ImageIcon, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface EditableImageProps {
  /** site_content key where the image URL is saved (stored in value_uz) */
  contentKey: string;
  /** Current image URL (from site_content or fallback) */
  currentUrl?: string;
  /** Storage bucket name (default: site-images) */
  bucket?: string;
  /** Optional folder/prefix inside the bucket */
  folder?: string;
  /** Render slot — children receive nothing; control is via floating overlay */
  children?: React.ReactNode;
  className?: string;
}

/**
 * Floating control overlay for admins to replace an image stored in site_content.
 * Uploads the file to local disk via adminUploadImage, then saves the public URL to site_content.value_uz.
 * Render this INSIDE a `relative` parent that holds the visible image.
 */
export function EditableImage({
  contentKey,
  currentUrl,
  bucket = "site-images",
  folder = "hero",
  children,
  className,
}: EditableImageProps) {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  if (!isAdmin) return <>{children}</>;

  const saveUrl = async (url: string) => {
    await adminUpsertSiteContentByKey({
      data: { key: contentKey, patch: { value_uz: url, value_ru: url, value_type: "image" } },
    });
    await qc.invalidateQueries({ queryKey: ["site_content"] });
  };

  const onFile = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Faqat rasm fayllari");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Rasm 10MB dan kichik bo'lsin");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", bucket);
      fd.append("folder", folder);
      const { url } = await adminUploadImage({ data: fd });
      await saveUrl(url);
      toast.success("Rasm yangilandi");
    } catch (e: any) {
      toast.error("Xatolik: " + e.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = async () => {
    if (!confirm("Rasmni o'chirib, asl holiga qaytarilsinmi?")) return;
    setUploading(true);
    try {
      await saveUrl("");
      toast.success("Asl rasm tiklandi");
    } catch (e: any) {
      toast.error("Xatolik: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {children}
      <div className={`pointer-events-auto absolute right-3 top-3 z-50 flex gap-2 ${className ?? ""}`}>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-lg backdrop-blur-sm transition hover:bg-primary/90 disabled:opacity-50"
          title="Rasmni o'zgartirish"
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
          {uploading ? "Yuklanmoqda..." : "Rasmni o'zgartirish"}
        </button>
        {currentUrl ? (
          <button
            type="button"
            onClick={remove}
            disabled={uploading}
            className="flex items-center gap-1 rounded-lg bg-background/90 px-2.5 py-2 text-xs font-medium text-destructive shadow-lg backdrop-blur-sm transition hover:bg-background disabled:opacity-50"
            title="Asl rasmga qaytarish"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    </>
  );
}
