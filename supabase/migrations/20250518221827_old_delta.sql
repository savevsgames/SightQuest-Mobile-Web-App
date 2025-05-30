/*
  # Split contrast sensitivity tests into light and dark variants

  1. Changes
    - Add new test types for light and dark contrast sensitivity tests
    - Update existing contrast sensitivity tests to be light variant
    - Add constraint to validate test types

  2. Security
    - Maintain existing RLS policies
    - Ensure data integrity during migration
*/

-- First, update existing contrast sensitivity tests to be light variant
UPDATE tests
SET test_type = 'contrast_sensitivity_light'
WHERE test_type = 'contrast_sensitivity';

-- Add check constraint for test types AFTER updating existing data
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