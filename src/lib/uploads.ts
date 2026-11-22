// Local-disk file storage for admin image uploads — replaces Supabase
// Storage buckets. Files live under UPLOADS_DIR (persistent on the VPS,
// outside the directory each deploy replaces) and are served directly by
// Nginx at /uploads/* (see deploy/nginx/yashfaa-clinic.uz.conf), not by
// this Node process.
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { join, extname } from "node:path";
import { randomUUID } from "node:crypto";

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]);
const SAFE_SEGMENT = /[^a-z0-9-]/gi;

export function getUploadsDir(): string {
  return process.env.UPLOADS_DIR || join(process.cwd(), "uploads");
}

export async function saveUploadedFile(file: File, bucket: string, folder?: string): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Faqat rasm fayllari yuklash mumkin");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("Fayl hajmi 10MB dan oshmasligi kerak");
  }
  const ext = extname(file.name).toLowerCase() || ".jpg";
  if (!ALLOWED_EXT.has(ext)) {
    throw new Error("Qo'llab-quvvatlanmaydigan fayl turi");
  }

  const safeBucket = bucket.replace(SAFE_SEGMENT, "") || "misc";
  const safeFolder = folder ? folder.replace(SAFE_SEGMENT, "") : "";
  const relDir = [safeBucket, safeFolder].filter(Boolean).join("/");

  const dir = join(getUploadsDir(), relDir);
  await mkdir(dir, { recursive: true });

  const filename = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(dir, filename), buffer);

  return `/uploads/${[relDir, filename].filter(Boolean).join("/")}`;
}

export async function deleteUploadedFile(publicUrl: string): Promise<void> {
  if (!publicUrl.startsWith("/uploads/")) return;
  const rel = publicUrl.slice("/uploads/".length);
  if (rel.includes("..")) return;
  try {
    await unlink(join(getUploadsDir(), rel));
  } catch {
    // Already gone — fine.
  }
}
