/*
  # Enhance user profile and add subscription tracking

  1. Changes
    - Add profile fields to users table
    - Add subscription tracking
    - Add avatar storage

  2. Security
    - Update RLS policies for new fields
*/

-- Add new columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_pro boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_ends_at timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}'::jsonb;

-- Update RLS policy to allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create storage bucket for avatars
-- Note: This needs to be done in the Supabase dashboard or using the CLI
-- INSERT INTO storage.buckets (id, name) VALUES ('avatars', 'avatars');

-- Create policy to allow users to upload their own avatar
-- Note: This needs to be done in the Supabase dashboard or using the CLI
-- CREATE POLICY "Users can upload own avatar"
--   ON storage.objects
--   FOR INSERT
--   TO authenticated
--   WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);