/*
  # Fix RLS policies for user signup

  1. Changes
    - Add policy to allow public users to insert into users table during signup
    - Ensure policy checks that the user ID matches the authenticated user's ID

  2. Security
    - Maintains existing RLS policies
    - Adds specific policy for signup process
    - Ensures users can only create their own records
*/

-- Add policy to allow public users to insert during signup
CREATE POLICY "Enable insert for signup" ON public.users
FOR INSERT
TO public
WITH CHECK (
  -- Ensure the user can only create their own record
  auth.uid() = id
);