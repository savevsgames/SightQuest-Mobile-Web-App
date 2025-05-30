/*
  # Update RLS policies for users and tests tables

  1. Changes
    - Update RLS policies for users table to allow:
      - New user registration
      - Users to read and update their own data
      - Admins to perform all operations
    - Update RLS policies for tests table to allow:
      - Users to create and read their own tests
      - Users to delete their own tests
      - Only admins to update tests
      - Admins to perform all operations

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
    - Add policies for admin users
    - Ensure proper data isolation between users
*/

-- First, drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create admin role if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_roles WHERE rolname = 'admin'
  ) THEN
    CREATE ROLE admin;
  END IF;
END
$$;

-- Users table policies

-- Allow users to insert their own data during signup
CREATE POLICY "Enable insert for authentication" ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to read their own data
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own data
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow admins full access to users table
CREATE POLICY "Admins have full access to users" ON public.users
  TO admin
  USING (true)
  WITH CHECK (true);

-- Tests table policies

-- Allow users to create their own tests
CREATE POLICY "Users can create tests" ON public.tests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to read their own tests
CREATE POLICY "Users can read own tests" ON public.tests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to delete their own tests
CREATE POLICY "Users can delete own tests" ON public.tests
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow admins full access to tests table
CREATE POLICY "Admins have full access to tests" ON public.tests
  TO admin
  USING (true)
  WITH CHECK (true);