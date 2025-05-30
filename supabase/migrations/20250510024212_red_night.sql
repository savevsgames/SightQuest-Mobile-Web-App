/*
  # Fix authentication and RLS policies

  1. Changes
    - Drop existing RLS policies for users table
    - Add new RLS policies for proper authentication flow
    - Update users table structure to match auth requirements

  2. Security
    - Enable RLS
    - Add policies for:
      - Public signup
      - Authenticated user access
      - Admin access
*/

-- First, drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Enable insert for authentication" ON users;
DROP POLICY IF EXISTS "Enable insert for signup" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins have full access to users" ON users;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create new policies

-- Allow users to read their own data
CREATE POLICY "Users can read own data"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow new users to create their profile during signup
CREATE POLICY "Enable user creation during signup"
ON users FOR INSERT
TO public
WITH CHECK (auth.uid() = id);

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
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');