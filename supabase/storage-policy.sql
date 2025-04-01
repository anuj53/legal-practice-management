
-- This SQL file contains the policy for the avatars bucket
-- You'll need to execute this in the Supabase SQL editor if the upload functionality doesn't work

-- Create the avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('avatars', 'avatars', true, 2097152) -- 2MB limit
ON CONFLICT (id) DO NOTHING;

-- Public policy for avatar images
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

-- Insert policy for authenticated users to upload their own avatars
CREATE POLICY "Users can upload their own avatars" 
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = 'avatars' AND
  POSITION(auth.uid()::text in name) > 0
);

-- Update policy for authenticated users to update their own avatars
CREATE POLICY "Users can update their own avatars" 
ON storage.objects FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'avatars' AND 
  POSITION(auth.uid()::text in name) > 0
);

-- Delete policy for authenticated users to delete their own avatars
CREATE POLICY "Users can delete their own avatars" 
ON storage.objects FOR DELETE 
TO authenticated
USING (
  bucket_id = 'avatars' AND 
  POSITION(auth.uid()::text in name) > 0
);
