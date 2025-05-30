/*
  # Recreate Users and Tests Tables

  1. Changes
    - Drop existing tables
    - Recreate users table with proper auth.users relationship
    - Recreate tests table with proper user relationship
    - Re-establish RLS policies
    - Maintain all existing columns and constraints

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
    - Add policies for admin users
*/

-- Drop existing tables
DROP TABLE IF EXISTS tests;
DROP TABLE IF EXISTS users;

-- Create users table with auth.users relationship
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  display_name text,
  avatar_url text,
  is_pro boolean DEFAULT false,
  subscription_ends_at timestamptz,
  settings jsonb DEFAULT '{}'::jsonb,
  calibrated_ppi float CHECK (calibrated_ppi >= 72 AND calibrated_ppi <= 600) DEFAULT 96
);

-- Enable RLS on users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Enable public signup"
ON users FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Users can read own data"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins have full access"
ON users FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'admin'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'admin'::text);

-- Create tests table with user relationship
CREATE TABLE IF NOT EXISTS tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  test_type text NOT NULL CHECK (
    test_type IN (
      'letter_acuity',
      'contrast_sensitivity_light',
      'contrast_sensitivity_dark',
      'color_blindness'
    )
  ),
  questions jsonb NOT NULL,
  answers jsonb NOT NULL,
  correct_answers jsonb NOT NULL,
  metrics jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  acuity_index double precision CHECK (acuity_index IS NULL OR (acuity_index >= 0.1 AND acuity_index <= 2.0)),
  average_response_time double precision CHECK (average_response_time IS NULL OR average_response_time >= 0)
);

-- Enable RLS on tests
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;

-- Create policies for tests table
CREATE POLICY "Users can read own test results"
ON tests FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create test results"
ON tests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tests"
ON tests FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins have full access to tests"
ON tests FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'admin'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'admin'::text);

-- Create indexes for better query performance
CREATE INDEX idx_tests_user_id ON tests(user_id);
CREATE INDEX idx_tests_created_at ON tests(created_at DESC);
CREATE INDEX idx_tests_test_type ON tests(test_type);
CREATE INDEX idx_tests_user_test_type ON tests(user_id, test_type);