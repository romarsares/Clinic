-- Add is_active column to patients table
ALTER TABLE patients 
ADD COLUMN is_active TINYINT(1) DEFAULT 1 AFTER deleted_at;

-- Update existing records: active if deleted_at is NULL
UPDATE patients 
SET is_active = CASE WHEN deleted_at IS NULL THEN 1 ELSE 0 END;

-- Add index for better query performance
CREATE INDEX idx_patients_is_active ON patients(is_active);
