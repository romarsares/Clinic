-- Add avatar_url column to auth_users table
ALTER TABLE auth_users ADD COLUMN avatar_url VARCHAR(255) NULL AFTER full_name;

-- Add index for better performance
CREATE INDEX idx_auth_users_avatar ON auth_users(avatar_url);