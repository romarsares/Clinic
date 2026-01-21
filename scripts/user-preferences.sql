-- User Preferences Table
-- Allows users to store personal preferences and settings

CREATE TABLE user_preferences (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    clinic_id BIGINT NOT NULL,
    preference_key VARCHAR(100) NOT NULL,
    preference_value TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES auth_users(id),
    FOREIGN KEY (clinic_id) REFERENCES clinics(id),
    UNIQUE KEY uq_user_preference (user_id, preference_key),
    INDEX idx_user_preferences (user_id, clinic_id)
);

-- Insert default preferences for existing admin user
INSERT INTO user_preferences (user_id, clinic_id, preference_key, preference_value) VALUES
(1, 1, 'theme', 'light'),
(1, 1, 'language', 'en'),
(1, 1, 'timezone', 'Asia/Manila'),
(1, 1, 'dashboard_refresh_interval', '30'),
(1, 1, 'notifications_enabled', 'true'),
(1, 1, 'date_format', 'MM/DD/YYYY'),
(1, 1, 'time_format', '12h');