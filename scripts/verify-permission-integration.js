/**
 * Permission Integration Verification Script
 * Verifies all controllers have proper granular permission validation
 */

const fs = require('fs');
const path = require('path');

// Define expected permissions for each controller
const EXPECTED_PERMISSIONS = {
  'PatientController.js': [
    'patient.add',
    'patient.edit', 
    'patient.view',
    'patient.delete'
  ],
  'AppointmentController.js': [
    'appointment.create',
    'appointment.edit',
    'appointment.view', 
    'appointment.cancel'
  ],
  'VisitController.js': [
    'clinical.visit.create',
    'clinical.visit.edit',
    'clinical.visit.view'
  ],
  'BillingController.js': [
    'billing.create',
    'billing.view',
    'billing.payment'
  ],
  'UserController.js': [
    'admin.users',
    'admin.permissions'
  ],
  'LabController.js': [
    'lab.request',
    'lab.view',
    'lab.edit',
    'lab.results'
  ],
  'AuditController.js': [
    'admin.audit'
  ]
};

function verifyControllerPermissions() {
  const controllersDir = path.join(__dirname, '../src/controllers');
  const results = {
    verified: [],
    missing: [],
    errors: []
  };

  console.log('🔍 Verifying Permission Integration in Controllers...\n');

  for (const [filename, expectedPerms] of Object.entries(EXPECTED_PERMISSIONS)) {
    const filePath = path.join(controllersDir, filename);
    
    try {
      if (!fs.existsSync(filePath)) {
        results.errors.push(`❌ File not found: ${filename}`);
        continue;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check if middleware is imported
      const hasMiddlewareImport = content.includes("require('../middleware/permissions')");
      if (!hasMiddlewareImport) {
        results.missing.push(`❌ ${filename}: Missing permissions middleware import`);
        continue;
      }

      // Check for checkUserPermission usage
      const hasPermissionCheck = content.includes('checkUserPermission');
      if (!hasPermissionCheck) {
        results.missing.push(`❌ ${filename}: No permission checks found`);
        continue;
      }

      // Verify each expected permission is used
      const missingPerms = [];
      for (const perm of expectedPerms) {
        if (!content.includes(`'${perm}'`)) {
          missingPerms.push(perm);
        }
      }

      if (missingPerms.length > 0) {
        results.missing.push(`⚠️  ${filename}: Missing permissions: ${missingPerms.join(', ')}`);
      } else {
        results.verified.push(`✅ ${filename}: All permissions integrated`);
      }

    } catch (error) {
      results.errors.push(`❌ Error reading ${filename}: ${error.message}`);
    }
  }

  // Print results
  console.log('📊 VERIFICATION RESULTS:\n');
  
  if (results.verified.length > 0) {
    console.log('✅ SUCCESSFULLY INTEGRATED:');
    results.verified.forEach(msg => console.log(`   ${msg}`));
    console.log('');
  }

  if (results.missing.length > 0) {
    console.log('⚠️  MISSING INTEGRATIONS:');
    results.missing.forEach(msg => console.log(`   ${msg}`));
    console.log('');
  }

  if (results.errors.length > 0) {
    console.log('❌ ERRORS:');
    results.errors.forEach(msg => console.log(`   ${msg}`));
    console.log('');
  }

  const totalControllers = Object.keys(EXPECTED_PERMISSIONS).length;
  const integratedControllers = results.verified.length;
  const successRate = Math.round((integratedControllers / totalControllers) * 100);

  console.log(`📈 INTEGRATION PROGRESS: ${integratedControllers}/${totalControllers} controllers (${successRate}%)`);
  
  if (successRate === 100) {
    console.log('🎉 ALL CONTROLLERS SUCCESSFULLY INTEGRATED WITH GRANULAR PERMISSIONS!');
  } else {
    console.log('🔧 Additional work needed to complete integration.');
  }

  return {
    success: successRate === 100,
    results
  };
}

// Run verification if called directly
if (require.main === module) {
  verifyControllerPermissions();
}

module.exports = { verifyControllerPermissions };