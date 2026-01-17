# Test Environment Setup Guide

**Author:** Romar Tabaosares  
**Created:** 2024-12-19  
**Purpose:** Complete testing environment setup for Windows 11 with MySQL 8

## Test Environment Overview

The test environment provides isolated testing capabilities with:
- Separate test database
- Mock authentication
- Automated test data cleanup
- Comprehensive test coverage

## Step 1: Test Database Setup

### 1.1 Create Test Database
```sql
-- Connect to MySQL as root or clinic_dev user
mysql -u root -p

-- Create test database
CREATE DATABASE clinic_saas_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant permissions to development user
GRANT ALL PRIVILEGES ON clinic_saas_test.* TO 'clinic_dev'@'localhost';
FLUSH PRIVILEGES;

-- Verify test database
SHOW DATABASES;
USE clinic_saas_test;
```

### 1.2 Test Database Schema
```sql
-- Run the same table creation scripts as development
-- Copy from DEV_ENVIRONMENT_SETUP.md Step 2.2

-- Additional test-specific tables
CREATE TABLE test_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  test_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

-- Test data cleanup tracking
CREATE TABLE test_cleanup_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  test_suite VARCHAR(255),
  cleanup_action VARCHAR(255),
  records_affected INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Step 2: Test Environment Configuration

### 2.1 Create Test Environment File
Create `.env.test`:
```env
# Test Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=clinic_dev
DB_PASSWORD=dev_password_123
DB_NAME=clinic_saas_test
DB_CONNECTION_LIMIT=5

# Test JWT Configuration
JWT_SECRET=test_jwt_secret_key_for_testing_only
JWT_EXPIRES_IN=1h

# Test Server Configuration
PORT=3001
NODE_ENV=test

# Test Logging Configuration
LOG_LEVEL=error
LOG_QUERIES=false

# Test-specific Settings
MOCK_AUTH=true
AUTO_CLEANUP=true
TEST_TIMEOUT=30000
```

### 2.2 Jest Configuration
Create `jest.config.js`:
```javascript
/**
 * Jest Test Configuration
 * 
 * Author: Romar Tabaosares
 * Created: 2024-12-19
 * Purpose: Jest testing configuration for clinic SaaS
 */

module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/config/database.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 30000,
  verbose: true,
  forceExit: true,
  detectOpenHandles: true
};
```

## Step 3: Test Setup and Utilities

### 3.1 Test Setup File
Create `tests/setup.js`:
```javascript
/**
 * Test Setup and Configuration
 * 
 * Author: Romar Tabaosares
 * Created: 2024-12-19
 * Purpose: Global test setup and utilities
 */

const db = require('../src/config/database');
require('dotenv').config({ path: '.env.test' });

// Global test setup
beforeAll(async () => {
  // Ensure test database connection
  await db.testConnection();
  
  // Setup test data
  await setupTestData();
});

// Global test cleanup
afterAll(async () => {
  // Clean up test data
  await cleanupTestData();
  
  // Close database connections
  await db.closePool();
});

// Setup test data
async function setupTestData() {
  try {
    // Insert test clinic
    await db.execute(`
      INSERT IGNORE INTO clinics (id, name, address, email, status) 
      VALUES (999, 'Test Clinic', 'Test Address', 'test@clinic.com', 'active')
    `);

    // Insert test users
    await db.execute(`
      INSERT IGNORE INTO auth_users (id, clinic_id, email, password_hash, full_name, status) 
      VALUES 
      (999, 999, 'testdoctor@test.com', '$2a$10$test', 'Test Doctor', 'active'),
      (998, 999, 'teststaff@test.com', '$2a$10$test', 'Test Staff', 'active')
    `);

    // Insert test roles
    await db.execute(`
      INSERT IGNORE INTO roles (id, clinic_id, name, description) 
      VALUES 
      (999, 999, 'Doctor', 'Test Doctor Role'),
      (998, 999, 'Staff', 'Test Staff Role')
    `);

    // Assign roles
    await db.execute(`
      INSERT IGNORE INTO user_roles (user_id, role_id) 
      VALUES (999, 999), (998, 998)
    `);

    // Insert test patient
    await db.execute(`
      INSERT IGNORE INTO patients (id, clinic_id, patient_code, full_name, birth_date, gender) 
      VALUES (999, 999, 'TEST001', 'Test Patient', '2010-01-01', 'M')
    `);

    console.log('✅ Test data setup complete');
  } catch (error) {
    console.error('❌ Test data setup failed:', error);
  }
}

// Cleanup test data
async function cleanupTestData() {
  try {
    const tables = [
      'visit_vital_signs',
      'visit_diagnoses', 
      'visit_notes',
      'visits',
      'audit_logs',
      'user_roles',
      'roles',
      'auth_users',
      'patients',
      'clinics',
      'test_sessions',
      'test_cleanup_log'
    ];

    for (const table of tables) {
      await db.execute(`DELETE FROM ${table} WHERE clinic_id = 999 OR id = 999`);
    }

    console.log('✅ Test data cleanup complete');
  } catch (error) {
    console.error('❌ Test data cleanup failed:', error);
  }
}

module.exports = {
  setupTestData,
  cleanupTestData
};
```

### 3.2 Test Utilities
Create `tests/utils/testHelpers.js`:
```javascript
/**
 * Test Helper Utilities
 * 
 * Author: Romar Tabaosares
 * Created: 2024-12-19
 * Purpose: Common testing utilities and mock functions
 */

const jwt = require('jsonwebtoken');

// Mock JWT tokens for testing
const createMockToken = (userId, clinicId, roles) => {
  return jwt.sign(
    { 
      userId, 
      clinicId, 
      roles: Array.isArray(roles) ? roles : [roles]
    },
    process.env.JWT_SECRET || 'test_secret',
    { expiresIn: '1h' }
  );
};

// Test user tokens
const testTokens = {
  doctor: createMockToken(999, 999, ['Doctor']),
  staff: createMockToken(998, 999, ['Staff']),
  invalid: 'invalid_token_for_testing'
};

// Mock request data
const mockVisitData = {
  appointment_id: 1,
  patient_id: 999,
  doctor_id: 999
};

const mockVitalSigns = {
  temperature: 37.5,
  blood_pressure_systolic: 120,
  blood_pressure_diastolic: 80,
  heart_rate: 75,
  respiratory_rate: 16,
  weight: 25.0,
  height: 120.0,
  oxygen_saturation: 98
};

const mockDiagnosis = {
  diagnosis_type: 'primary',
  diagnosis_code: 'J06.9',
  diagnosis_name: 'Acute upper respiratory infection, unspecified',
  clinical_notes: 'Test diagnosis notes'
};

// Database test helpers
const createTestVisit = async (db) => {
  const query = `
    INSERT INTO visits (clinic_id, appointment_id, patient_id, doctor_id, visit_date, status)
    VALUES (999, 1, 999, 999, NOW(), 'open')
  `;
  const [result] = await db.execute(query);
  return result.insertId;
};

const cleanupTestVisit = async (db, visitId) => {
  await db.execute('DELETE FROM visit_vital_signs WHERE visit_id = ?', [visitId]);
  await db.execute('DELETE FROM visit_diagnoses WHERE visit_id = ?', [visitId]);
  await db.execute('DELETE FROM visit_notes WHERE visit_id = ?', [visitId]);
  await db.execute('DELETE FROM visits WHERE id = ?', [visitId]);
};

// API response validators
const validateApiResponse = (response, expectedStatus = 200) => {
  expect(response.status).toBe(expectedStatus);
  expect(response.body).toHaveProperty('success');
  
  if (expectedStatus >= 200 && expectedStatus < 300) {
    expect(response.body.success).toBe(true);
  } else {
    expect(response.body.success).toBe(false);
    expect(response.body).toHaveProperty('message');
  }
};

const validateVisitResponse = (response) => {
  validateApiResponse(response, 200);
  expect(response.body.data).toHaveProperty('visit');
  expect(response.body.data).toHaveProperty('notes');
  expect(response.body.data).toHaveProperty('diagnoses');
  expect(response.body.data).toHaveProperty('vital_signs');
};

// Test data generators
const generateRandomPatientData = () => ({
  full_name: `Test Patient ${Math.random().toString(36).substr(2, 9)}`,
  birth_date: '2010-01-01',
  gender: Math.random() > 0.5 ? 'M' : 'F',
  contact_number: '09123456789',
  email: `test${Math.random().toString(36).substr(2, 5)}@test.com`
});

const generateRandomVitalSigns = () => ({
  temperature: (36 + Math.random() * 4).toFixed(1),
  blood_pressure_systolic: Math.floor(90 + Math.random() * 50),
  blood_pressure_diastolic: Math.floor(60 + Math.random() * 30),
  heart_rate: Math.floor(60 + Math.random() * 40),
  respiratory_rate: Math.floor(12 + Math.random() * 8),
  weight: (20 + Math.random() * 30).toFixed(1),
  height: (100 + Math.random() * 50).toFixed(1),
  oxygen_saturation: Math.floor(95 + Math.random() * 5)
});

module.exports = {
  testTokens,
  mockVisitData,
  mockVitalSigns,
  mockDiagnosis,
  createTestVisit,
  cleanupTestVisit,
  validateApiResponse,
  validateVisitResponse,
  generateRandomPatientData,
  generateRandomVitalSigns,
  createMockToken
};
```

## Step 4: Running Tests

### 4.1 Test Commands
```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- tests/visit-records.test.js

# Run tests in watch mode
npm test -- --watch

# Run tests with verbose output
npm test -- --verbose

# Run tests and generate HTML coverage report
npm test -- --coverage --coverageReporters=html
```

### 4.2 Test Scripts in package.json
Update `package.json`:
```json
{
  "scripts": {
    "test": "NODE_ENV=test jest",
    "test:watch": "NODE_ENV=test jest --watch",
    "test:coverage": "NODE_ENV=test jest --coverage",
    "test:verbose": "NODE_ENV=test jest --verbose",
    "test:specific": "NODE_ENV=test jest --testNamePattern",
    "test:setup": "node tests/setup-test-db.js"
  }
}
```

## Step 5: Test Database Management

### 5.1 Test Database Reset Script
Create `tests/setup-test-db.js`:
```javascript
/**
 * Test Database Setup Script
 * 
 * Author: Romar Tabaosares
 * Created: 2024-12-19
 * Purpose: Reset and setup test database
 */

const db = require('../src/config/database');
require('dotenv').config({ path: '.env.test' });

async function resetTestDatabase() {
  try {
    console.log('🔄 Resetting test database...');
    
    // Drop and recreate test database
    await db.execute('DROP DATABASE IF EXISTS clinic_saas_test');
    await db.execute('CREATE DATABASE clinic_saas_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    await db.execute('USE clinic_saas_test');
    
    // Create tables (copy from main setup)
    // ... table creation scripts ...
    
    console.log('✅ Test database reset complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test database reset failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  resetTestDatabase();
}

module.exports = { resetTestDatabase };
```

### 5.2 Run Test Database Setup
```bash
# Reset test database
npm run test:setup

# Or run directly
node tests/setup-test-db.js
```

## Step 6: Test Coverage and Reporting

### 6.1 Coverage Configuration
Jest automatically generates coverage reports. View coverage:
```bash
# Generate coverage report
npm run test:coverage

# Open HTML coverage report
start coverage/lcov-report/index.html
```

### 6.2 Coverage Targets
Aim for these coverage targets:
- **Statements:** 80%+
- **Branches:** 75%+
- **Functions:** 80%+
- **Lines:** 80%+

## Step 7: Continuous Integration Testing

### 7.1 GitHub Actions (Optional)
Create `.github/workflows/test.yml`:
```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: clinic_saas_test
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3

    steps:
    - uses: actions/checkout@v2
    - uses: actions/setup-node@v2
      with:
        node-version: '18'
    - run: npm install
    - run: npm test
```

## Step 8: Test Data Management

### 8.1 Test Data Fixtures
Create `tests/fixtures/`:
```javascript
// tests/fixtures/visitData.js
module.exports = {
  validVisit: {
    appointment_id: 1,
    patient_id: 999,
    doctor_id: 999
  },
  
  validDiagnosis: {
    diagnosis_type: 'primary',
    diagnosis_name: 'Test Diagnosis',
    clinical_notes: 'Test notes'
  },
  
  validVitalSigns: {
    temperature: 37.0,
    heart_rate: 75,
    weight: 25.0,
    height: 120.0
  }
};
```

### 8.2 Test Data Cleanup
Automatic cleanup after each test:
```javascript
afterEach(async () => {
  // Clean up test data created during test
  await cleanupTestData();
});
```

## Step 9: Mock Services

### 9.1 Mock Authentication
```javascript
// tests/mocks/auth.js
const mockAuth = {
  authenticateToken: (req, res, next) => {
    req.user = {
      id: 999,
      clinic_id: 999,
      roles: ['Doctor']
    };
    next();
  }
};
```

### 9.2 Mock Database
```javascript
// tests/mocks/database.js
const mockDb = {
  execute: jest.fn(),
  testConnection: jest.fn().mockResolvedValue(true),
  closePool: jest.fn()
};
```

## Step 10: Debugging Tests

### 10.1 Debug Configuration
```bash
# Run tests with debugging
node --inspect-brk node_modules/.bin/jest --runInBand

# Debug specific test
node --inspect-brk node_modules/.bin/jest --runInBand tests/visit-records.test.js
```

### 10.2 Test Logging
```javascript
// Enable test logging
process.env.LOG_LEVEL = 'debug';
process.env.LOG_QUERIES = 'true';
```

## Common Test Issues

### Database Connection Issues
```bash
# Check test database exists
mysql -u clinic_dev -p -e "SHOW DATABASES LIKE 'clinic_saas_test'"

# Reset test database
npm run test:setup
```

### Port Conflicts
```bash
# Use different port for tests
PORT=3001 npm test
```

### Memory Leaks
```bash
# Run with memory monitoring
node --max-old-space-size=4096 node_modules/.bin/jest
```

---

**Test Environment Status:** Ready for Testing ✅  
**Coverage Target:** 80%+ across all metrics  
**Next:** Run comprehensive test suite for Phase 2 Step 1