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
     * Serve dashboard page
     */
    static serveDashboard(req, res) {
        const dashboardPath = path.join(__dirname, '../../public/views/dashboard-clean.html');
        res.sendFile(dashboardPath);
    }

    /**
     * Serve login page
     */
    static serveLogin(req, res) {
        const loginPath = path.join(__dirname, '../../public/views/login.html');
        res.sendFile(loginPath);
    }

    /**
     * Serve patients page
     */
    static servePatients(req, res) {
        const patientsPath = path.join(__dirname, '../../public/views/patients.html');
        res.sendFile(patientsPath);
    }

    /**
     * Serve appointments page
     */
    static serveAppointments(req, res) {
        const appointmentsPath = path.join(__dirname, '../../public/views/appointments.html');
        res.sendFile(appointmentsPath);
    }

    /**
     * Serve visits page
     */
    static serveVisits(req, res) {
        const visitsPath = path.join(__dirname, '../../public/views/visits.html');
        res.sendFile(visitsPath);
    }

    /**
     * Serve users page
     */
    static serveUsers(req, res) {
        const usersPath = path.join(__dirname, '../../public/views/users.html');
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
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Settings - Clinic SaaS</title>
                <link rel="stylesheet" href="/css/dashboard.css">
            </head>
            <body>
                <div class="header">
                    <h1>Settings</h1>
                    <a href="/dashboard" class="btn">← Back to Dashboard</a>
                </div>
                <div class="main-content" style="margin-left: 0;">
                    <div class="card">
                        <h3>Settings Module</h3>
                        <p>This is a placeholder for the settings interface.</p>
                        <p>Features will include:</p>
                        <ul>
                            <li>Clinic profile and configuration</li>
                            <li>User preferences</li>
                            <li>System settings</li>
                            <li>Security settings</li>
                        </ul>
                    </div>
                </div>
            </body>
            </html>
        `);
    }
}

module.exports = UIController;