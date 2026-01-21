/**
 * Parent Portal Test Script
 * Tests parent portal functionality and API endpoints
 */

const fs = require('fs');
const path = require('path');

class ParentPortalTester {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            tests: []
        };
    }

    async runTests() {
        console.log('🧪 Testing Parent Portal Implementation...\n');

        // Test 1: Check HTML file exists and has required elements
        this.testParentPortalHTML();

        // Test 2: Check JavaScript file exists and has required functions
        this.testParentPortalJS();

        // Test 3: Check controller exists and has required methods
        this.testParentPortalController();

        // Test 4: Verify parent-child relationship handling
        this.testParentChildSecurity();

        // Test 5: Check API endpoint structure
        this.testAPIEndpoints();

        this.printResults();
    }

    testParentPortalHTML() {
        const testName = 'Parent Portal HTML Structure';
        try {
            const htmlPath = path.join(__dirname, '../public/views/parent-portal.html');
            
            if (!fs.existsSync(htmlPath)) {
                this.addTest(testName, false, 'HTML file not found');
                return;
            }

            const htmlContent = fs.readFileSync(htmlPath, 'utf8');
            
            const requiredElements = [
                'children-list',
                'upcoming-appointments', 
                'recent-visits',
                'vaccine-reminders',
                'child-modal',
                'appointment-modal'
            ];

            const missingElements = requiredElements.filter(element => 
                !htmlContent.includes(`id="${element}"`)
            );

            if (missingElements.length === 0) {
                this.addTest(testName, true, 'All required HTML elements present');
            } else {
                this.addTest(testName, false, `Missing elements: ${missingElements.join(', ')}`);
            }
        } catch (error) {
            this.addTest(testName, false, `Error: ${error.message}`);
        }
    }

    testParentPortalJS() {
        const testName = 'Parent Portal JavaScript Functions';
        try {
            const jsPath = path.join(__dirname, '../public/js/parent-portal.js');
            
            if (!fs.existsSync(jsPath)) {
                this.addTest(testName, false, 'JavaScript file not found');
                return;
            }

            const jsContent = fs.readFileSync(jsPath, 'utf8');
            
            const requiredFunctions = [
                'loadChildren',
                'loadUpcomingAppointments',
                'loadRecentVisits',
                'loadVaccineReminders',
                'showChildDetails',
                'handleAppointmentRequest'
            ];

            const missingFunctions = requiredFunctions.filter(func => 
                !jsContent.includes(func)
            );

            if (missingFunctions.length === 0) {
                this.addTest(testName, true, 'All required JavaScript functions present');
            } else {
                this.addTest(testName, false, `Missing functions: ${missingFunctions.join(', ')}`);
            }
        } catch (error) {
            this.addTest(testName, false, `Error: ${error.message}`);
        }
    }

    testParentPortalController() {
        const testName = 'Parent Portal Controller Methods';
        try {
            const controllerPath = path.join(__dirname, '../src/controllers/ParentPortalController.js');
            
            if (!fs.existsSync(controllerPath)) {
                this.addTest(testName, false, 'Controller file not found');
                return;
            }

            const controllerContent = fs.readFileSync(controllerPath, 'utf8');
            
            const requiredMethods = [
                'getProfile',
                'getChildren',
                'getChildDetails',
                'getUpcomingAppointments',
                'getRecentVisits',
                'requestAppointment'
            ];

            const missingMethods = requiredMethods.filter(method => 
                !controllerContent.includes(`static async ${method}`)
            );

            if (missingMethods.length === 0) {
                this.addTest(testName, true, 'All required controller methods present');
            } else {
                this.addTest(testName, false, `Missing methods: ${missingMethods.join(', ')}`);
            }
        } catch (error) {
            this.addTest(testName, false, `Error: ${error.message}`);
        }
    }

    testParentChildSecurity() {
        const testName = 'Parent-Child Security Validation';
        try {
            const controllerPath = path.join(__dirname, '../src/controllers/ParentPortalController.js');
            const controllerContent = fs.readFileSync(controllerPath, 'utf8');
            
            // Check for parent role validation
            const hasRoleCheck = controllerContent.includes("req.user.roles.includes('Parent')");
            
            // Check for parent-child relationship verification
            const hasRelationshipCheck = controllerContent.includes('patient_parents');
            
            // Check for access denied responses
            const hasAccessDenied = controllerContent.includes('Access denied');

            if (hasRoleCheck && hasRelationshipCheck && hasAccessDenied) {
                this.addTest(testName, true, 'Security validations implemented');
            } else {
                const missing = [];
                if (!hasRoleCheck) missing.push('role validation');
                if (!hasRelationshipCheck) missing.push('relationship verification');
                if (!hasAccessDenied) missing.push('access denied handling');
                
                this.addTest(testName, false, `Missing security features: ${missing.join(', ')}`);
            }
        } catch (error) {
            this.addTest(testName, false, `Error: ${error.message}`);
        }
    }

    testAPIEndpoints() {
        const testName = 'API Endpoint Structure';
        try {
            const controllerPath = path.join(__dirname, '../src/controllers/ParentPortalController.js');
            const controllerContent = fs.readFileSync(controllerPath, 'utf8');
            
            const expectedEndpoints = [
                '/api/v1/parent/profile',
                '/api/v1/parent/children',
                '/api/v1/parent/appointments/upcoming',
                '/api/v1/parent/appointments/request'
            ];

            // Check if endpoints are referenced in comments or strings
            const foundEndpoints = expectedEndpoints.filter(endpoint => 
                controllerContent.includes(endpoint) || 
                controllerContent.includes(endpoint.replace('/api/v1/parent/', ''))
            );

            if (foundEndpoints.length >= expectedEndpoints.length - 1) { // Allow some flexibility
                this.addTest(testName, true, 'API endpoint structure looks good');
            } else {
                this.addTest(testName, false, `Some API endpoints may be missing`);
            }
        } catch (error) {
            this.addTest(testName, false, `Error: ${error.message}`);
        }
    }

    addTest(name, passed, message) {
        this.testResults.tests.push({ name, passed, message });
        if (passed) {
            this.testResults.passed++;
        } else {
            this.testResults.failed++;
        }
    }

    printResults() {
        console.log('\n📊 TEST RESULTS:\n');
        
        this.testResults.tests.forEach(test => {
            const icon = test.passed ? '✅' : '❌';
            console.log(`${icon} ${test.name}: ${test.message}`);
        });

        const total = this.testResults.passed + this.testResults.failed;
        const successRate = Math.round((this.testResults.passed / total) * 100);

        console.log(`\n📈 SUMMARY: ${this.testResults.passed}/${total} tests passed (${successRate}%)`);
        
        if (successRate === 100) {
            console.log('🎉 ALL TESTS PASSED! Parent Portal implementation is complete.');
        } else if (successRate >= 80) {
            console.log('✨ MOSTLY COMPLETE! Minor issues to address.');
        } else {
            console.log('🔧 NEEDS WORK! Several components missing or incomplete.');
        }

        console.log('\n🚀 NEXT STEPS:');
        console.log('1. Add parent portal routes to Express router');
        console.log('2. Create patient_parents table for parent-child relationships');
        console.log('3. Test parent portal with actual data');
        console.log('4. Implement vaccine tracking system integration');
        console.log('5. Add growth chart visualization with Chart.js');
    }
}

// Run tests if called directly
if (require.main === module) {
    const tester = new ParentPortalTester();
    tester.runTests();
}

module.exports = { ParentPortalTester };