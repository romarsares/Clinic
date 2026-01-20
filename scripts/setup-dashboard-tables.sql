-- Ensure all required tables exist for dashboard APIs
CREATE TABLE IF NOT EXISTS patients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    clinic_id INT NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS visits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    clinic_id INT NOT NULL,
    patient_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    clinic_id INT NOT NULL,
    patient_id INT,
    appointment_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    clinic_id INT NOT NULL,
    patient_id INT,
    amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    clinic_id INT NOT NULL,
    user_id INT,
    action VARCHAR(100),
    table_name VARCHAR(100),
    record_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data for testing
INSERT IGNORE INTO patients (id, clinic_id, first_name, last_name) VALUES (1, 1, 'John', 'Doe');
INSERT IGNORE INTO visits (id, clinic_id, patient_id) VALUES (1, 1, 1);
INSERT IGNORE INTO appointments (id, clinic_id, patient_id, appointment_date) VALUES (1, 1, 1, CURDATE());
INSERT IGNORE INTO bills (id, clinic_id, patient_id, amount) VALUES (1, 1, 1, 1500.00);
INSERT IGNORE INTO audit_logs (id, clinic_id, user_id, action, table_name, record_id) VALUES (1, 1, 1, 'LOGIN', 'auth_users', 1);