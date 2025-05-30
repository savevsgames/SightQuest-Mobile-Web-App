/*
  # Add Visual Acuity Index and Response Time Tracking

  1. New Columns
    - acuity_index: Visual acuity index (20/x converted to decimal)
    - average_response_time: Average response time in milliseconds

  2. Constraints
    - Valid acuity index range: 0.1 to 2.0
    - Valid response time: Must be positive

  3. Documentation
    - Added column comments for clarity
*/

DO $$ 
BEGIN
  -- Add acuity_index column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tests' AND column_name = 'acuity_index') THEN
    ALTER TABLE tests ADD COLUMN acuity_index double precision;
  END IF;

  -- Add average_response_time column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tests' AND column_name = 'average_response_time') THEN
    ALTER TABLE tests ADD COLUMN average_response_time double precision;
  END IF;

  -- Add check constraint for acuity_index if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_acuity_index') THEN
    ALTER TABLE tests
    ADD CONSTRAINT valid_acuity_index 
      CHECK (acuity_index IS NULL OR (acuity_index >= 0.1 AND acuity_index <= 2.0));
  END IF;

  -- Add check constraint for average_response_time if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_response_time') THEN
    ALTER TABLE tests
    ADD CONSTRAINT valid_response_time 
      CHECK (average_response_time IS NULL OR average_response_time >= 0);
  END IF;
END $$;

-- Add column comments
COMMENT ON COLUMN tests.acuity_index IS 'Visual acuity index (20/x converted to decimal). Range: 0.1-2.0';
COMMENT ON COLUMN tests.average_response_time IS 'Average response time in milliseconds for the test session';