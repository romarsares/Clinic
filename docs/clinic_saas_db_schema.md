# Clinic Operations SaaS - Database Schema (MVP v2 - Clinical Enhanced)

Design Goals:
- Multi-tenant (one system, many clinics)
- Simple but scalable
- Audit-friendly
- Global-ready
- Developer-friendly
- **Healthcare-grade for clinical data**

---

# Database Architecture Diagrams

## Entity-Relationship Diagram (ERD) - Complete Schema

**Purpose**: Visual representation of the complete database structure showing all tables, columns, and relationships.

**What it Shows**:
- 25+ database tables with their primary keys (PK) and foreign keys (FK)
- Relationships between entities (clinics, users, patients, clinical data, etc.)
- Multi-tenant architecture with clinic_id as the isolation key
- Clinical workflow data structures (diagnoses, labs, billing)

**How to Read**:
- Boxes represent database tables
- Lines with arrows show foreign key relationships
- "1" indicates "one-to-many" relationships
- PK = Primary Key, FK = Foreign Key
- Table names are in lowercase, column names descriptive

```
┌─────────────────┐       ┌──────────────────┐
│    clinics      │       │ clinic_settings  │
│─────────────────│       │──────────────────│
│ id (PK)         │1──────┼── clinic_id (FK) │
│ name            │       │ key              │
│ address         │       │ value            │
│ email           │       │ created_at       │
│ status          │       └──────────────────┘
│ subscription    │
│ created_at      │
└─────────────────┘
         │1
         │
         │
         ▼
┌─────────────────┐       ┌──────────────────┐
│   auth_users    │       │      roles       │
│─────────────────│       │──────────────────│
│ id (PK)         │───────┼── clinic_id (FK) │
│ clinic_id (FK)  │       │ id (PK)          │
│ email           │       │ name             │
│ full_name       │       │ description      │
│ status          │       └──────────────────┘
│ created_at      │               │
└─────────────────┘               │
         │                        │
         │                        │
         ▼                        ▼
┌─────────────────┐       ┌──────────────────┐
│   user_roles    │       │ role_permissions │
│─────────────────│       │──────────────────│
│ user_id (FK)    │       │ role_id (FK)     │
│ role_id (FK)    │       │ permission_id(FK)│
└─────────────────┘       └──────────────────┘
                                  │
                                  │
                                  ▼
                         ┌──────────────────┐
                         │   permissions    │
                         │──────────────────│
                         │ id (PK)          │
                         │ name             │
                         │ display_name     │
                         │ category         │
                         └──────────────────┘

┌─────────────────┐       ┌──────────────────┐
│    patients     │       │   appointments   │
│─────────────────│       │──────────────────│
│ id (PK)         │1──────┼── clinic_id (FK) │
│ clinic_id (FK)  │       │ patient_id (FK)  │
│ patient_code    │       │ doctor_id (FK)   │
│ full_name       │       │ scheduled_date   │
│ birth_date      │       │ status           │
│ gender          │       │ remarks          │
│ parent_id (FK)  │◄──────┼──────────────────┤
└─────────────────┘       │                  │
         ▲                └──────────────────┘
         │                        │
         │                        │
         ▼                        ▼
┌─────────────────┐       ┌──────────────────┐
│     visits      │       │   visit_notes    │
│─────────────────│       │──────────────────│
│ id (PK)         │───────┼── visit_id (FK)  │
│ clinic_id (FK)  │       │ clinic_id (FK)   │
│ appointment_id  │       │ note_type        │
│ patient_id (FK) │       │ content          │
│ doctor_id (FK)  │       └──────────────────┘
│ visit_date      │
│ status          │
└─────────────────┘
         │
         │
         ▼
    ┌─────────────────┐
    │ visit_diagnoses │
    │─────────────────│
    │ id (PK)         │
    │ visit_id (FK)   │
    │ clinic_id (FK)  │
    │ diagnosis_type  │
    │ diagnosis_code  │
    │ diagnosis_name  │
    │ clinical_notes  │
    │ diagnosed_by    │
    └─────────────────┘

    ┌─────────────────┐
    │visit_vital_signs│
    │─────────────────│
    │ id (PK)         │
    │ visit_id (FK)   │
    │ clinic_id (FK)  │
    │ temperature     │
    │ blood_pressure  │
    │ heart_rate      │
    │ weight/height   │
    │ recorded_by     │
    └─────────────────┘

┌─────────────────┐       ┌──────────────────┐
│patient_allergies│       │patient_medications│
│─────────────────│       │───────────────────│
│ id (PK)         │       │ id (PK)           │
│ patient_id (FK) │       │ patient_id (FK)   │
│ clinic_id (FK)  │       │ clinic_id (FK)    │
│ allergen        │       │ medication_name   │
│ reaction        │       │ dosage            │
│ severity        │       │ frequency         │
└─────────────────┘       │ prescribed_by     │
                          └───────────────────┘

┌─────────────────┐       ┌──────────────────┐
│     services    │       │    billings      │
│─────────────────│       │──────────────────│
│ id (PK)         │       │ id (PK)          │
│ clinic_id (FK)  │1──────┼── clinic_id (FK) │
│ service_type    │       │ patient_id (FK)  │
│ name            │       │ visit_id (FK)    │
│ price           │       │ total_amount     │
└─────────────────┘       │ status           │
         ▲                └──────────────────┘
         │                        │
         │                        │
         ▼                        ▼
┌─────────────────┐       ┌──────────────────┐
│ billing_items   │       │    payments      │
│─────────────────│       │──────────────────│
│ id (PK)         │       │ billing_id (FK)  │
│ service_id (FK) │       │ clinic_id (FK)   │
│ description     │       │ amount           │
│ quantity        │       │ payment_method   │
│ unit_price      │       │ payment_date     │
└─────────────────┘       └──────────────────┘

┌─────────────────┐       ┌──────────────────┐
│   lab_tests     │       │  lab_requests    │
│─────────────────│       │──────────────────│
│ id (PK)         │       │ id (PK)          │
│ clinic_id (FK)  │1──────┼── clinic_id (FK) │
│ test_code       │       │ patient_id (FK)  │
│ test_name       │       │ visit_id (FK)    │
│ category        │       │ request_number   │
│ price           │       │ requested_by     │
└─────────────────┘       │ status           │
         ▲                │ urgency          │
         │                └──────────────────┘
         │                        │
         │                        │
         ▼                        ▼
┌─────────────────┐       ┌──────────────────┐
│lab_request_items│       │   lab_results    │
│─────────────────│       │──────────────────│
│ id (PK)         │       │ id (PK)          │
│ lab_request_id  │       │ lab_request_id   │
│ lab_test_id     │       │ clinic_id (FK)   │
│ status          │       │ result_date      │
└─────────────────┘       │ entered_by       │
                          │ verified_by      │
                          └──────────────────┘
                                  │
                                  │
                                  ▼
                         ┌──────────────────┐
                         │lab_result_details│
                         │──────────────────│
                         │ id (PK)          │
                         │ lab_result_id    │
                         │ lab_test_id      │
                         │ parameter_name   │
                         │ result_value     │
                         │ unit             │
                         │ normal_range     │
                         │ is_abnormal      │
                         └──────────────────┘

┌─────────────────┐
│   audit_logs    │
│─────────────────│
│ id (PK)         │
│ clinic_id (FK)  │
│ user_id (FK)    │
│ action          │
│ entity          │
│ entity_id       │
│ old_value       │
│ new_value       │
│ ip_address      │
│ created_at      │
└─────────────────┘
```

**Key Insights**:
- Clinics are the root tenant entity with complete data isolation
- Patients support parent-child relationships for pediatric care
- Comprehensive RBAC system with granular permissions
- Clinical data structures support full diagnostic workflows
- Audit logging ensures compliance and traceability

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
- avatar_url (legacy - for backward compatibility)
- avatar_data (LONGBLOB) - **MySQL BLOB Storage Implementation**
- avatar_filename (VARCHAR(255))
- avatar_mimetype (VARCHAR(100))
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
- photo_data (LONGBLOB) - **MySQL BLOB Storage Implementation**
- photo_filename (VARCHAR(255))
- photo_mimetype (VARCHAR(100))
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

---

# 13. MySQL BLOB Storage Implementation

## Overview
The system uses MySQL BLOB storage for file management instead of filesystem storage, providing better data integrity, simplified backups, and enhanced security.

## Implementation Details

### Patient Photos
- **Storage**: `patients.photo_data` (LONGBLOB)
- **Metadata**: `photo_filename`, `photo_mimetype`
- **Size Limit**: 5MB maximum
- **API Endpoint**: `GET /api/patients/:id/photo`
- **Upload Endpoint**: `POST /api/patients/:id/photo`

### User Avatars
- **Storage**: `auth_users.avatar_data` (LONGBLOB)
- **Metadata**: `avatar_filename`, `avatar_mimetype`
- **Size Limit**: 5MB maximum
- **API Endpoint**: `GET /api/users/:id/avatar`
- **Upload Endpoint**: `POST /api/users/avatar`
- **Legacy Support**: `avatar_url` column maintained for backward compatibility

## Benefits
1. **Data Integrity**: Files and metadata stored together atomically
2. **Simplified Backups**: Single database backup includes all files
3. **Enhanced Security**: Files encrypted with database encryption
4. **No Broken Links**: No file path management issues
5. **Easier Deployment**: No shared filesystem requirements
6. **Better Scaling**: Database replication handles file distribution

## Performance Considerations
- File size limits prevent database bloat
- Separate queries for file data vs metadata
- Caching implemented for frequently accessed files
- Regular monitoring of database size growth

## Migration Strategy
- Backward compatibility maintained with existing `avatar_url` column
- Gradual migration from filesystem to BLOB storage
- Fallback mechanisms for legacy file references

## Future Enhancements
- Document storage for lab results and medical records
- File compression for larger documents
- Cloud storage migration path if BLOB storage exceeds limits