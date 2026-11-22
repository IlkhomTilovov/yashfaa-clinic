// Admin-only CRUD server functions — replace direct `supabase.from(...)` calls
// made from the browser in src/routes/admin.*.tsx. Every export here is
// gated by `requireAdmin` (role check against our own Postgres `user_roles`
// table); identity comes from the caller's admin session token.
//
// Unlike the public functions in server-functions.ts, errors here are NOT
// sanitized — admin pages show `error.message` directly (same as the old
// Supabase/PostgREST error messages did), since the caller is a trusted admin.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { requireAdmin } from "@/lib/require-admin";
import {
  categories,
  categoryTypes,
  tests,
  doctors,
  appointments,
  services,
  clinicSettings,
  siteContent,
} from "@/lib/db/schema";

const idInput = (input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input);

// ---------- appointments ----------

export const adminListAppointments = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const db = await getDb();
    return db.query.appointments.findMany({
      with: { doctors: { columns: { name: true } } },
      orderBy: desc(appointments.created_at),
    });
  });

export const adminUpdateAppointmentStatus = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: { id: string; status: string }) =>
    z.object({ id: z.string().uuid(), status: z.string().min(1) }).parse(input)
  )
  .handler(async ({ data }) => {
    const db = await getDb();
    await db.update(appointments).set({ status: data.status }).where(eq(appointments.id, data.id));
    return { success: true };
  });

export const adminDeleteAppointment = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(idInput)
  .handler(async ({ data }) => {
    const db = await getDb();
    await db.delete(appointments).where(eq(appointments.id, data.id));
    return { success: true };
  });

// ---------- categories & category types ----------

export const adminListCategories = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const db = await getDb();
    return db.select().from(categories).orderBy(asc(categories.sort_order), asc(categories.name));
  });

export const adminListCategoriesMinimal = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const db = await getDb();
    return db
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .orderBy(asc(categories.name));
  });

export const adminListCategoryTypes = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const db = await getDb();
    return db.select().from(categoryTypes).orderBy(asc(categoryTypes.created_at));
  });

export const adminFindCategoryTypeBySlug = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .inputValidator((input: { slug: string }) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const db = await getDb();
    const row = await db.query.categoryTypes.findFirst({
      columns: { id: true, slug: true },
      where: eq(categoryTypes.slug, data.slug),
    });
    return row ?? null;
  });

export const adminCreateCategoryType = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: { name: string; slug: string }) =>
    z.object({ name: z.string().min(1), slug: z.string().min(1) }).parse(input)
  )
  .handler(async ({ data }) => {
    const db = await getDb();
    const [row] = await db.insert(categoryTypes).values(data).returning({ id: categoryTypes.id, slug: categoryTypes.slug });
    return row;
  });

export const adminUpsertCategoryType = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: { id?: string } & Partial<typeof categoryTypes.$inferInsert>) => input)
  .handler(async ({ data }) => {
    const db = await getDb();
    const { id, ...payload } = data;
    if (id) await db.update(categoryTypes).set(payload).where(eq(categoryTypes.id, id));
    else await db.insert(categoryTypes).values(payload as typeof categoryTypes.$inferInsert);
    return { success: true };
  });

export const adminDeleteCategoryType = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(idInput)
  .handler(async ({ data }) => {
    const db = await getDb();
    await db.delete(categoryTypes).where(eq(categoryTypes.id, data.id));
    return { success: true };
  });

export const adminUpsertCategory = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: { id?: string } & Partial<typeof categories.$inferInsert>) => input)
  .handler(async ({ data }) => {
    const db = await getDb();
    const { id, ...payload } = data;
    if (id) await db.update(categories).set(payload).where(eq(categories.id, id));
    else await db.insert(categories).values(payload as typeof categories.$inferInsert);
    return { success: true };
  });

export const adminDeleteCategory = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(idInput)
  .handler(async ({ data }) => {
    const db = await getDb();
    await db.delete(categories).where(eq(categories.id, data.id));
    return { success: true };
  });

// ---------- site content ----------

export const adminGetSiteContentRows = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const db = await getDb();
    return db.select().from(siteContent).orderBy(asc(siteContent.key));
  });

export const adminUpdateSiteContentRow = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: { id: string; value_uz: string | null; value_ru: string | null }) =>
    z.object({ id: z.string().uuid(), value_uz: z.string().nullable(), value_ru: z.string().nullable() }).parse(input)
  )
  .handler(async ({ data }) => {
    const db = await getDb();
    await db
      .update(siteContent)
      .set({ value_uz: data.value_uz, value_ru: data.value_ru })
      .where(eq(siteContent.id, data.id));
    return { success: true };
  });

// Upsert-by-key: used by EditableText/EditableImage, which edit one locale
// field of a `site_content` row identified by its unique `key` (creating the
// row on first use). `patch` only contains the field(s) being changed.
export const adminUpsertSiteContentByKey = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: {
    key: string;
    patch: Partial<Pick<typeof siteContent.$inferInsert, "value_uz" | "value_ru" | "value_type">>;
  }) =>
    z.object({
      key: z.string().min(1),
      patch: z.object({
        value_uz: z.string().nullable().optional(),
        value_ru: z.string().nullable().optional(),
        value_type: z.string().optional(),
      }),
    }).parse(input)
  )
  .handler(async ({ data }) => {
    const db = await getDb();
    const existing = await db.query.siteContent.findFirst({
      columns: { id: true },
      where: eq(siteContent.key, data.key),
    });
    if (existing) {
      await db.update(siteContent).set(data.patch).where(eq(siteContent.id, existing.id));
    } else {
      await db.insert(siteContent).values({ key: data.key, ...data.patch });
    }
    return { success: true };
  });

// ---------- doctors ----------

export const adminGetDoctorsAdmin = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const db = await getDb();
    return db.select().from(doctors).orderBy(asc(doctors.name));
  });

export const adminUpsertDoctor = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: { id?: string } & Partial<typeof doctors.$inferInsert>) => input)
  .handler(async ({ data }) => {
    const db = await getDb();
    const { id, ...payload } = data;
    if (id) await db.update(doctors).set(payload).where(eq(doctors.id, id));
    else await db.insert(doctors).values(payload as typeof doctors.$inferInsert);
    return { success: true };
  });

export const adminDeleteDoctor = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(idInput)
  .handler(async ({ data }) => {
    const db = await getDb();
    await db.delete(doctors).where(eq(doctors.id, data.id));
    return { success: true };
  });

// ---------- services ----------

export const adminListServices = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const db = await getDb();
    return db.query.services.findMany({
      with: { categories: { columns: { name: true } } },
      orderBy: asc(services.name),
    });
  });

export const adminListActiveDoctorsForSelect = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const db = await getDb();
    return db
      .select({ id: doctors.id, name: doctors.name, specialization: doctors.specialization })
      .from(doctors)
      .where(eq(doctors.is_active, true))
      .orderBy(asc(doctors.name));
  });

export const adminUpsertService = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: { id?: string } & Partial<typeof services.$inferInsert>) => input)
  .handler(async ({ data }) => {
    const db = await getDb();
    const { id, ...payload } = data;
    if (id) await db.update(services).set(payload).where(eq(services.id, id));
    else await db.insert(services).values(payload as typeof services.$inferInsert);
    return { success: true };
  });

export const adminDeleteService = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(idInput)
  .handler(async ({ data }) => {
    const db = await getDb();
    await db.delete(services).where(eq(services.id, data.id));
    return { success: true };
  });

// ---------- tests ----------

export const adminListTests = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const db = await getDb();
    return db.query.tests.findMany({
      with: { categories: { columns: { name: true } } },
      orderBy: asc(tests.name),
    });
  });

export const adminUpsertTest = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: { id?: string } & Partial<typeof tests.$inferInsert>) => input)
  .handler(async ({ data }) => {
    const db = await getDb();
    const { id, ...payload } = data;
    if (id) await db.update(tests).set(payload).where(eq(tests.id, id));
    else await db.insert(tests).values(payload as typeof tests.$inferInsert);
    return { success: true };
  });

export const adminDeleteTest = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator(idInput)
  .handler(async ({ data }) => {
    const db = await getDb();
    await db.delete(tests).where(eq(tests.id, data.id));
    return { success: true };
  });

// ---------- clinic settings ----------

export const adminGetClinicSettings = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const db = await getDb();
    const row = await db.query.clinicSettings.findFirst();
    return row ?? null;
  });

export const adminUpdateClinicSettings = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: { id: string } & Partial<typeof clinicSettings.$inferInsert>) => input)
  .handler(async ({ data }) => {
    const db = await getDb();
    const { id, ...payload } = data;
    await db.update(clinicSettings).set(payload).where(eq(clinicSettings.id, id));
    return { success: true };
  });

// ---------- dashboard ----------

export const adminGetDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const db = await getDb();
    const today = new Date().toISOString().split("T")[0];

    const [doctorsCount, testsCount, categoriesCount, appointmentsCount, servicesCount, todayCount, recent] =
      await Promise.all([
        db.$count(doctors),
        db.$count(tests),
        db.$count(categories),
        db.$count(appointments),
        db.$count(services),
        db.$count(appointments, eq(appointments.date, today)),
        db.query.appointments.findMany({
          with: { doctors: { columns: { name: true } } },
          orderBy: desc(appointments.created_at),
          limit: 5,
        }),
      ]);

    return {
      stats: {
        doctors: doctorsCount,
        tests: testsCount,
        categories: categoriesCount,
        appointments: appointmentsCount,
        services: servicesCount,
        todayAppointments: todayCount,
      },
      recentAppointments: recent,
    };
  });
