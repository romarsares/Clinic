-- Add photo_url column to patients table
ALTER TABLE patients ADD COLUMN photo_url VARCHAR(255) NULL AFTER emergency_contact_number;

-- Add index for better performance
CREATE INDEX idx_patients_photo ON patients(photo_url);