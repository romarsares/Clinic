-- Check current admin user roles
SELECT 
    u.id,
    u.email,
    u.clinic_id,
    GROUP_CONCAT(r.name) as roles
FROM auth_users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'admin@clinic.com'
GROUP BY u.id;

-- If you need to add Super User role:
-- First, check if Super User role exists
SELECT id, name, clinic_id FROM roles WHERE name = 'Super User';

-- If it doesn't exist, create it (use clinic_id = 1 or your clinic's ID)
-- INSERT INTO roles (clinic_id, name, description, created_at, updated_at)
-- VALUES (1, 'Super User', 'System administrator with full access', NOW(), NOW());

-- Then assign Super User role to admin
-- SET @user_id = (SELECT id FROM auth_users WHERE email = 'admin@clinic.com' LIMIT 1);
-- SET @role_id = (SELECT id FROM roles WHERE name = 'Super User' LIMIT 1);
-- INSERT IGNORE INTO user_roles (user_id, role_id, created_at)
-- VALUES (@user_id, @role_id, NOW());
