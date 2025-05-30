/*
  # Add Test Metrics Columns

  1. Changes
    - Safely adds acuity_index and average_response_time columns if they don't exist
    - Adds constraints for data validation
    - Adds column comments for documentation

  2. Constraints
    - acuity_index must be between 0.1 and 2.0 when present
    - average_response_time must be non-negative when present
*/

DO $$ 
BEGIN
  -- Only add acuity_index if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tests' AND column_name = 'acuity_index'
  ) THEN
    ALTER TABLE tests ADD COLUMN acuity_index double precision;
    
    -- Add constraint for acuity_index
    ALTER TABLE tests 
    ADD CONSTRAINT valid_acuity_index 
    CHECK (acuity_index IS NULL OR (acuity_index >= 0.1 AND acuity_index <= 2.0));
    
    -- Add comment for acuity_index
    COMMENT ON COLUMN tests.acuity_index IS 'Visual acuity index (20/x converted to decimal). Range: 0.1-2.0';
  END IF;

  -- Only add average_response_time if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tests' AND column_name = 'average_response_time'
  ) THEN
    ALTER TABLE tests ADD COLUMN average_response_time double precision;
    
    -- Add constraint for average_response_time
    ALTER TABLE tests 
    ADD CONSTRAINT valid_response_time 
    CHECK (average_response_time IS NULL OR average_response_time >= 0);
    
    -- Add comment for average_response_time
    COMMENT ON COLUMN tests.average_response_time IS 'Average response time in milliseconds for the test session';
  END IF;
END $$;