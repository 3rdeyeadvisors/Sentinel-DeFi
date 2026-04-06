
-- Fix social-banners bucket: Remove permissive public write policies, add admin-only write
DROP POLICY IF EXISTS "Anyone can upload social banners" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update social banners" ON storage.objects;

CREATE POLICY "Admins can upload social banners"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'social-banners'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can update social banners"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'social-banners'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  bucket_id = 'social-banners'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Fix digital-products bucket: Replace any-authenticated write with admin-only
DROP POLICY IF EXISTS "Authenticated users can upload digital products" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update digital products" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to digital-products" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to digital-products" ON storage.objects;

CREATE POLICY "Admins can upload digital products"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'digital-products'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can update digital products"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'digital-products'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  bucket_id = 'digital-products'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Fix resources bucket: Replace any-authenticated write with admin-only
DROP POLICY IF EXISTS "Admin upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to resources" ON storage.objects;

CREATE POLICY "Admins can upload resources"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resources'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);
