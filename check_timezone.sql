-- Check current MySQL timezone
SELECT @@global.time_zone, @@session.time_zone;

-- Check what time MySQL thinks it is now
SELECT NOW(), UTC_TIMESTAMP();

-- If you want to set MySQL to use system timezone (recommended)
-- SET GLOBAL time_zone = 'SYSTEM';
-- SET SESSION time_zone = 'SYSTEM';

-- Or set to specific timezone (Philippines is +08:00)
-- SET GLOBAL time_zone = '+08:00';
-- SET SESSION time_zone = '+08:00';
