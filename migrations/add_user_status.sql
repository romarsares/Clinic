-- Ensure auth_users table has status column
-- This migration is idempotent (safe to run multiple times)

-- Check if status column exists, if not add it
SET @col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'auth_users' 
    AND COLUMN_NAME = 'status'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE auth_users ADD COLUMN status ENUM(''active'', ''suspended'') DEFAULT ''active'' AFTER password_hash',
    'SELECT ''Column status already exists'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update any NULL status values to 'active'
UPDATE auth_users SET status = 'active' WHERE status IS NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_status ON auth_users(status);
CREATE INDEX IF NOT EXISTS idx_users_clinic_status ON auth_users(clinic_id, status);
