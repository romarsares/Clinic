/**
 * Test Setup and Configuration
 * 
 * Author: Romar Tabaosares
 * Created: 2024-12-19
 * Purpose: Global test setup and utilities for clinic SaaS testing
 */

const db = require('../src/config/database');
require('dotenv').config({ path: '.env.test' });

// Global test setup
beforeAll(async () => {
  console.log('🔧 Setting up test environment...');

  // Ensure test database connection
  const connected = await db.testConnection();
  if (!connected) {
    throw new Error('Failed to connect to test database');
  }

  // Setup test data
  await setupTestData();
  console.log('✅ Test environment ready');
});

// Global test cleanup
afterAll(async () => {
  console.log('🧹 Cleaning up test environment...');

  // Clean up test data
  await cleanupTestData();

  // Close database connections
  await db.closePool();
  console.log('✅ Test cleanup complete');
});

// Setup test data
async function setupTestData() {
  try {
    // Insert test users with proper password hash
    await db.executeQuery(`
      INSERT IGNORE INTO auth_users (id, clinic_id, email, password_hash, full_name, status) 
      VALUES 
      (999, 999, 'testdoctor@test.com', '$2a$10$test.hash.for.testing', 'Test Doctor', 'active'),
      (998, 999, 'teststaff@test.com', '$2a$10$test.hash.for.testing', 'Test Staff', 'active')
    `);

    // Insert test roles
    await db.executeQuery(`
      INSERT IGNORE INTO roles (id, clinic_id, name, description) 
      VALUES 
      (999, 999, 'Doctor', 'Test Doctor Role'),
      (998, 999, 'Staff', 'Test Staff Role')
    `);

    // Assign roles
    await db.executeQuery(`
      INSERT IGNORE INTO user_roles (user_id, role_id) 
      VALUES (999, 999), (998, 998)
    `);

  } catch (error) {
    console.error('❌ Test data setup failed:', error.message);
    throw error;
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
      'auth_users'
    ];

    for (const table of tables) {
      await db.executeQuery(`DELETE FROM ${table} WHERE clinic_id = 999 OR id >= 999`);
    }

  } catch (error) {
    console.error('❌ Test data cleanup failed:', error.message);
    // Don't throw error during cleanup to avoid masking test failures
  }
}

module.exports = {
  setupTestData,
  cleanupTestData
};