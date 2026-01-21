/**
 * Dashboard Controller - Role-specific Dashboard Data
 * Phase 5.1: Dashboard UX Finalization
 */

const db = require('../config/database');

class DashboardController {
    /**
     * Get role-specific dashboard data
     */
    static async getDashboardData(req, res) {
        try {
            const { clinic_id, roles } = req.user;
            
            // Determine primary role for dashboard type
            const primaryRole = roles.includes('Owner') ? 'Owner' : 
                              roles.includes('Doctor') ? 'Doctor' : 'Staff';
            
            let dashboardData = {};
            
            switch (primaryRole) {
                case 'Owner':
                    dashboardData = await DashboardController.getOwnerDashboard(clinic_id);
                    break;
                case 'Doctor':
                    dashboardData = await DashboardController.getDoctorDashboard(clinic_id, req.user.id);
                    break;
                case 'Staff':
                    dashboardData = await DashboardController.getStaffDashboard(clinic_id);
                    break;
                default:
                    dashboardData = await DashboardController.getBasicDashboard(clinic_id);
            }
            
            res.json({
                success: true,
                data: {
                    role: primaryRole,
                    ...dashboardData
                }
            });
        } catch (error) {
            console.error('Dashboard data error:', error);
            res.status(500).json({ error: 'Failed to load dashboard data' });
        }
    }

    /**
     * Owner Dashboard - Business Intelligence
     */
    static async getOwnerDashboard(clinicId) {
        const [stats] = await db.execute(`
            SELECT 
                (SELECT COUNT(*) FROM patients WHERE clinic_id = ?) as total_patients,
                (SELECT COUNT(*) FROM auth_users WHERE clinic_id = ? AND status = 'active') as active_staff,
                (SELECT COUNT(*) FROM appointments WHERE clinic_id = ? AND DATE(appointment_date) = CURDATE()) as today_appointments,
                (SELECT COALESCE(SUM(total_amount), 0) FROM bills WHERE clinic_id = ? AND DATE(created_at) = CURDATE()) as today_revenue,
                (SELECT COALESCE(SUM(total_amount), 0) FROM bills WHERE clinic_id = ? AND MONTH(created_at) = MONTH(CURDATE())) as month_revenue,
                (SELECT COUNT(*) FROM visits WHERE clinic_id = ? AND DATE(created_at) = CURDATE()) as today_visits
        `, [clinicId, clinicId, clinicId, clinicId, clinicId, clinicId]);

        const [revenueChart] = await db.execute(`
            SELECT DATE(created_at) as date, SUM(total_amount) as revenue
            FROM bills WHERE clinic_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAYS)
            GROUP BY DATE(created_at) ORDER BY date
        `, [clinicId]);

        const [topDoctors] = await db.execute(`
            SELECT u.full_name, COUNT(v.id) as visits, COALESCE(SUM(b.total_amount), 0) as revenue
            FROM auth_users u
            LEFT JOIN visits v ON u.id = v.doctor_id AND DATE(v.created_at) = CURDATE()
            LEFT JOIN bills b ON v.id = b.visit_id
            WHERE u.clinic_id = ? AND JSON_CONTAINS(u.roles, '"Doctor"')
            GROUP BY u.id ORDER BY visits DESC LIMIT 5
        `, [clinicId]);

        return {
            stats: stats[0],
            revenueChart,
            topDoctors,
            type: 'owner'
        };
    }

    /**
     * Doctor Dashboard - Clinical Focus
     */
    static async getDoctorDashboard(clinicId, doctorId) {
        const [stats] = await db.execute(`
            SELECT 
                (SELECT COUNT(*) FROM appointments WHERE clinic_id = ? AND doctor_id = ? AND DATE(appointment_date) = CURDATE()) as today_appointments,
                (SELECT COUNT(*) FROM visits WHERE clinic_id = ? AND doctor_id = ? AND DATE(created_at) = CURDATE()) as today_visits,
                (SELECT COUNT(*) FROM lab_requests WHERE clinic_id = ? AND doctor_id = ? AND status = 'pending') as pending_labs,
                (SELECT COUNT(*) FROM patients WHERE clinic_id = ? AND id IN (SELECT DISTINCT patient_id FROM visits WHERE doctor_id = ?)) as my_patients
        `, [clinicId, doctorId, clinicId, doctorId, clinicId, doctorId, clinicId, doctorId]);

        const [todaySchedule] = await db.execute(`
            SELECT a.*, p.first_name, p.last_name, p.date_of_birth
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            WHERE a.clinic_id = ? AND a.doctor_id = ? AND DATE(a.appointment_date) = CURDATE()
            ORDER BY a.appointment_time
        `, [clinicId, doctorId]);

        const [pendingLabs] = await db.execute(`
            SELECT lr.*, p.first_name, p.last_name
            FROM lab_requests lr
            JOIN patients p ON lr.patient_id = p.id
            WHERE lr.clinic_id = ? AND lr.doctor_id = ? AND lr.status = 'pending'
            ORDER BY lr.created_at DESC LIMIT 5
        `, [clinicId, doctorId]);

        return {
            stats: stats[0],
            todaySchedule,
            pendingLabs,
            type: 'doctor'
        };
    }

    /**
     * Staff Dashboard - Operations Focus
     */
    static async getStaffDashboard(clinicId) {
        const [stats] = await db.execute(`
            SELECT 
                (SELECT COUNT(*) FROM appointments WHERE clinic_id = ? AND DATE(appointment_date) = CURDATE()) as today_appointments,
                (SELECT COUNT(*) FROM appointments WHERE clinic_id = ? AND DATE(appointment_date) = CURDATE() AND status = 'scheduled') as pending_checkins,
                (SELECT COUNT(*) FROM bills WHERE clinic_id = ? AND status = 'pending') as pending_bills,
                (SELECT COUNT(*) FROM patients WHERE clinic_id = ? AND DATE(created_at) = CURDATE()) as new_patients
        `, [clinicId, clinicId, clinicId, clinicId]);

        const [recentPatients] = await db.execute(`
            SELECT * FROM patients 
            WHERE clinic_id = ? 
            ORDER BY created_at DESC LIMIT 5
        `, [clinicId]);

        const [upcomingAppointments] = await db.execute(`
            SELECT a.*, p.first_name, p.last_name, u.full_name as doctor_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.id
            LEFT JOIN auth_users u ON a.doctor_id = u.id
            WHERE a.clinic_id = ? AND DATE(a.appointment_date) = CURDATE() AND a.status = 'scheduled'
            ORDER BY a.appointment_time LIMIT 10
        `, [clinicId]);

        return {
            stats: stats[0],
            recentPatients,
            upcomingAppointments,
            type: 'staff'
        };
    }

    /**
     * Basic Dashboard - Default view
     */
    static async getBasicDashboard(clinicId) {
        const [stats] = await db.execute(`
            SELECT 
                (SELECT COUNT(*) FROM patients WHERE clinic_id = ?) as total_patients,
                (SELECT COUNT(*) FROM appointments WHERE clinic_id = ? AND DATE(appointment_date) = CURDATE()) as today_appointments,
                (SELECT COUNT(*) FROM visits WHERE clinic_id = ? AND DATE(created_at) = CURDATE()) as today_visits
        `, [clinicId, clinicId, clinicId]);

        return {
            stats: stats[0],
            type: 'basic'
        };
    }

    /**
     * Get quick actions based on role
     */
    static async getQuickActions(req, res) {
        try {
            const { roles } = req.user;
            
            const actions = {
                Owner: [
                    { title: 'View Reports', icon: '📊', url: '/reports', description: 'Business analytics' },
                    { title: 'Manage Staff', icon: '👥', url: '/users', description: 'Staff management' },
                    { title: 'Clinic Settings', icon: '⚙️', url: '/settings', description: 'Configure clinic' }
                ],
                Doctor: [
                    { title: 'New Visit', icon: '🏥', url: '/visits/new', description: 'Document patient visit' },
                    { title: 'Order Lab', icon: '🧪', url: '/lab/requests/new', description: 'Request lab tests' },
                    { title: 'Patient History', icon: '📋', url: '/patients', description: 'View medical records' }
                ],
                Staff: [
                    { title: 'New Patient', icon: '👤', url: '/patients/new', description: 'Register patient' },
                    { title: 'Schedule Appointment', icon: '📅', url: '/appointments/new', description: 'Book appointment' },
                    { title: 'Check-in Patient', icon: '✅', url: '/appointments', description: 'Patient check-in' }
                ]
            };

            const primaryRole = roles.includes('Owner') ? 'Owner' : 
                              roles.includes('Doctor') ? 'Doctor' : 'Staff';

            res.json({
                success: true,
                data: actions[primaryRole] || actions.Staff
            });
        } catch (error) {
            console.error('Quick actions error:', error);
            res.status(500).json({ error: 'Failed to load quick actions' });
        }
    }
}

module.exports = DashboardController;