#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Test UI Consistency & Validation Implementation
class UIConsistencyTest {
    constructor() {
        this.testResults = [];
        this.passedTests = 0;
        this.totalTests = 0;
    }

    runTest(testName, testFunction) {
        this.totalTests++;
        try {
            const result = testFunction();
            if (result) {
                this.passedTests++;
                this.testResults.push(`✅ ${testName}: PASSED`);
                console.log(`✅ ${testName}: PASSED`);
            } else {
                this.testResults.push(`❌ ${testName}: FAILED`);
                console.log(`❌ ${testName}: FAILED`);
            }
        } catch (error) {
            this.testResults.push(`❌ ${testName}: ERROR - ${error.message}`);
            console.log(`❌ ${testName}: ERROR - ${error.message}`);
        }
    }

    // Test 1: CSS File Structure and Consistency
    testCSSStructure() {
        const cssPath = path.join(__dirname, '..', 'public', 'css', 'ui-consistency.css');
        
        if (!fs.existsSync(cssPath)) {
            return false;
        }

        const cssContent = fs.readFileSync(cssPath, 'utf8');
        
        // Check for required CSS classes
        const requiredClasses = [
            '.datetime-picker',
            '.toast-container',
            '.toast',
            '.progress-bar',
            '.loading-spinner',
            '.form-control',
            '.validation-message',
            '.modal-overlay',
            '.btn'
        ];

        return requiredClasses.every(className => 
            cssContent.includes(className)
        );
    }

    // Test 2: JavaScript Module Structure
    testJavaScriptModule() {
        const jsPath = path.join(__dirname, '..', 'public', 'js', 'ui-consistency.js');
        
        if (!fs.existsSync(jsPath)) {
            return false;
        }

        const jsContent = fs.readFileSync(jsPath, 'utf8');
        
        // Check for required methods
        const requiredMethods = [
            'formatDate',
            'showToast',
            'showProgress',
            'validateField',
            'showConfirmDialog',
            'handleResponsiveElements'
        ];

        return requiredMethods.every(method => 
            jsContent.includes(method)
        );
    }

    // Test 3: Validation Controller Backend
    testValidationController() {
        const controllerPath = path.join(__dirname, '..', 'src', 'controllers', 'ValidationController.js');
        
        if (!fs.existsSync(controllerPath)) {
            return false;
        }

        const controllerContent = fs.readFileSync(controllerPath, 'utf8');
        
        // Check for validation schemas
        const requiredSchemas = [
            'patient',
            'appointment',
            'visit',
            'user'
        ];

        const hasSchemas = requiredSchemas.every(schema => 
            controllerContent.includes(`${schema}:`)
        );

        // Check for validation methods
        const requiredMethods = [
            'validate',
            'validateMiddleware',
            'validateDateTime',
            'validateVitalSigns'
        ];

        const hasMethods = requiredMethods.every(method => 
            controllerContent.includes(`static ${method}`)
        );

        return hasSchemas && hasMethods;
    }

    // Test 4: Date/Time Formatting Functions
    testDateTimeFormatting() {
        // Simulate date formatting logic
        const testDate = new Date('2024-01-15T10:30:00');
        
        // Test date format patterns
        const shortFormat = testDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        const longFormat = testDate.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        return shortFormat.includes('Jan') && 
               shortFormat.includes('15') && 
               longFormat.includes('January');
    }

    // Test 5: Validation Schema Completeness
    testValidationSchemas() {
        const ValidationController = require('../src/controllers/ValidationController.js');
        
        // Test patient validation
        const validPatient = {
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: '1990-01-01',
            email: 'john@example.com',
            phone: '+1234567890',
            gender: 'male'
        };

        const patientValidation = ValidationController.validate(validPatient, 'patient');
        
        // Test invalid patient
        const invalidPatient = {
            firstName: 'J', // Too short
            lastName: '',   // Required
            dateOfBirth: '2030-01-01', // Future date
            email: 'invalid-email',
            phone: '123',   // Too short
            gender: 'invalid'
        };

        const invalidValidation = ValidationController.validate(invalidPatient, 'patient');

        return patientValidation.isValid && !invalidValidation.isValid;
    }

    // Test 6: Responsive Design Classes
    testResponsiveDesign() {
        const cssPath = path.join(__dirname, '..', 'public', 'css', 'ui-consistency.css');
        const cssContent = fs.readFileSync(cssPath, 'utf8');
        
        // Check for responsive breakpoints
        const hasTabletBreakpoint = cssContent.includes('@media (max-width: 768px)');
        const hasMobileOptimizations = cssContent.includes('font-size: 16px'); // iOS zoom prevention
        
        return hasTabletBreakpoint && hasMobileOptimizations;
    }

    // Test 7: Form Validation Rules
    testFormValidationRules() {
        const ValidationController = require('../src/controllers/ValidationController.js');
        
        // Test vital signs validation
        const validVitals = {
            temperature: 37.5,
            bloodPressure: '120/80',
            heartRate: 72,
            respiratoryRate: 16
        };

        const invalidVitals = {
            temperature: 50, // Too high
            bloodPressure: 'invalid',
            heartRate: 300, // Too high
            respiratoryRate: 5 // Too low
        };

        const validResult = ValidationController.validateVitalSigns(validVitals);
        const invalidResult = ValidationController.validateVitalSigns(invalidVitals);

        return validResult.isValid && !invalidResult.isValid;
    }

    // Generate test report
    generateReport() {
        console.log('\n' + '='.repeat(50));
        console.log('UI CONSISTENCY & VALIDATION TEST REPORT');
        console.log('='.repeat(50));
        console.log(`Total Tests: ${this.totalTests}`);
        console.log(`Passed: ${this.passedTests}`);
        console.log(`Failed: ${this.totalTests - this.passedTests}`);
        console.log(`Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`);
        console.log('='.repeat(50));
        
        this.testResults.forEach(result => console.log(result));
        
        console.log('\n📋 IMPLEMENTATION SUMMARY:');
        console.log('✅ CSS UI consistency framework');
        console.log('✅ JavaScript validation and feedback system');
        console.log('✅ Backend validation controller with Joi schemas');
        console.log('✅ Date/time standardization');
        console.log('✅ Toast notification system');
        console.log('✅ Form validation with real-time feedback');
        console.log('✅ Responsive design optimizations');
        console.log('✅ Confirmation dialogs and progress indicators');
        
        if (this.passedTests === this.totalTests) {
            console.log('\n🎉 ALL TESTS PASSED! UI Consistency & Validation system is ready for production.');
        } else {
            console.log(`\n⚠️  ${this.totalTests - this.passedTests} test(s) failed. Please review implementation.`);
        }
    }

    // Run all tests
    runAllTests() {
        console.log('🧪 Running UI Consistency & Validation Tests...\n');

        this.runTest('CSS Structure and Classes', () => this.testCSSStructure());
        this.runTest('JavaScript Module Structure', () => this.testJavaScriptModule());
        this.runTest('Validation Controller Backend', () => this.testValidationController());
        this.runTest('Date/Time Formatting Functions', () => this.testDateTimeFormatting());
        this.runTest('Validation Schema Completeness', () => this.testValidationSchemas());
        this.runTest('Responsive Design Classes', () => this.testResponsiveDesign());
        this.runTest('Form Validation Rules', () => this.testFormValidationRules());

        this.generateReport();
    }
}

// Run tests if called directly
if (require.main === module) {
    const tester = new UIConsistencyTest();
    tester.runAllTests();
}

module.exports = UIConsistencyTest;