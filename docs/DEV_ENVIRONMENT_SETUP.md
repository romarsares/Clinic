# Development Environment Setup Guide

**Author:** Romar Tabaosares  
**Created:** 2024-12-19  
**Purpose:** Complete setup guide for Windows 11 development environment with MySQL 8

## Prerequisites

### System Requirements
- Windows 11
- Node.js 18+ 
- MySQL 8.0+
- Git for Windows
- VS Code (recommended)

## Step 1: Install Required Software

### 1.1 Node.js Installation
```bash
# Download from https://nodejs.org/
# Choose LTS version (18.x or higher)
# Verify installation
node --version
npm --version
```

### 1.2 MySQL 8.0 Installation
```bash
# Download MySQL 8.0 Community Server from:
# https://dev.mysql.com/downloads/mysql/

# During installation:
# - Choose "Developer Default" setup
# - Set root password (remember this!)
# - Configure as Windows Service
# - Start MySQL service
```

### 1.3 MySQL Workbench (Optional but Recommended)
```bash
# Download from: https://dev.mysql.com/downloads/workbench/
# Useful for database management and queries
```

## Step 2: Database Setup

### 2.1 Create Database
```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create database
CREATE DATABASE clinic_saas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create development user
CREATE USER 'clinic_dev'@'localhost' IDENTIFIED BY 'dev_password_123';
GRANT ALL PRIVILEGES ON clinic_saas.* TO 'clinic_dev'@'localhost';
FLUSH PRIVILEGES;

-- Verify database
SHOW DATABASES;
USE clinic_saas;
```

### 2.2 Create Required Tables
```sql
-- Core visit table
CREATE TABLE visits (
  id INT PRIMARY KEY AUTO_INCREMENT,
  clinic_id INT NOT NULL,
  appointment_id INT,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  visit_date DATETIME NOT NULL,
  status ENUM('open', 'closed') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_clinic_patient (clinic_id, patient_id),
  INDEX idx_visit_date (visit_date)
);

-- Visit notes
CREATE TABLE visit_notes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  visit_id INT NOT NULL,
  clinic_id INT NOT NULL,
  note_type ENUM('chief_complaint', 'clinical_assessment', 'treatment_plan', 'follow_up_instructions') NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_visit_clinic (visit_id, clinic_id),
  UNIQUE KEY unique_visit_note_type (visit_id, note_type)
);

-- Diagnoses
CREATE TABLE visit_diagnoses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  visit_id INT NOT NULL,
  clinic_id INT NOT NULL,
  diagnosis_type ENUM('primary', 'secondary') DEFAULT 'primary',
  diagnosis_code VARCHAR(20),
  diagnosis_name VARCHAR(255) NOT NULL,
  clinical_notes TEXT,
  diagnosed_by INT NOT NULL,
  diagnosed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_visit_clinic (visit_id, clinic_id)
);

-- Vital signs
CREATE TABLE visit_vital_signs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  visit_id INT NOT NULL,
  clinic_id INT NOT NULL,
  temperature DECIMAL(4,2),
  blood_pressure_systolic INT,
  blood_pressure_diastolic INT,
  heart_rate INT,
  respiratory_rate INT,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  bmi DECIMAL(4,2),
  oxygen_saturation INT,
  recorded_by INT NOT NULL,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_visit_vitals (visit_id)
);

-- Audit logs
CREATE TABLE audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  clinic_id INT NOT NULL,
  user_id INT NOT NULL,
  action VARCHAR(50) NOT NULL,
  entity VARCHAR(50) NOT NULL,
  entity_id INT,
  old_value JSON,
  new_value JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  method VARCHAR(10),
  url VARCHAR(255),
  status_code INT,
  request_body JSON,
  response_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_clinic_user (clinic_id, user_id),
  INDEX idx_entity (entity, entity_id),
  INDEX idx_created_at (created_at)
);

-- Basic auth tables for testing
CREATE TABLE auth_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  clinic_id INT NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  status ENUM('active', 'suspended') DEFAULT 'active',
  last_login_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  clinic_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_clinic_role (clinic_id, name)
);

CREATE TABLE user_roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_role (user_id, role_id)
);

-- Insert test data
INSERT INTO auth_users (id, clinic_id, email, password_hash, full_name) VALUES
(1, 1, 'doctor@test.com', '$2a$10$hash', 'Dr. Test Doctor'),
(2, 1, 'staff@test.com', '$2a$10$hash', 'Test Staff');

INSERT INTO roles (id, clinic_id, name, description) VALUES
(1, 1, 'Doctor', 'Medical doctor with full clinical access'),
(2, 1, 'Staff', 'Clinical staff with limited access');

INSERT INTO user_roles (user_id, role_id) VALUES (1, 1), (2, 2);
```

## Step 3: Project Setup

### 3.1 Clone Repository
```bash
# Open Command Prompt or PowerShell
cd C:\Users\%USERNAME%\Documents
git clone https://github.com/your-username/Clinic.git
cd Clinic
```

### 3.2 Install Dependencies
```bash
npm install
```

### 3.3 Environment Configuration
```bash
# Copy environment template
copy config\.env.example .env

# Edit .env file with your settings:
```

**.env Configuration:**
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=clinic_dev
DB_PASSWORD=dev_password_123
DB_NAME=clinic_saas
DB_CONNECTION_LIMIT=10

# JWT Configuration
JWT_SECRET=dev_clinic_saas_2024_secure_jwt_key_a8f9b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
NODE_ENV=development

# Logging Configuration
LOG_LEVEL=info
LOG_QUERIES=true

# Development Settings
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

## Step 4: Development Server

### 4.1 Start Development Server
```bash
# Start with auto-reload
npm run dev

# Or start normally
npm start
```

### 4.2 Verify Setup
```bash
# Test health endpoint
curl http://localhost:3000/health

# Test database health
curl http://localhost:3000/db-health

# Test API documentation
curl http://localhost:3000/api/v1/docs
```

## Step 5: Testing Setup

### 5.1 Test Database Setup
```sql
-- Create test database
CREATE DATABASE clinic_saas_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON clinic_saas_test.* TO 'clinic_dev'@'localhost';
FLUSH PRIVILEGES;
```

### 5.2 Test Environment Configuration
Create `.env.test`:
```env
# Test Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=clinic_dev
DB_PASSWORD=dev_password_123
DB_NAME=clinic_saas_test
DB_CONNECTION_LIMIT=5

# Test JWT
JWT_SECRET=test_jwt_secret_key
JWT_EXPIRES_IN=1h

# Test Server
PORT=3001
NODE_ENV=test
LOG_LEVEL=error
LOG_QUERIES=false
```

### 5.3 Run Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/visit-records.test.js

# Run tests with coverage
npm test -- --coverage
```

## Step 6: Development Tools

### 6.1 VS Code Extensions (Recommended)
```json
{
  "recommendations": [
    "ms-vscode.vscode-json",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### 6.2 MySQL Tools
```bash
# MySQL Command Line Client
mysql -u clinic_dev -p clinic_saas

# Or use MySQL Workbench GUI
# Connection: localhost:3306
# Username: clinic_dev
# Password: dev_password_123
```

## Step 7: API Testing

### 7.1 Using cURL (Windows)
```bash
# Test visit creation (requires JWT token)
curl -X POST http://localhost:3000/api/v1/visits ^
  -H "Authorization: Bearer YOUR_JWT_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"appointment_id\": 1, \"patient_id\": 1, \"doctor_id\": 1}"
```

### 7.2 Using PowerShell
```powershell
# Test API endpoint
$headers = @{
    'Authorization' = 'Bearer YOUR_JWT_TOKEN'
    'Content-Type' = 'application/json'
}

$body = @{
    appointment_id = 1
    patient_id = 1
    doctor_id = 1
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/visits' -Method POST -Headers $headers -Body $body
```

### 7.3 Using Postman
1. Download Postman from https://www.postman.com/
2. Import collection from `docs/postman_collection.json` (if available)
3. Set environment variables:
   - `base_url`: http://localhost:3000
   - `jwt_token`: Your JWT token

## Step 8: Common Issues & Solutions

### 8.1 MySQL Connection Issues
```bash
# Check MySQL service status
net start | findstr MySQL

# Start MySQL service
net start MySQL80

# Check MySQL port
netstat -an | findstr 3306
```

### 8.2 Node.js Issues
```bash
# Clear npm cache
npm cache clean --force

# Reinstall node_modules
rmdir /s node_modules
npm install
```

### 8.3 Port Already in Use
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

## Step 9: Development Workflow

### 9.1 Daily Development
```bash
# 1. Start MySQL service (if not auto-start)
net start MySQL80

# 2. Start development server
npm run dev

# 3. Run tests after changes
npm test

# 4. Check code quality
npm run lint
```

### 9.2 Database Management
```bash
# Backup development database
mysqldump -u clinic_dev -p clinic_saas > backup.sql

# Restore database
mysql -u clinic_dev -p clinic_saas < backup.sql

# Reset test database
mysql -u clinic_dev -p -e "DROP DATABASE clinic_saas_test; CREATE DATABASE clinic_saas_test;"
```

## Step 10: Production Preparation

### 10.1 Environment Variables
```env
# Production settings
NODE_ENV=production
LOG_LEVEL=warn
LOG_QUERIES=false
DB_CONNECTION_LIMIT=20
JWT_EXPIRES_IN=8h
```

### 10.2 Build Process
```bash
# Run linting
npm run lint

# Run all tests
npm test

# Build for production
npm run build
```

## Troubleshooting

### Common Error Messages

**"ECONNREFUSED 127.0.0.1:3306"**
- MySQL service not running
- Solution: `net start MySQL80`

**"Access denied for user"**
- Wrong database credentials
- Solution: Check .env file and MySQL user permissions

**"Port 3000 already in use"**
- Another process using the port
- Solution: Change PORT in .env or kill the process

**"Cannot find module"**
- Missing dependencies
- Solution: `npm install`

---

**Setup Status:** Ready for Development ✅  
**Next:** Start implementing Phase 2 Step 2 features  
**Support:** Check logs in `logs/` directory for detailed error information