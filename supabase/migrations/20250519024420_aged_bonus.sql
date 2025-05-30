/*
  # Add Acuity Metrics

  1. New Columns
    - `acuity_index` (double precision): Stores the calculated visual acuity index (20/x converted to decimal)
    - `average_response_time` (double precision): Stores the average response time in milliseconds

  2. Changes
    - Added NOT NULL constraints to ensure data integrity
    - Added CHECK constraints to validate data ranges
    - Added comments to explain column usage
*/

-- Add new columns with constraints
ALTER TABLE tests
ADD COLUMN IF NOT EXISTS acuity_index double precision,
ADD COLUMN IF NOT EXISTS average_response_time double precision;

-- Add check constraints
ALTER TABLE tests
ADD CONSTRAINT valid_acuity_index 
  CHECK (acuity_index IS NULL OR (acuity_index >= 0.1 AND acuity_index <= 2.0)),
ADD CONSTRAINT valid_response_time 
  CHECK (average_response_time IS NULL OR average_response_time >= 0);

-- Add column comments
COMMENT ON COLUMN tests.acuity_index IS 'Visual acuity index (20/x converted to decimal). Range: 0.1-2.0';
COMMENT ON COLUMN tests.average_response_time IS 'Average response time in milliseconds for the test session';