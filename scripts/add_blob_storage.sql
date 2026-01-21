-- Add BLOB columns for storing files directly in MySQL
ALTER TABLE patients ADD COLUMN photo_data LONGBLOB NULL AFTER emergency_contact_number;
ALTER TABLE patients ADD COLUMN photo_filename VARCHAR(255) NULL AFTER photo_data;
ALTER TABLE patients ADD COLUMN photo_mimetype VARCHAR(100) NULL AFTER photo_filename;

-- Add BLOB columns for user avatars
ALTER TABLE auth_users ADD COLUMN avatar_data LONGBLOB NULL AFTER avatar_url;
ALTER TABLE auth_users ADD COLUMN avatar_filename VARCHAR(255) NULL AFTER avatar_data;
ALTER TABLE auth_users ADD COLUMN avatar_mimetype VARCHAR(100) NULL AFTER avatar_filename;