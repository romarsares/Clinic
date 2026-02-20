-- Add photo columns to patients table
ALTER TABLE patients 
ADD COLUMN photo_data LONGBLOB,
ADD COLUMN photo_filename VARCHAR(255),
ADD COLUMN photo_mimetype VARCHAR(100);
