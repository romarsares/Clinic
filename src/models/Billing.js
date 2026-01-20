const TenantDB = require('../middleware/tenant');

class Billing {
  static async createBill(tenantId, billData) {
    const db = TenantDB.getConnection(tenantId);
    const [result] = await db.execute(
      `INSERT INTO bills (patient_id, visit_id, total_amount, status, created_at, tenant_id) 
       VALUES (?, ?, ?, 'pending', NOW(), ?)`,
      [billData.patient_id, billData.visit_id, billData.total_amount, tenantId]
    );
    return { id: result.insertId, ...billData };
  }

  static async addServiceCharge(tenantId, billId, serviceData) {
    const db = TenantDB.getConnection(tenantId);
    const [result] = await db.execute(
      `INSERT INTO bill_items (bill_id, service_type, service_name, quantity, unit_price, total_price, tenant_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [billId, serviceData.service_type, serviceData.service_name, 
       serviceData.quantity, serviceData.unit_price, 
       serviceData.quantity * serviceData.unit_price, tenantId]
    );
    
    // Update bill total
    await this.updateBillTotal(tenantId, billId);
    return { id: result.insertId, ...serviceData };
  }

  static async addVisitCharges(tenantId, visitId, patientId) {
    const db = TenantDB.getConnection(tenantId);
    
    // Get visit details
    const [visit] = await db.execute(
      'SELECT * FROM visits WHERE id = ? AND tenant_id = ?',
      [visitId, tenantId]
    );
    
    if (!visit[0]) return null;

    // Create bill
    const bill = await this.createBill(tenantId, {
      patient_id: patientId,
      visit_id: visitId,
      total_amount: 0
    });

    // Add consultation charge
    await this.addServiceCharge(tenantId, bill.id, {
      service_type: 'consultation',
      service_name: 'Medical Consultation',
      quantity: 1,
      unit_price: this.getServicePrice('consultation')
    });

    // Add diagnosis-based charges
    const [diagnoses] = await db.execute(
      'SELECT * FROM visit_diagnoses WHERE visit_id = ?',
      [visitId]
    );

    for (const diagnosis of diagnoses) {
      const price = this.getDiagnosisPrice(diagnosis.diagnosis_code);
      if (price > 0) {
        await this.addServiceCharge(tenantId, bill.id, {
          service_type: 'diagnosis',
          service_name: `Diagnosis: ${diagnosis.diagnosis_description}`,
          quantity: 1,
          unit_price: price
        });
      }
    }

    // Add treatment charges
    const [treatments] = await db.execute(
      'SELECT * FROM visit_treatments WHERE visit_id = ?',
      [visitId]
    );

    for (const treatment of treatments) {
      const price = this.getTreatmentPrice(treatment.treatment_type);
      if (price > 0) {
        await this.addServiceCharge(tenantId, bill.id, {
          service_type: 'treatment',
          service_name: treatment.medication_name || treatment.treatment_type,
          quantity: 1,
          unit_price: price
        });
      }
    }

    return bill;
  }

  static async addLabCharges(tenantId, labRequestId) {
    const db = TenantDB.getConnection(tenantId);
    
    // Get lab request details
    const [labRequest] = await db.execute(
      'SELECT * FROM lab_requests WHERE id = ? AND tenant_id = ?',
      [labRequestId, tenantId]
    );

    if (!labRequest[0]) return null;

    // Find or create bill for the visit
    let [existingBill] = await db.execute(
      'SELECT * FROM bills WHERE visit_id = ? AND tenant_id = ?',
      [labRequest[0].visit_id, tenantId]
    );

    let billId;
    if (existingBill[0]) {
      billId = existingBill[0].id;
    } else {
      const newBill = await this.createBill(tenantId, {
        patient_id: labRequest[0].patient_id,
        visit_id: labRequest[0].visit_id,
        total_amount: 0
      });
      billId = newBill.id;
    }

    // Add lab charge
    const labPrice = this.getLabPrice(labRequest[0].test_name);
    await this.addServiceCharge(tenantId, billId, {
      service_type: 'laboratory',
      service_name: labRequest[0].test_name,
      quantity: 1,
      unit_price: labPrice
    });

    return billId;
  }

  static async updateBillTotal(tenantId, billId) {
    const db = TenantDB.getConnection(tenantId);
    const [total] = await db.execute(
      'SELECT SUM(total_price) as total FROM bill_items WHERE bill_id = ? AND tenant_id = ?',
      [billId, tenantId]
    );

    await db.execute(
      'UPDATE bills SET total_amount = ? WHERE id = ? AND tenant_id = ?',
      [total[0].total || 0, billId, tenantId]
    );
  }

  static async getBillsByPatient(tenantId, patientId) {
    const db = TenantDB.getConnection(tenantId);
    const [bills] = await db.execute(
      `SELECT b.*, p.first_name, p.last_name 
       FROM bills b
       JOIN patients p ON b.patient_id = p.id
       WHERE b.patient_id = ? AND b.tenant_id = ?
       ORDER BY b.created_at DESC`,
      [patientId, tenantId]
    );
    return bills;
  }

  static async getBillDetails(tenantId, billId) {
    const db = TenantDB.getConnection(tenantId);
    const [bill] = await db.execute(
      `SELECT b.*, p.first_name, p.last_name, v.visit_date
       FROM bills b
       JOIN patients p ON b.patient_id = p.id
       LEFT JOIN visits v ON b.visit_id = v.id
       WHERE b.id = ? AND b.tenant_id = ?`,
      [billId, tenantId]
    );

    if (!bill[0]) return null;

    const [items] = await db.execute(
      'SELECT * FROM bill_items WHERE bill_id = ? AND tenant_id = ?',
      [billId, tenantId]
    );

    return { ...bill[0], items };
  }

  static async getRevenueByService(tenantId, dateFrom = null, dateTo = null) {
    const db = TenantDB.getConnection(tenantId);
    let query = `SELECT bi.service_type, SUM(bi.total_price) as revenue, COUNT(*) as count
                 FROM bill_items bi
                 JOIN bills b ON bi.bill_id = b.id
                 WHERE bi.tenant_id = ?`;
    
    const params = [tenantId];

    if (dateFrom) {
      query += ' AND b.created_at >= ?';
      params.push(dateFrom);
    }
    if (dateTo) {
      query += ' AND b.created_at <= ?';
      params.push(dateTo);
    }

    query += ' GROUP BY bi.service_type ORDER BY revenue DESC';

    const [rows] = await db.execute(query, params);
    return rows;
  }

  static getServicePrice(serviceType) {
    const prices = {
      'consultation': 500,
      'follow_up': 300,
      'emergency': 800,
      'vaccination': 200
    };
    return prices[serviceType] || 500;
  }

  static getDiagnosisPrice(diagnosisCode) {
    // Simplified pricing based on diagnosis complexity
    if (diagnosisCode.startsWith('A') || diagnosisCode.startsWith('B')) return 100; // Infectious diseases
    if (diagnosisCode.startsWith('J')) return 150; // Respiratory
    if (diagnosisCode.startsWith('K')) return 200; // Digestive
    return 50; // Basic diagnosis fee
  }

  static getTreatmentPrice(treatmentType) {
    const prices = {
      'medication': 100,
      'procedure': 300,
      'injection': 150,
      'dressing': 100
    };
    return prices[treatmentType] || 100;
  }

  static getLabPrice(testName) {
    const prices = {
      'Complete Blood Count (CBC)': 150,
      'Urinalysis': 100,
      'Blood Glucose': 80,
      'Cholesterol Panel': 200,
      'Liver Function Tests': 250,
      'Kidney Function Tests': 200,
      'Hemoglobin': 60,
      'White Blood Cells': 80,
      'Platelets': 70
    };
    return prices[testName] || 100;
  }
}

module.exports = Billing;