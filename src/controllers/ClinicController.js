const db = require('../config/database');

class ClinicController {
    static async getStats(req, res) {
        try {
            const clinicId = req.params.clinicId;
            
            const [stats] = await db.execute(`
                SELECT 
                    (SELECT COUNT(*) FROM patients WHERE clinic_id = ?) as total_patients,
                    (SELECT COUNT(*) FROM visits WHERE clinic_id = ? AND DATE(created_at) = CURDATE()) as today_visits,
                    (SELECT COUNT(*) FROM appointments WHERE clinic_id = ? AND DATE(appointment_date) = CURDATE()) as today_appointments,
                    (SELECT COALESCE(SUM(amount), 0) FROM bills WHERE clinic_id = ? AND DATE(created_at) = CURDATE()) as today_revenue
            `, [clinicId, clinicId, clinicId, clinicId]);
            
            // Transform to match dashboard expectations
            const result = {
                totalUsers: stats[0].total_patients,
                activeUsers: stats[0].total_patients, // Same as total for now
                todayAppointments: stats[0].today_appointments,
                todayRevenue: stats[0].today_revenue
            };
            
            res.json({ data: result });
        } catch (error) {
            console.error('Error fetching clinic stats:', error);
            res.status(500).json({ error: 'Failed to fetch clinic stats' });
        }
    }
}

module.exports = ClinicController;