/**
 * Appointment Model - Basic Scheduling Operations
 * 
 * Author: Romar Tabaosares
 * Created: 2024-12-19
 * Purpose: Handles appointment scheduling data operations
 */

class Appointment {
    constructor(db) {
        this.db = db;
    }

    /**
     * Create new appointment
     */
    async create(appointmentData) {
        const {
            clinic_id, patient_id, doctor_id, appointment_date, appointment_time,
            appointment_type, duration = 30, notes
        } = appointmentData;

        const query = `
            INSERT INTO appointments (
                clinic_id, patient_id, doctor_id, appointment_date, appointment_time,
                appointment_type, duration, notes, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', NOW(), NOW())
        `;

        const [result] = await this.db.execute(query, [
            clinic_id, patient_id, doctor_id, appointment_date, appointment_time,
            appointment_type, duration, notes
        ]);

        return this.getById(result.insertId);
    }

    /**
     * Get appointment by ID
     */
    async getById(id) {
        const query = `
            SELECT a.*, 
                   p.first_name as patient_first_name, p.last_name as patient_last_name,
                   p.contact_number as patient_contact, p.date_of_birth as patient_dob,
                   TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) as patient_age,
                   d.full_name as doctor_name,
                   c.name as clinic_name
            FROM appointments a
            LEFT JOIN patients p ON a.patient_id = p.id
            LEFT JOIN auth_users d ON a.doctor_id = d.id
            LEFT JOIN clinics c ON a.clinic_id = c.id
            WHERE a.id = ?
        `;
        const [rows] = await this.db.execute(query, [id]);
        return rows[0] || null;
    }

    /**
     * List appointments by clinic
     */
    async listByClinic(clinicId, options = {}) {
        const { 
            page = 1, 
            limit = 20, 
            status = 'all', 
            doctor_id, 
            date_from, 
            date_to 
        } = options;
        const offset = (page - 1) * limit;

        let whereClause = 'WHERE a.clinic_id = ?';
        let params = [clinicId];

        if (status !== 'all') {
            whereClause += ' AND a.status = ?';
            params.push(status);
        }

        if (doctor_id) {
            whereClause += ' AND a.doctor_id = ?';
            params.push(doctor_id);
        }

        if (date_from) {
            whereClause += ' AND a.appointment_date >= ?';
            params.push(date_from);
        }

        if (date_to) {
            whereClause += ' AND a.appointment_date <= ?';
            params.push(date_to);
        }

        const query = `
            SELECT a.id, a.appointment_date, a.appointment_time, a.appointment_type, 
                   a.duration, a.status, a.notes, a.created_at,
                   p.first_name as patient_first_name, p.last_name as patient_last_name,
                   p.contact_number as patient_contact,
                   TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) as patient_age,
                   d.full_name as doctor_name
            FROM appointments a
            LEFT JOIN patients p ON a.patient_id = p.id
            LEFT JOIN auth_users d ON a.doctor_id = d.id
            ${whereClause}
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
            LIMIT ? OFFSET ?
        `;

        params.push(limit, offset);
        const [rows] = await this.db.execute(query, params);
        return rows;
    }

    /**
     * Get calendar view
     */
    async getCalendarView(clinicId, options = {}) {
        const { date, doctor_id } = options;
        
        let whereClause = 'WHERE a.clinic_id = ?';
        let params = [clinicId];

        if (date) {
            whereClause += ' AND a.appointment_date = ?';
            params.push(date);
        } else {
            // Default to current week
            whereClause += ' AND a.appointment_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)';
        }

        if (doctor_id) {
            whereClause += ' AND a.doctor_id = ?';
            params.push(doctor_id);
        }

        const query = `
            SELECT a.id, a.appointment_date, a.appointment_time, a.appointment_type, 
                   a.duration, a.status, a.notes,
                   p.first_name as patient_first_name, p.last_name as patient_last_name,
                   TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) as patient_age,
                   d.full_name as doctor_name
            FROM appointments a
            LEFT JOIN patients p ON a.patient_id = p.id
            LEFT JOIN auth_users d ON a.doctor_id = d.id
            ${whereClause}
            AND a.status NOT IN ('cancelled')
            ORDER BY a.appointment_date, a.appointment_time
        `;

        const [rows] = await this.db.execute(query, params);
        return rows;
    }

    /**
     * Get today's appointments
     */
    async getTodayAppointments(clinicId, options = {}) {
        const { doctor_id } = options;
        
        let whereClause = 'WHERE a.clinic_id = ? AND a.appointment_date = CURDATE()';
        let params = [clinicId];

        if (doctor_id) {
            whereClause += ' AND a.doctor_id = ?';
            params.push(doctor_id);
        }

        const query = `
            SELECT a.id, a.appointment_time, a.appointment_type, a.duration, 
                   a.status, a.notes,
                   p.first_name as patient_first_name, p.last_name as patient_last_name,
                   p.contact_number as patient_contact,
                   TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) as patient_age,
                   d.full_name as doctor_name
            FROM appointments a
            LEFT JOIN patients p ON a.patient_id = p.id
            LEFT JOIN auth_users d ON a.doctor_id = d.id
            ${whereClause}
            AND a.status NOT IN ('cancelled')
            ORDER BY a.appointment_time
        `;

        const [rows] = await this.db.execute(query, params);
        return rows;
    }

    /**
     * Update appointment
     */
    async update(id, updateData) {
        const {
            patient_id, doctor_id, appointment_date, appointment_time,
            appointment_type, duration, notes
        } = updateData;

        const query = `
            UPDATE appointments 
            SET patient_id = ?, doctor_id = ?, appointment_date = ?, appointment_time = ?,
                appointment_type = ?, duration = ?, notes = ?, updated_at = NOW()
            WHERE id = ?
        `;

        await this.db.execute(query, [
            patient_id, doctor_id, appointment_date, appointment_time,
            appointment_type, duration, notes, id
        ]);

        return this.getById(id);
    }

    /**
     * Update appointment status
     */
    async updateStatus(id, status, notes = null) {
        const query = `
            UPDATE appointments 
            SET status = ?, notes = COALESCE(?, notes), updated_at = NOW()
            WHERE id = ?
        `;

        await this.db.execute(query, [status, notes, id]);
        return true;
    }

    /**
     * Cancel appointment
     */
    async cancel(id, reason = null) {
        const query = `
            UPDATE appointments 
            SET status = 'cancelled', 
                notes = CONCAT(COALESCE(notes, ''), ' | Cancelled: ', COALESCE(?, 'No reason provided')),
                updated_at = NOW()
            WHERE id = ?
        `;

        await this.db.execute(query, [reason, id]);
        return true;
    }

    /**
     * Get available time slots for a doctor on a specific date
     */
    async getAvailableTimeSlots(clinicId, doctorId, appointmentDate, appointmentTypeId = null) {
        // Get clinic operating hours (default 8:00 AM to 6:00 PM)
        const startHour = 8;
        const endHour = 18;
        const slotDuration = 30; // 30-minute slots
        
        // Get appointment type duration if provided
        let typeDuration = slotDuration;
        if (appointmentTypeId) {
            const [typeRows] = await this.db.execute(
                'SELECT duration_minutes FROM appointment_types WHERE id = ? AND clinic_id = ?',
                [appointmentTypeId, clinicId]
            );
            if (typeRows.length > 0) {
                typeDuration = typeRows[0].duration_minutes;
            }
        }

        // Generate all possible time slots
        const allSlots = [];
        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += slotDuration) {
                const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                allSlots.push({
                    time: timeStr,
                    available: true
                });
            }
        }

        // Get existing appointments for the date
        const [existingAppointments] = await this.db.execute(`
            SELECT appointment_time, duration 
            FROM appointments 
            WHERE clinic_id = ? AND doctor_id = ? AND appointment_date = ?
            AND status NOT IN ('cancelled', 'no_show')
        `, [clinicId, doctorId, appointmentDate]);

        // Mark unavailable slots
        existingAppointments.forEach(appointment => {
            const [hours, minutes] = appointment.appointment_time.split(':').map(Number);
            const startMinutes = hours * 60 + minutes;
            const endMinutes = startMinutes + appointment.duration;

            allSlots.forEach(slot => {
                const [slotHours, slotMins] = slot.time.split(':').map(Number);
                const slotStartMinutes = slotHours * 60 + slotMins;
                const slotEndMinutes = slotStartMinutes + typeDuration;

                // Check if slots overlap
                if ((slotStartMinutes < endMinutes && slotEndMinutes > startMinutes)) {
                    slot.available = false;
                }
            });
        });

        return allSlots.filter(slot => slot.available);
    }
    /**
     * Check for time conflicts
     */
    async checkTimeConflict(clinicId, doctorId, appointmentDate, appointmentTime, duration, excludeId = null) {
        // Calculate end time
        const [hours, minutes] = appointmentTime.split(':').map(Number);
        const startMinutes = hours * 60 + minutes;
        const endMinutes = startMinutes + duration;
        const endHours = Math.floor(endMinutes / 60);
        const endMins = endMinutes % 60;
        const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;

        let query = `
            SELECT id FROM appointments 
            WHERE clinic_id = ? AND doctor_id = ? AND appointment_date = ?
            AND status NOT IN ('cancelled', 'no_show')
            AND (
                (appointment_time <= ? AND TIME_ADD(appointment_time, INTERVAL duration MINUTE) > ?) OR
                (appointment_time < ? AND TIME_ADD(appointment_time, INTERVAL duration MINUTE) >= ?)
            )
        `;
        
        let params = [clinicId, doctorId, appointmentDate, appointmentTime, appointmentTime, endTime, endTime];

        if (excludeId) {
            query += ' AND id != ?';
            params.push(excludeId);
        }

        const [rows] = await this.db.execute(query, params);
        return rows.length > 0;
    }

    /**
     * Validate appointment time slot
     */
    async validateTimeSlot(clinicId, doctorId, appointmentDate, appointmentTime, duration) {
        // Check if time is within operating hours (8 AM - 6 PM)
        const [hours, minutes] = appointmentTime.split(':').map(Number);
        const timeInMinutes = hours * 60 + minutes;
        const startOfDay = 8 * 60; // 8:00 AM
        const endOfDay = 18 * 60; // 6:00 PM
        
        if (timeInMinutes < startOfDay || (timeInMinutes + duration) > endOfDay) {
            return {
                valid: false,
                message: 'Appointment time must be between 8:00 AM and 6:00 PM'
            };
        }

        // Check for conflicts
        const hasConflict = await this.checkTimeConflict(clinicId, doctorId, appointmentDate, appointmentTime, duration);
        if (hasConflict) {
            return {
                valid: false,
                message: 'Time slot is already booked'
            };
        }

        return {
            valid: true,
            message: 'Time slot is available'
        };
    }

    /**
     * Get appointment statistics for clinic
     */
    async getClinicStats(clinicId) {
        const queries = {
            totalAppointments: 'SELECT COUNT(*) as count FROM appointments WHERE clinic_id = ?',
            todayAppointments: 'SELECT COUNT(*) as count FROM appointments WHERE clinic_id = ? AND appointment_date = CURDATE()',
            scheduledAppointments: 'SELECT COUNT(*) as count FROM appointments WHERE clinic_id = ? AND status = "scheduled"',
            completedAppointments: 'SELECT COUNT(*) as count FROM appointments WHERE clinic_id = ? AND status = "completed"',
            cancelledAppointments: 'SELECT COUNT(*) as count FROM appointments WHERE clinic_id = ? AND status = "cancelled"',
            noShowAppointments: 'SELECT COUNT(*) as count FROM appointments WHERE clinic_id = ? AND status = "no_show"'
        };

        const stats = {};
        
        for (const [key, query] of Object.entries(queries)) {
            const [rows] = await this.db.execute(query, [clinicId]);
            stats[key] = rows[0].count;
        }

        return stats;
    }

    /**
     * Get appointments by status
     */
    async getAppointmentsByStatus(clinicId) {
        const query = `
            SELECT status, COUNT(*) as count
            FROM appointments 
            WHERE clinic_id = ?
            GROUP BY status
            ORDER BY count DESC
        `;

        const [rows] = await this.db.execute(query, [clinicId]);
        return rows;
    }

    /**
     * Get upcoming appointments for patient
     */
    async getUpcomingForPatient(patientId, limit = 5) {
        const query = `
            SELECT a.id, a.appointment_date, a.appointment_time, a.appointment_type, 
                   a.status, d.full_name as doctor_name
            FROM appointments a
            LEFT JOIN auth_users d ON a.doctor_id = d.id
            WHERE a.patient_id = ? 
            AND a.appointment_date >= CURDATE()
            AND a.status NOT IN ('cancelled', 'completed')
            ORDER BY a.appointment_date, a.appointment_time
            LIMIT ?
        `;

        const [rows] = await this.db.execute(query, [patientId, limit]);
        return rows;
    }
}

module.exports = Appointment;