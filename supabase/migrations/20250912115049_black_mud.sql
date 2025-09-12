/*
  # Storage Policies for Image Uploads

  1. Storage Buckets
    - Enable RLS on storage.objects table
    - Create policies for profile-images bucket
    - Create policies for albums bucket

  2. Security
    - Allow authenticated users to upload images
    - Allow authenticated users to view their own images
    - Allow public read access to images
*/

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create profile-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create albums bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('albums', 'albums', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for authenticated users to upload to profile-images bucket
CREATE POLICY "Authenticated users can upload profile images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-images');

-- Policy for authenticated users to upload to albums bucket
CREATE POLICY "Authenticated users can upload album images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'albums');

-- Policy for public read access to profile-images
CREATE POLICY "Public can view profile images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-images');

-- Policy for public read access to albums
CREATE POLICY "Public can view album images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'albums');

-- Policy for authenticated users to update their own uploads in profile-images
CREATE POLICY "Users can update their own profile images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-images' AND auth.uid()::text = owner)
WITH CHECK (bucket_id = 'profile-images');

-- Policy for authenticated users to update their own uploads in albums
CREATE POLICY "Users can update their own album images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'albums' AND auth.uid()::text = owner)
WITH CHECK (bucket_id = 'albums');

-- Policy for authenticated users to delete their own uploads in profile-images
CREATE POLICY "Users can delete their own profile images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'profile-images' AND auth.uid()::text = owner);

-- Policy for authenticated users to delete their own uploads in albums
CREATE POLICY "Users can delete their own album images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'albums' AND auth.uid()::text = owner);