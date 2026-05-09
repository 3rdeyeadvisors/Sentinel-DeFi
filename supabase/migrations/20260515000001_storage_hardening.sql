-- Storage Security Hardening Migration
-- This migration secures storage buckets and restricts unauthorized access

-- 1. Secure 'social-banners' bucket
UPDATE storage.buckets
SET public = false
WHERE id = 'social-banners';

-- 2. Update RLS policies for storage objects

-- social-banners: only authenticated users can see their own banners
DROP POLICY IF EXISTS "Public access to social-banners" ON storage.objects;
CREATE POLICY "Users can view their own social banners"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'social-banners'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Ensure 'avatars' remains public but secure for modifications
UPDATE storage.buckets
SET public = true
WHERE id = 'avatars';
