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
        const dashboardPath = path.join(__dirname, '../../public/views/dashboard.html');
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
     * Serve patients page (placeholder)
     */
    static servePatients(req, res) {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Patients - Clinic SaaS</title>
                <link rel="stylesheet" href="/css/dashboard.css">
            </head>
            <body>
                <div class="header">
                    <h1>Patients Management</h1>
                    <a href="/dashboard" class="btn">← Back to Dashboard</a>
                </div>
                <div class="main-content" style="margin-left: 0;">
                    <div class="card">
                        <h3>Patients Module</h3>
                        <p>This is a placeholder for the patients management interface.</p>
                        <p>Features will include:</p>
                        <ul>
                            <li>Patient registration and demographics</li>
                            <li>Parent-child relationships</li>
                            <li>Patient search and filtering</li>
                            <li>Medical history overview</li>
                        </ul>
                    </div>
                </div>
            </body>
            </html>
        `);
    }

    /**
     * Serve appointments page (placeholder)
     */
    static serveAppointments(req, res) {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Appointments - Clinic SaaS</title>
                <link rel="stylesheet" href="/css/dashboard.css">
            </head>
            <body>
                <div class="header">
                    <h1>Appointment Management</h1>
                    <a href="/dashboard" class="btn">← Back to Dashboard</a>
                </div>
                <div class="main-content" style="margin-left: 0;">
                    <div class="card">
                        <h3>Appointments Module</h3>
                        <p>This is a placeholder for the appointment management interface.</p>
                        <p>Features will include:</p>
                        <ul>
                            <li>Appointment scheduling and calendar view</li>
                            <li>Time conflict detection</li>
                            <li>Appointment status management</li>
                            <li>Patient appointment history</li>
                        </ul>
                    </div>
                </div>
            </body>
            </html>
        `);
    }

    /**
     * Serve visits page (placeholder)
     */
    static serveVisits(req, res) {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Visits - Clinic SaaS</title>
                <link rel="stylesheet" href="/css/dashboard.css">
            </head>
            <body>
                <div class="header">
                    <h1>Clinical Visits</h1>
                    <a href="/dashboard" class="btn">← Back to Dashboard</a>
                </div>
                <div class="main-content" style="margin-left: 0;">
                    <div class="card">
                        <h3>Clinical Documentation Module</h3>
                        <p>This is a placeholder for the clinical visits interface.</p>
                        <p>Features will include:</p>
                        <ul>
                            <li>Visit records and documentation</li>
                            <li>Diagnosis entry and management</li>
                            <li>Vital signs recording</li>
                            <li>Treatment plans and follow-up</li>
                        </ul>
                    </div>
                </div>
            </body>
            </html>
        `);
    }

    /**
     * Serve users page (placeholder)
     */
    static serveUsers(req, res) {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Users - Clinic SaaS</title>
                <link rel="stylesheet" href="/css/dashboard.css">
            </head>
            <body>
                <div class="header">
                    <h1>User Management</h1>
                    <a href="/dashboard" class="btn">← Back to Dashboard</a>
                </div>
                <div class="main-content" style="margin-left: 0;">
                    <div class="card">
                        <h3>User Management Module</h3>
                        <p>This is a placeholder for the user management interface.</p>
                        <p>Features will include:</p>
                        <ul>
                            <li>User creation and role assignment</li>
                            <li>Role-based access control</li>
                            <li>User status management</li>
                            <li>Password management</li>
                        </ul>
                    </div>
                </div>
            </body>
            </html>
        `);
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
}

module.exports = UIController;