/*
  # Update test types and constraints

  1. Changes
    - Update existing contrast sensitivity tests to use more specific type
    - Add check constraint for test types if it doesn't exist

  2. Details
    - Changes 'contrast_sensitivity' to 'contrast_sensitivity_light'
    - Adds constraint to validate test types if not present
*/

-- Update existing contrast sensitivity tests to be more specific
UPDATE tests
SET test_type = 'contrast_sensitivity_light'
WHERE test_type = 'contrast_sensitivity';

-- Add check constraint for test types if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'valid_test_types' 
        AND conrelid = 'tests'::regclass
    ) THEN
        ALTER TABLE tests
        ADD CONSTRAINT valid_test_types
        CHECK (
            test_type IN (
                'letter_acuity',
                'contrast_sensitivity_light',
                'contrast_sensitivity_dark',
                'color_blindness'
            )
        );
    END IF;
END $$;