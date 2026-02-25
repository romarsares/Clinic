-- Add contact_number and address to auth_users table
-- This migration is idempotent (safe to run multiple times)

-- Add contact_number column if it doesn't exist
SET @col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'auth_users' 
    AND COLUMN_NAME = 'contact_number'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE auth_users ADD COLUMN contact_number VARCHAR(20) AFTER email',
    'SELECT ''Column contact_number already exists'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add address column if it doesn't exist
SET @col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'auth_users' 
    AND COLUMN_NAME = 'address'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE auth_users ADD COLUMN address TEXT AFTER contact_number',
    'SELECT ''Column address already exists'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
