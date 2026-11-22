// Admin image upload/delete — replaces direct `supabase.storage.from(...)`
// calls made from the browser.
import { createServerFn } from "@tanstack/react-start";
import { requireAdmin } from "@/lib/require-admin";
import { saveUploadedFile, deleteUploadedFile } from "@/lib/uploads";

export const adminUploadImage = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: unknown) => {
    if (!(input instanceof FormData)) throw new Error("Expected FormData");
    const file = input.get("file");
    if (!(file instanceof File)) throw new Error("Fayl topilmadi");
    return {
      file,
      bucket: input.get("bucket")?.toString() || "misc",
      folder: input.get("folder")?.toString() || undefined,
    };
  })
  .handler(async ({ data }) => {
    const url = await saveUploadedFile(data.file, data.bucket, data.folder);
    return { url };
  });

export const adminDeleteUploadedImage = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: { url: string }) => {
    if (typeof input?.url !== "string") throw new Error("url required");
    return input;
  })
  .handler(async ({ data }) => {
    await deleteUploadedFile(data.url);
    return { success: true };
  });
