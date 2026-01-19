-- Billing Integration Schema for Phase 5
-- Links clinical services to billing charges

-- Service types and pricing
CREATE TABLE service_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    clinic_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    category ENUM('consultation', 'procedure', 'lab_test', 'vaccine', 'other') NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
    INDEX idx_clinic_category (clinic_id, category)
);

-- Patient bills
CREATE TABLE patient_bills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    clinic_id INT NOT NULL,
    patient_id INT NOT NULL,
    visit_id INT NULL,
    bill_number VARCHAR(50) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status ENUM('draft', 'pending', 'paid', 'cancelled') DEFAULT 'draft',
    bill_date DATE NOT NULL,
    due_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE SET NULL,
    UNIQUE KEY unique_bill_number (clinic_id, bill_number),
    INDEX idx_patient_status (patient_id, status),
    INDEX idx_clinic_date (clinic_id, bill_date)
);

-- Bill line items
CREATE TABLE bill_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bill_id INT NOT NULL,
    service_type_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    lab_request_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES patient_bills(id) ON DELETE CASCADE,
    FOREIGN KEY (service_type_id) REFERENCES service_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (lab_request_id) REFERENCES lab_requests(id) ON DELETE SET NULL,
    INDEX idx_bill_service (bill_id, service_type_id)
);

-- Insert default service types
INSERT INTO service_types (clinic_id, name, category, base_price) VALUES
(1, 'General Consultation', 'consultation', 500.00),
(1, 'Pediatric Consultation', 'consultation', 600.00),
(1, 'Follow-up Visit', 'consultation', 300.00),
(1, 'Complete Blood Count (CBC)', 'lab_test', 250.00),
(1, 'Urinalysis', 'lab_test', 150.00),
(1, 'Blood Chemistry', 'lab_test', 400.00);