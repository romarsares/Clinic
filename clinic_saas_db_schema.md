# Clinic Operations SaaS - Database Schema (MVP v2 - Clinical Enhanced)

Design Goals:
- Multi-tenant (one system, many clinics)
- Simple but scalable
- Audit-friendly
- Global-ready
- Developer-friendly
- **Healthcare-grade for clinical data**

---

# Core Tables Overview

## Authentication & Access
- auth_users
- roles
- user_roles
- permissions
- role_permissions

## Clinic Management
- clinics
- clinic_settings

## Patient Management
- patients
- patient_allergies
- patient_medications
- patient_medical_history

## Appointments & Visits
- appointments
- visits
- visit_notes
- visit_diagnoses
- visit_vital_signs
- visit_attachments

## Laboratory Management (NEW)
- lab_tests
- lab_requests
- lab_request_items
- lab_results
- lab_result_details

## Billing
- services
- billings
- billing_items
- payments

## Audit & Compliance
- audit_logs

---

# 1. Authentication & Access Control

## auth_users
- id (PK)
- clinic_id (FK → clinics)
- email
- password_hash
- full_name
- status (active, suspended)
- last_login_at
- created_at
- updated_at
- deleted_at

## roles
- id (PK)
- clinic_id (FK → clinics)
- name (Owner, Doctor, Staff, Lab Technician)
- description
- created_at
- updated_at

## user_roles
- id (PK)
- user_id (FK → auth_users)
- role_id (FK → roles)
- created_at

## permissions (NEW)
- id (PK)
- name (e.g., 'create_diagnosis', 'enter_lab_results')
- display_name
- description
- category
- created_at

## role_permissions (NEW)
- id (PK)
- role_id (FK → roles)
- permission_id (FK → permissions)
- created_at

---

# 2. Clinic Management

## clinics
- id (PK)
- name
- address
- contact_number
- email
- timezone
- status (trial, active, suspended)
- subscription_plan
- trial_ends_at
- created_at
- updated_at

## clinic_settings
- id (PK)
- clinic_id (FK → clinics)
- key
- value
- created_at
- updated_at

---

# 3. Patient Management

## patients
- id (PK)
- clinic_id (FK → clinics)
- patient_code
- full_name
- birth_date
- gender
- contact_number
- email
- parent_patient_id (FK → patients, self-referencing)
- notes
- created_at
- updated_at
- deleted_at

## patient_allergies (NEW)
- id (PK)
- patient_id (FK → patients)
- clinic_id (FK → clinics)
- allergen (e.g., 'Penicillin', 'Peanuts')
- reaction (e.g., 'Rash', 'Anaphylaxis')
- severity (mild, moderate, severe)
- diagnosed_date
- notes
- created_at
- updated_at

## patient_medications (NEW)
- id (PK)
- patient_id (FK → patients)
- clinic_id (FK → clinics)
- medication_name
- dosage
- frequency
- start_date
- end_date (NULL if ongoing)
- prescribed_by (FK → auth_users)
- status (active, discontinued)
- notes
- created_at
- updated_at

## patient_medical_history (NEW)
- id (PK)
- patient_id (FK → patients)
- clinic_id (FK → clinics)
- history_type (past_illness, surgery, hospitalization, family_history)
- condition
- diagnosed_date
- notes
- created_at
- updated_at

---

# 4. Appointment Management

## appointments
- id (PK)
- clinic_id (FK → clinics)
- patient_id (FK → patients)
- doctor_id (FK → auth_users)
- scheduled_date
- scheduled_time
- status (scheduled, completed, cancelled, no_show)
- remarks
- created_at
- updated_at
- deleted_at

---

# 5. Consultation / Visit Records

## visits
- id (PK)
- clinic_id (FK → clinics)
- appointment_id (FK → appointments)
- patient_id (FK → patients)
- doctor_id (FK → auth_users)
- visit_date
- status (open, closed)
- created_at
- updated_at

## visit_notes
- id (PK)
- visit_id (FK → visits)
- clinic_id (FK → clinics)
- note_type (complaint, diagnosis, treatment, remarks)
- content (TEXT)
- created_at
- updated_at

## visit_diagnoses (NEW)
- id (PK)
- visit_id (FK → visits)
- clinic_id (FK → clinics)
- diagnosis_type (primary, secondary)
- diagnosis_code (ICD-10 code, optional)
- diagnosis_name
- clinical_notes
- diagnosed_by (FK → auth_users)
- diagnosed_at
- created_at
- updated_at

## visit_vital_signs (NEW)
- id (PK)
- visit_id (FK → visits)
- clinic_id (FK → clinics)
- temperature (DECIMAL, Celsius)
- blood_pressure_systolic (INT)
- blood_pressure_diastolic (INT)
- heart_rate (INT, bpm)
- respiratory_rate (INT, per minute)
- weight (DECIMAL, kg)
- height (DECIMAL, cm)
- bmi (DECIMAL, calculated)
- oxygen_saturation (INT, %)
- recorded_by (FK → auth_users)
- recorded_at
- created_at

## visit_attachments
- id (PK)
- visit_id (FK → visits)
- clinic_id (FK → clinics)
- file_name
- file_path
- file_type (image, pdf, lab_result)
- uploaded_by (FK → auth_users)
- created_at

---

# 6. Laboratory Management (NEW MODULE)

## lab_tests
- id (PK)
- clinic_id (FK → clinics)
- test_code (e.g., 'CBC', 'URIN')
- test_name (e.g., 'Complete Blood Count')
- category (hematology, chemistry, urinalysis, microbiology)
- normal_range_config (JSON - stores normal ranges by age/gender)
- price (DECIMAL)
- is_active (BOOLEAN)
- created_at
- updated_at

## lab_requests
- id (PK)
- clinic_id (FK → clinics)
- patient_id (FK → patients)
- visit_id (FK → visits)
- request_number (auto-generated unique ID)
- requested_by (FK → auth_users, doctor)
- request_date
- status (pending, in_progress, completed, cancelled)
- urgency (routine, urgent, stat)
- clinical_notes (reason for test)
- created_at
- updated_at

## lab_request_items (NEW)
- id (PK)
- lab_request_id (FK → lab_requests)
- lab_test_id (FK → lab_tests)
- status (pending, completed)
- created_at

## lab_results
- id (PK)
- lab_request_id (FK → lab_requests)
- clinic_id (FK → clinics)
- result_date
- entered_by (FK → auth_users, lab technician)
- verified_by (FK → auth_users, doctor)
- overall_status (normal, abnormal, critical)
- remarks (TEXT)
- result_file_path (if PDF uploaded)
- created_at
- updated_at

## lab_result_details (NEW)
- id (PK)
- lab_result_id (FK → lab_results)
- lab_test_id (FK → lab_tests)
- parameter_name (e.g., 'Hemoglobin', 'WBC Count')
- result_value (e.g., '12.5')
- unit (e.g., 'g/dL', 'cells/μL')
- normal_range (e.g., '12-16')
- is_abnormal (BOOLEAN)
- created_at

---

# 7. Billing

## services
- id (PK)
- clinic_id (FK → clinics)
- service_type (consultation, procedure, laboratory)
- name
- price (DECIMAL)
- is_active (BOOLEAN)
- created_at
- updated_at

## billings
- id (PK)
- clinic_id (FK → clinics)
- patient_id (FK → patients)
- visit_id (FK → visits)
- total_amount (DECIMAL)
- discount_amount (DECIMAL)
- net_amount (DECIMAL)
- status (unpaid, paid, void)
- created_at
- updated_at

## billing_items
- id (PK)
- billing_id (FK → billings)
- service_id (FK → services)
- lab_request_id (FK → lab_requests, optional)
- description
- quantity (INT)
- unit_price (DECIMAL)
- amount (DECIMAL)
- created_at

## payments
- id (PK)
- billing_id (FK → billings)
- clinic_id (FK → clinics)
- amount (DECIMAL)
- payment_method (cash, card, gcash)
- payment_date
- received_by (FK → auth_users)
- created_at

---

# 8. Audit & Accountability

## audit_logs
- id (PK)
- clinic_id (FK → clinics)
- user_id (FK → auth_users)
- action (create, update, delete, login, view)
- entity (patients, visits, diagnoses, lab_results, etc.)
- entity_id
- old_value (JSON)
- new_value (JSON)
- ip_address
- created_at

---

# 9. Relationships (Enhanced Mental Model)

```
clinic
 ├── users
 ├── roles → permissions
 ├── patients
 │    ├── allergies
 │    ├── medications
 │    ├── medical_history
 │    └── appointments
 │         └── visits
 │              ├── diagnoses
 │              ├── vital_signs
 │              ├── notes
 │              ├── attachments
 │              └── lab_requests
 │                   ├── lab_request_items
 │                   └── lab_results
 │                        └── lab_result_details
 ├── services
 ├── billings
 │    ├── billing_items
 │    └── payments
 └── audit_logs
```

---

# 10. Key Design Decisions

## Why separate `visit_diagnoses` from `visit_notes`?
- **Structured data:** Diagnoses need ICD-10 codes, primary/secondary classification
- **Reporting:** Easier to generate disease prevalence reports
- **RBAC:** Only doctors can create/edit diagnoses
- **Audit:** Enhanced tracking for medical-legal protection

## Why `lab_result_details` separate from `lab_results`?
- **Flexibility:** One CBC test has 10+ parameters (Hemoglobin, WBC, Platelets, etc.)
- **Abnormal flagging:** Each parameter can be flagged independently
- **Trending:** Track specific values over time (e.g., Hemoglobin trends)

## Why `patient_allergies` instead of JSON field?
- **Safety:** Easier to query and alert on allergies
- **Validation:** Structured data prevents typos
- **Reporting:** Track allergy prevalence

## Why `parent_patient_id` self-referencing?
- **Pediatric workflow:** Parent account can manage multiple children
- **Simplicity:** No need for separate `parents` table
- **Flexibility:** Adult patients can also have guardians

---

# 11. Excluded Features for MVP

- Insurance claims tracking
- PhilHealth integration
- Payroll management
- Inventory/stock management
- Advanced imaging (PACS)
- E-prescription with digital signatures
- Telemedicine video calls

---

# 12. Index Strategy (Performance)

**Critical indexes for clinical queries:**
- `patients(clinic_id, deleted_at)` - Active patient lists
- `visits(patient_id, visit_date)` - Patient visit history
- `lab_requests(clinic_id, status, request_date)` - Pending labs
- `lab_results(lab_request_id)` - Fast result lookup
- `visit_diagnoses(diagnosis_code)` - Disease prevalence reports
- `audit_logs(clinic_id, entity, created_at)` - Compliance audits

---

**End of Enhanced Database Schema**

**MAJOR CHANGES FROM v1.0:**
1. Added `permissions` and `role_permissions` tables for fine-grained RBAC
2. Added `patient_allergies`, `patient_medications`, `patient_medical_history`
3. Added `visit_diagnoses` for structured diagnosis tracking
4. Added `visit_vital_signs` for clinical measurements
5. Added complete Laboratory module (5 new tables)
6. Enhanced `services` with service_type for clinical/lab categorization
7. Enhanced `billing_items` with optional lab_request_id link
8. Enhanced `audit_logs` with 'view' action for clinical data access tracking