-- Add Feature Toggle System to Clinic SaaS
-- This script adds the clinic_features table and default feature settings

-- Create clinic_features table
CREATE TABLE clinic_features (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    clinic_id BIGINT NOT NULL,
    feature_name VARCHAR(100) NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    enabled_by BIGINT,
    enabled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    disabled_by BIGINT,
    disabled_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (clinic_id) REFERENCES clinics(id),
    FOREIGN KEY (enabled_by) REFERENCES auth_users(id),
    FOREIGN KEY (disabled_by) REFERENCES auth_users(id),
    UNIQUE KEY uq_clinic_feature (clinic_id, feature_name),
    INDEX idx_clinic_feature_enabled (clinic_id, feature_name, is_enabled)
);

-- Insert default features for existing clinic (clinic_id = 1)
INSERT INTO clinic_features (clinic_id, feature_name, is_enabled, enabled_by) VALUES
(1, 'appointments', TRUE, 1),
(1, 'laboratory', TRUE, 1),
(1, 'billing', TRUE, 1),
(1, 'parent_portal', TRUE, 1),
(1, 'sms_notifications', FALSE, 1),
(1, 'pediatric_features', TRUE, 1),
(1, 'advanced_analytics', TRUE, 1),
(1, 'clinical_templates', TRUE, 1),
(1, 'vaccine_management', TRUE, 1),
(1, 'growth_tracking', TRUE, 1);

-- Create feature definitions table for reference
CREATE TABLE feature_definitions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    feature_name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    is_core BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert feature definitions
INSERT INTO feature_definitions (feature_name, display_name, description, category, is_core) VALUES
('appointments', 'Appointment Management', 'Schedule and manage patient appointments', 'Core Operations', FALSE),
('laboratory', 'Laboratory Management', 'Lab requests, results, and analytics', 'Clinical', FALSE),
('billing', 'Billing & Payments', 'Invoice generation and payment processing', 'Financial', FALSE),
('parent_portal', 'Parent Portal', 'Limited access portal for patient guardians', 'Patient Access', FALSE),
('sms_notifications', 'SMS Notifications', 'Automated SMS reminders and alerts', 'Communication', FALSE),
('pediatric_features', 'Pediatric Features', 'Growth charts, milestones, vaccine tracking', 'Clinical', FALSE),
('advanced_analytics', 'Advanced Analytics', 'Clinical reports and data insights', 'Analytics', FALSE),
('clinical_templates', 'Clinical Templates', 'Standardized clinical note templates', 'Clinical', FALSE),
('vaccine_management', 'Vaccine Management', 'Immunization tracking and compliance', 'Clinical', FALSE),
('growth_tracking', 'Growth Tracking', 'WHO growth charts and development milestones', 'Pediatric', FALSE);