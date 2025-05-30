/*
  # Create users and test results tables

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      
    - `tests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `test_type` (text)
      - `questions` (jsonb)
      - `answers` (jsonb)
      - `correct_answers` (jsonb)
      - `metrics` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to:
      - Read their own data
      - Create new test results
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create tests table
CREATE TABLE IF NOT EXISTS tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  test_type text NOT NULL,
  questions jsonb NOT NULL,
  answers jsonb NOT NULL,
  correct_answers jsonb NOT NULL,
  metrics jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on tests
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;

-- Create policies for tests
CREATE POLICY "Users can read own test results"
  ON tests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create test results"
  ON tests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);