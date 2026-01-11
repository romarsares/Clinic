# prd.md
# Product Requirement Document
# Pediatric Clinic / Clinic Operations SaaS

---

## 1. Product Identity

**Product Name (Placeholder):** ClinicOps SaaS  
**Target Users:** Small to medium pediatric and general clinics  
**Positioning:** Clinic operations and workflow system for SMEs, starting in the Philippines, scalable globally.  
**Product Scope:** Operations-first; NOT a full EHR or hospital system.  

**This system IS NOT:**
- A hospital system
- A full Electronic Health Record (EHR)
- Insurance or government-integrated
- A diagnosis or treatment platform

**This system IS:**
- An operations and workflow SaaS
- Focused on appointments, patient identity, billing summaries, and reporting
- Multi-tenant from day one

---

## 2. Business Problem

Clinics often struggle with:
- Manual appointment tracking (Messenger / phone)
- Patient history in folders or spreadsheets
- Manual billing & invoicing
- Lack of operational reports for owners
- Poor accountability among staff

**Goal:** Replace operational chaos with structured, scalable workflows.

---

## 3. Core Principles

1. **Operations-first** – no clinical diagnosis logic  
2. **Multi-tenant architecture** – one system, many clinics  
3. **Documentation-first** – everything defined in `claude.md`, `tasks.md`, `decisions.md`  
4. **Compliance-ready** – PH Data Privacy Act and basic global best practices  
5. **Modular for pediatric extension** – parent-child tracking, vaccine module, etc.

---

## 4. MVP Modules

### 4.1 Tenant / Clinic Management
- Each clinic = one tenant  
- Branch support configurable later  
- Custom settings per clinic

### 4.2 User & Role Management
- Roles: Owner, Doctor, Staff, Admin  
- RBAC enforced  
- Permissions control feature access

### 4.3 Appointment Management
- Daily schedule management  
- Pediatric-specific appointment types optional  
- Booking, rescheduling, cancellations  
- Notifications via SMS / Email

### 4.4 Patient Management
- Parent account → child profiles (for pediatric clinics)  
- Identity only; DOB immutable  
- Appointment history, visit summary  
- Free-text operational notes **ONLY** (no diagnosis, no prescriptions, no treatment plans)  
- Consent flags for notifications

### 4.5 Consultation / Visit Records
- Operational visit notes (non-clinical)  
- Timestamped, linked to staff and patient  
- Free-text for operational clarity, legal protection, historical context

### 4.6 Billing Summary
- Track charges & payments per patient  
- Summaries per clinic owner  
- Simple, operational; no payroll, no tax calculations

### 4.7 Reports
- Owner-focused dashboards: revenue, doctor utilization, no-shows  
- CSV export optional

### 4.8 Audit Logs
- Track all user actions per tenant  
- Builds trust and accountability  
- Enables compliance review

---

## 5. Security & Compliance
- PH Data Privacy Act 2012 compliant  
- Role-based access control  
- Encryption at rest and in transit  
- No sensitive medical diagnosis data stored  
- Multi-tenant data isolation

---

## 6. MVP Non-Goals
- ❌ Full EHR  
- ❌ Clinical diagnosis or prescriptions  
- ❌ Insurance or government integration  
- ❌ Lab or imaging results  
- ❌ Payroll or tax computation  

**Non-goals exist to prevent:**
- Feature creep  
- AI over-helpfulness  
- Premature complexity

---

## 7. Phased Execution (tasks.md guide reference)

**Phase 0:** Validation & setup  
- Clinic interviews, confirm pediatric workflow  
- Confirm basic tech stack

**Phase 1:** Core foundation  
- Auth / RBAC  
- Tenant & user management  
- Basic appointment scheduling

**Phase 2:** Critical paths  
- Appointment notifications  
- Parent-child patient management  
- Visit records

**Phase 3:** UX completion  
- Dashboards for owners  
- Reports  
- Billing summary  
- Audit logs

**Phase 4:** Hardening  
- Permissions review  
- Data validation  
- Security checks

**Phase 5:** Pre-launch QA  
- Role-based testing (Owner, Staff, Admin, Parent)  
- Breaker / QA testing for operational failures

**Phase 6:** Launch  
- PH clinics first  
- Optional pediatric-specific enhancements  
- Ready for multi-tenant scaling

---

## 8. Future Pediatric-Specific Enhancements
- Vaccine schedule tracker  
- Age-based reminders  
- Parent portal dashboards  
- Pediatric growth tracking (operational only, non-clinical)

---

## 9. Pricing Logic (Optional for MVP)
- ₱999–₱2,999 / month per clinic  
- Tier based on users and appointment volume  
- Predictable for clinics and sustainable for SaaS

---

## 10. Success Criteria
- Clinics adopt system for daily operations  
- Parent notifications work reliably  
- Appointment and billing tracking is accurate  
- Multi-tenant system scales to >10 clinics in pilot  
- No critical security breaches

---

## 11. References
- `claude.md` – Laws & AI constraints  
- `tasks.md` – Phase tasks  
- `decisions.md` – Log choices  
- `risks.md` – Track known weaknesses

---

**End of PRD**
