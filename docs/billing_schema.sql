-- Billing Integration Database Schema

-- Billing Services (Service-to-billing code mapping)
CREATE TABLE billing_services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    service_id INT NOT NULL,
    billing_code VARCHAR(20) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    description TEXT,
    effective_date DATE DEFAULT CURDATE(),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_service_id (service_id),
    INDEX idx_billing_code (billing_code)
);

-- Billing Procedures (CPT codes and pricing)
CREATE TABLE billing_procedures (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    type ENUM('consultation', 'procedure', 'laboratory', 'imaging') NOT NULL,
    category VARCHAR(100),
    effective_date DATE DEFAULT CURDATE(),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_type (type)
);

-- Billing Charges (Individual charges per visit)
CREATE TABLE billing_charges (
    id INT PRIMARY KEY AUTO_INCREMENT,
    visit_id INT NOT NULL,
    service_type ENUM('consultation', 'procedure', 'laboratory', 'imaging', 'medication') NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    billing_code VARCHAR(20),
    quantity INT DEFAULT 1,
    lab_test_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE CASCADE,
    FOREIGN KEY (lab_test_id) REFERENCES lab_tests(id) ON DELETE SET NULL,
    INDEX idx_visit_id (visit_id),
    INDEX idx_service_type (service_type),
    INDEX idx_billing_code (billing_code)
);

-- Insurance Information
CREATE TABLE insurance_providers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tenant_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    contact_info JSON,
    coverage_details JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    INDEX idx_tenant_id (tenant_id)
);

-- Patient Insurance
CREATE TABLE patient_insurance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    insurance_provider_id INT NOT NULL,
    policy_number VARCHAR(100) NOT NULL,
    group_number VARCHAR(100),
    coverage_percentage DECIMAL(5,2) DEFAULT 80.00,
    deductible DECIMAL(10,2) DEFAULT 0.00,
    copay DECIMAL(10,2) DEFAULT 0.00,
    effective_date DATE NOT NULL,
    expiry_date DATE,
    is_primary BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (insurance_provider_id) REFERENCES insurance_providers(id) ON DELETE CASCADE,
    INDEX idx_patient_id (patient_id),
    INDEX idx_policy_number (policy_number)
);

-- Insurance Billing
CREATE TABLE insurance_billing (
    id INT PRIMARY KEY AUTO_INCREMENT,
    visit_id INT NOT NULL,
    insurance_id INT NOT NULL,
    total_charges DECIMAL(10,2) NOT NULL,
    coverage_amount DECIMAL(10,2) NOT NULL,
    patient_responsibility DECIMAL(10,2) NOT NULL,
    deductible DECIMAL(10,2) DEFAULT 0.00,
    copay DECIMAL(10,2) DEFAULT 0.00,
    claim_number VARCHAR(100),
    claim_status ENUM('pending', 'submitted', 'approved', 'denied', 'paid') DEFAULT 'pending',
    submitted_date DATE,
    processed_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE CASCADE,
    FOREIGN KEY (insurance_id) REFERENCES patient_insurance(id) ON DELETE CASCADE,
    INDEX idx_visit_id (visit_id),
    INDEX idx_claim_status (claim_status)
);

-- Payments
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    visit_id INT NOT NULL,
    patient_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'card', 'bank_transfer', 'insurance', 'check') NOT NULL,
    payment_reference VARCHAR(100),
    payment_date DATE NOT NULL,
    notes TEXT,
    processed_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES users(id),
    INDEX idx_visit_id (visit_id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_payment_date (payment_date)
);

-- Doctor Consultation Rates
ALTER TABLE doctors ADD COLUMN consultation_rate DECIMAL(10,2) DEFAULT 1500.00;
ALTER TABLE doctors ADD COLUMN specialty_rate DECIMAL(10,2) DEFAULT 2000.00;
ALTER TABLE doctors ADD COLUMN emergency_rate DECIMAL(10,2) DEFAULT 2500.00;

-- Visit Billing Information
ALTER TABLE visits ADD COLUMN total_charges DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE visits ADD COLUMN complexity_multiplier DECIMAL(3,2) DEFAULT 1.00;
ALTER TABLE visits ADD COLUMN billing_status ENUM('pending', 'billed', 'paid', 'partial') DEFAULT 'pending';

-- Insert Default Billing Procedures
INSERT INTO billing_procedures (code, description, base_price, type, category) VALUES
-- Consultations
('CONS001', 'General Consultation', 1500.00, 'consultation', 'General'),
('CONS002', 'Specialist Consultation', 2000.00, 'consultation', 'Specialty'),
('CONS003', 'Emergency Consultation', 2500.00, 'consultation', 'Emergency'),
('CONS004', 'Follow-up Consultation', 1000.00, 'consultation', 'Follow-up'),

-- Common Procedures
('PROC001', 'Blood Pressure Monitoring', 200.00, 'procedure', 'Vital Signs'),
('PROC002', 'ECG/EKG', 800.00, 'procedure', 'Cardiac'),
('PROC003', 'Wound Dressing', 500.00, 'procedure', 'Minor Surgery'),
('PROC004', 'Injection (IM/IV)', 300.00, 'procedure', 'Medication'),
('PROC005', 'Nebulization', 400.00, 'procedure', 'Respiratory'),

-- Laboratory Tests
('LAB001', 'Complete Blood Count (CBC)', 400.00, 'laboratory', 'Hematology'),
('LAB002', 'Urinalysis', 200.00, 'laboratory', 'Clinical Chemistry'),
('LAB003', 'Fasting Blood Sugar', 250.00, 'laboratory', 'Clinical Chemistry'),
('LAB004', 'Lipid Profile', 800.00, 'laboratory', 'Clinical Chemistry'),
('LAB005', 'Liver Function Test', 1200.00, 'laboratory', 'Clinical Chemistry'),
('LAB006', 'Kidney Function Test', 1000.00, 'laboratory', 'Clinical Chemistry'),
('LAB007', 'Thyroid Function Test', 1500.00, 'laboratory', 'Endocrinology'),
('LAB008', 'HbA1c', 600.00, 'laboratory', 'Diabetes'),

-- Imaging
('IMG001', 'Chest X-ray', 800.00, 'imaging', 'Radiology'),
('IMG002', 'Abdominal Ultrasound', 1500.00, 'imaging', 'Ultrasound'),
('IMG003', 'Pelvic Ultrasound', 1200.00, 'imaging', 'Ultrasound'),

-- Pediatric Specific
('PED001', 'Growth Assessment', 300.00, 'procedure', 'Pediatric'),
('PED002', 'Developmental Screening', 500.00, 'procedure', 'Pediatric'),
('PED003', 'Vaccination', 200.00, 'procedure', 'Immunization');