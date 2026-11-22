import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  date,
  uniqueIndex,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Column keys below are intentionally snake_case, matching the DB column
// names 1:1 — the whole app (routes/components, carried over from the
// Supabase/PostgREST days) reads fields like `row.name_uz`/`row.created_at`
// directly, so Drizzle's returned objects must keep those exact keys.

export const appRoleEnum = pgEnum("app_role", ["admin", "user"]);

export const categoryTypes = pgTable("category_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  icon: text("icon"),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  name_uz: text("name_uz"),
  name_ru: text("name_ru"),
}, (table) => ({
  slugUnique: uniqueIndex("category_types_slug_key").on(table.slug),
}));

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  type: text("type").notNull().default("others"),
  slug: text("slug"),
  description: text("description"),
  icon: text("icon"),
  sort_order: integer("sort_order").notNull().default(0),
  is_featured: boolean("is_featured").notNull().default(false),
  is_active: boolean("is_active").notNull().default(true),
  parent_id: uuid("parent_id").references((): AnyPgColumn => categories.id, { onDelete: "set null" }),
  type_id: uuid("type_id").references(() => categoryTypes.id, { onDelete: "set null" }),
  name_uz: text("name_uz"),
  name_ru: text("name_ru"),
  description_uz: text("description_uz"),
  description_ru: text("description_ru"),
}, (table) => ({
  slugUnique: uniqueIndex("categories_slug_key").on(table.slug),
}));

export const tests = pgTable("tests", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  price: numeric("price", { mode: "number" }).notNull().default(0),
  category_id: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  description: text("description"),
  is_active: boolean("is_active").notNull().default(true),
  preparation_requirements: text("preparation_requirements"),
  result_time: text("result_time"),
  biomaterial_type: text("biomaterial_type"),
  is_recommended: boolean("is_recommended").notNull().default(false),
  is_urgent: boolean("is_urgent").notNull().default(false),
  slug: text("slug"),
  name_uz: text("name_uz"),
  name_ru: text("name_ru"),
  description_uz: text("description_uz"),
  description_ru: text("description_ru"),
  preparation_requirements_uz: text("preparation_requirements_uz"),
  preparation_requirements_ru: text("preparation_requirements_ru"),
}, (table) => ({
  slugUnique: uniqueIndex("tests_slug_key").on(table.slug),
}));

export const doctors = pgTable("doctors", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  specialization: text("specialization").notNull(),
  image_url: text("image_url"),
  bio: text("bio"),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  phone: text("phone"),
  experience_years: integer("experience_years"),
  is_active: boolean("is_active").notNull().default(true),
  branch: text("branch"),
  schedule: text("schedule"),
  consultation_price: numeric("consultation_price", { mode: "number" }).default(0),
  languages: text("languages").array().default([]),
  services_offered: text("services_offered").array().default([]),
  slug: text("slug"),
  online_available: boolean("online_available").notNull().default(false),
  name_uz: text("name_uz"),
  name_ru: text("name_ru"),
  specialization_uz: text("specialization_uz"),
  specialization_ru: text("specialization_ru"),
  bio_uz: text("bio_uz"),
  bio_ru: text("bio_ru"),
}, (table) => ({
  slugUnique: uniqueIndex("doctors_slug_key").on(table.slug),
}));

export const appointments = pgTable("appointments", {
  id: uuid("id").primaryKey().defaultRandom(),
  patient_name: text("patient_name").notNull(),
  phone: text("phone").notNull(),
  doctor_id: uuid("doctor_id").references(() => doctors.id, { onDelete: "set null" }),
  service: text("service").notNull(),
  date: date("date").notNull(),
  time: text("time").notNull(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  status: text("status").notNull().default("new"),
  notes: text("notes"),
});

export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price", { mode: "number" }).default(0),
  category_id: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  duration: text("duration"),
  location_type: text("location_type"),
  preparation_requirements: text("preparation_requirements"),
  result_info: text("result_info"),
  is_featured: boolean("is_featured").notNull().default(false),
  is_online: boolean("is_online").notNull().default(false),
  doctor_ids: uuid("doctor_ids").array().default([]),
  slug: text("slug"),
  name_uz: text("name_uz"),
  name_ru: text("name_ru"),
  description_uz: text("description_uz"),
  description_ru: text("description_ru"),
  preparation_requirements_uz: text("preparation_requirements_uz"),
  preparation_requirements_ru: text("preparation_requirements_ru"),
  result_info_uz: text("result_info_uz"),
  result_info_ru: text("result_info_ru"),
}, (table) => ({
  slugUnique: uniqueIndex("services_slug_key").on(table.slug),
}));

export const clinicSettings = pgTable("clinic_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  clinic_name: text("clinic_name").notNull().default("Yashfaa Clinic"),
  logo_url: text("logo_url"),
  phone: text("phone").default("+998 71 123 45 67"),
  address: text("address").default("Toshkent, O'zbekiston"),
  telegram: text("telegram"),
  working_hours: text("working_hours").default("Dush-Shan: 8:00-20:00"),
  instagram: text("instagram"),
  facebook: text("facebook"),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});

export const siteContent = pgTable("site_content", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull(),
  value_uz: text("value_uz"),
  value_ru: text("value_ru"),
  value_type: text("value_type").notNull().default("text"),
  description: text("description"),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
}, (table) => ({
  keyUnique: uniqueIndex("site_content_key_key").on(table.key),
}));

// `user_id` stores the Supabase Auth user id (plain uuid, no FK — Auth stays
// on Supabase in phase 1, so there is no local `users` table to reference yet).
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  full_name: text("full_name"),
  avatar_url: text("avatar_url"),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
}, (table) => ({
  userIdUnique: uniqueIndex("profiles_user_id_key").on(table.user_id),
}));

export const userRoles = pgTable("user_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  role: appRoleEnum("role").notNull(),
  created_at: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
}, (table) => ({
  userRoleUnique: uniqueIndex("user_roles_user_id_role_key").on(table.user_id, table.role),
}));

// Relation keys are named after the Supabase PostgREST embedding convention
// (the related TABLE name, e.g. `categories`/`doctors`) so existing component
// code reading `row.categories.name` / `row.doctors.name` needs no changes.
export const testsRelations = relations(tests, ({ one }) => ({
  categories: one(categories, { fields: [tests.category_id], references: [categories.id] }),
}));

export const servicesRelations = relations(services, ({ one }) => ({
  categories: one(categories, { fields: [services.category_id], references: [categories.id] }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  doctors: one(doctors, { fields: [appointments.doctor_id], references: [doctors.id] }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  tests: many(tests),
  services: many(services),
}));
