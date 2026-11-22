CREATE TYPE "public"."app_role" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_name" text NOT NULL,
	"phone" text NOT NULL,
	"doctor_id" uuid,
	"service" text NOT NULL,
	"date" date NOT NULL,
	"time" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"type" text DEFAULT 'others' NOT NULL,
	"slug" text,
	"description" text,
	"icon" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"parent_id" uuid,
	"type_id" uuid,
	"name_uz" text,
	"name_ru" text,
	"description_uz" text,
	"description_ru" text
);
--> statement-breakpoint
CREATE TABLE "category_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"icon" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name_uz" text,
	"name_ru" text
);
--> statement-breakpoint
CREATE TABLE "clinic_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_name" text DEFAULT 'Yashfaa Clinic' NOT NULL,
	"logo_url" text,
	"phone" text DEFAULT '+998 71 123 45 67',
	"address" text DEFAULT 'Toshkent, O''zbekiston',
	"telegram" text,
	"working_hours" text DEFAULT 'Dush-Shan: 8:00-20:00',
	"instagram" text,
	"facebook" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "doctors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"specialization" text NOT NULL,
	"image_url" text,
	"bio" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"phone" text,
	"experience_years" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"branch" text,
	"schedule" text,
	"consultation_price" numeric DEFAULT 0,
	"languages" text[] DEFAULT '{}',
	"services_offered" text[] DEFAULT '{}',
	"slug" text,
	"online_available" boolean DEFAULT false NOT NULL,
	"name_uz" text,
	"name_ru" text,
	"specialization_uz" text,
	"specialization_ru" text,
	"bio_uz" text,
	"bio_ru" text
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"full_name" text,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" numeric DEFAULT 0,
	"category_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"duration" text,
	"location_type" text,
	"preparation_requirements" text,
	"result_info" text,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_online" boolean DEFAULT false NOT NULL,
	"doctor_ids" uuid[] DEFAULT '{}',
	"slug" text,
	"name_uz" text,
	"name_ru" text,
	"description_uz" text,
	"description_ru" text,
	"preparation_requirements_uz" text,
	"preparation_requirements_ru" text,
	"result_info_uz" text,
	"result_info_ru" text
);
--> statement-breakpoint
CREATE TABLE "site_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"value_uz" text,
	"value_ru" text,
	"value_type" text DEFAULT 'text' NOT NULL,
	"description" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"price" numeric DEFAULT 0 NOT NULL,
	"category_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"preparation_requirements" text,
	"result_time" text,
	"biomaterial_type" text,
	"is_recommended" boolean DEFAULT false NOT NULL,
	"is_urgent" boolean DEFAULT false NOT NULL,
	"slug" text,
	"name_uz" text,
	"name_ru" text,
	"description_uz" text,
	"description_ru" text,
	"preparation_requirements_uz" text,
	"preparation_requirements_ru" text
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "app_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_type_id_category_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."category_types"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tests" ADD CONSTRAINT "tests_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_key" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "category_types_slug_key" ON "category_types" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "doctors_slug_key" ON "doctors" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "services_slug_key" ON "services" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "site_content_key_key" ON "site_content" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "tests_slug_key" ON "tests" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "user_roles_user_id_role_key" ON "user_roles" USING btree ("user_id","role");