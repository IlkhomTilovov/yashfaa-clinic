import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { and, asc, eq, arrayContains } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { categories, tests, doctors, services, appointments, siteContent } from "@/lib/db/schema";

// Sanitized error helper: log full detail server-side, return generic message to clients
function fail(context: string, error: unknown): never {
  console.error(`[server-fn:${context}]`, error);
  throw new Error("Kutilmagan xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring.");
}

export const getCategories = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const db = await getDb();
    return await db.select().from(categories).orderBy(asc(categories.name));
  } catch (error) {
    fail("getCategories", error);
  }
});

export const getTests = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const db = await getDb();
    return await db.query.tests.findMany({
      with: { categories: { columns: { name: true } } },
      orderBy: asc(tests.name),
    });
  } catch (error) {
    fail("getTests", error);
  }
});

export const getTestBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => {
    const parsed = z.object({ slug: z.string().min(1) }).parse(input);
    return parsed;
  })
  .handler(async ({ data }) => {
    try {
      const db = await getDb();
      const test = await db.query.tests.findFirst({
        where: and(eq(tests.slug, data.slug), eq(tests.is_active, true)),
        with: { categories: { columns: { name: true } } },
      });
      if (!test) throw new Error("Not found");
      return test;
    } catch (error) {
      fail("getTestBySlug", error);
    }
  });

// Public doctor columns — excludes `phone` (restricted; admin-only via getDoctorsAdmin)
const PUBLIC_DOCTOR_COLUMNS = {
  id: true, name: true, name_uz: true, name_ru: true,
  specialization: true, specialization_uz: true, specialization_ru: true,
  image_url: true, bio: true, bio_uz: true, bio_ru: true,
  created_at: true, experience_years: true, is_active: true, branch: true,
  schedule: true, consultation_price: true, languages: true,
  services_offered: true, slug: true, online_available: true,
} as const;

export const getDoctors = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const db = await getDb();
    return await db.query.doctors.findMany({
      columns: PUBLIC_DOCTOR_COLUMNS,
      orderBy: asc(doctors.name),
    });
  } catch (error) {
    fail("getDoctors", error);
  }
});

export const getDoctorById = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => {
    const parsed = z.object({ id: z.string().uuid() }).parse(input);
    return parsed;
  })
  .handler(async ({ data }) => {
    try {
      const db = await getDb();
      const doctor = await db.query.doctors.findFirst({
        columns: PUBLIC_DOCTOR_COLUMNS,
        where: and(eq(doctors.id, data.id), eq(doctors.is_active, true)),
      });
      return doctor ?? null; // null if not found or inactive
    } catch (error) {
      fail("getDoctorById", error);
    }
  });

/**
 * Returns services where this doctor is listed in `doctor_ids` array.
 */
export const getServicesByDoctor = createServerFn({ method: "GET" })
  .inputValidator((input: { doctorId: string }) => {
    return z.object({ doctorId: z.string().uuid() }).parse(input);
  })
  .handler(async ({ data }) => {
    try {
      const db = await getDb();
      return await db.query.services.findMany({
        where: and(eq(services.is_active, true), arrayContains(services.doctor_ids, [data.doctorId])),
        with: { categories: { columns: { name: true, name_uz: true, name_ru: true } } },
        orderBy: asc(services.name),
      });
    } catch (error) {
      fail("getServicesByDoctor", error);
    }
  });

export const createAppointment = createServerFn({ method: "POST" })
  .inputValidator((input: {
    patient_name: string;
    phone: string;
    doctor_id: string;
    service: string;
    date: string;
    time: string;
  }) => {
    const parsed = z.object({
      patient_name: z.string().min(2).max(100),
      phone: z.string().min(7).max(20).regex(/^[+\d\s()-]+$/),
      doctor_id: z.string().uuid(),
      service: z.string().min(1).max(200),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      time: z.string().min(1).max(10),
    }).parse(input);
    return parsed;
  })
  .handler(async ({ data }) => {
    try {
      const db = await getDb();
      await db.insert(appointments).values(data);
      return { success: true };
    } catch (error) {
      fail("createAppointment", error);
    }
  });

export const getSiteContent = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const db = await getDb();
    const rows = await db
      .select({
        key: siteContent.key,
        value_uz: siteContent.value_uz,
        value_ru: siteContent.value_ru,
        value_type: siteContent.value_type,
      })
      .from(siteContent);
    // Return as a map keyed by `key` so the client can hydrate directly
    const map: Record<string, { key: string; value_uz: string | null; value_ru: string | null; value_type: string }> = {};
    for (const row of rows) {
      map[row.key] = row;
    }
    return map;
  } catch (error) {
    fail("getSiteContent", error);
  }
});

export const getServices = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const db = await getDb();
    return await db.query.services.findMany({
      with: { categories: { columns: { name: true } } },
      orderBy: asc(services.name),
    });
  } catch (error) {
    fail("getServices", error);
  }
});

export const getActiveServices = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const db = await getDb();
    return await db
      .select({
        id: services.id,
        name: services.name,
        name_uz: services.name_uz,
        name_ru: services.name_ru,
        slug: services.slug,
        category_id: services.category_id,
      })
      .from(services)
      .where(eq(services.is_active, true))
      .orderBy(asc(services.name));
  } catch (error) {
    fail("getActiveServices", error);
  }
});

export const getServiceBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => {
    const parsed = z.object({ slug: z.string().min(1) }).parse(input);
    return parsed;
  })
  .handler(async ({ data }) => {
    const db = await getDb();
    let service;
    try {
      service = await db.query.services.findFirst({
        where: and(eq(services.slug, data.slug), eq(services.is_active, true)),
        with: { categories: { columns: { name: true } } },
      });
    } catch (error) {
      fail("getServiceBySlug", error);
    }
    if (!service) throw new Error("Xizmat topilmadi");
    return service;
  });
