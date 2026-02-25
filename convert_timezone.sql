-- Convert existing last_login_at from local time to UTC
-- Philippine Time is UTC+8, so subtract 8 hours
UPDATE auth_users 
SET last_login_at = DATE_SUB(last_login_at, INTERVAL 8 HOUR) 
WHERE last_login_at IS NOT NULL;

-- Verify the conversion
SELECT id, email, last_login_at FROM auth_users WHERE last_login_at IS NOT NULL;
