-- Fix 1: Replace overly permissive digital-products SELECT policy
-- Current: any authenticated user can view all files
-- New: only users who purchased the associated product can access files

DROP POLICY IF EXISTS "Authenticated users can view files" ON storage.objects;

CREATE POLICY "Purchasers can view digital product files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'digital-products'
  AND (
    -- Admins can access all files
    has_role(auth.uid(), 'admin'::app_role)
    OR
    -- Users who purchased the product associated with this file
    EXISTS (
      SELECT 1
      FROM public.digital_product_files dpf
      INNER JOIN public.user_purchases up ON up.product_id = dpf.product_id
      WHERE dpf.file_path = storage.filename(name)
        AND up.user_id = auth.uid()
    )
  )
);