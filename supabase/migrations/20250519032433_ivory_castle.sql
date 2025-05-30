/*
  # Add metrics columns to tests table

  1. Changes
    - Add acuity_index column for storing visual acuity measurements
    - Add average_response_time column for tracking test performance
    - Add validation constraints for both columns
    - Add descriptive comments for the columns

  2. Constraints
    - acuity_index must be between 0.1 and 2.0 (or null)
    - average_response_time must be non-negative (or null)
*/

-- Add new columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tests' AND column_name = 'acuity_index'
  ) THEN
    ALTER TABLE tests ADD COLUMN acuity_index double precision;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tests' AND column_name = 'average_response_time'
  ) THEN
    ALTER TABLE tests ADD COLUMN average_response_time double precision;
  END IF;
END $$;

-- Add constraints if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_acuity_index'
  ) THEN
    ALTER TABLE tests
    ADD CONSTRAINT valid_acuity_index 
    CHECK (acuity_index IS NULL OR (acuity_index >= 0.1 AND acuity_index <= 2.0));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_response_time'
  ) THEN
    ALTER TABLE tests
    ADD CONSTRAINT valid_response_time 
    CHECK (average_response_time IS NULL OR average_response_time >= 0);
  END IF;
END $$;

-- Add column comments
COMMENT ON COLUMN tests.acuity_index IS 'Visual acuity index (20/x converted to decimal). Range: 0.1-2.0';
COMMENT ON COLUMN tests.average_response_time IS 'Average response time in milliseconds for the test session';