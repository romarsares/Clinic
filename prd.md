# prd.md
# Product Requirement Document
# Pediatric Clinic / Clinic Operations SaaS

---

## 1. Product Identity

**Product Name (Placeholder):** ClinicOps SaaS  
**Target Users:** Small to medium pediatric and general clinics  
**Positioning:** Comprehensive clinic operations and clinical workflow system for SMEs, starting in the Philippines, scalable globally.  
**Product Scope:** Full-featured clinic management including operations AND clinical records.  

**This system IS NOT:**
- A hospital system
- An insurance or government-integrated platform
- A complex multi-specialty hospital EHR

**This system IS:**
- A comprehensive clinic management SaaS
- Focused on appointments, patient records, clinical documentation, lab management, and billing
- Multi-tenant from day one
- Clinical-grade but designed for SME clinics

---

## 2. Business Problem

Clinics often struggle with:
- Manual appointment tracking (Messenger / phone)
- Patient history in folders or spreadsheets
- No structured clinical documentation (diagnosis, treatment plans)
- Manual lab request and result tracking
- Manual billing & invoicing
- Lack of operational reports for owners
- Poor accountability among staff

**Goal:** Replace operational chaos with structured, scalable workflows that include both operational AND clinical capabilities.

---

## 3. Core Principles

1. **Comprehensive clinic solution** – operations + clinical documentation  
2. **Multi-tenant architecture** – one system, many clinics  
3. **Documentation-first** – everything defined in `claude.md`, `tasks.md`, `decisions.md`  
4. **Compliance-ready** – PH Data Privacy Act and healthcare data protection  
5. **Modular for pediatric extension** – parent-child tracking, vaccine module, growth tracking

---

## 4. MVP Modules

### 4.1 Tenant / Clinic Management
- Each clinic = one tenant  
- Branch support configurable later  
- Custom settings per clinic

### 4.2 User & Role Management
- Roles: Owner, Doctor, Staff, Admin, Lab Technician  
- RBAC enforced  
- Permissions control feature access

### 4.3 Appointment Management
- Daily schedule management  
- Pediatric-specific appointment types optional  
- Booking, rescheduling, cancellations  
- Notifications via SMS / Email

### 4.4 Patient Management
- **Complete patient records including:**
  - Basic demographics and contact information
  - Parent account → child profiles (for pediatric clinics)
  - Medical history tracking
  - Allergy records
  - Current medications
  - Previous diagnoses and treatments
  - Family medical history (optional)
- Identity management with DOB (immutable for legal/audit purposes)
- Appointment history and visit summaries  
- Consent flags for notifications and data sharing

### 4.5 Clinical Documentation / Visit Records
- **Comprehensive visit documentation:**
  - Chief complaint
  - **Diagnosis** (primary and secondary diagnoses)
  - **Treatment plans** (medications, procedures, recommendations)
  - Vital signs (temperature, blood pressure, heart rate, weight, height)
  - Physical examination notes
  - Clinical assessments
  - Follow-up instructions
- Timestamped, linked to doctor and patient  
- Support for multiple note types and structured templates
- Legal protection through complete documentation

### 4.6 Laboratory Management
- **Lab request management:**
  - Create lab orders from visit records
  - Common lab test templates (CBC, urinalysis, blood chemistry, etc.)
  - Custom lab test definitions
  - Track lab request status (pending, in-progress, completed)
- **Lab results management:**
  - Record lab results with normal ranges
  - Flag abnormal values
  - Attach result files (PDFs, images)
  - Link results to patient history
- **Lab reporting:**
  - Pending lab requests dashboard
  - Lab turnaround time tracking
  - Lab utilization reports

### 4.7 Patient History & Medical Records
- **Comprehensive medical history view:**
  - Chronological visit timeline
  - All diagnoses across all visits
  - Treatment history
  - Lab results history
  - Medication history
  - Growth charts (for pediatric patients)
  - Vaccine records (for pediatric patients)
- **Search and filter capabilities:**
  - Search by diagnosis
  - Filter by date range
  - Find specific lab results
- **Export capabilities:**
  - Generate patient summary reports
  - Export medical records for referrals
  - Print visit summaries

### 4.8 Billing Summary
- Track charges & payments per patient  
- Link billing to specific visits and procedures
- Support for lab test charges
- Summaries per clinic owner  
- Simple, operational; no payroll, no tax calculations

### 4.9 Reports
- **Owner-focused dashboards:**
  - Revenue and collections
  - Doctor utilization and productivity
  - No-show rates
  - **Common diagnoses (ICD-10 compatible)**
  - **Lab test volumes and revenue**
  - Patient demographics
- CSV export for all reports

### 4.10 Audit Logs
- Track all user actions per tenant  
- **Special tracking for clinical actions:**
  - Diagnosis entries
  - Treatment modifications
  - Lab result entries
  - Medical record access
- Builds trust and accountability  
- Enables compliance review

---

## 5. Security & Compliance
- PH Data Privacy Act 2012 compliant  
- **Healthcare data protection standards:**
  - Sensitive personal health information (SPI) protection
  - Medical record confidentiality
  - Audit trails for all clinical data access
- Role-based access control with clinical data restrictions
- Encryption at rest and in transit  
- **Medical data retention policies:**
  - Minimum 5-10 year retention for patient records
  - Secure deletion procedures
- Multi-tenant data isolation

---

## 6. MVP Non-Goals
- ❌ Complex hospital systems (OR scheduling, ICU monitoring)
- ❌ Insurance or PhilHealth integration (Phase 2+)
- ❌ Government reporting integration (Phase 2+)
- ❌ Advanced imaging (PACS integration) - Phase 2+
- ❌ Payroll or tax computation  
- ❌ Inventory management (Phase 2+)

**Non-goals exist to prevent:**
- Feature creep beyond clinic scope
- AI over-helpfulness  
- Premature complexity

---

## 7. Phased Execution (tasks.md guide reference)

**Phase 0:** Validation & setup  
- Clinic interviews, confirm clinical workflow requirements
- Confirm tech stack and compliance requirements

**Phase 1:** Core foundation  
- Auth / RBAC with clinical role support
- Tenant & user management  
- Basic appointment scheduling
- Patient demographics

**Phase 2:** Clinical documentation  
- **Visit records with diagnosis and treatment**
- **Patient medical history tracking**
- Vital signs recording
- Clinical note templates

**Phase 3:** Laboratory integration  
- **Lab request management**
- **Lab results recording**
- Lab reporting dashboard

**Phase 4:** Patient history & reporting
- **Comprehensive patient history view**
- Medical record search and export
- Clinical reports and analytics

**Phase 5:** UX completion & billing  
- Dashboards for owners and doctors
- Clinical reports  
- Billing integration with clinical services
- Audit logs

**Phase 6:** Hardening  
- Permissions review (clinical data access)
- Data validation  
- Security checks (healthcare data protection)

**Phase 7:** Pre-launch QA  
- Role-based testing (Owner, Doctor, Staff, Lab Tech)
- Clinical workflow testing
- Breaker / QA testing

**Phase 8:** Launch  
- PH clinics first  
- Pediatric-specific enhancements  
- Ready for multi-tenant scaling

---

## 8. Future Enhancements
- Vaccine schedule tracker and administration records
- Growth and development tracking (WHO standards)
- Parent portal with clinical summaries
- Telemedicine integration
- PhilHealth and insurance integration
- Prescription management with e-signature
- Advanced reporting and analytics
- Inventory management for clinic supplies

---

## 9. Pricing Logic (Optional for MVP)
- ₱1,999–₱4,999 / month per clinic  
- Tier based on users, appointment volume, and clinical features
- Additional fees for advanced features (lab integration, telemedicine)
- Predictable for clinics and sustainable for SaaS

---

## 10. Success Criteria
- Clinics adopt system for daily clinical operations  
- **Complete medical records maintained for all patients**
- **Diagnosis and treatment documentation meets legal standards**
- **Lab workflows streamline request-to-result process**
- Appointment and billing tracking is accurate  
- Multi-tenant system scales to >10 clinics in pilot  
- No critical security breaches or data leaks
- **Compliance with healthcare data protection regulations**

---

## 11. Clinical Data Categories

### Operational Data
- Appointments, scheduling, billing, notifications
- Basic patient demographics
- Audit logs

### Clinical Data (Protected Health Information)
- **Diagnoses** (all medical conditions)
- **Treatment plans** (medications, procedures, recommendations)
- **Medical history** (past illnesses, surgeries, conditions)
- **Lab results** (all laboratory test results)
- Vital signs and physical examination findings
- Clinical assessments and progress notes
- Allergy information
- Current medications
- Family medical history

### Sensitive Clinical Data (Enhanced Protection)
- Mental health diagnoses
- HIV/AIDS status
- Genetic information
- Substance abuse records
- Sexual health information

---

## 12. References
- `claude.md` – Laws & AI constraints (needs update for clinical features)
- `tasks.md` – Phase tasks (needs expansion for clinical phases)
- `decisions.md` – Log choices  
- `risks.md` – Track known weaknesses (needs clinical risk assessment)
- `clinic_saas_compliance.md` – Compliance requirements

---

**End of Updated PRD**

**IMPORTANT NOTES:**
1. This PRD now includes full clinical capabilities (diagnosis, patient history, labs)
2. The following files need to be updated to align:
   - `claude.md` - Remove restrictions on clinical data
   - `tasks.md` - Add clinical feature phases
   - `clinic_saas_mysql_ddl.md` - Keep diagnosis/treatment in visit_notes
   - `decisions.md` - Reverse 2026-01-15 decision about clinical terms
   - `clinic_saas_api_endpoints.md` - Add lab and medical history endpoints
   - `clinic_saas_compliance.md` - Add clinical data protection requirements
3. Security and compliance requirements are more stringent with clinical data
4. This positions the product as a comprehensive clinic solution, not just operations