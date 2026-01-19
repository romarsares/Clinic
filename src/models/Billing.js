/**
 * Billing Model - Phase 5 Implementation
 * Links clinical services to billing charges
 */

const db = require('../config/database');

class Billing {
  // Create new bill for visit
  static async createBillForVisit(visitId, clinicId, patientId) {
    const billNumber = `BILL-${Date.now()}`;
    const billDate = new Date().toISOString().split('T')[0];
    
    const [result] = await db.execute(
      `INSERT INTO patient_bills (clinic_id, patient_id, visit_id, bill_number, bill_date, status)
       VALUES (?, ?, ?, ?, ?, 'draft')`,
      [clinicId, patientId, visitId, billNumber, billDate]
    );
    
    return result.insertId;
  }

  // Add consultation charge to bill
  static async addConsultationCharge(billId, serviceTypeId, description = 'Consultation') {
    const [serviceType] = await db.execute(
      'SELECT base_price FROM service_types WHERE id = ?',
      [serviceTypeId]
    );
    
    if (!serviceType.length) throw new Error('Service type not found');
    
    const price = serviceType[0].base_price;
    
    await db.execute(
      `INSERT INTO bill_items (bill_id, service_type_id, description, quantity, unit_price, total_price)
       VALUES (?, ?, ?, 1, ?, ?)`,
      [billId, serviceTypeId, description, price, price]
    );
    
    await this.updateBillTotal(billId);
  }

  // Add lab charges to bill
  static async addLabCharges(billId, labRequestId) {
    const [labItems] = await db.execute(
      `SELECT lri.lab_test_id, lt.name, st.id as service_type_id, st.base_price
       FROM lab_request_items lri
       JOIN lab_tests lt ON lri.lab_test_id = lt.id
       JOIN service_types st ON st.name = lt.name AND st.category = 'lab_test'
       WHERE lri.lab_request_id = ?`,
      [labRequestId]
    );

    for (const item of labItems) {
      await db.execute(
        `INSERT INTO bill_items (bill_id, service_type_id, description, quantity, unit_price, total_price, lab_request_id)
         VALUES (?, ?, ?, 1, ?, ?, ?)`,
        [billId, item.service_type_id, item.name, item.base_price, item.base_price, labRequestId]
      );
    }
    
    await this.updateBillTotal(billId);
  }

  // Update bill total
  static async updateBillTotal(billId) {
    await db.execute(
      `UPDATE patient_bills 
       SET total_amount = (SELECT COALESCE(SUM(total_price), 0) FROM bill_items WHERE bill_id = ?)
       WHERE id = ?`,
      [billId, billId]
    );
  }

  // Get bill details
  static async getBillDetails(billId) {
    const [bill] = await db.execute(
      `SELECT pb.*, p.first_name, p.last_name
       FROM patient_bills pb
       JOIN patients p ON pb.patient_id = p.id
       WHERE pb.id = ?`,
      [billId]
    );

    if (!bill.length) return null;

    const [items] = await db.execute(
      `SELECT bi.*, st.name as service_name, st.category
       FROM bill_items bi
       JOIN service_types st ON bi.service_type_id = st.id
       WHERE bi.bill_id = ?`,
      [billId]
    );

    return { ...bill[0], items };
  }

  // Get revenue by service type
  static async getRevenueByService(clinicId, startDate, endDate) {
    const [revenue] = await db.execute(
      `SELECT st.category, st.name, 
              COUNT(bi.id) as service_count,
              SUM(bi.total_price) as total_revenue
       FROM bill_items bi
       JOIN service_types st ON bi.service_type_id = st.id
       JOIN patient_bills pb ON bi.bill_id = pb.id
       WHERE pb.clinic_id = ? AND pb.bill_date BETWEEN ? AND ? AND pb.status = 'paid'
       GROUP BY st.category, st.name
       ORDER BY total_revenue DESC`,
      [clinicId, startDate, endDate]
    );

    return revenue;
  }

  // Get pending bills
  static async getPendingBills(clinicId) {
    const [bills] = await db.execute(
      `SELECT pb.*, p.first_name, p.last_name
       FROM patient_bills pb
       JOIN patients p ON pb.patient_id = p.id
       WHERE pb.clinic_id = ? AND pb.status IN ('draft', 'pending')
       ORDER BY pb.bill_date DESC`,
      [clinicId]
    );

    return bills;
  }
}

module.exports = Billing;