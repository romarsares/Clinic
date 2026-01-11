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
- ❌ Handle medical diagnosis, prescriptions, lab results
- ❌ Store sensitive patient data outside allowed fields
- ❌ Merge backend and frontend logic inappropriately
- ❌ Bypass RBAC or tenant isolation
- ❌ Change scope mid-phase

---

## 4. Architecture Rules
- Multi-tenant from day one
- Parent-child relationship enforced for pediatric clinics
- RBAC strictly applied: Owner > Doctor > Staff > Admin
- Visit records are operational-only (no diagnosis, no prescriptions)
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
- Minimal UI for operations-focused workflows
- Parent portal and staff dashboard clearly separated
- Avoid medical terminologies
- Consistent date / time format
- Feedback and errors visible and clear

---

## 7. Backend Discipline
- DB isolation per tenant
- Encryption at rest for patient identifiers
- Input validation on all endpoints
- No direct access to sensitive data without role permissions
- Audit logs mandatory for critical actions

---

## 8. Security Guardrails
- RBAC enforced at all levels
- Tenant data cannot be accessed by other tenants
- Passwords hashed
- TLS for all client-server communication
- Sensitive fields (DOB, child data) immutable

---

## 9. Error Handling Rules
- All exceptions logged
- No raw stack traces sent to front-end
- Graceful handling of failed appointments, notifications, or billing

---

## 10. Auth & Permissions Rules
- Owner: full tenant access
- Doctor: patient visit operational access
- Staff: appointment and billing access only
- Admin: system-level access (multi-tenant management)
- Parent: child profile, appointments, notifications only

---

## 11. Phase Execution Rules
- AI must **never skip phases**
- Phases are:  
  Phase 0: Validation & setup  
  Phase 1: Core foundation  
  Phase 2: Critical paths  
  Phase 3: UX completion  
  Phase 4: Hardening  
  Phase 5: Pre-launch QA  
  Phase 6: Launch

- AI **cannot implement features from later phases early**

---

## 12. Role-Based Agent System
Before every instruction, AI must be explicitly told its role:
- Backend Architect
- Frontend Engineer
- Product Architect
- AI Systems Agent
- QA / Breaker Agent

**Rule:** If role is not specified → AI must STOP

---

## 13. STOP / ASK Rule
- If instructions are ambiguous, AI **must ask questions** instead of guessing
- AI must not invent features outside scope
- AI must not refactor code outside current task

---

## 14. Pediatric-Specific Rules
- Parent → Child relationship mandatory
- DOB immutable
- Vaccine module optional (future)
- Only operational notes allowed; no clinical notes
- Consent flags must exist for notifications

---

## 15. Review & Approval
- Every AI-generated code, config, or UI must be **reviewed by human**
- AI suggestions can only execute **after human approval**
- Human-in-the-loop mandatory for QA, security, and operational correctness

---

**End of Claude.md**  
**This file is the ultimate authority for AI behavior in this project.**
