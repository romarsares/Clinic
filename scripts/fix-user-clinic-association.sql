-- Fix User Clinic Association
-- This script ensures all users have a valid clinic_id

-- First, check if there are any users without clinic_id
SELECT id, email, full_name, clinic_id, status 
FROM auth_users 
WHERE clinic_id IS NULL OR clinic_id = 0;

-- If you have a default clinic (usually ID = 1), update users without clinic_id
-- UPDATE auth_users 
-- SET clinic_id = 1 
-- WHERE clinic_id IS NULL OR clinic_id = 0;

-- Or update a specific user by email
-- UPDATE auth_users 
-- SET clinic_id = 1 
-- WHERE email = 'admin@clinic.com';

-- Verify the update
SELECT id, email, full_name, clinic_id, status 
FROM auth_users 
ORDER BY id;
