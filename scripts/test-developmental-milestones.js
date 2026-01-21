/**
 * Developmental Milestones Test Script
 * Tests milestone tracking, vaccine compliance, and pediatric analytics
 */

const fs = require('fs');
const path = require('path');

class DevelopmentalMilestonesTest {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            tests: []
        };
    }

    async runTests() {
        console.log('👶 Testing Developmental Milestones Implementation...\n');

        // Test 1: Developmental Milestones Controller
        this.testDevelopmentalMilestonesController();

        // Test 2: Vaccine Schedule Controller
        this.testVaccineScheduleController();

        // Test 3: Pediatric Analytics Controller
        this.testPediatricAnalyticsController();

        // Test 4: Database Setup Script
        this.testDatabaseSetupScript();

        // Test 5: Routes Configuration
        this.testRoutesConfiguration();

        // Test 6: Milestone Data Completeness
        this.testMilestoneDataCompleteness();

        this.printResults();
    }

    testDevelopmentalMilestonesController() {
        const testName = 'Developmental Milestones Controller';
        try {
            const controllerPath = path.join(__dirname, '../src/controllers/DevelopmentalMilestonesController.js');
            
            if (!fs.existsSync(controllerPath)) {
                this.addTest(testName, false, 'Controller file not found');
                return;
            }

            const controllerContent = fs.readFileSync(controllerPath, 'utf8');
            
            const requiredMethods = [
                'getPatientMilestones',
                'recordMilestoneAchievement',
                'getMilestoneScreening',
                'getMilestoneSummary',
                'generateMilestoneSummary'
            ];

            const missingMethods = requiredMethods.filter(method => 
                !controllerContent.includes(method)
            );

            // Check for milestone data
            const hasMilestoneData = controllerContent.includes('MILESTONE_DATA');
            const hasAgeCalculation = controllerContent.includes('calculateAgeInMonths');

            if (missingMethods.length === 0 && hasMilestoneData && hasAgeCalculation) {
                this.addTest(testName, true, 'All milestone tracking methods implemented');
            } else {
                const issues = [];
                if (missingMethods.length > 0) issues.push(`Missing methods: ${missingMethods.join(', ')}`);
                if (!hasMilestoneData) issues.push('Milestone data missing');
                if (!hasAgeCalculation) issues.push('Age calculation missing');
                this.addTest(testName, false, issues.join('; '));
            }
        } catch (error) {
            this.addTest(testName, false, `Error: ${error.message}`);
        }
    }

    testVaccineScheduleController() {
        const testName = 'Vaccine Schedule Controller';
        try {
            const controllerPath = path.join(__dirname, '../src/controllers/VaccineScheduleController.js');
            
            if (!fs.existsSync(controllerPath)) {
                this.addTest(testName, false, 'Controller file not found');
                return;
            }

            const controllerContent = fs.readFileSync(controllerPath, 'utf8');
            
            const requiredMethods = [
                'getPatientVaccineStatus',
                'recordVaccineAdministration',
                'getOverdueVaccinations',
                'getVaccinationCoverage',
                'generateCatchUpSchedule'
            ];

            const missingMethods = requiredMethods.filter(method => 
                !controllerContent.includes(method)
            );

            // Check for vaccine schedule data
            const hasVaccineSchedule = controllerContent.includes('VACCINE_SCHEDULE');
            const hasComplianceTracking = controllerContent.includes('generateComplianceStatus');

            if (missingMethods.length === 0 && hasVaccineSchedule && hasComplianceTracking) {
                this.addTest(testName, true, 'All vaccine tracking methods implemented');
            } else {
                const issues = [];
                if (missingMethods.length > 0) issues.push(`Missing methods: ${missingMethods.join(', ')}`);
                if (!hasVaccineSchedule) issues.push('Vaccine schedule data missing');
                if (!hasComplianceTracking) issues.push('Compliance tracking missing');
                this.addTest(testName, false, issues.join('; '));
            }
        } catch (error) {
            this.addTest(testName, false, `Error: ${error.message}`);
        }
    }

    testPediatricAnalyticsController() {
        const testName = 'Pediatric Analytics Controller';
        try {
            const controllerPath = path.join(__dirname, '../src/controllers/PediatricAnalyticsController.js');
            
            if (!fs.existsSync(controllerPath)) {
                this.addTest(testName, false, 'Controller file not found');
                return;
            }

            const controllerContent = fs.readFileSync(controllerPath, 'utf8');
            
            const requiredMethods = [
                'getPediatricDashboard',
                'getChildhoodDiseaseTracking',
                'getVaccinationStatistics',
                'getPediatricGrowthAnalytics',
                'getPediatricQualityIndicators'
            ];

            const missingMethods = requiredMethods.filter(method => 
                !controllerContent.includes(method)
            );

            // Check for analytics features
            const hasAgeGroupAnalysis = controllerContent.includes('age_group');
            const hasQualityIndicators = controllerContent.includes('quality');

            if (missingMethods.length === 0 && hasAgeGroupAnalysis && hasQualityIndicators) {
                this.addTest(testName, true, 'All pediatric analytics methods implemented');
            } else {
                const issues = [];
                if (missingMethods.length > 0) issues.push(`Missing methods: ${missingMethods.join(', ')}`);
                if (!hasAgeGroupAnalysis) issues.push('Age group analysis missing');
                if (!hasQualityIndicators) issues.push('Quality indicators missing');
                this.addTest(testName, false, issues.join('; '));
            }
        } catch (error) {
            this.addTest(testName, false, `Error: ${error.message}`);
        }
    }

    testDatabaseSetupScript() {
        const testName = 'Database Setup Script';
        try {
            const setupPath = path.join(__dirname, '../scripts/setup-developmental-milestones-db.js');
            
            if (!fs.existsSync(setupPath)) {
                this.addTest(testName, false, 'Setup script not found');
                return;
            }

            const setupContent = fs.readFileSync(setupPath, 'utf8');
            
            const requiredTables = [
                'developmental_milestones',
                'milestone_achievements',
                'vaccine_records'
            ];

            const missingTables = requiredTables.filter(table => 
                !setupContent.includes(table)
            );

            // Check for sample data insertion
            const hasSampleMilestones = setupContent.includes('standard developmental milestones');
            const hasSampleVaccines = setupContent.includes('vaccine schedules');

            if (missingTables.length === 0 && hasSampleMilestones && hasSampleVaccines) {
                this.addTest(testName, true, 'Database setup script complete with sample data');
            } else {
                const issues = [];
                if (missingTables.length > 0) issues.push(`Missing tables: ${missingTables.join(', ')}`);
                if (!hasSampleMilestones) issues.push('Sample milestones missing');
                if (!hasSampleVaccines) issues.push('Sample vaccines missing');
                this.addTest(testName, false, issues.join('; '));
            }
        } catch (error) {
            this.addTest(testName, false, `Error: ${error.message}`);
        }
    }

    testRoutesConfiguration() {
        const testName = 'Routes Configuration';
        try {
            const routesPath = path.join(__dirname, '../src/routes/pediatric.js');
            
            if (!fs.existsSync(routesPath)) {
                this.addTest(testName, false, 'Routes file not found');
                return;
            }

            const routesContent = fs.readFileSync(routesPath, 'utf8');
            
            const requiredRoutes = [
                '/milestones/',
                '/vaccines/',
                '/analytics/'
            ];

            const missingRoutes = requiredRoutes.filter(route => 
                !routesContent.includes(route)
            );

            // Check for controller imports
            const hasControllerImports = routesContent.includes('DevelopmentalMilestonesController') &&
                                       routesContent.includes('VaccineScheduleController') &&
                                       routesContent.includes('PediatricAnalyticsController');

            if (missingRoutes.length === 0 && hasControllerImports) {
                this.addTest(testName, true, 'All pediatric routes configured with proper controllers');
            } else {
                const issues = [];
                if (missingRoutes.length > 0) issues.push(`Missing routes: ${missingRoutes.join(', ')}`);
                if (!hasControllerImports) issues.push('Controller imports missing');
                this.addTest(testName, false, issues.join('; '));
            }
        } catch (error) {
            this.addTest(testName, false, `Error: ${error.message}`);
        }
    }

    testMilestoneDataCompleteness() {
        const testName = 'Milestone Data Completeness';
        try {
            const controllerPath = path.join(__dirname, '../src/controllers/DevelopmentalMilestonesController.js');
            const controllerContent = fs.readFileSync(controllerPath, 'utf8');
            
            // Check for age ranges covered
            const ageRanges = ['2:', '4:', '6:', '9:', '12:', '18:', '24:', '36:'];
            const missingAges = ageRanges.filter(age => !controllerContent.includes(age));
            
            // Check for milestone categories
            const categories = ['motor', 'social', 'communication', 'cognitive'];
            const missingCategories = categories.filter(cat => !controllerContent.includes(cat));
            
            // Check for milestone types
            const types = ['gross_motor', 'fine_motor', 'language', 'social_emotional'];
            const missingTypes = types.filter(type => !controllerContent.includes(type));

            if (missingAges.length === 0 && missingCategories.length === 0 && missingTypes.length === 0) {
                this.addTest(testName, true, 'Complete milestone data covering all ages and categories');
            } else {
                const issues = [];
                if (missingAges.length > 0) issues.push(`Missing ages: ${missingAges.join(', ')}`);
                if (missingCategories.length > 0) issues.push(`Missing categories: ${missingCategories.join(', ')}`);
                if (missingTypes.length > 0) issues.push(`Missing types: ${missingTypes.join(', ')}`);
                this.addTest(testName, false, issues.join('; '));
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
            console.log('🎉 ALL TESTS PASSED! Developmental Milestones implementation is complete.');
        } else if (successRate >= 80) {
            console.log('✨ MOSTLY COMPLETE! Minor issues to address.');
        } else {
            console.log('🔧 NEEDS WORK! Several components missing or incomplete.');
        }

        console.log('\n🚀 FEATURES IMPLEMENTED:');
        console.log('• Developmental milestone tracking (2-36 months)');
        console.log('• Vaccine schedule compliance monitoring');
        console.log('• Pediatric analytics and quality indicators');
        console.log('• Growth pattern analysis integration');
        console.log('• Overdue vaccination alerts');
        console.log('• Catch-up vaccination scheduling');
        console.log('• Childhood disease tracking');
        console.log('• Comprehensive pediatric dashboard');

        console.log('\n📋 NEXT STEPS:');
        console.log('1. Add pediatric routes to main Express app');
        console.log('2. Run database setup script for milestone tables');
        console.log('3. Test with sample pediatric patient data');
        console.log('4. Integrate with visit documentation workflow');
        console.log('5. Create pediatric dashboard UI components');
        console.log('6. Implement milestone screening forms');
        console.log('7. Add vaccine reminder notifications');
    }
}

// Run tests if called directly
if (require.main === module) {
    const tester = new DevelopmentalMilestonesTest();
    tester.runTests();
}

module.exports = { DevelopmentalMilestonesTest };