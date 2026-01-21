/**
 * UI Routes Controller - Frontend Dashboard Templates
 * 
 * Author: Romar Tabaosares
 * Created: 2024-12-19
 * Purpose: Serves basic UI skeleton for dashboards
 */

const path = require('path');
const fs = require('fs');

class UIController {
    /**
     * Serve dashboard page based on user role
     */
    static serveDashboard(req, res) {
        // For now, serve the main dashboard - role detection will be handled by JavaScript
        const dashboardPath = path.join(__dirname, '../../public/views/dashboard-nextui-exact.html');
        res.sendFile(dashboardPath);
    }

    /**
     * Serve staff-specific dashboard
     */
    static serveStaffDashboard(req, res) {
        const dashboardPath = path.join(__dirname, '../../public/views/staff-dashboard.html');
        res.sendFile(dashboardPath);
    }

    /**
     * Serve doctor-specific dashboard
     */
    static serveDoctorDashboard(req, res) {
        const dashboardPath = path.join(__dirname, '../../public/views/doctor-dashboard.html');
        res.sendFile(dashboardPath);
    }

    /**
     * Serve owner-specific dashboard
     */
    static serveOwnerDashboard(req, res) {
        const dashboardPath = path.join(__dirname, '../../public/views/owner-dashboard.html');
        res.sendFile(dashboardPath);
    }

    /**
     * Serve login page
     */
    static serveLogin(req, res) {
        const loginPath = path.join(__dirname, '../../public/views/login-nextui-simple.html');
        res.sendFile(loginPath);
    }

    /**
     * Serve patients page
     */
    static servePatients(req, res) {
        const patientsPath = path.join(__dirname, '../../public/views/patients-nextui.html');
        res.sendFile(patientsPath);
    }

    /**
     * Serve appointments page
     */
    static serveAppointments(req, res) {
        const appointmentsPath = path.join(__dirname, '../../public/views/appointments-nextui.html');
        res.sendFile(appointmentsPath);
    }

    /**
     * Serve visits page
     */
    static serveVisits(req, res) {
        const visitsPath = path.join(__dirname, '../../public/views/visits-nextui.html');
        res.sendFile(visitsPath);
    }

    /**
     * Serve users page
     */
    static serveUsers(req, res) {
        const usersPath = path.join(__dirname, '../../public/views/users-nextui.html');
        res.sendFile(usersPath);
    }

    /**
     * Serve audit page (placeholder)
     */
    static serveAudit(req, res) {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Audit Logs - Clinic SaaS</title>
                <link rel="stylesheet" href="/css/dashboard.css">
            </head>
            <body>
                <div class="header">
                    <h1>Audit Logs</h1>
                    <a href="/dashboard" class="btn">← Back to Dashboard</a>
                </div>
                <div class="main-content" style="margin-left: 0;">
                    <div class="card">
                        <h3>Audit Logging Module</h3>
                        <p>This is a placeholder for the audit logs interface.</p>
                        <p>Features will include:</p>
                        <ul>
                            <li>Comprehensive audit trail viewing</li>
                            <li>User activity monitoring</li>
                            <li>Clinical data access logs</li>
                            <li>Security event tracking</li>
                        </ul>
                    </div>
                </div>
            </body>
            </html>
        `);
    }

    /**
     * Serve settings page (placeholder)
     */
    static serveSettings(req, res) {
        const settingsPath = path.join(__dirname, '../../public/views/settings-nextui.html');
        res.sendFile(settingsPath);
    }
}

module.exports = UIController;