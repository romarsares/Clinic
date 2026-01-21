-- User Permissions System - Granular Access Control
-- Creates table for checkbox-based permissions

CREATE TABLE IF NOT EXISTS user_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    clinic_id INT NOT NULL,
    permission_key VARCHAR(100) NOT NULL,
    granted_by INT NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE,
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES auth_users(id),
    
    UNIQUE KEY unique_user_permission (user_id, clinic_id, permission_key),
    INDEX idx_user_clinic (user_id, clinic_id),
    INDEX idx_permission_key (permission_key)
);

-- Insert default permissions for Super Users and Owners
INSERT IGNORE INTO user_permissions (user_id, clinic_id, permission_key, granted_by)
SELECT 
    u.id,
    u.clinic_id,
    p.permission_key,
    u.id
FROM auth_users u
CROSS JOIN (
    -- All available permissions
    SELECT 'patient.add' as permission_key
    UNION SELECT 'patient.edit'
    UNION SELECT 'patient.view'
    UNION SELECT 'patient.delete'
    UNION SELECT 'appointment.create'
    UNION SELECT 'appointment.edit'
    UNION SELECT 'appointment.view'
    UNION SELECT 'appointment.cancel'
    UNION SELECT 'billing.create'
    UNION SELECT 'billing.edit'
    UNION SELECT 'billing.view'
    UNION SELECT 'billing.payment'
    UNION SELECT 'clinical.visit.create'
    UNION SELECT 'clinical.visit.edit'
    UNION SELECT 'clinical.visit.view'
    UNION SELECT 'clinical.lab.order'
    UNION SELECT 'lab.request.create'
    UNION SELECT 'lab.result.enter'
    UNION SELECT 'lab.result.view'
    UNION SELECT 'lab.dashboard'
    UNION SELECT 'reports.clinical'
    UNION SELECT 'reports.financial'
    UNION SELECT 'reports.patient'
    UNION SELECT 'reports.export'
    UNION SELECT 'admin.users'
    UNION SELECT 'admin.permissions'
    UNION SELECT 'admin.settings'
    UNION SELECT 'admin.audit'
) p
WHERE JSON_CONTAINS(u.roles, '"Super User"') OR JSON_CONTAINS(u.roles, '"Owner"');

-- Give Owners the admin.permissions by default (User Group Access Settings)
INSERT IGNORE INTO user_permissions (user_id, clinic_id, permission_key, granted_by)
SELECT 
    u.id,
    u.clinic_id,
    'admin.permissions',
    u.id
FROM auth_users u
WHERE JSON_CONTAINS(u.roles, '"Owner"');

SELECT 'User permissions system created successfully' as message;