/*
  # Add calibration support to users table

  1. Changes
    - Add calibrated_ppi column to users table
    - Add default value for uncalibrated devices
    - Add validation check for reasonable PPI values

  2. Security
    - Maintain existing RLS policies
*/

-- Add calibrated_ppi column with constraints
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS calibrated_ppi float 
CHECK (calibrated_ppi >= 72 AND calibrated_ppi <= 600) -- Reasonable PPI range
DEFAULT 96; -- Default web PPI