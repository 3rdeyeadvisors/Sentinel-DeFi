
-- Restrict INSERT/UPDATE/DELETE on the public 'resources' bucket to admins only.
-- Public SELECT is preserved so the existing /resources downloads keep working.

DROP POLICY IF EXISTS "Admins can upload resources" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update resources" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete resources" ON storage.objects;

CREATE POLICY "Admins can upload resources"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resources'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can update resources"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'resources'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  bucket_id = 'resources'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can delete resources"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'resources'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);
