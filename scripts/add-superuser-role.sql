-- Add Super User role to admin@clinic.com

SET @user_id = (SELECT id FROM auth_users WHERE email = 'admin@clinic.com' LIMIT 1);
SET @role_id = (SELECT id FROM roles WHERE name = 'Super User' LIMIT 1);

INSERT IGNORE INTO user_roles (user_id, role_id, created_at)
VALUES (@user_id, @role_id, NOW());

-- Verify
SELECT 
    u.email,
    GROUP_CONCAT(r.name) as roles
FROM auth_users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'admin@clinic.com'
GROUP BY u.id;
