-- Check what time is being stored
SELECT 
    NOW() as local_time,
    UTC_TIMESTAMP() as utc_time,
    last_login_at,
    CONVERT_TZ(last_login_at, '+00:00', '+08:00') as ph_time
FROM auth_users 
WHERE last_login_at IS NOT NULL 
LIMIT 1;
