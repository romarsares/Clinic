-- Assign Owner role to admin@clinic.com user
-- This fixes the "User roles: []" issue

-- Find the user
SELECT @user_id := id FROM auth_users WHERE email = 'admin@clinic.com' LIMIT 1;

-- Find the Owner role for their clinic
SELECT @role_id := id FROM roles WHERE name = 'Owner' AND clinic_id = (
    SELECT clinic_id FROM auth_users WHERE email = 'admin@clinic.com' LIMIT 1
) LIMIT 1;

-- Assign the role (if not already assigned)
INSERT IGNORE INTO user_roles (user_id, role_id, created_at)
VALUES (@user_id, @role_id, NOW());

-- Verify the assignment
SELECT 
    u.email,
    u.clinic_id,
    r.name as role_name
FROM auth_users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'admin@clinic.com';
