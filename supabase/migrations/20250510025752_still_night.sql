/*
  # Fix Authentication Flow

  1. Changes
    - Drop existing policies to start fresh
    - Add new policies for user creation and management
    - Ensure proper RLS for user authentication flow

  2. Security
    - Enable RLS on users table
    - Add policies for:
      - Public signup
      - Authenticated user operations
      - Admin access
*/

-- First, drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Enable user creation during signup" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins have full access" ON users;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create new policies

-- Allow public access for signup
CREATE POLICY "Enable public signup"
ON users FOR INSERT
TO public
WITH CHECK (true);

-- Allow users to read their own data
CREATE POLICY "Users can read own data"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update own data"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow admins full access
CREATE POLICY "Admins have full access"
ON users FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'admin'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'admin'::text);