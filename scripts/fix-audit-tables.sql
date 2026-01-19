-- Fix missing audit tables
ALTER TABLE audit_logs ADD COLUMN user_agent TEXT;
ALTER TABLE audit_logs ADD COLUMN method VARCHAR(10);
ALTER TABLE audit_logs ADD COLUMN url VARCHAR(255);
ALTER TABLE audit_logs ADD COLUMN status_code INT;
ALTER TABLE audit_logs ADD COLUMN request_body TEXT;
ALTER TABLE audit_logs ADD COLUMN response_data TEXT;

-- Create missing failed access logs table
CREATE TABLE failed_access_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    url VARCHAR(255),
    method VARCHAR(10),
    status_code INT,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);