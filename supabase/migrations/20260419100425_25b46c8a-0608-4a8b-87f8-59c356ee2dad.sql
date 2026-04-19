-- Site content: editable hero/CTA/stats text and image references
CREATE TABLE public.site_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value_uz text,
  value_ru text,
  value_type text NOT NULL DEFAULT 'text', -- 'text' | 'image' | 'number'
  description text,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site content is publicly readable"
ON public.site_content FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins can insert site content"
ON public.site_content FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update site content"
ON public.site_content FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete site content"
ON public.site_content FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_site_content_updated_at
BEFORE UPDATE ON public.site_content
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for site images (hero, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Site images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-images');

CREATE POLICY "Admins can upload site images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'site-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update site images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'site-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete site images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'site-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Seed default keys (multilingual values, no defaults — sayt fallback i18n ga tushadi)
INSERT INTO public.site_content (key, value_uz, value_ru, value_type, description) VALUES
  ('hero.title', 'Sog''lig''ingiz uchun ishonchli yechim', 'Надёжное решение для вашего здоровья', 'text', 'Bosh sahifa hero sarlavhasi'),
  ('hero.subtitle', 'Tajribali shifokorlar va zamonaviy diagnostika — sizga yaqin, sizga ishonchli.', 'Опытные врачи и современная диагностика — рядом и надёжно.', 'text', 'Hero subtitle'),
  ('hero.image', '', '', 'image', 'Hero o''ng tomonidagi rasm (shifokor)'),
  ('stats.rating', '4.9', '4.9', 'text', 'Reyting'),
  ('stats.doctors', '50+', '50+', 'text', 'Shifokorlar soni'),
  ('stats.patients', '10,000+', '10,000+', 'text', 'Bemorlar soni'),
  ('stats.tests_count', '200+', '200+', 'text', 'Tahlil turlari'),
  ('cta.title', 'Bugun sog''lig''ingizni tekshiring', 'Проверьте своё здоровье сегодня', 'text', 'CTA bloki sarlavhasi'),
  ('cta.subtitle', 'Shifokorimiz bilan maslahat olish uchun hoziroq murojaat qiling.', 'Обратитесь к нашему врачу для консультации прямо сейчас.', 'text', 'CTA bloki tavsifi')
ON CONFLICT (key) DO NOTHING;