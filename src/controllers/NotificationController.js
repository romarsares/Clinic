const db = require('../config/database');
const nodemailer = require('nodemailer');

class NotificationController {
    // SMS/Email Notification System
    static async sendAppointmentReminder(req, res) {
        try {
            const { appointmentId, type = 'both' } = req.body;
            
            // Get appointment details
            const appointmentQuery = `
                SELECT a.*, p.first_name, p.last_name, p.email, p.phone,
                       d.first_name as doctor_first, d.last_name as doctor_last
                FROM appointments a
                JOIN patients p ON a.patient_id = p.id
                JOIN doctors d ON a.doctor_id = d.id
                WHERE a.id = ?
            `;
            
            const [appointments] = await db.execute(appointmentQuery, [appointmentId]);
            if (appointments.length === 0) {
                return res.status(404).json({ success: false, message: 'Appointment not found' });
            }
            
            const appointment = appointments[0];
            const results = {};
            
            // Send SMS if requested
            if (type === 'sms' || type === 'both') {
                results.sms = await this.sendSMS(appointment);
            }
            
            // Send Email if requested
            if (type === 'email' || type === 'both') {
                results.email = await this.sendEmail(appointment);
            }
            
            // Log notification
            await this.logNotification(appointmentId, type, results);
            
            res.json({
                success: true,
                message: 'Reminder sent successfully',
                data: results
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async sendSMS(appointment) {
        const message = `Reminder: You have an appointment with Dr. ${appointment.doctor_first} ${appointment.doctor_last} on ${new Date(appointment.appointment_date).toLocaleDateString()} at ${appointment.appointment_time}. CuraOne Clinic`;
        
        // Mock SMS sending (replace with actual SMS provider)
        return {
            success: true,
            provider: 'twilio',
            messageId: 'SMS' + Date.now(),
            message: message,
            phone: appointment.phone
        };
    }

    static async sendEmail(appointment) {
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: appointment.email,
            subject: 'Appointment Reminder - CuraOne Clinic',
            html: `
                <h2>Appointment Reminder</h2>
                <p>Dear ${appointment.first_name} ${appointment.last_name},</p>
                <p>This is a reminder for your upcoming appointment:</p>
                <ul>
                    <li><strong>Doctor:</strong> Dr. ${appointment.doctor_first} ${appointment.doctor_last}</li>
                    <li><strong>Date:</strong> ${new Date(appointment.appointment_date).toLocaleDateString()}</li>
                    <li><strong>Time:</strong> ${appointment.appointment_time}</li>
                    <li><strong>Type:</strong> ${appointment.appointment_type}</li>
                </ul>
                <p>Please arrive 15 minutes early for check-in.</p>
                <p>Best regards,<br>CuraOne Clinic Team</p>
            `
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            return {
                success: true,
                messageId: info.messageId,
                email: appointment.email
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    static async logNotification(appointmentId, type, results) {
        const query = `
            INSERT INTO notification_logs (appointment_id, notification_type, status, details, created_at)
            VALUES (?, ?, ?, ?, NOW())
        `;
        
        await db.execute(query, [
            appointmentId,
            type,
            results.sms?.success || results.email?.success ? 'sent' : 'failed',
            JSON.stringify(results)
        ]);
    }

    // Notification Template Management
    static async createTemplate(req, res) {
        try {
            const { name, type, subject, content, variables } = req.body;
            
            const query = `
                INSERT INTO notification_templates (name, type, subject, content, variables, created_at)
                VALUES (?, ?, ?, ?, ?, NOW())
            `;
            
            await db.execute(query, [name, type, subject, content, JSON.stringify(variables)]);
            
            res.json({
                success: true,
                message: 'Template created successfully'
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getTemplates(req, res) {
        try {
            const { type } = req.query;
            
            let query = 'SELECT * FROM notification_templates WHERE is_active = TRUE';
            const params = [];
            
            if (type) {
                query += ' AND type = ?';
                params.push(type);
            }
            
            const [templates] = await db.execute(query, params);
            
            res.json({
                success: true,
                data: templates
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Notification Scheduling
    static async scheduleNotifications(req, res) {
        try {
            const { tenantId } = req.query;
            
            // Get appointments for tomorrow
            const appointmentsQuery = `
                SELECT a.id, a.appointment_date, a.appointment_time,
                       p.notification_preferences
                FROM appointments a
                JOIN patients p ON a.patient_id = p.id
                JOIN doctors d ON a.doctor_id = d.id
                WHERE d.tenant_id = ?
                AND DATE(a.appointment_date) = DATE_ADD(CURDATE(), INTERVAL 1 DAY)
                AND a.status = 'scheduled'
            `;
            
            const [appointments] = await db.execute(appointmentsQuery, [tenantId]);
            
            let scheduled = 0;
            for (const appointment of appointments) {
                const preferences = JSON.parse(appointment.notification_preferences || '{"sms": true, "email": true}');
                
                if (preferences.sms || preferences.email) {
                    const type = preferences.sms && preferences.email ? 'both' : 
                                preferences.sms ? 'sms' : 'email';
                    
                    // Schedule notification (in production, use a job queue)
                    setTimeout(() => {
                        this.sendAppointmentReminder({
                            body: { appointmentId: appointment.id, type }
                        }, { json: () => {} });
                    }, 1000);
                    
                    scheduled++;
                }
            }
            
            res.json({
                success: true,
                message: `Scheduled ${scheduled} notifications`,
                data: { scheduled, total: appointments.length }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Operational Summaries
    static async generateDailySummary(req, res) {
        try {
            const { tenantId, date = new Date().toISOString().split('T')[0] } = req.query;
            
            // Get daily statistics
            const statsQuery = `
                SELECT 
                    COUNT(CASE WHEN a.status = 'scheduled' THEN 1 END) as scheduled_appointments,
                    COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_appointments,
                    COUNT(CASE WHEN a.status = 'cancelled' THEN 1 END) as cancelled_appointments,
                    COUNT(CASE WHEN a.status = 'no_show' THEN 1 END) as no_show_appointments,
                    COUNT(DISTINCT a.patient_id) as unique_patients,
                    COUNT(DISTINCT a.doctor_id) as active_doctors
                FROM appointments a
                JOIN doctors d ON a.doctor_id = d.id
                WHERE d.tenant_id = ? AND DATE(a.appointment_date) = ?
            `;
            
            const [stats] = await db.execute(statsQuery, [tenantId, date]);
            
            // Get revenue for the day
            const revenueQuery = `
                SELECT SUM(bc.amount) as daily_revenue
                FROM billing_charges bc
                JOIN visits v ON bc.visit_id = v.id
                WHERE v.tenant_id = ? AND DATE(v.visit_date) = ?
            `;
            
            const [revenue] = await db.execute(revenueQuery, [tenantId, date]);
            
            const summary = {
                date,
                appointments: stats[0],
                revenue: revenue[0].daily_revenue || 0,
                generated_at: new Date().toISOString()
            };
            
            // Save summary
            await this.saveDailySummary(tenantId, summary);
            
            res.json({
                success: true,
                data: summary
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async generateWeeklySummary(req, res) {
        try {
            const { tenantId } = req.query;
            const endDate = new Date();
            const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
            
            const summaryQuery = `
                SELECT 
                    DATE(a.appointment_date) as date,
                    COUNT(*) as total_appointments,
                    COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed,
                    COUNT(CASE WHEN a.status = 'cancelled' THEN 1 END) as cancelled,
                    COUNT(DISTINCT a.patient_id) as unique_patients
                FROM appointments a
                JOIN doctors d ON a.doctor_id = d.id
                WHERE d.tenant_id = ?
                AND a.appointment_date BETWEEN ? AND ?
                GROUP BY DATE(a.appointment_date)
                ORDER BY date
            `;
            
            const [weeklyData] = await db.execute(summaryQuery, [
                tenantId,
                startDate.toISOString().split('T')[0],
                endDate.toISOString().split('T')[0]
            ]);
            
            res.json({
                success: true,
                data: {
                    period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
                    daily_breakdown: weeklyData,
                    generated_at: new Date().toISOString()
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async generateMonthlySummary(req, res) {
        try {
            const { tenantId, month, year } = req.query;
            const currentDate = new Date();
            const targetMonth = month || currentDate.getMonth() + 1;
            const targetYear = year || currentDate.getFullYear();
            
            const summaryQuery = `
                SELECT 
                    COUNT(*) as total_appointments,
                    COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_appointments,
                    COUNT(CASE WHEN a.status = 'cancelled' THEN 1 END) as cancelled_appointments,
                    COUNT(DISTINCT a.patient_id) as unique_patients,
                    COUNT(DISTINCT a.doctor_id) as active_doctors,
                    AVG(CASE WHEN a.status = 'completed' THEN 1.0 ELSE 0.0 END) * 100 as completion_rate
                FROM appointments a
                JOIN doctors d ON a.doctor_id = d.id
                WHERE d.tenant_id = ?
                AND MONTH(a.appointment_date) = ?
                AND YEAR(a.appointment_date) = ?
            `;
            
            const [monthlyStats] = await db.execute(summaryQuery, [tenantId, targetMonth, targetYear]);
            
            // Get revenue for the month
            const revenueQuery = `
                SELECT SUM(bc.amount) as monthly_revenue
                FROM billing_charges bc
                JOIN visits v ON bc.visit_id = v.id
                WHERE v.tenant_id = ?
                AND MONTH(v.visit_date) = ?
                AND YEAR(v.visit_date) = ?
            `;
            
            const [revenue] = await db.execute(revenueQuery, [tenantId, targetMonth, targetYear]);
            
            res.json({
                success: true,
                data: {
                    month: targetMonth,
                    year: targetYear,
                    statistics: monthlyStats[0],
                    revenue: revenue[0].monthly_revenue || 0,
                    generated_at: new Date().toISOString()
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async saveDailySummary(tenantId, summary) {
        const query = `
            INSERT INTO operational_summaries (tenant_id, summary_type, summary_date, data, created_at)
            VALUES (?, 'daily', ?, ?, NOW())
            ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = NOW()
        `;
        
        await db.execute(query, [tenantId, summary.date, JSON.stringify(summary)]);
    }

    // Notification Delivery Reporting
    static async getNotificationReport(req, res) {
        try {
            const { tenantId, startDate, endDate } = req.query;
            
            const reportQuery = `
                SELECT 
                    nl.notification_type,
                    COUNT(*) as total_sent,
                    COUNT(CASE WHEN nl.status = 'sent' THEN 1 END) as successful,
                    COUNT(CASE WHEN nl.status = 'failed' THEN 1 END) as failed,
                    DATE(nl.created_at) as date
                FROM notification_logs nl
                JOIN appointments a ON nl.appointment_id = a.id
                JOIN doctors d ON a.doctor_id = d.id
                WHERE d.tenant_id = ?
                AND DATE(nl.created_at) BETWEEN ? AND ?
                GROUP BY nl.notification_type, DATE(nl.created_at)
                ORDER BY date DESC
            `;
            
            const [report] = await db.execute(reportQuery, [tenantId, startDate, endDate]);
            
            res.json({
                success: true,
                data: report
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Patient Notification Preferences
    static async updateNotificationPreferences(req, res) {
        try {
            const { patientId } = req.params;
            const { sms, email, reminders, marketing } = req.body;
            
            const preferences = {
                sms: sms || false,
                email: email || false,
                reminders: reminders || true,
                marketing: marketing || false
            };
            
            const query = `
                UPDATE patients 
                SET notification_preferences = ?
                WHERE id = ?
            `;
            
            await db.execute(query, [JSON.stringify(preferences), patientId]);
            
            res.json({
                success: true,
                message: 'Notification preferences updated'
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = NotificationController;