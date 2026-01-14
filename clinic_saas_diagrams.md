# Clinic SaaS Architecture Diagrams (Text Format)

## Documentation Guide

This document contains comprehensive architectural diagrams for the Pediatric Clinic SaaS platform. All diagrams are presented in ASCII text format for easy version control and tool-agnostic viewing.

### How to Use These Diagrams

1. **Reading Text Diagrams**: Start from top-left, follow arrows (→, ↓, ───) to understand flow
2. **Converting to Visual**: Copy any diagram into Draw.io, Lucidchart, or PlantUML for professional rendering
3. **Navigation**: Each diagram is numbered and has clear section headers
4. **Cross-References**: Diagrams reference each other where relevant

---

## Diagram Index & Documentation

### 1. Entity-Relationship Diagram (ERD) - Core Database Schema

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

**Key Insights**:
- Clinics are the root tenant entity
- Patients can have parent-child relationships (parent_patient_id)
- RBAC system with roles → permissions through user_roles and role_permissions
- Clinical data is comprehensive (diagnoses, vitals, medications, allergies)
- Audit logging captures all changes for compliance

**Business Impact**: Ensures data integrity and supports complex clinical workflows while maintaining tenant isolation.

---

### 2. System Architecture Diagram

**Purpose**: High-level overview of the entire system architecture from user interfaces to infrastructure.

**What it Shows**:
- Four main layers: Client, API Gateway, Application, Data/Infrastructure
- Technology stack choices (React, Node.js, MySQL, Redis)
- Multi-tenant SaaS architecture
- Security and monitoring components

**How to Read**:
- Flow is top-to-bottom (Client → Infrastructure)
- Boxes represent components or services
- Arrows show data/communication flow
- Layered approach ensures separation of concerns

**Key Insights**:
- Multi-tenant from ground up (clinic isolation)
- Scalable architecture with load balancers and caching
- Security-first design with encryption and access controls
- External integrations for payments, SMS, and lab systems

**Business Impact**: Provides foundation for reliable, secure healthcare platform that can scale with clinic growth.

---

### 3. Clinical Workflow Sequence Diagram

**Purpose**: Detailed patient journey from arrival to visit completion, showing all clinical and operational steps.

**What it Shows**:
- Complete patient visit workflow
- Role responsibilities (Patient, Reception, Doctor, Lab, Billing)
- Data flow between systems and people
- Critical clinical decision points

**How to Read**:
- Time flows left to right, then top to bottom
- Boxes represent people/systems, arrows show actions
- Parallel paths show concurrent activities
- Decision points branch based on clinical needs

**Key Insights**:
- Clear separation between operational (appointments, billing) and clinical (diagnoses, treatments) workflows
- Lab integration is asynchronous (order → process → results)
- Audit trail required for all clinical actions
- Patient consent and data privacy considerations

**Business Impact**: Ensures efficient clinic operations while maintaining clinical quality and regulatory compliance.

---

### 4. API Endpoint Flow Diagram

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

**Key Insights**:
- Clinic ID injected into all requests for tenant isolation
- Clinical data endpoints have enhanced security controls
- Pagination and filtering for performance
- Audit logging on all API calls

**Business Impact**: Provides secure, scalable API foundation for web/mobile applications and third-party integrations.

---

### 5. Data Flow Diagram (Compliance-Focused)

**Purpose**: Healthcare data lifecycle showing classification, protection, and compliance controls.

**What it Shows**:
- PHI (Protected Health Information) data classification
- Encryption and access control layers
- Regulatory compliance frameworks (PH Data Privacy Act, HIPAA-like)
- Data retention and destruction policies

**How to Read**:
- Data flows left to right through processing stages
- Security layers wrap around data handling
- Compliance controls shown as parallel requirements
- Risk levels (public → confidential → PHI) determine protection levels

**Key Insights**:
- PHI data requires encryption at rest and in transit
- Role-based access prevents unauthorized clinical data access
- Audit logging is immutable for compliance
- Data minimization principle applied

**Business Impact**: Ensures regulatory compliance and builds patient trust through data protection.

---

### 6. Component Interaction Diagram

**Purpose**: Current system structure and future microservices migration path.

**What it Shows**:
- Current monolithic application architecture
- Future microservices decomposition
- Service boundaries and communication patterns
- Data consistency strategies

**How to Read**:
- Current state shows layered monolith
- Future state shows service mesh with individual microservices
- Arrows indicate service dependencies and communication
- Migration phases show incremental decomposition

**Key Insights**:
- Auth service extracted first (security-critical)
- Clinical service isolated for PHI protection
- Event-driven architecture for lab results
- Saga pattern for distributed transactions

**Business Impact**: Provides roadmap for scalable, maintainable architecture evolution.

---

### 7. Deployment Architecture Diagram

**Purpose**: Production infrastructure design for high availability and scalability.

**What it Shows**:
- Load balancing and auto-scaling setup
- Database architecture (separate DBs per tenant)
- Backup and disaster recovery
- Monitoring and logging infrastructure

**How to Read**:
- Traffic flow from internet to database
- Redundancy shown with multiple instances
- Backup flows indicated with separate paths
- Monitoring overlays all components

**Key Insights**:
- Separate databases per clinic for complete isolation
- Multi-region deployment for disaster recovery
- Automated scaling based on load
- Comprehensive monitoring for healthcare reliability

**Business Impact**: Ensures 99.9% uptime and data protection for critical healthcare operations.

---

### 8. User Interface Flow Diagrams

**Purpose**: User experience journeys for different roles in the system.

**What it Shows**:
- Four distinct user portals (Patient, Staff, Doctor, Admin)
- Navigation patterns and key user tasks
- UI/UX considerations for healthcare workflows
- Accessibility and usability features

**How to Read**:
- Each role has its own journey map
- Arrows show primary navigation paths
- Parallel paths show alternative workflows
- Key screens highlighted as major decision points

**Key Insights**:
- Role-specific interfaces reduce cognitive load
- Clinical workflows prioritize data accuracy
- Mobile-responsive design for all roles
- Accessibility compliance for healthcare users

**Business Impact**: Ensures efficient, error-free workflows that support clinical decision-making.

---

### 9. Integration Diagrams

**Purpose**: External system connections and data exchange patterns.

**What it Shows**:
- Payment processors, SMS gateways, lab systems
- Healthcare standards (HL7, ICD-10, LOINC)
- Government system integrations (future)
- Security and compliance for integrations

**How to Read**:
- External systems shown at top, integration layer in middle
- Adapter pattern for protocol translation
- Security controls wrap all integrations
- Data flows show request/response patterns

**Key Insights**:
- Adapter pattern isolates external system changes
- Healthcare standards ensure interoperability
- Webhook security for real-time updates
- Fallback mechanisms for integration failures

**Business Impact**: Enables seamless connection with healthcare ecosystem while maintaining security.

---

## Implementation Notes

### Converting to Visual Diagrams

**Recommended Tools**:
- **Draw.io**: Free, web-based, supports importing text diagrams
- **Lucidchart**: Professional diagramming with healthcare templates
- **PlantUML**: Code-based diagram generation from text
- **Mermaid**: Similar to PlantUML, integrates with Markdown

**Conversion Process**:
1. Copy diagram text to chosen tool
2. Adjust styling for healthcare/clinical themes
3. Add colors for different data types (PHI = red, Public = green)
4. Export as PNG/PDF for documentation

### Maintenance Guidelines

- Update diagrams when schema changes occur
- Version control all diagram changes
- Review diagrams during architecture decision records (ADRs)
- Include diagrams in code reviews for new features

### Compliance Considerations

- PHI data flows clearly marked and protected
- Audit trails shown for all clinical operations
- Multi-tenant isolation demonstrated
- Regulatory requirements (PH Data Privacy Act) addressed

---

## 1. Entity-Relationship Diagram (ERD) - Core Schema

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
│ id (PK)         │       │ id (PK)          │
│ billing_id (FK) │       │ billing_id (FK)  │
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

## 2. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Clinic SaaS - System Architecture            │
│                    Multi-Tenant Healthcare Platform             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Web Browser   │  │   Mobile App    │  │   Admin Portal  │ │
│  │   (React/Vue)   │  │   (React Native)│  │   (React)       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API GATEWAY LAYER                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Nginx/HAProxy │  │   Rate Limiting │  │   SSL/TLS       │ │
│  │   Load Balancer │  │   & Throttling  │  │   Termination    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   REST API      │  │   Authentication │  │   Authorization│  │
│  │   (Node.js/     │  │   Service        │  │   Service        ││
│  │    Python)      │  │   (JWT/OAuth)   │  │   (RBAC)         │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Patient Mgmt  │  │   Appointment   │  │   Clinical      │ │
│  │   Service       │  │   Service       │  │   Service       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Lab Mgmt      │  │   Billing       │  │   Reporting     │ │
│  │   Service       │  │   Service       │  │   Service       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   MySQL DB      │  │   Redis Cache   │  │   File Storage  │ │
│  │   (Multi-tenant)│  │   (Sessions)    │  │   (S3/MinIO)    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                      INFRASTRUCTURE LAYER                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Docker        │  │   Kubernetes    │  │   AWS/GCP/Azure │ │
│  │   Containers    │  │   Orchestration │  │   Cloud         │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Monitoring    │  │   Logging       │  │   Backup        │ │
│  │   (Prometheus)  │  │   (ELK Stack)   │  │   (Automated)    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                     EXTERNAL INTEGRATIONS                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   SMS Gateway   │  │   Payment       │  │   Lab Systems   │ │
│  │   (Twilio/etc)  │  │   Processors     │  │   (HL7/API)     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 3. Clinical Workflow Sequence Diagram

```
Patient Visit Workflow:
======================

Patient/Staff → Reception → Doctor → Lab → Billing → Complete

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Patient   │     │  Reception  │     │   Doctor    │
│  Arrives    │────▶│  Check-in   │────▶│ Assessment  │
└─────────────┘     └─────────────┘     └─────────────┘
                        │                       │
                        │                       │
                        ▼                       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│Appointment  │     │   Vital     │     │ Diagnosis   │
│  Scheduled  │◀────│   Signs     │────▶│   & Plan    │
└─────────────┘     └─────────────┘     └─────────────┘
                                                      │
                                                      │
                                                      ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Lab       │     │   Results   │     │   Treatment │
│   Order     │────▶│   Entry     │────▶│   & Rx      │
└─────────────┘     └─────────────┘     └─────────────┘
                        │                       │
                        │                       │
                        ▼                       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Billing   │     │   Payment   │     │   Complete  │
│   Invoice   │────▶│   Process   │────▶│   Visit     │
└─────────────┘     └─────────────┘     └─────────────┘

Detailed Sequence:
================

1. Patient Registration/Appointment Booking
   Patient → Reception Staff → System (Create/Update Patient Record)

2. Check-in Process
   Reception Staff → System → Create Visit Record
   Link to Appointment if exists

3. Clinical Assessment
   Doctor → System → Record Vital Signs
   Doctor → System → Record Chief Complaint
   Doctor → System → Enter Diagnosis (ICD-10)
   Doctor → System → Create Treatment Plan

4. Laboratory Orders (if needed)
   Doctor → System → Create Lab Request
   System → Lab Technician → Notification
   Lab Technician → System → Process Samples
   Lab Technician → System → Enter Results
   Doctor → System → Review/Verify Results

5. Prescription & Treatment
   Doctor → System → Create Prescription
   Doctor → System → Update Treatment Notes

6. Billing Process
   System → Auto-generate Invoice
   Reception Staff → System → Record Payment
   System → Send Receipt/Invoice

7. Visit Closure
   Doctor → System → Close Visit
   System → Update Appointment Status
   System → Send Follow-up Reminders (if needed)

Key Data Flows:
==============

Patient Data Flow:
- Demographics → Visits → Diagnoses → Treatments → Billing

Clinical Data Flow:
- Vital Signs → Diagnoses → Lab Orders → Results → Prescriptions

Administrative Flow:
- Appointments → Visits → Billing → Payments → Reports

Security Considerations:
======================

- All clinical data encrypted at rest/transit
- Role-based access (Doctor vs Staff vs Admin)
- Audit logging for all clinical actions
- PHI compliance (HIPAA/PH Data Privacy Act)
- Multi-tenant data isolation
```

## 4. API Endpoint Flow Diagram

```
Clinic SaaS API Architecture:
============================

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

API Request Flow:
================

Client Request → API Gateway → Authentication → Authorization → Rate Limiting
       ↓              ↓             ↓             ↓             ↓
   Validation → Business Logic → Data Access → Database → Response Generation
       ↑              ↑             ↑             ↑             ↑
   Error Handling ← Audit Logging ← Encryption ← Multi-tenant Isolation

Key API Patterns:
===============

1. RESTful Resource Management
   - CRUD operations on all entities
   - Consistent URL patterns: /resource, /resource/{id}
   - HTTP status codes for responses

2. Multi-tenant Context
   - Clinic ID extracted from JWT token
   - Automatic filtering on all queries
   - Tenant isolation at database level

3. Clinical Data Protection
   - PHI encryption for sensitive fields
   - Role-based field access
   - Audit trail for all clinical operations

4. Pagination & Filtering
   - Cursor-based pagination for large datasets
   - Date range, status, search filters
   - Optimized queries for performance
```

## 5. Data Flow Diagram (Compliance-Focused)

```
Healthcare Data Flow & Compliance Architecture:
==============================================

┌─────────────────────────────────────────────────────────────────┐
│                    DATA CLASSIFICATION                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Public Data   │  │   Internal Data │  │   Confidential  │ │
│  │   (Clinic info, │  │   (User data,   │  │   Data (PHI)    │ │
│  │    services)    │  │    appointments)│  │                 │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DATA FLOW CONTROL                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Input         │  │   Processing    │  │   Storage       │ │
│  │   Validation    │  │   & Business    │  │   Encryption    │ │
│  │   & Sanitization│  │   Logic         │  │   (AES-256)     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Access        │  │   Audit         │  │   Backup        │ │
│  │   Control       │  │   Logging       │  │   & Recovery    │ │
│  │   (RBAC)        │  │   (immutable)   │  │   (encrypted)    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                  COMPLIANCE CONTROLS                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   PH Data       │  │   HIPAA-like    │  │   GDPR          │ │
│  │   Privacy Act   │  │   Controls      │  │   Compliance    │ │
│  │   (Philippines) │  │   (Healthcare)  │  │   (EU Data)     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Data          │  │   Consent       │  │   Data          │ │
│  │   Retention     │  │   Management    │  │   Portability   │ │
│  │   Policies      │  │   (Patient)     │  │   (Export)      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

Data Lifecycle:
==============

1. Data Creation/Ingestion
   User Input → Validation → Sanitization → Classification → Encryption

2. Data Processing
   Decryption → Business Logic → Access Control → Audit Logging → Re-encryption

3. Data Storage
   Encrypted Storage → Access Logging → Backup → Retention Policy → Deletion

4. Data Access
   Authentication → Authorization → Decryption → Usage Logging → Re-encryption

5. Data Export/Sharing
   Consent Verification → Data Extraction → Anonymization → Secure Transfer

PHI Data Elements:
=================

High-Risk PHI (Strict Controls):
- Patient diagnoses (ICD-10 codes)
- Treatment plans and notes
- Laboratory results and values
- Medication history and prescriptions
- Vital signs and measurements

Medium-Risk PHI (Standard Controls):
- Patient demographics (name, DOB, contact)
- Appointment schedules and history
- Billing and payment information
- Medical history summaries

Low-Risk Data (Basic Controls):
- Clinic operational data
- User access logs (non-PHI)
- System configuration
- Public service information

Security Layers:
==============

Network Security:
- SSL/TLS encryption for all connections
- IP whitelisting for admin access
- DDoS protection and rate limiting

Application Security:
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection

Data Security:
- Database encryption at rest
- Field-level encryption for PHI
- Secure key management
- Data masking for logs

Access Security:
- Multi-factor authentication
- Role-based access control
- Principle of least privilege
- Session management and timeouts
```

## 6. Component Interaction Diagram

```
Microservices Architecture (Future State):
=======================================

┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE MESH                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   API Gateway   │  │   Service       │  │   Configuration │ │
│  │   (Istio/Envoy) │  │   Discovery     │  │   Management    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                   MICROSERVICES                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Auth Service  │  │   User Mgmt     │  │   Patient Mgmt  │ │
│  │   (JWT, OAuth)  │  │   Service       │  │   Service       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Appointment   │  │   Clinical      │  │   Lab Mgmt      │ │
│  │   Service       │  │   Service       │  │   Service       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Billing       │  │   Notification  │  │   Reporting     │ │
│  │   Service       │  │   Service       │  │   Service       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                 SHARED INFRASTRUCTURE                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Message Bus   │  │   Cache         │  │   Database      │ │
│  │   (Kafka/Rabbit)│  │   (Redis)       │  │   (MySQL)       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   File Storage  │  │   Monitoring    │  │   Logging       │ │
│  │   (S3/MinIO)    │  │   (Prometheus)  │  │   (ELK)         │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

Current Monolithic Architecture:
==============================

┌─────────────────────────────────────────────────────────────────┐
│                    MONOLITHIC APPLICATION                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Web Layer     │  │   API Layer     │  │   Service Layer │ │
│  │   (React)       │  │   (Express)     │  │   (Business      │ │
│  │                 │  │                 │  │    Logic)       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Repository    │  │   Database      │  │   Cache         │ │
│  │   Layer         │  │   Layer         │  │   Layer         │ │
│  │   (Data Access) │  │   (MySQL)       │  │   (Redis)       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

Migration Path to Microservices:
==============================

Phase 1: Service Extraction
- Extract Auth Service (highest security requirements)
- Extract Notification Service (async processing)
- Keep core clinical logic monolithic

Phase 2: Domain Separation
- Extract Patient Management Service
- Extract Clinical Service (PHI handling)
- Extract Lab Management Service

Phase 3: Infrastructure Services
- Extract Billing Service
- Extract Reporting Service
- Implement service mesh

Phase 4: Event-Driven Architecture
- Implement event sourcing for clinical events
- Add CQRS for reporting
- Message-driven inter-service communication

Service Boundaries:
=================

Auth Service:
- User authentication and authorization
- JWT token management
- Role and permission management
- Multi-tenant context handling

Patient Management Service:
- Patient CRUD operations
- Patient search and filtering
- Parent-child relationships
- Patient demographics management

Clinical Service:
- Visit management
- Diagnosis and treatment recording
- Vital signs management
- Clinical notes and documentation

Lab Management Service:
- Lab test catalog management
- Lab order processing
- Result entry and verification
- Lab workflow management

Billing Service:
- Invoice generation
- Payment processing
- Service pricing management
- Financial reporting

Communication Patterns:
=====================

Synchronous Communication:
- REST APIs for user-facing operations
- gRPC for internal service communication
- GraphQL for complex data fetching

Asynchronous Communication:
- Message queues for lab results
- Event streaming for audit logging
- Background processing for reports

Data Consistency:
- Saga pattern for distributed transactions
- Event sourcing for clinical data
- CQRS for read/write optimization
```

## 7. Deployment Architecture Diagram

```
Production Deployment Architecture:
=================================

┌─────────────────────────────────────────────────────────────────┐
│                    LOAD BALANCER LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Cloud Load    │  │   SSL           │  │   DDoS           │ │
│  │   Balancer      │  │   Termination   │  │   Protection     │ │
│  │   (AWS ALB)     │  │   (Let's Encrypt)│  │   (Cloudflare)   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Web Servers   │  │   API Servers   │  │   Background     │ │
│  │   (Nginx)       │  │   (Node.js)     │  │   Workers        │ │
│  │   Auto-scaling  │  │   Auto-scaling  │  │   (Queue)        │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CACHE & SESSION LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Redis Cluster │  │   Session Store │  │   API Cache     │ │
│  │   (High Avail)  │  │   (Encrypted)   │  │   (Fast Data)   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                   DATABASE LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Primary DB    │  │   Read Replicas │  │   Backup DB      │ │
│  │   (MySQL)       │  │   (3 nodes)     │  │   (Cross-region) │ │
│  │   Multi-tenant  │  │   Load balanced │  │   Disaster       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                   STORAGE & BACKUP LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   File Storage  │  │   Database      │  │   Log Storage   │ │
│  │   (S3)          │  │   Backups       │  │   (S3 Glacier)  │ │
│  │   Encrypted     │  │   Encrypted     │  │   Compressed    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                   MONITORING & LOGGING                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Application   │  │   Infrastructure │  │   Log           │ │
│  │   Monitoring    │  │   Monitoring     │  │   Aggregation   │ │
│  │   (New Relic)   │  │   (CloudWatch)   │  │   (ELK Stack)   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

Multi-Tenant Database Architecture:
==================================

┌─────────────────────────────────────────────────────────────────┐
│                DATABASE ISOLATION STRATEGIES                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Option 1: Separate Databases (Recommended for Healthcare)     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Clinic A DB   │  │   Clinic B DB   │  │   Clinic C DB   │ │
│  │   (Dedicated)   │  │   (Dedicated)   │  │   (Dedicated)   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  Option 2: Schema Separation (Cost Effective)                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Shared Database                          │ │
│  ├─────────────────┬─────────────────┬─────────────────┬─────┤ │
│  │   clinic_a      │   clinic_b      │   clinic_c      │ ... │ │
│  │   schema        │   schema        │   schema        │     │ │
│  └─────────────────┴─────────────────┴─────────────────┴─────┘ │
│                                                                 │
│  Option 3: Row-Level Security (Complex)                         │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Shared Tables                            │ │
│  │   clinic_id column in every table for filtering             │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

Recommended: Separate Databases per Clinic
=========================================

Pros:
- Complete data isolation (regulatory compliance)
- Performance isolation (no noisy neighbors)
- Simplified backup/restore per clinic
- Easier scaling per clinic needs
- Better security boundaries

Cons:
- Higher infrastructure costs
- More complex provisioning
- Connection management complexity

Implementation:
- Database-per-tenant pattern
- Connection pooling per tenant
- Automated provisioning scripts
- Centralized schema management

Scaling Strategy:
===============

Vertical Scaling:
- Increase instance size for growing clinics
- Memory optimization for large datasets
- Read replicas for reporting queries

Horizontal Scaling:
- Database sharding by clinic ID ranges
- Geographic distribution for global clinics
- Multi-region replication for disaster recovery

Backup Strategy:
==============

Daily Backups:
- Full database backups (encrypted)
- Point-in-time recovery capability
- Cross-region replication
- 30-day retention

Continuous Backup:
- Transaction log shipping
- Real-time replication to standby
- Automated failover testing

Disaster Recovery:
- Multi-region deployment
- Automated failover (RTO < 4 hours)
- Data consistency verification
- Regular DR drills
```

## 8. User Interface Flow Diagrams

```
Patient Portal User Journey:
==========================

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Landing   │────▶│   Login/    │────▶│   Dashboard │
│   Page      │     │   Register  │     │   (Home)    │
└─────────────┘     └─────────────┘     └─────────────┘
                        │                       │
                        │                       │
                        ▼                       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│Book Appoint-│     │   Profile   │     │   Medical   │
│   ment      │◀────│   Settings  │────▶│   History   │
└─────────────┘     └─────────────┘     └─────────────┘
                                                      │
                                                      │
                                                      ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Lab       │     │   Billing   │     │   Messages  │
│   Results   │────▶│   & Pay-    │────▶│   & Noti-   │
│             │     │   ments     │     │   fications │
└─────────────┘     └─────────────┘     └─────────────┘

Staff Portal User Journey:
========================

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Login     │────▶│   Dashboard │────▶│   Patient   │
│   (Staff)   │     │   (Today's  │     │   Search    │
│             │     │    Tasks)   │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
                        │                       │
                        │                       │
                        ▼                       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Appoint-  │     │   Patient   │     │   Billing   │
│   ment      │◀────│   Records   │────▶│   Queue     │
│   Calendar  │     │   (View)    │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
                                                      │
                                                      │
                                                      ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Reports   │     │   Settings  │     │   Help/     │
│   & Stats   │────▶│   (Clinic)  │────▶│   Support   │
└─────────────┘     └─────────────┘     └─────────────┘

Doctor Portal User Journey:
=========================

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Login     │────▶│   Dashboard │────▶│   Today's   │
│   (Doctor)  │     │   (Schedule)│     │   Patients  │
└─────────────┘     └─────────────┘     └─────────────┘
                        │                       │
                        │                       │
                        ▼                       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Patient   │     │   Start     │     │   Record    │
│   Queue     │◀────│   Visit     │────▶│   Vitals    │
└─────────────┘     └─────────────┘     └─────────────┘
                                                      │
                                                      │
                                                      ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Diagnosis │     │   Lab       │     │   Prescribe │
│   & Plan    │────▶│   Orders    │────▶│   Treatment │
└─────────────┘     └─────────────┘     └─────────────┘
                        │                       │
                        │                       │
                        ▼                       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Review    │     │   Close     │     │   Reports   │
│   Results   │────▶│   Visit     │────▶│   & Stats   │
└─────────────┘     └─────────────┘     └─────────────┘

Admin Portal User Journey:
========================

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Login     │────▶│   Dashboard │────▶│   User      │
│   (Admin)   │     │   (Overview)│     │   Management│
└─────────────┘     └─────────────┘     └─────────────┘
                        │                       │
                        │                       │
                        ▼                       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Clinic    │     │   Roles &   │     │   Services  │
│   Settings  │◀────│   Permissions│────▶│   & Pricing │
└─────────────┘     └─────────────┘     └─────────────┘
                                                      │
                                                      │
                                                      ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Reports   │     │   Billing   │     │   System    │
│   & Analytics│────▶│   & Revenue│────▶│   Health    │
└─────────────┘     └─────────────┘     └─────────────┘

Key UI Patterns:
==============

Navigation Patterns:
- Left sidebar for main navigation
- Top bar for user actions and notifications
- Breadcrumb navigation for deep pages
- Tab-based navigation for related sections

Data Display Patterns:
- Data tables with sorting, filtering, pagination
- Cards for summary information
- Timeline views for patient history
- Calendar views for appointments

Form Patterns:
- Step-by-step wizards for complex processes
- Inline editing for quick updates
- Modal dialogs for confirmations
- Progressive disclosure for advanced options

Clinical UI Considerations:
- Large, readable fonts for medical data
- Color coding for status indicators
- Clear labeling for medical terminology
- Keyboard navigation for efficiency
- Mobile-responsive design

Accessibility Features:
- WCAG 2.1 AA compliance
- Screen reader support
- High contrast mode
- Keyboard-only navigation
- Focus management
```

## 9. Integration Diagrams

```
External System Integrations:
============================

┌─────────────────────────────────────────────────────────────────┐
│                    PAYMENT PROCESSORS                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   PayPal        │  │   Stripe        │  │   GCash         │ │
│  │   Integration   │  │   (Credit Card) │  │   (Philippines)  │ │
│  │   (Global)      │  │   (International│  │   (Local)       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                   COMMUNICATION SERVICES                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   SMS Gateway   │  │   Email Service │  │   Push          │ │
│  │   (Twilio)      │  │   (SendGrid)    │  │   Notifications  │ │
│  │   (Reminders)   │  │   (Invoices)    │  │   (Mobile App)   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                   LABORATORY SYSTEMS                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   LIS Systems   │  │   HL7 Standard │  │   API            │ │
│  │   (Hospital Labs│  │   Integration   │  │   Integration    │ │
│  │   )             │  │   (v2/v3)       │  │   (REST)         │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                   HEALTHCARE STANDARDS                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   ICD-10        │  │   LOINC         │  │   SNOMED CT     │ │
│  │   (Diagnosis)   │  │   (Lab Tests)   │  │   (Clinical     │ │
│  │   Codes         │  │   Codes         │  │   Terminology)  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                   GOVERNMENT SYSTEMS                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   PhilHealth    │  │   DOH Systems   │  │   Insurance      │ │
│  │   (Future)      │  │   (Reporting)   │  │   Providers      │ │
│  │   Integration   │  │   (Phase 2+)   │  │   (Phase 2+)     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

Integration Architecture:
=======================

┌─────────────────────────────────────────────────────────────────┐
│                   INTEGRATION LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   API Gateway   │  │   Message       │  │   Event Bus     │ │
│  │   (External)    │  │   Queue         │  │   (Internal)    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Data          │  │   Protocol      │  │   Security       │ │
│  │   Transformation│  │   Translation   │  │   & Encryption  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ADAPTER PATTERN                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Payment       │  │   SMS Adapter   │  │   Lab System    │ │
│  │   Adapter       │  │   (Twilio)      │  │   Adapter       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Email         │  │   HL7 Adapter   │  │   FHIR Adapter   │ │
│  │   Adapter       │  │   (Lab)         │  │   (Future)       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

Payment Integration Flow:
=======================

1. Invoice Generation
   Clinic SaaS → Generate Invoice → Store in Database

2. Payment Initiation
   Patient → Select Payment Method → Redirect to Payment Processor

3. Payment Processing
   Payment Processor → Process Payment → Return Success/Failure

4. Payment Confirmation
   Clinic SaaS → Receive Webhook → Update Invoice Status → Send Receipt

5. Reconciliation
   Daily → Fetch Payment Reports → Match with Invoices → Update Records

SMS Integration Flow:
===================

1. Event Trigger
   System Event → Check SMS Settings → Queue SMS Message

2. Message Processing
   SMS Service → Format Message → Send via Gateway

3. Delivery Tracking
   Gateway → Delivery Receipt → Update Message Status

4. Retry Logic
   Failed Delivery → Retry Queue → Escalation if persistent failure

Lab Integration Flow:
===================

1. Order Creation
   Doctor → Create Lab Request → Send to Lab System

2. Order Processing
   Lab System → Receive Order → Process Samples → Generate Results

3. Result Transmission
   Lab System → Format Results (HL7/API) → Send to Clinic SaaS

4. Result Processing
   Clinic SaaS → Parse Results → Store in Database → Notify Doctor

5. Result Verification
   Doctor → Review Results → Verify/Comment → Finalize in Patient Record

Integration Security:
===================

API Security:
- OAuth 2.0 / JWT for authentication
- API key management
- Rate limiting and throttling
- Request signing for webhooks

Data Security:
- TLS 1.3 for all connections
- Data encryption in transit and at rest
- PHI data masking in logs
- Secure key management

Compliance:
- Audit logging for all integrations
- Data retention policies
- Consent management for data sharing
- Regular security assessments

Monitoring & Alerting:
- Integration health checks
- Error rate monitoring
- Performance metrics
- Automated retry mechanisms
```
```
```</content>
<parameter name="filePath">c:\Users\user\Documents\GitHub\Clinic\clinic_saas_diagrams.md