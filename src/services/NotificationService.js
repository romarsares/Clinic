/**
 * Notification Service - Phase 5 Implementation
 * Basic SMS/Email notifications for appointments
 */

const nodemailer = require('nodemailer');

class NotificationService {
  constructor() {
    this.emailTransporter = this.createEmailTransporter();
  }

  // Create email transporter
  createEmailTransporter() {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('Email credentials not configured');
      return null;
    }

    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Send appointment reminder email
  async sendAppointmentReminder(appointment, patient, clinic) {
    if (!this.emailTransporter || !patient.email) return false;

    const subject = `Appointment Reminder - ${clinic.name}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Appointment Reminder</h2>
        <p>Dear ${patient.first_name} ${patient.last_name},</p>
        <p>This is a reminder for your upcoming appointment:</p>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Date:</strong> ${new Date(appointment.appointment_date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${appointment.appointment_time}</p>
          <p><strong>Type:</strong> ${appointment.appointment_type}</p>
          <p><strong>Clinic:</strong> ${clinic.name}</p>
        </div>
        
        <p>Please arrive 15 minutes early for check-in.</p>
        <p>If you need to reschedule, please contact us at ${clinic.contact_number}.</p>
        
        <p>Best regards,<br>${clinic.name}</p>
      </div>
    `;

    try {
      await this.emailTransporter.sendMail({
        from: process.env.SMTP_USER,
        to: patient.email,
        subject,
        html
      });
      return true;
    } catch (error) {
      console.error('Email send error:', error);
      return false;
    }
  }

  // Send appointment confirmation
  async sendAppointmentConfirmation(appointment, patient, clinic) {
    if (!this.emailTransporter || !patient.email) return false;

    const subject = `Appointment Confirmed - ${clinic.name}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Appointment Confirmed</h2>
        <p>Dear ${patient.first_name} ${patient.last_name},</p>
        <p>Your appointment has been confirmed:</p>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Date:</strong> ${new Date(appointment.appointment_date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${appointment.appointment_time}</p>
          <p><strong>Type:</strong> ${appointment.appointment_type}</p>
          <p><strong>Clinic:</strong> ${clinic.name}</p>
        </div>
        
        <p>We look forward to seeing you!</p>
        
        <p>Best regards,<br>${clinic.name}</p>
      </div>
    `;

    try {
      await this.emailTransporter.sendMail({
        from: process.env.SMTP_USER,
        to: patient.email,
        subject,
        html
      });
      return true;
    } catch (error) {
      console.error('Email send error:', error);
      return false;
    }
  }

  // Send SMS (placeholder - requires SMS service like Twilio)
  async sendSMS(phoneNumber, message) {
    // Placeholder for SMS implementation
    console.log(`SMS to ${phoneNumber}: ${message}`);
    return true;
  }

  // Send appointment reminder SMS
  async sendAppointmentReminderSMS(appointment, patient, clinic) {
    if (!patient.contact_number) return false;

    const message = `Reminder: You have an appointment at ${clinic.name} on ${new Date(appointment.appointment_date).toLocaleDateString()} at ${appointment.appointment_time}. Please arrive 15 minutes early.`;
    
    return await this.sendSMS(patient.contact_number, message);
  }

  // Batch send reminders for tomorrow's appointments
  async sendTomorrowReminders(clinicId) {
    const db = require('../config/database');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    try {
      const [appointments] = await db.execute(`
        SELECT a.*, p.first_name, p.last_name, p.email, p.contact_number,
               c.name as clinic_name, c.contact_number as clinic_contact
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN clinics c ON a.clinic_id = c.id
        WHERE a.clinic_id = ? AND DATE(a.appointment_date) = ? AND a.status = 'scheduled'
      `, [clinicId, tomorrowStr]);

      let emailsSent = 0;
      let smsSent = 0;

      for (const apt of appointments) {
        const patient = {
          first_name: apt.first_name,
          last_name: apt.last_name,
          email: apt.email,
          contact_number: apt.contact_number
        };

        const clinic = {
          name: apt.clinic_name,
          contact_number: apt.clinic_contact
        };

        // Send email reminder
        if (await this.sendAppointmentReminder(apt, patient, clinic)) {
          emailsSent++;
        }

        // Send SMS reminder
        if (await this.sendAppointmentReminderSMS(apt, patient, clinic)) {
          smsSent++;
        }
      }

      return { total: appointments.length, emailsSent, smsSent };
    } catch (error) {
      console.error('Batch reminder error:', error);
      return { total: 0, emailsSent: 0, smsSent: 0 };
    }
  }
}

module.exports = new NotificationService();