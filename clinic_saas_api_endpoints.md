# Clinic Operations SaaS - API Endpoint Design (MVP v1 - Clinical Enhanced)

Design Principles:
- Multi-tenant aware (clinic_id in all requests)
- RESTful endpoints
- Clinical-grade security with RBAC enforcement
- JSON request/response
- Clear and direct for developers

---

# API Architecture Diagrams

## API Endpoint Flow Diagram

**Purpose**: Complete API architecture showing endpoints, request flow, and security controls.

**What it Shows**:
- RESTful API structure organized by resource type
- Request processing pipeline (auth → validation → business logic → database)
- Multi-tenant context handling
- Security layers (JWT, RBAC, rate limiting)

**How to Read**:
- Top section shows API endpoints grouped by functionality
- Middle shows request flow control
- Bottom shows data access patterns
- Arrows indicate processing sequence

```
┌─────────────────────────────────────────────────────────────────┐
│                          API ENDPOINTS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Authentication & Authorization                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  POST /auth/    │  │  POST /auth/    │  │  POST /auth/    │ │
│  │  login          │  │  refresh        │  │  logout         │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  Patient Management                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  GET /patients  │  │  POST /patients │  │  PUT /patients/ │ │
│  │  (list/search)  │  │  (create)       │  │  {id} (update)  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  Appointment Management                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  GET /appoint-  │  │  POST /appoint- │  │  PUT /appoint-  │ │
│  │  ments          │  │  ments          │  │  ments/{id}     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  Clinical Operations                                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  POST /visits   │  │  POST /visits/  │  │  GET /visits/   │ │
│  │  (start visit)  │  │  {id}/vitals   │  │  {id}/diagnoses │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  Laboratory Management                                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  POST /lab/     │  │  PUT /lab/      │  │  GET /lab/       │ │
│  │  requests       │  │  results/{id}   │  │  results/{id}    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  Billing & Payments                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  GET /billing   │  │  POST /billing/ │  │  PUT /billing/  │ │
│  │  (invoices)     │  │  {id}/payment  │  │  {id}/status     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API FLOW CONTROL                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   JWT Token     │  │   Clinic ID     │  │   User Role     │ │
│  │   Validation    │  │   Extraction    │  │   Authorization │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Rate Limiting │  │   Input         │  │   Audit Logging │ │
│  │   (per clinic)  │  │   Validation    │  │   (all actions) │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Service Layer │  │   Repository    │  │   Domain        │ │
│  │   (Use Cases)   │  │   Layer         │  │   Logic         │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA ACCESS                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Multi-tenant  │  │   Query         │  │   Connection    │ │
│  │   Filtering     │  │   Optimization  │  │   Pooling       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Key Insights**:
- Clinic ID injected into all requests for tenant isolation
- Clinical data endpoints have enhanced security controls
- Pagination and filtering for performance
- Audit logging on all API calls

---

# 1. Authentication & Access Control

## Auth Users
POST /auth/register -> Create user
POST /auth/login -> Authenticate user
POST /auth/refresh -> Refresh JWT token
POST /auth/forgot-password -> Request password reset
POST /auth/reset-password -> Reset password with token
POST /auth/verify-email -> Verify email address
GET /auth/users -> List users (clinic scoped)
GET /auth/users/{id} -> Get user details
PUT /auth/users/{id} -> Update user
DELETE /auth/users/{id} -> Soft delete user

## Roles
GET /roles -> List roles for clinic
POST /roles -> Create role
PUT /roles/{id} -> Update role
DELETE /roles/{id} -> Delete role

## User Roles
POST /user_roles -> Assign role to user
DELETE /user_roles/{id} -> Remove role from user

## Permissions
GET /permissions -> List all system permissions (global)

## Role Permissions
GET /role_permissions -> List permissions assigned to clinic roles
POST /role_permissions -> Assign permission to role
DELETE /role_permissions/{id} -> Remove permission from role

---
# 2. Clinic Management

## Clinics
GET /clinics -> List clinics (admin only)
GET /clinics/{id} -> Get clinic details
PUT /clinics/{id} -> Update clinic info

## Clinic Settings
GET /clinic_settings -> List settings
POST /clinic_settings -> Create setting
PUT /clinic_settings/{id} -> Update setting
DELETE /clinic_settings/{id} -> Delete setting

---
# 3. Patient Management

## Patients
GET /patients -> List patients
GET /patients/{id} -> Get patient details
GET /patients/{id}/summary -> Get patient summary (demographics + basic stats)
POST /patients -> Create patient
PUT /patients/{id} -> Update patient
DELETE /patients/{id} -> Soft delete patient

## Patient Medical History (NEW)
GET /patients/{id}/medical-history -> Get comprehensive medical history
GET /patients/{id}/medical-history/timeline -> Chronological visit timeline
GET /patients/{id}/diagnoses -> All diagnoses for patient
GET /patients/{id}/treatments -> Treatment history
GET /patients/{id}/medications -> Current and past medications
GET /patients/{id}/allergies -> Allergy records
GET /patients/{id}/family-history -> Family medical history
POST /patients/{id}/allergies -> Add allergy record
PUT /patients/{id}/allergies/{allergy_id} -> Update allergy
DELETE /patients/{id}/allergies/{allergy_id} -> Remove allergy
POST /patients/{id}/medications -> Add medication
PUT /patients/{id}/medications/{med_id} -> Update medication
DELETE /patients/{id}/medications/{med_id} -> Remove medication

## Medical History Search & Export (NEW)
GET /patients/{id}/medical-history/search -> Search patient history (by diagnosis, date, keyword)
GET /patients/{id}/medical-history/export -> Export medical records (PDF)
GET /patients/{id}/visit-summary/{visit_id} -> Get specific visit summary for printing

---
# 4. Appointment Management

## Appointments
GET /appointments -> List appointments
GET /appointments/{id} -> Appointment details
POST /appointments -> Schedule appointment
PUT /appointments/{id} -> Update appointment
DELETE /appointments/{id} -> Cancel appointment

## Appointment Notifications (Enhanced)
POST /appointments/{id}/send-reminder -> Send appointment reminder
GET /appointments/{id}/notification-history -> Notification delivery log

---
# 5. Clinical Documentation (ENHANCED)

## Visits
GET /visits -> List visits
GET /visits/{id} -> Visit details (complete clinical record)
POST /visits -> Create visit record
PUT /visits/{id} -> Update visit
PUT /visits/{id}/close -> Close visit (mark as complete)

## Visit Clinical Data (NEW)
GET /visits/{id}/clinical-summary -> Get clinical summary of visit
PUT /visits/{id}/diagnosis -> Add/update diagnosis
PUT /visits/{id}/treatment-plan -> Add/update treatment plan
PUT /visits/{id}/vital-signs -> Record vital signs
GET /visits/{id}/vital-signs -> Get vital signs history

## Diagnoses (NEW)
GET /visits/{id}/diagnoses -> List diagnoses for visit
POST /visits/{id}/diagnoses -> Add diagnosis (doctor only)
PUT /visits/{id}/diagnoses/{diagnosis_id} -> Update diagnosis (doctor only)
DELETE /visits/{id}/diagnoses/{diagnosis_id} -> Remove diagnosis (doctor only)
GET /diagnoses/codes -> Search ICD-10 codes (optional, future)

## Treatment Plans (NEW)
GET /visits/{id}/treatment-plan -> Get treatment plan
POST /visits/{id}/treatment-plan -> Create treatment plan (doctor only)
PUT /visits/{id}/treatment-plan/{plan_id} -> Update treatment plan (doctor only)
POST /visits/{id}/treatment-plan/medications -> Add medication to plan
POST /visits/{id}/treatment-plan/procedures -> Add procedure to plan
POST /visits/{id}/treatment-plan/recommendations -> Add recommendation

## Vital Signs (NEW)
POST /visits/{id}/vital-signs -> Record vital signs
GET /patients/{id}/vital-signs -> Get vital signs history for patient
GET /patients/{id}/vital-signs/chart -> Get vital signs chart data (for pediatric growth charts)

## Visit Notes (Existing, Enhanced)
GET /visit_notes?visit_id={id} -> List notes
POST /visit_notes -> Add note
PUT /visit_notes/{id} -> Update note
DELETE /visit_notes/{id} -> Delete note

## Visit Attachments
POST /visit_attachments -> Upload file
GET /visit_attachments/{id} -> Download file
DELETE /visit_attachments/{id} -> Remove attachment

---
# 6. Laboratory Management (NEW MODULE)

## Lab Requests
GET /lab-requests -> List all lab requests (filtered by status, patient, date)
GET /lab-requests/{id} -> Lab request details
POST /lab-requests -> Create lab order (doctor only)
PUT /lab-requests/{id} -> Update lab request
PUT /lab-requests/{id}/cancel -> Cancel lab request
GET /lab-requests/pending -> List pending lab requests
GET /lab-requests/completed -> List completed lab requests

## Lab Results
GET /lab-requests/{id}/results -> Get lab results
POST /lab-requests/{id}/results -> Enter lab results (lab technician only)
PUT /lab-results/{id} -> Update lab result (lab technician only)
GET /lab-results/{id}/download -> Download result file (PDF/image)
POST /lab-results/{id}/attachments -> Upload result attachment

## Lab Tests & Templates
GET /lab-tests -> List available lab tests
POST /lab-tests -> Create custom lab test
PUT /lab-tests/{id} -> Update lab test
GET /lab-tests/{id}/normal-ranges -> Get normal ranges for test
PUT /lab-tests/{id}/normal-ranges -> Update normal ranges

## Lab Dashboards (NEW)
GET /lab/dashboard -> Lab dashboard (pending requests, turnaround times)
GET /lab/statistics -> Lab statistics (volume, revenue, popular tests)
GET /patients/{id}/lab-history -> All lab results for patient
GET /patients/{id}/lab-history/{test_type} -> Specific test history for trending

## Lab Notifications (NEW)
POST /lab-requests/{id}/notify-doctor -> Notify doctor of completed results
GET /lab-results/abnormal -> List abnormal results requiring attention

---
# 7. Billing (Enhanced with Clinical Integration)

## Services
GET /services -> List services
GET /services/clinical -> List clinical services (consultations, procedures)
GET /services/laboratory -> List laboratory services
POST /services -> Create service
PUT /services/{id} -> Update service
DELETE /services/{id} -> Deactivate service

## Billings
GET /billings -> List bills
GET /billings/{id} -> Bill details
POST /billings -> Create bill
POST /billings/from-visit/{visit_id} -> Create bill from visit (auto-populate clinical services)
PUT /billings/{id} -> Update bill
DELETE /billings/{id} -> Void bill

## Billing Analytics (NEW)
GET /billings/revenue-by-service -> Revenue breakdown by service type
GET /billings/revenue-by-doctor -> Revenue by doctor
GET /billings/lab-revenue -> Laboratory revenue analytics

## Payments
POST /payments -> Record payment
GET /payments/{id} -> Payment details

---
# 8. Clinical Reports & Analytics (NEW MODULE)

## Clinical Reports
GET /reports/common-diagnoses -> Most common diagnoses (ICD-10 compatible)
GET /reports/disease-prevalence -> Disease prevalence over time
GET /reports/patient-demographics -> Patient demographic breakdown
GET /reports/doctor-productivity -> Doctor productivity (patients, diagnoses, revenue)
GET /reports/lab-utilization -> Lab test volumes and trends

## Pediatric Reports (NEW)
GET /reports/pediatric/growth-charts -> Growth chart data
GET /reports/pediatric/vaccine-compliance -> Vaccine schedule compliance
GET /reports/pediatric/developmental-milestones -> Milestone tracking

## Operational Reports (Existing)
GET /reports/appointments -> Appointment statistics
GET /reports/no-shows -> No-show rates
GET /reports/revenue -> Revenue reports

---
# 9. Audit Logs (Enhanced)

## Audit Logs
GET /audit_logs -> List logs (admin/owner)
GET /audit_logs/{id} -> Log details
GET /audit_logs/clinical -> Clinical data access logs
GET /audit_logs/user/{user_id} -> User activity logs
GET /audit_logs/patient/{patient_id} -> Patient record access logs

---
# 10. Notifications (Enhanced)

## SMS/Email Notifications
POST /notifications/send -> Send notification
POST /notifications/appointment-reminder -> Send appointment reminder
POST /notifications/lab-result-ready -> Notify lab result ready
GET /notifications/history -> Notification delivery history
GET /notifications/templates -> List notification templates
POST /notifications/templates -> Create notification template
PUT /notifications/templates/{id} -> Update notification template

## Notification Preferences
GET /users/{id}/notification-preferences -> Get user notification preferences
PUT /users/{id}/notification-preferences -> Update notification preferences

---
# 11. Parent Portal API (NEW)

## Parent Access
GET /parent/children -> List child profiles for parent account
GET /parent/children/{child_id} -> Get child details
GET /parent/children/{child_id}/appointments -> Child's appointments
GET /parent/children/{child_id}/medical-summary -> Limited medical summary (with permissions)
GET /parent/children/{child_id}/vaccines -> Vaccine records
GET /parent/children/{child_id}/growth-chart -> Growth chart data
GET /parent/notifications -> Parent's notification history
PUT /parent/notification-preferences -> Update parent notification settings

---
# 12. Search & Global Features (NEW)

## Global Search
GET /search -> Global search across patients, visits, diagnoses
GET /search/patients -> Search patients by name, code, contact
GET /search/diagnoses -> Search by diagnosis/ICD code
GET /search/lab-results -> Search lab results

## Data Export
GET /export/patients -> Export patient list (CSV)
GET /export/visits -> Export visit records (CSV)
GET /export/lab-results -> Export lab data (CSV)
GET /export/billing -> Export billing data (CSV)

---
# Notes
- All endpoints must include `clinic_id` in request headers or JWT for multi-tenant scoping
- Clinical endpoints enforce role-based permissions (doctor, lab technician)
- Enhanced audit logging for all clinical data access
- Pagination and filtering supported on all GET lists
- Date range filters available for clinical and lab reports
- Sensitive clinical data encrypted in transit and at rest

---

**CHANGES FROM PREVIOUS VERSION:**
1. Added Patient Medical History endpoints (comprehensive history, timeline, search, export)
2. Added Clinical Documentation endpoints (diagnoses, treatment plans, vital signs)
3. NEW: Laboratory Management module (requests, results, dashboards, analytics)
4. NEW: Clinical Reports & Analytics module
5. NEW: Parent Portal API endpoints
6. Enhanced billing with clinical service integration
7. Enhanced audit logs with clinical data tracking
8. Added notification endpoints for lab results
9. Added search and export capabilities for clinical data
10. Authentication endpoints expanded (refresh, password reset, email verification)