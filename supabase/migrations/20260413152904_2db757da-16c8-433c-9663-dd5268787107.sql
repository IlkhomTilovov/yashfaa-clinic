
INSERT INTO storage.buckets (id, name, public)
VALUES ('doctor-images', 'doctor-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view doctor images"
ON storage.objects FOR SELECT
USING (bucket_id = 'doctor-images');

CREATE POLICY "Admins can upload doctor images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'doctor-images'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can update doctor images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'doctor-images'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can delete doctor images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'doctor-images'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);
