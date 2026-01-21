/**
 * Phase 5.1 Dashboard UX Test Script
 * Tests role-specific dashboard functionality
 */

const fetch = require('node-fetch');

class Phase51Tester {
    constructor() {
        this.baseUrl = 'http://localhost:3000';
        this.token = null;
        this.testResults = [];
    }

    async runTests() {
        console.log('🚀 Starting Phase 5.1 Dashboard UX Tests...\n');

        try {
            // Test 1: Login and get token
            await this.testLogin();
            
            // Test 2: Test dashboard data endpoint
            await this.testDashboardData();
            
            // Test 3: Test quick actions endpoint
            await this.testQuickActions();
            
            // Test 4: Test role-specific dashboard routes
            await this.testDashboardRoutes();
            
            // Print results
            this.printResults();
            
        } catch (error) {
            console.error('❌ Test suite failed:', error.message);
        }
    }

    async testLogin() {
        try {
            const response = await fetch(`${this.baseUrl}/api/v1/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'admin@curaone.com',
                    password: 'Admin123!'
                })
            });

            if (response.ok) {
                const data = await response.json();
                this.token = data.token;
                this.addResult('✅ Login Test', 'PASS', 'Successfully authenticated');
            } else {
                this.addResult('❌ Login Test', 'FAIL', 'Authentication failed');
            }
        } catch (error) {
            this.addResult('❌ Login Test', 'ERROR', error.message);
        }
    }

    async testDashboardData() {
        if (!this.token) {
            this.addResult('❌ Dashboard Data Test', 'SKIP', 'No authentication token');
            return;
        }

        try {
            const response = await fetch(`${this.baseUrl}/api/v1/dashboard/data`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data.role) {
                    this.addResult('✅ Dashboard Data Test', 'PASS', `Role-specific data loaded: ${data.data.role}`);
                } else {
                    this.addResult('❌ Dashboard Data Test', 'FAIL', 'Invalid response structure');
                }
            } else {
                this.addResult('❌ Dashboard Data Test', 'FAIL', `HTTP ${response.status}`);
            }
        } catch (error) {
            this.addResult('❌ Dashboard Data Test', 'ERROR', error.message);
        }
    }

    async testQuickActions() {
        if (!this.token) {
            this.addResult('❌ Quick Actions Test', 'SKIP', 'No authentication token');
            return;
        }

        try {
            const response = await fetch(`${this.baseUrl}/api/v1/dashboard/actions`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && Array.isArray(data.data)) {
                    this.addResult('✅ Quick Actions Test', 'PASS', `${data.data.length} actions loaded`);
                } else {
                    this.addResult('❌ Quick Actions Test', 'FAIL', 'Invalid response structure');
                }
            } else {
                this.addResult('❌ Quick Actions Test', 'FAIL', `HTTP ${response.status}`);
            }
        } catch (error) {
            this.addResult('❌ Quick Actions Test', 'ERROR', error.message);
        }
    }

    async testDashboardRoutes() {
        const routes = [
            '/dashboard',
            '/dashboard/staff',
            '/dashboard/doctor',
            '/dashboard/owner'
        ];

        for (const route of routes) {
            try {
                const response = await fetch(`${this.baseUrl}${route}`);
                
                if (response.ok) {
                    const html = await response.text();
                    if (html.includes('CuraOne')) {
                        this.addResult(`✅ Route ${route}`, 'PASS', 'Dashboard page served');
                    } else {
                        this.addResult(`❌ Route ${route}`, 'FAIL', 'Invalid HTML content');
                    }
                } else {
                    this.addResult(`❌ Route ${route}`, 'FAIL', `HTTP ${response.status}`);
                }
            } catch (error) {
                this.addResult(`❌ Route ${route}`, 'ERROR', error.message);
            }
        }
    }

    addResult(test, status, message) {
        this.testResults.push({ test, status, message });
    }

    printResults() {
        console.log('\n📊 Phase 5.1 Test Results:');
        console.log('=' .repeat(60));
        
        this.testResults.forEach(result => {
            console.log(`${result.test}: ${result.status} - ${result.message}`);
        });
        
        const passed = this.testResults.filter(r => r.status === 'PASS').length;
        const total = this.testResults.length;
        
        console.log('=' .repeat(60));
        console.log(`📈 Summary: ${passed}/${total} tests passed`);
        
        if (passed === total) {
            console.log('🎉 All Phase 5.1 Dashboard UX tests passed!');
        } else {
            console.log('⚠️  Some tests failed. Check the results above.');
        }
    }
}

// Run tests if called directly
if (require.main === module) {
    const tester = new Phase51Tester();
    tester.runTests();
}

module.exports = Phase51Tester;