const db = require('../config/database');

class ClinicController {
    async createClinic(req, res) {
        try {
            const { name, address, phone, email, license_number } = req.body;
            
            const [result] = await db.execute(
                'INSERT INTO clinics (name, address, phone, email, license_number) VALUES (?, ?, ?, ?, ?)',
                [name, address, phone, email, license_number]
            );
            
            res.status(201).json({
                success: true,
                message: 'Clinic created successfully',
                data: { id: result.insertId }
            });
        } catch (error) {
            console.error('Error creating clinic:', error);
            res.status(500).json({ error: 'Failed to create clinic' });
        }
    }

    async listClinics(req, res) {
        try {
            const [clinics] = await db.execute('SELECT * FROM clinics WHERE status = "active"');
            res.json({ data: clinics });
        } catch (error) {
            console.error('Error listing clinics:', error);
            res.status(500).json({ error: 'Failed to list clinics' });
        }
    }

    async getClinicDetails(req, res) {
        try {
            const clinicId = req.params.id;
            const [clinics] = await db.execute('SELECT * FROM clinics WHERE id = ?', [clinicId]);
            
            if (clinics.length === 0) {
                return res.status(404).json({ error: 'Clinic not found' });
            }
            
            res.json({ data: clinics[0] });
        } catch (error) {
            console.error('Error getting clinic details:', error);
            res.status(500).json({ error: 'Failed to get clinic details' });
        }
    }

    async updateClinicInfo(req, res) {
        try {
            const clinicId = req.params.id;
            const { name, address, phone, email, license_number } = req.body;
            
            await db.execute(
                'UPDATE clinics SET name = ?, address = ?, phone = ?, email = ?, license_number = ? WHERE id = ?',
                [name, address, phone, email, license_number, clinicId]
            );
            
            res.json({ success: true, message: 'Clinic updated successfully' });
        } catch (error) {
            console.error('Error updating clinic:', error);
            res.status(500).json({ error: 'Failed to update clinic' });
        }
    }

    async deactivateClinic(req, res) {
        try {
            const clinicId = req.params.id;
            
            await db.execute('UPDATE clinics SET status = "inactive" WHERE id = ?', [clinicId]);
            
            res.json({ success: true, message: 'Clinic deactivated successfully' });
        } catch (error) {
            console.error('Error deactivating clinic:', error);
            res.status(500).json({ error: 'Failed to deactivate clinic' });
        }
    }

    async getSettings(req, res) {
        try {
            const clinicId = req.params.id;
            const [settings] = await db.execute('SELECT * FROM clinic_settings WHERE clinic_id = ?', [clinicId]);
            res.json({ data: settings });
        } catch (error) {
            console.error('Error getting settings:', error);
            res.status(500).json({ error: 'Failed to get settings' });
        }
    }

    async updateSetting(req, res) {
        try {
            const clinicId = req.params.id;
            const { setting_key, setting_value } = req.body;
            
            await db.execute(
                'INSERT INTO clinic_settings (clinic_id, setting_key, setting_value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
                [clinicId, setting_key, setting_value]
            );
            
            res.json({ success: true, message: 'Setting updated successfully' });
        } catch (error) {
            console.error('Error updating setting:', error);
            res.status(500).json({ error: 'Failed to update setting' });
        }
    }

    async getStats(req, res) {
        try {
            const clinicId = req.params.id;
            console.log('Getting stats for clinic:', clinicId);
            
            const [stats] = await db.execute(`
                SELECT 
                    (SELECT COUNT(*) FROM auth_users WHERE clinic_id = ?) as total_users,
                    (SELECT COUNT(*) FROM auth_users WHERE clinic_id = ? AND status = 'active') as active_users,
                    (SELECT COUNT(*) FROM patients WHERE clinic_id = ?) as total_patients,
                    (SELECT COUNT(*) FROM visits WHERE clinic_id = ? AND DATE(created_at) = CURDATE()) as today_visits,
                    (SELECT COUNT(*) FROM appointments WHERE clinic_id = ? AND DATE(appointment_date) = CURDATE()) as today_appointments,
                    (SELECT COALESCE(SUM(total_amount), 0) FROM bills WHERE clinic_id = ? AND DATE(created_at) = CURDATE()) as today_revenue
            `, [clinicId, clinicId, clinicId, clinicId, clinicId, clinicId]);
            
            const result = {
                totalUsers: stats[0].total_users,
                activeUsers: stats[0].active_users,
                totalPatients: stats[0].total_patients,
                todayVisits: stats[0].today_visits,
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