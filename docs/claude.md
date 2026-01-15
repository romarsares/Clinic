# claude.md
# AI Law File for Pediatric / Clinic Operations SaaS
# DO NOT VIOLATE THESE RULES

---

## 1. Core Philosophy
- AI executes only inside explicit constraints
- AI does **not decide architecture, scope, or priorities**
- AI must **stop and ask** if instructions are unclear
- AI is **an assistant**, not the product owner

---

## 2. Allowed Tech Stack
- Backend: Java (Spring Boot) / Node.js
- Database: MySQL 8
- Frontend: React / Vue / HTML-CSS-JS
- Notifications: SMS / Email gateways
- Multi-tenant support required
- Git for version control

**Rule:** No new dependencies without approval

---

## 3. Denied Actions
- ❌ Add new features outside `prd.md` scope
- ❌ Refactor unrelated code without explicit instructions
- ❌ Merge backend and frontend logic inappropriately
- ❌ Bypass RBAC or tenant isolation
- ❌ Change scope mid-phase
- ❌ Store sensitive clinical data without proper encryption and access controls
- ❌ Skip compliance validation for healthcare data

---

## 4. Architecture Rules
- Multi-tenant from day one
- Parent-child relationship enforced for pediatric clinics
- RBAC strictly applied: Owner > Doctor > Staff > Lab Technician > Admin
- **Clinical data handling:**
  - Visit records include diagnosis, treatment plans, and clinical notes
  - Patient history includes medical records, allergies, medications
  - Lab results properly linked to patients and visits
  - Enhanced encryption for sensitive health information
- Phases must be respected (tasks.md)
- Layers separated: backend, frontend, DB
- Modular design for future pediatric/EHR features

---

## 5. File & Naming Conventions
- Backend: `/src/backend/...`  
- Frontend: `/src/frontend/...`  
- Tenant modules: `/modules/tenant/...`  
- Files: `camelCase.js` or `PascalCase.java` as appropriate
- Config: `/config/...`  
- Tests: `/tests/...`

---

## 6. UI Discipline
- English-first UI
- Clean, clinical-grade interface for medical workflows
- Parent portal and staff dashboard clearly separated
- **Clinical terminology used appropriately:**
  - Diagnosis fields labeled clearly
  - Treatment plan sections structured
  - Lab results displayed with normal ranges
- Consistent date / time format
- Feedback and errors visible and clear
- Medical data entry validation

---

## 7. Backend Discipline
- DB isolation per tenant
- **Enhanced encryption for clinical data:**
  - Diagnoses encrypted at rest
  - Lab results encrypted at rest
  - Patient medical history encrypted at rest
- Input validation on all endpoints
- **Clinical data access controls:**
  - Only doctors can enter diagnoses
  - Only lab technicians can enter lab results
  - Audit logs for all clinical data access
- Sensitive fields (DOB, clinical data) protected

---

## 8. Security Guardrails
- RBAC enforced at all levels
- Tenant data cannot be accessed by other tenants
- Passwords hashed
- TLS for all client-server communication
- **Clinical data protection:**
  - Separate encryption keys for clinical vs operational data
  - Enhanced audit logging for medical record access
  - Automatic session timeout for clinical workstations
  - Role-based restrictions on diagnosis and lab data
- **Compliance requirements:**
  - PH Data Privacy Act compliance for sensitive health information
  - Medical record retention policies enforced
  - Data breach notification procedures

---

## 9. Error Handling Rules
- All exceptions logged
- No raw stack traces sent to front-end
- **Clinical data errors handled carefully:**
  - Lab result entry failures logged and alerted
  - Diagnosis save failures require immediate notification
  - Medical record access failures audited
- Graceful handling of failed appointments, notifications, or billing

---

## 10. Auth & Permissions Rules
- **Owner:** full tenant access including clinical reports
- **Doctor:** full clinical access (diagnoses, treatment plans, medical history, order labs)
- **Lab Technician:** lab request viewing, lab result entry only
- **Staff:** appointment and billing access, view patient demographics (no clinical access)
- **Admin:** system-level access (multi-tenant management, no clinical data access)
- **Parent:** child profile, appointments, notifications, limited medical history view (with permissions)

---

## 11. Phase Execution Rules
- AI must **never skip phases**
- Phases are:  
  Phase 0: Validation & setup  
  Phase 1: Core foundation (auth, tenants, users, appointments, patient demographics)  
  Phase 2: Clinical documentation (diagnoses, treatment plans, vital signs, clinical notes)  
  Phase 3: Laboratory integration (lab requests, results, reporting)  
  Phase 4: Patient history & reporting (medical history view, search, export, analytics)  
  Phase 5: UX completion & billing integration  
  Phase 6: Hardening (clinical data security, compliance validation)  
  Phase 7: Pre-launch QA (clinical workflow testing)  
  Phase 8: Launch

- AI **cannot implement features from later phases early**

---

## 12. Role-Based Agent System
Before every instruction, AI must be explicitly told its role:
- Backend Architect
- Frontend Engineer
- Product Architect
- AI Systems Agent
- QA / Breaker Agent
- **Clinical Workflow Specialist** (for medical feature design)
- **Compliance Officer** (for healthcare data protection)

**Rule:** If role is not specified → AI must STOP

---

## 13. STOP / ASK Rule
- If instructions are ambiguous, AI **must ask questions** instead of guessing
- AI must not invent features outside scope
- AI must not refactor code outside current task
- **Clinical data handling questions:**
  - If unsure about medical terminology → ASK
  - If unsure about clinical workflow → ASK
  - If unsure about compliance requirements → ASK

---

## 14. Pediatric-Specific Rules
- Parent → Child relationship mandatory
- DOB immutable
- Vaccine module optional (future)
- **Clinical features for pediatric patients:**
  - Growth charts (WHO standards)
  - Developmental milestones tracking
  - Pediatric-specific diagnosis codes
  - Age-appropriate medication dosing
- Consent flags must exist for notifications and data sharing

---

## 15. Clinical Data Rules (NEW)
- **Diagnosis entry:**
  - Only doctors can create/edit diagnoses
  - Support for ICD-10 codes (optional in MVP)
  - Primary and secondary diagnoses
  - Diagnosis must be linked to specific visit
- **Treatment plans:**
  - Medications with dosage and frequency
  - Procedures and recommendations
  - Follow-up instructions
  - All treatment changes audited
- **Lab management:**
  - Lab requests created by doctors
  - Lab results entered by lab technicians only
  - Abnormal values flagged automatically
  - Results linked to patient medical history
- **Medical history:**
  - Comprehensive view across all visits
  - Search by diagnosis, date range, lab result
  - Export capability for referrals
  - Retention policy: minimum 5-10 years

---

## 16. Compliance & Legal Rules (ENHANCED)
- **PH Data Privacy Act compliance:**
  - Sensitive personal health information (SPI) protection
  - Patient consent for data processing
  - Data breach notification within 72 hours
  - Data subject rights (access, rectification, erasure)
- **Medical record standards:**
  - Complete, accurate, timely documentation
  - Audit trail for all clinical entries
  - Retention: 5-10 years minimum
  - Secure deletion after retention period
- **Access controls:**
  - Need-to-know basis for clinical data
  - Role-based restrictions enforced
  - All access logged and auditable

---

## 17. Review & Approval
- Every AI-generated code, config, or UI must be **reviewed by human**
- AI suggestions can only execute **after human approval**
- Human-in-the-loop mandatory for QA, security, and operational correctness
- **Clinical features require additional review:**
  - Medical terminology accuracy
  - Clinical workflow validity
  - Compliance with healthcare standards

---

**End of Claude.md**  
**This file is the ultimate authority for AI behavior in this project.**

**MAJOR CHANGES FROM PREVIOUS VERSION:**
1. Removed restrictions on clinical data (diagnosis, treatment, labs)
2. Added clinical data handling rules and security requirements
3. Enhanced RBAC with Lab Technician role and clinical permissions
4. Updated phases to include clinical documentation and lab integration
5. Added compliance rules for healthcare data protection
6. Added Clinical Workflow Specialist and Compliance Officer roles
7. Specified clinical data encryption and audit requirements