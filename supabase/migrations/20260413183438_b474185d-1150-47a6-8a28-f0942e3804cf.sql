
-- Create category_types table
CREATE TABLE public.category_types (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  icon text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.category_types ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Category types are publicly readable"
ON public.category_types FOR SELECT
TO anon, authenticated
USING (true);

-- Admin CRUD
CREATE POLICY "Admins can insert category types"
ON public.category_types FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update category types"
ON public.category_types FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete category types"
ON public.category_types FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Insert initial data
INSERT INTO public.category_types (name, slug, icon) VALUES
  ('Laboratoriya', 'laboratoriya', 'flask'),
  ('Diagnostika', 'diagnostika', 'microscope'),
  ('Kosmetologiya', 'kosmetologiya', 'sparkles'),
  ('Tibbiy xizmat', 'tibbiy-xizmat', 'heart');

-- Add type_id FK to categories table
ALTER TABLE public.categories
  ADD COLUMN type_id uuid REFERENCES public.category_types(id) ON DELETE SET NULL;

-- Migrate existing type values to type_id
UPDATE public.categories c
SET type_id = ct.id
FROM public.category_types ct
WHERE (c.type = 'laboratory' AND ct.slug = 'laboratoriya')
   OR (c.type = 'diagnostics' AND ct.slug = 'diagnostika')
   OR (c.type = 'cosmetology' AND ct.slug = 'kosmetologiya');
