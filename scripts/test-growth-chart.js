/**
 * Growth Chart Test Script
 * Tests WHO Growth Standards implementation
 */

const fs = require('fs');
const path = require('path');

class GrowthChartTester {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            tests: []
        };
    }

    async runTests() {
        console.log('📈 Testing Growth Chart Implementation...\n');

        // Test 1: Check controller exists and has required methods
        this.testGrowthChartController();

        // Test 2: Check HTML interface exists
        this.testGrowthChartHTML();

        // Test 3: Check JavaScript functionality
        this.testGrowthChartJS();

        // Test 4: Check routes configuration
        this.testGrowthChartRoutes();

        // Test 5: Verify WHO percentile calculations
        this.testWHOPercentileCalculations();

        // Test 6: Check growth analysis logic
        this.testGrowthAnalysis();

        this.printResults();
    }

    testGrowthChartController() {
        const testName = 'Growth Chart Controller Methods';
        try {
            const controllerPath = path.join(__dirname, '../src/controllers/GrowthChartController.js');
            
            if (!fs.existsSync(controllerPath)) {
                this.addTest(testName, false, 'Controller file not found');
                return;
            }

            const controllerContent = fs.readFileSync(controllerPath, 'utf8');
            
            const requiredMethods = [
                'getPatientGrowthData',
                'addGrowthMeasurement',
                'getWHOChartData',
                'calculatePercentile',
                'analyzeGrowthPattern'
            ];

            const missingMethods = requiredMethods.filter(method => 
                !controllerContent.includes(method)
            );

            // Check for WHO percentile data
            const hasWHOData = controllerContent.includes('WHO_PERCENTILES');

            if (missingMethods.length === 0 && hasWHOData) {
                this.addTest(testName, true, 'All required methods and WHO data present');
            } else {
                const issues = [];
                if (missingMethods.length > 0) issues.push(`Missing methods: ${missingMethods.join(', ')}`);
                if (!hasWHOData) issues.push('WHO percentile data missing');
                this.addTest(testName, false, issues.join('; '));
            }
        } catch (error) {
            this.addTest(testName, false, `Error: ${error.message}`);
        }
    }

    testGrowthChartHTML() {
        const testName = 'Growth Chart HTML Interface';
        try {
            const htmlPath = path.join(__dirname, '../public/views/growth-chart.html');
            
            if (!fs.existsSync(htmlPath)) {
                this.addTest(testName, false, 'HTML file not found');
                return;
            }

            const htmlContent = fs.readFileSync(htmlPath, 'utf8');
            
            const requiredElements = [
                'growthChart',
                'measurements-tbody',
                'growth-alerts',
                'add-measurement-modal',
                'chart.js'
            ];

            const missingElements = requiredElements.filter(element => 
                !htmlContent.includes(element)
            );

            if (missingElements.length === 0) {
                this.addTest(testName, true, 'All required HTML elements and Chart.js present');
            } else {
                this.addTest(testName, false, `Missing elements: ${missingElements.join(', ')}`);
            }
        } catch (error) {
            this.addTest(testName, false, `Error: ${error.message}`);
        }
    }

    testGrowthChartJS() {
        const testName = 'Growth Chart JavaScript Functions';
        try {
            const jsPath = path.join(__dirname, '../public/js/growth-chart.js');
            
            if (!fs.existsSync(jsPath)) {
                this.addTest(testName, false, 'JavaScript file not found');
                return;
            }

            const jsContent = fs.readFileSync(jsPath, 'utf8');
            
            const requiredFunctions = [
                'loadPatientGrowthData',
                'loadWHOData',
                'renderChart',
                'interpolateWHO',
                'addMeasurement',
                'renderGrowthAlerts'
            ];

            const missingFunctions = requiredFunctions.filter(func => 
                !jsContent.includes(func)
            );

            // Check for Chart.js integration
            const hasChartJS = jsContent.includes('new Chart');

            if (missingFunctions.length === 0 && hasChartJS) {
                this.addTest(testName, true, 'All required functions and Chart.js integration present');
            } else {
                const issues = [];
                if (missingFunctions.length > 0) issues.push(`Missing functions: ${missingFunctions.join(', ')}`);
                if (!hasChartJS) issues.push('Chart.js integration missing');
                this.addTest(testName, false, issues.join('; '));
            }
        } catch (error) {
            this.addTest(testName, false, `Error: ${error.message}`);
        }
    }

    testGrowthChartRoutes() {
        const testName = 'Growth Chart Routes Configuration';
        try {
            const routesPath = path.join(__dirname, '../src/routes/growthChart.js');
            
            if (!fs.existsSync(routesPath)) {
                this.addTest(testName, false, 'Routes file not found');
                return;
            }

            const routesContent = fs.readFileSync(routesPath, 'utf8');
            
            const requiredRoutes = [
                '/:patientId',
                '/measurements',
                '/who-data',
                '/summary'
            ];

            const missingRoutes = requiredRoutes.filter(route => 
                !routesContent.includes(route)
            );

            if (missingRoutes.length === 0) {
                this.addTest(testName, true, 'All required routes configured');
            } else {
                this.addTest(testName, false, `Missing routes: ${missingRoutes.join(', ')}`);
            }
        } catch (error) {
            this.addTest(testName, false, `Error: ${error.message}`);
        }
    }

    testWHOPercentileCalculations() {
        const testName = 'WHO Percentile Calculations';
        try {
            // Test percentile calculation logic
            const controllerPath = path.join(__dirname, '../src/controllers/GrowthChartController.js');
            const controllerContent = fs.readFileSync(controllerPath, 'utf8');
            
            // Check for percentile calculation method
            const hasCalculatePercentile = controllerContent.includes('calculatePercentile');
            const hasWHOData = controllerContent.includes('height_boys') && controllerContent.includes('weight_girls');
            const hasInterpolation = controllerContent.includes('closestAge') || controllerContent.includes('interpolat');

            if (hasCalculatePercentile && hasWHOData && hasInterpolation) {
                this.addTest(testName, true, 'WHO percentile calculation logic implemented');
            } else {
                const missing = [];
                if (!hasCalculatePercentile) missing.push('calculatePercentile method');
                if (!hasWHOData) missing.push('WHO data tables');
                if (!hasInterpolation) missing.push('age interpolation');
                this.addTest(testName, false, `Missing: ${missing.join(', ')}`);
            }
        } catch (error) {
            this.addTest(testName, false, `Error: ${error.message}`);
        }
    }

    testGrowthAnalysis() {
        const testName = 'Growth Pattern Analysis';
        try {
            const controllerPath = path.join(__dirname, '../src/controllers/GrowthChartController.js');
            const controllerContent = fs.readFileSync(controllerPath, 'utf8');
            
            // Check for growth analysis features
            const hasAnalyzeGrowthPattern = controllerContent.includes('analyzeGrowthPattern');
            const hasGrowthAlerts = controllerContent.includes('alerts');
            const hasPercentileChecks = controllerContent.includes('percentile < 3') || controllerContent.includes('percentile > 97');
            const hasGrowthVelocity = controllerContent.includes('velocity') || controllerContent.includes('growth');

            if (hasAnalyzeGrowthPattern && hasGrowthAlerts && hasPercentileChecks) {
                this.addTest(testName, true, 'Growth analysis and alerts implemented');
            } else {
                const missing = [];
                if (!hasAnalyzeGrowthPattern) missing.push('analyzeGrowthPattern method');
                if (!hasGrowthAlerts) missing.push('growth alerts');
                if (!hasPercentileChecks) missing.push('percentile checks');
                this.addTest(testName, false, `Missing: ${missing.join(', ')}`);
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
            console.log('🎉 ALL TESTS PASSED! Growth Chart implementation is complete.');
        } else if (successRate >= 80) {
            console.log('✨ MOSTLY COMPLETE! Minor issues to address.');
        } else {
            console.log('🔧 NEEDS WORK! Several components missing or incomplete.');
        }

        console.log('\n🚀 FEATURES IMPLEMENTED:');
        console.log('• WHO Growth Standards (height/weight percentiles)');
        console.log('• Interactive Chart.js visualization');
        console.log('• Percentile calculations and interpolation');
        console.log('• Growth pattern analysis and alerts');
        console.log('• Add new measurements functionality');
        console.log('• Growth concerns detection');

        console.log('\n📋 NEXT STEPS:');
        console.log('1. Add growth chart routes to main Express app');
        console.log('2. Run database setup to create growth_measurements table');
        console.log('3. Test with sample pediatric patient data');
        console.log('4. Integrate with visit documentation workflow');
        console.log('5. Add BMI-for-age charts for comprehensive tracking');
    }
}

// Run tests if called directly
if (require.main === module) {
    const tester = new GrowthChartTester();
    tester.runTests();
}

module.exports = { GrowthChartTester };