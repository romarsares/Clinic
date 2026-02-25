-- Grant admin.users permission to Owner role
-- This allows Owner to create/manage users

-- Get the permission ID
SELECT @perm_id := id FROM permissions WHERE name = 'admin.users' LIMIT 1;

-- If permission doesn't exist, create it
INSERT IGNORE INTO permissions (name, display_name, description, category, created_at)
VALUES ('admin.users', 'Manage Users', 'Create, update, and delete users', 'admin', NOW());

-- Get the permission ID again
SELECT @perm_id := id FROM permissions WHERE name = 'admin.users' LIMIT 1;

-- Assign to all Owner roles
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at)
SELECT r.id, @perm_id, NOW()
FROM roles r
WHERE r.name = 'Owner';

-- Verify
SELECT 
    r.name as role_name,
    r.clinic_id,
    p.name as permission_name,
    p.display_name
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'Owner' AND p.name = 'admin.users';
