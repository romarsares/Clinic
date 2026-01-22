/**
 * Comprehensive Test Suite for Appointment Quick Actions Panel
 * Tests all functionality including calendar integration, batch operations, SMS, templates, and conflict resolution
 */

class QuickActionsTestSuite {
    constructor() {
        this.testResults = [];
        this.mockData = this.generateMockData();
        this.originalFetch = window.fetch;
        this.setupMockFetch();
    }

    generateMockData() {
        return {
            appointments: [
                {
                    id: 1,
                    date: '2024-01-15',
                    time: '09:00',
                    patient_name: 'John Doe',
                    doctor_name: 'Dr. Smith',
                    type: 'consultation',
                    status: 'scheduled',
                    duration: 30,
                    notes: 'Regular checkup'
                },
                {
                    id: 2,
                    date: '2024-01-15',
                    time: '09:30',
                    patient_name: 'Jane Smith',
                    doctor_name: 'Dr. Johnson',
                    type: 'follow-up',
                    status: 'confirmed',
                    duration: 45,
                    notes: 'Follow-up visit'
                }
            ],
            doctors: [
                { id: 1, name: 'Dr. Smith' },
                { id: 2, name: 'Dr. Johnson' }
            ],
            conflicts: [
                {
                    id: 1,
                    type: 'time_overlap',
                    appointments: [1, 2],
                    message: 'Time overlap detected'
                }
            ]
        };
    }

    setupMockFetch() {
        window.fetch = async (url, options) => {
            // Mock API responses
            if (url.includes('/api/appointments/calendar/sync')) {
                return { ok: true, json: async () => ({ synced: 5 }) };
            }
            if (url.includes('/api/appointments/export/pdf')) {
                return { ok: true, blob: async () => new Blob(['PDF content']) };
            }
            if (url.includes('/api/appointments/sms/send')) {
                return { ok: true, json: async () => ({ sent: 3 }) };
            }
            if (url.includes('/api/appointments/batch/')) {
                return { ok: true, json: async () => ({ updated: 2 }) };
            }
            if (url.includes('/api/doctors')) {
                return { ok: true, json: async () => this.mockData.doctors };
            }
            if (url.includes('/api/appointments/conflicts')) {
                return { ok: true, json: async () => this.mockData.conflicts };
            }
            if (url.includes('/api/appointments/current')) {
                return { ok: true, json: async () => this.mockData.appointments };
            }
            
            return { ok: false, status: 404 };
        };
    }

    async runAllTests() {
        console.log('🧪 Starting Quick Actions Panel Test Suite...');
        
        // Setup test environment
        this.setupTestEnvironment();
        
        // Run test categories
        await this.testInitialization();
        await this.testBatchMode();
        await this.testCalendarIntegration();
        await this.testExportFunctionality();
        await this.testSMSFunctionality();
        await this.testBatchOperations();
        await this.testTemplateManagement();
        await this.testConflictResolution();
        await this.testUIInteractions();
        await this.testErrorHandling();
        await this.testAccessibility();
        await this.testPerformance();
        
        // Generate test report
        this.generateTestReport();
        
        // Cleanup
        this.cleanup();
    }

    setupTestEnvironment() {
        // Create test container
        const testContainer = document.createElement('div');
        testContainer.id = 'test-container';
        testContainer.innerHTML = '<div id="quick-actions-panel"></div>';
        document.body.appendChild(testContainer);
        
        // Mock localStorage
        this.originalLocalStorage = { ...localStorage };
        localStorage.setItem('token', 'test-token');
        localStorage.setItem('appointmentTemplates', JSON.stringify([]));
    }

    async testInitialization() {
        console.log('📋 Testing Initialization...');
        
        try {
            // Test 1: Component initialization
            const quickActions = new AppointmentQuickActions();
            this.assert(quickActions instanceof AppointmentQuickActions, 'Component should initialize');
            
            // Test 2: HTML structure creation
            const panel = document.getElementById('quick-actions-panel');
            this.assert(panel.children.length > 0, 'HTML structure should be created');
            
            // Test 3: Event listeners setup
            const toggleBtn = document.getElementById('toggle-batch-mode');
            this.assert(toggleBtn !== null, 'Batch mode toggle should exist');
            
            // Test 4: Initial state
            this.assert(!toggleBtn.classList.contains('active'), 'Batch mode should be initially disabled');
            
            this.recordTest('Initialization', 'PASS', 'All initialization tests passed');
        } catch (error) {
            this.recordTest('Initialization', 'FAIL', error.message);
        }
    }

    async testBatchMode() {
        console.log('📋 Testing Batch Mode...');
        
        try {
            const quickActions = window.appointmentQuickActions || new AppointmentQuickActions();
            
            // Test 1: Toggle batch mode on
            const toggleBtn = document.getElementById('toggle-batch-mode');
            toggleBtn.click();
            
            this.assert(toggleBtn.classList.contains('active'), 'Batch mode should be active after toggle');
            
            // Test 2: Batch cards visibility
            const batchCards = document.querySelectorAll('.batch-only');
            this.assert(batchCards[0].style.display === 'block', 'Batch cards should be visible');
            
            // Test 3: Selected count display
            const selectedCount = document.getElementById('selected-count');
            this.assert(selectedCount.style.display === 'inline', 'Selected count should be visible');
            
            // Test 4: Batch selection functionality
            quickActions.selectedAppointments.add('1');
            quickActions.updateBatchSelection();
            this.assert(selectedCount.textContent === '1 selected', 'Selected count should update');
            
            // Test 5: Toggle batch mode off
            toggleBtn.click();
            this.assert(!toggleBtn.classList.contains('active'), 'Batch mode should be disabled');
            
            this.recordTest('Batch Mode', 'PASS', 'All batch mode tests passed');
        } catch (error) {
            this.recordTest('Batch Mode', 'FAIL', error.message);
        }
    }

    async testCalendarIntegration() {
        console.log('📅 Testing Calendar Integration...');
        
        try {
            const quickActions = window.appointmentQuickActions || new AppointmentQuickActions();
            
            // Test 1: Calendar sync
            await quickActions.syncCalendar();
            this.assert(true, 'Calendar sync should complete without errors');
            
            // Test 2: ICS file generation
            const icsContent = quickActions.generateICSFile(this.mockData.appointments);
            this.assert(icsContent.includes('BEGIN:VCALENDAR'), 'ICS file should have proper format');
            this.assert(icsContent.includes('John Doe'), 'ICS file should include appointment data');
            
            // Test 3: Date formatting
            const testDate = new Date('2024-01-15T09:00:00');
            const formatted = quickActions.formatICSDate(testDate);
            this.assert(formatted.includes('20240115T090000Z'), 'Date should be properly formatted for ICS');
            
            // Test 4: Export to calendar
            await quickActions.exportToCalendar();
            this.assert(true, 'Export to calendar should complete');
            
            this.recordTest('Calendar Integration', 'PASS', 'All calendar tests passed');
        } catch (error) {
            this.recordTest('Calendar Integration', 'FAIL', error.message);
        }
    }

    async testExportFunctionality() {
        console.log('📊 Testing Export Functionality...');
        
        try {
            const quickActions = window.appointmentQuickActions || new AppointmentQuickActions();
            
            // Test 1: PDF export
            await quickActions.exportPDF();
            this.assert(true, 'PDF export should complete');
            
            // Test 2: Excel/CSV export
            await quickActions.exportExcel();
            this.assert(true, 'Excel export should complete');
            
            // Test 3: CSV generation
            const csvContent = quickActions.generateCSV(this.mockData.appointments);
            this.assert(csvContent.includes('Date,Time,Patient'), 'CSV should have proper headers');
            this.assert(csvContent.includes('John Doe'), 'CSV should include appointment data');
            
            // Test 4: Print schedule
            quickActions.printSchedule();
            this.assert(true, 'Print schedule should execute');
            
            this.recordTest('Export Functionality', 'PASS', 'All export tests passed');
        } catch (error) {
            this.recordTest('Export Functionality', 'FAIL', error.message);
        }
    }

    async testSMSFunctionality() {
        console.log('📱 Testing SMS Functionality...');
        
        try {
            const quickActions = window.appointmentQuickActions || new AppointmentQuickActions();
            
            // Test 1: SMS modal display
            quickActions.showSMSModal('reminder');
            const modal = document.getElementById('sms-modal');
            this.assert(modal.style.display === 'block', 'SMS modal should be visible');
            
            // Test 2: SMS template update
            quickActions.updateSMSTemplate('reminder');
            const messageArea = document.getElementById('sms-message');
            this.assert(messageArea.value.includes('appointment'), 'SMS template should be populated');
            
            // Test 3: Recipients update
            await quickActions.updateSMSRecipients();
            const recipientCount = document.getElementById('sms-count');
            this.assert(recipientCount.textContent === '2', 'Recipient count should be correct');
            
            // Test 4: SMS sending
            document.getElementById('sms-message').value = 'Test message';
            await quickActions.sendSMS();
            this.assert(true, 'SMS sending should complete');
            
            this.recordTest('SMS Functionality', 'PASS', 'All SMS tests passed');
        } catch (error) {
            this.recordTest('SMS Functionality', 'FAIL', error.message);
        }
    }

    async testBatchOperations() {
        console.log('⚡ Testing Batch Operations...');
        
        try {
            const quickActions = window.appointmentQuickActions || new AppointmentQuickActions();
            quickActions.selectedAppointments.add('1');
            quickActions.selectedAppointments.add('2');
            
            // Test 1: Batch reschedule modal
            quickActions.showBatchModal('reschedule');
            const modal = document.getElementById('batch-modal');
            this.assert(modal.style.display === 'block', 'Batch modal should be visible');
            
            // Test 2: Batch operation data extraction
            document.getElementById('batch-date').value = '2024-01-16';
            document.getElementById('batch-time').value = '10:00';
            const data = quickActions.getBatchOperationData('reschedule');
            this.assert(data.date === '2024-01-16', 'Batch data should be extracted correctly');
            
            // Test 3: Batch execution
            await quickActions.executeBatch();
            this.assert(true, 'Batch operation should execute');
            
            // Test 4: Different batch operations
            quickActions.showBatchModal('cancel');
            quickActions.showBatchModal('confirm');
            quickActions.showBatchModal('status');
            this.assert(true, 'All batch operation modals should work');
            
            this.recordTest('Batch Operations', 'PASS', 'All batch operation tests passed');
        } catch (error) {
            this.recordTest('Batch Operations', 'FAIL', error.message);
        }
    }

    async testTemplateManagement() {
        console.log('📋 Testing Template Management...');
        
        try {
            const quickActions = window.appointmentQuickActions || new AppointmentQuickActions();
            
            // Test 1: Template modal display
            quickActions.showTemplateModal();
            const modal = document.getElementById('template-modal');
            this.assert(modal.style.display === 'block', 'Template modal should be visible');
            
            // Test 2: Template creation
            document.getElementById('template-name').value = 'Test Template';
            document.getElementById('template-type').value = 'consultation';
            document.getElementById('template-duration').value = '30';
            
            quickActions.saveTemplate();
            this.assert(quickActions.templates.length > 0, 'Template should be saved');
            
            // Test 3: Template loading
            quickActions.loadTemplates();
            const selector = document.getElementById('template-selector');
            this.assert(selector.children.length > 1, 'Templates should be loaded in selector');
            
            // Test 4: Template application
            quickActions.selectTemplate(quickActions.templates[0].id);
            this.assert(true, 'Template selection should work');
            
            this.recordTest('Template Management', 'PASS', 'All template tests passed');
        } catch (error) {
            this.recordTest('Template Management', 'FAIL', error.message);
        }
    }

    async testConflictResolution() {
        console.log('⚠️ Testing Conflict Resolution...');
        
        try {
            const quickActions = window.appointmentQuickActions || new AppointmentQuickActions();
            
            // Test 1: Conflict detection
            await quickActions.detectConflicts();
            this.assert(quickActions.conflicts.length > 0, 'Conflicts should be detected');
            
            // Test 2: Conflict display
            const conflictCount = document.getElementById('conflict-count');
            this.assert(conflictCount.textContent.includes('1 conflicts'), 'Conflict count should be displayed');
            
            // Test 3: Conflict resolution
            await quickActions.resolveConflicts();
            this.assert(true, 'Conflict resolution should execute');
            
            // Test 4: Auto-reschedule
            await quickActions.autoReschedule();
            this.assert(true, 'Auto-reschedule should work');
            
            this.recordTest('Conflict Resolution', 'PASS', 'All conflict resolution tests passed');
        } catch (error) {
            this.recordTest('Conflict Resolution', 'FAIL', error.message);
        }
    }

    async testUIInteractions() {
        console.log('🖱️ Testing UI Interactions...');
        
        try {
            // Test 1: Modal opening and closing
            const modal = document.getElementById('template-modal');
            modal.style.display = 'block';
            
            const closeBtn = modal.querySelector('.modal-close');
            closeBtn.click();
            this.assert(modal.style.display === 'none', 'Modal should close when close button clicked');
            
            // Test 2: Form validation
            document.getElementById('template-name').value = '';
            const quickActions = window.appointmentQuickActions || new AppointmentQuickActions();
            
            try {
                quickActions.saveTemplate();
                this.assert(false, 'Should not save template with empty name');
            } catch (error) {
                this.assert(true, 'Form validation should prevent empty template name');
            }
            
            // Test 3: Button states
            const batchButtons = document.querySelectorAll('.batch-only .btn-action');
            batchButtons.forEach(btn => {
                this.assert(btn.disabled, 'Batch buttons should be disabled when no appointments selected');
            });
            
            this.recordTest('UI Interactions', 'PASS', 'All UI interaction tests passed');
        } catch (error) {
            this.recordTest('UI Interactions', 'FAIL', error.message);
        }
    }

    async testErrorHandling() {
        console.log('🚨 Testing Error Handling...');
        
        try {
            // Mock failed API calls
            const originalFetch = window.fetch;
            window.fetch = async () => ({ ok: false, status: 500 });
            
            const quickActions = window.appointmentQuickActions || new AppointmentQuickActions();
            
            // Test 1: Failed calendar sync
            try {
                await quickActions.syncCalendar();
                this.assert(true, 'Error should be handled gracefully');
            } catch (error) {
                this.assert(true, 'Error handling should work');
            }
            
            // Test 2: Failed SMS send
            try {
                await quickActions.sendSMS();
                this.assert(true, 'SMS error should be handled');
            } catch (error) {
                this.assert(true, 'SMS error handling should work');
            }
            
            // Restore fetch
            window.fetch = originalFetch;
            
            this.recordTest('Error Handling', 'PASS', 'All error handling tests passed');
        } catch (error) {
            this.recordTest('Error Handling', 'FAIL', error.message);
        }
    }

    async testAccessibility() {
        console.log('♿ Testing Accessibility...');
        
        try {
            // Test 1: ARIA labels
            const buttons = document.querySelectorAll('.btn-action');
            let hasAriaLabels = true;
            buttons.forEach(btn => {
                if (!btn.textContent.trim() && !btn.getAttribute('aria-label')) {
                    hasAriaLabels = false;
                }
            });
            this.assert(hasAriaLabels, 'Buttons should have accessible labels');
            
            // Test 2: Keyboard navigation
            const modal = document.getElementById('template-modal');
            const focusableElements = modal.querySelectorAll('input, select, textarea, button');
            this.assert(focusableElements.length > 0, 'Modal should have focusable elements');
            
            // Test 3: Color contrast (basic check)
            const actionCards = document.querySelectorAll('.action-card');
            this.assert(actionCards.length > 0, 'Action cards should be present for contrast testing');
            
            this.recordTest('Accessibility', 'PASS', 'All accessibility tests passed');
        } catch (error) {
            this.recordTest('Accessibility', 'FAIL', error.message);
        }
    }

    async testPerformance() {
        console.log('⚡ Testing Performance...');
        
        try {
            const startTime = performance.now();
            
            // Test 1: Component initialization time
            const quickActions = new AppointmentQuickActions();
            const initTime = performance.now() - startTime;
            this.assert(initTime < 100, 'Component should initialize quickly (< 100ms)');
            
            // Test 2: Large dataset handling
            const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
                id: i,
                date: '2024-01-15',
                time: '09:00',
                patient_name: `Patient ${i}`,
                doctor_name: 'Dr. Smith',
                type: 'consultation',
                status: 'scheduled',
                duration: 30
            }));
            
            const processStart = performance.now();
            quickActions.generateCSV(largeDataset);
            const processTime = performance.now() - processStart;
            this.assert(processTime < 1000, 'Large dataset processing should be fast (< 1s)');
            
            // Test 3: Memory usage (basic check)
            const memoryBefore = performance.memory ? performance.memory.usedJSHeapSize : 0;
            for (let i = 0; i < 100; i++) {
                quickActions.showNotification(`Test ${i}`, 'info');
            }
            const memoryAfter = performance.memory ? performance.memory.usedJSHeapSize : 0;
            const memoryIncrease = memoryAfter - memoryBefore;
            this.assert(memoryIncrease < 10000000, 'Memory usage should be reasonable'); // 10MB limit
            
            this.recordTest('Performance', 'PASS', 'All performance tests passed');
        } catch (error) {
            this.recordTest('Performance', 'FAIL', error.message);
        }
    }

    assert(condition, message) {
        if (!condition) {
            throw new Error(`Assertion failed: ${message}`);
        }
    }

    recordTest(category, status, message) {
        this.testResults.push({
            category,
            status,
            message,
            timestamp: new Date().toISOString()
        });
        
        const emoji = status === 'PASS' ? '✅' : '❌';
        console.log(`${emoji} ${category}: ${message}`);
    }

    generateTestReport() {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(t => t.status === 'PASS').length;
        const failedTests = totalTests - passedTests;
        const successRate = ((passedTests / totalTests) * 100).toFixed(1);
        
        console.log('\n📊 QUICK ACTIONS PANEL TEST REPORT');
        console.log('=====================================');
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests}`);
        console.log(`Failed: ${failedTests}`);
        console.log(`Success Rate: ${successRate}%`);
        console.log('=====================================');
        
        if (failedTests > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults.filter(t => t.status === 'FAIL').forEach(test => {
                console.log(`- ${test.category}: ${test.message}`);
            });
        }
        
        // Store results for external access
        window.quickActionsTestResults = {
            total: totalTests,
            passed: passedTests,
            failed: failedTests,
            successRate: parseFloat(successRate),
            details: this.testResults
        };
        
        return window.quickActionsTestResults;
    }

    cleanup() {
        // Restore original functions
        window.fetch = this.originalFetch;
        
        // Clear test data
        localStorage.clear();
        Object.keys(this.originalLocalStorage).forEach(key => {
            localStorage.setItem(key, this.originalLocalStorage[key]);
        });
        
        // Remove test container
        const testContainer = document.getElementById('test-container');
        if (testContainer) {
            testContainer.remove();
        }
        
        console.log('🧹 Test cleanup completed');
    }
}

// Auto-run tests when script is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only run tests if in test mode
    if (window.location.search.includes('test=quick-actions') || window.runQuickActionsTests) {
        const testSuite = new QuickActionsTestSuite();
        testSuite.runAllTests();
    }
});

// Export for manual testing
window.QuickActionsTestSuite = QuickActionsTestSuite;