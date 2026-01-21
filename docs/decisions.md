# decisions.md
# Record of Key Project Decisions

## 2026-01-11
**Decision:** Use MySQL 8 for database  
**Reason:** Familiar ecosystem, strong relational support, proven in SaaS applications, existing DDL compatibility  
**Rejected:** NoSQL options (MongoDB, Firebase) – lacked relational integrity and RBAC support

## 2026-01-11
**Decision:** Backend framework – Node.js or Java Spring Boot  
**Reason:** Scalability, strong community support, existing expertise  
**Rejected:** PHP / Laravel – slower for multi-tenant scaling

## 2026-01-12
**Decision:** Operational visit records only; no clinical diagnoses or prescriptions (SUPERSEDED - See 2026-01-15 Reversal)  
**Reason:** Avoids EHR-level compliance and legal risk; MVP can launch faster  
**Rejected:** Full EHR module – too complex for initial launch  
**Status:** SUPERSEDED by decision on 2026-01-15

## 2026-01-12
**Decision:** Parent → Child relationship for pediatric patients  
**Reason:** Needed for pediatric workflows, vaccine tracking, age-based reminders  
**Rejected:** Flat patient list – lacked clarity for pediatric use

## 2026-01-13
**Decision:** Multi-tenant architecture from Day 1  
**Reason:** Enables SaaS scaling and subscription model  
**Rejected:** Single-tenant deployments – higher operational cost and slower onboarding

## 2026-01-13
**Decision:** Role-based access control (RBAC)  
**Reason:** Ensures tenant data security, accountability  
**Rejected:** Simple user roles – insufficient for clinic operations and audit requirements

## 2026-01-14
**Decision:** Minimal operational UI; English-first  
**Reason:** Simple onboarding, globally adaptable, reduces support overhead  
**Rejected:** Full-featured complex UI – higher learning curve

## 2026-01-15 (ORIGINAL - SUPERSEDED)
**Decision:** Corrected `visit_notes` table to remove clinical terms from `note_type` ENUM.  
**Reason:** The DDL included `'diagnosis'` and `'treatment'`, which directly contradicted the core requirement in `prd.md` to store "operational notes ONLY". This change enforces the non-clinical scope at the database level, mitigating compliance risks (e.g., PH Data Privacy Act for health data) and aligning the schema with the product's strategic decision to avoid being a full EHR.  
**Rejected:** Relying on application-level validation alone was deemed too risky.  
**Status:** SUPERSEDED - Decision reversed on 2026-01-15 (see below)

## 2026-01-15 (ORIGINAL - SUPERSEDED)
**Decision:** Corrected `patients` table by adding `parent_patient_id`.  
**Reason:** The PRD and workflow documents specify a "Parent account → child profiles" relationship as a core feature for pediatric clinics. The original schema was missing this link. Adding a self-referencing foreign key (`parent_patient_id`) directly implements this requirement, enabling the parent portal and other pediatric-specific features.  
**Rejected:** A separate mapping table was considered but rejected as overly complex for a simple hierarchical need.  
**Status:** STILL VALID

---

## 2026-01-15 (SCOPE EXPANSION - REVERSAL OF PREVIOUS DECISION)

**Decision:** REVERSAL - Expand product scope to include full clinical capabilities (diagnosis, treatment plans, laboratory management, comprehensive medical history)

**Reason:**  
After initial planning to avoid clinical features, the product direction has been reassessed. The market opportunity and competitive positioning require a comprehensive clinic management solution, not just an operations tool. Key factors:

1. **Market Differentiation:** Competitors offer clinical features; operations-only positioning is too limited
2. **Value Proposition:** Clinics need both operational AND clinical solutions; selling two separate products reduces value
3. **Revenue Potential:** Clinical features justify higher pricing (₱1,999-₱4,999/month vs ₱999-₱2,999/month)
4. **Compliance is Manageable:** PH Data Privacy Act requirements for clinical data are achievable with proper security architecture
5. **Global Expansion:** International markets expect comprehensive EHR-lite solutions for SME clinics
6. **Pediatric Alignment:** Medical history tracking essential for vaccine schedules, growth monitoring, developmental milestones

**Impact on Previous Decisions:**
- **2026-01-12 Decision REVERSED:** Now includes clinical diagnoses, prescriptions, and treatment plans
- **2026-01-15 DDL Correction REVERSED:** Keep 'diagnosis' and 'treatment' in `visit_notes.note_type` ENUM
- Original MySQL DDL with clinical terms is now CORRECT and aligned with new scope

**New Product Scope Includes:**
- Clinical documentation (diagnosis, treatment plans, vital signs, clinical assessments)
- Laboratory management (lab requests, results, reporting, abnormal value flagging)
- Comprehensive patient medical history (all visits, diagnoses, treatments, lab results)
- Medical record search and export capabilities
- Clinical analytics and reporting
- Enhanced security for sensitive health information
- Healthcare-grade compliance (PH Data Privacy Act for clinical data)
- **MySQL BLOB Storage Implementation** for patient photos and user avatars

**Rejected Alternatives:**
1. **Hybrid Approach (Operations now, Clinical later):** Creates fragmented product experience, harder to market
2. **Separate Products:** Increases development/maintenance cost, confuses market positioning
3. **Clinical as Add-on Module:** Undermines value proposition, complicates pricing

**Technical Implications:**
- Enhanced RBAC with Lab Technician role
- Clinical data encryption requirements (at rest and in transit)
- Extended audit logging for all clinical data access
- Medical record retention policies (5-10 years minimum)
- Compliance validation for healthcare data protection
- Additional security hardening phase
- **MySQL BLOB Storage for file management** (photos, avatars, documents)

**Development Timeline Impact:**
- Phases restructured:
  - Phase 2: Clinical Documentation
  - Phase 3: Laboratory Integration
  - Phase 4: Patient History & Reporting
- Estimated additional development time: +2-3 months
- Enhanced QA requirements for clinical workflows
- Compliance validation before launch

**Pricing Impact:**
- Target pricing increased to ₱1,999-₱4,999/month
- Justifies higher price point with comprehensive clinical features
- Additional revenue from lab module and clinical analytics

**Risk Assessment:**
- **Higher:** Compliance risk (manageable with proper implementation)
- **Higher:** Development complexity (mitigated with phased approach)
- **Higher:** Security requirements (addressed in Phase 6 hardening)
- **Lower:** Market risk (better competitive positioning)
- **Lower:** Customer acquisition (more complete solution)

**Owner:** Product Team  
**Date:** 2026-01-15  
**Status:** ACTIVE - This is now the core product direction

---

**Files Updated as Result of This Decision:**
1. ✅ `prd.md` - Expanded to include clinical features, lab management, patient history
2. ✅ `claude.md` - Removed "no clinical data" restrictions, added clinical data rules
3. ✅ `tasks.md` - Restructured phases to include clinical documentation, lab integration
4. 🔄 `clinic_saas_mysql_ddl.md` - Original DDL with 'diagnosis' and 'treatment' is now CORRECT (no changes needed)
5. 🔄 `clinic_saas_api_endpoints.md` - Needs update to add lab and medical history endpoints
6. 🔄 `risk.md` - Needs update to add clinical data risks and compliance requirements
7. 🔄 `clinic_saas_compliance.md` - May need enhancement for clinical data protection

---

**End of decisions.md**

---

## 2026-01-16
**Decision:** MySQL BLOB Storage Implementation for File Management  
**Reason:** Store patient photos and user avatars directly in MySQL database using BLOB columns instead of filesystem storage  
**Benefits:**
- Better data integrity and consistency
- Simplified backup and migration (single database backup includes all files)
- Enhanced security (files encrypted with database encryption)
- No file path management or broken links
- Easier deployment and scaling (no shared filesystem requirements)
- Atomic transactions (file and metadata updates together)

**Technical Implementation:**
- Added LONGBLOB columns to `patients` table: `photo_data`, `photo_filename`, `photo_mimetype`
- Added LONGBLOB columns to `auth_users` table: `avatar_data`, `avatar_filename`, `avatar_mimetype`
- Modified API endpoints to serve files directly from database
- Implemented proper Content-Type headers and caching
- Added file size validation (5MB limit)
- Maintained backward compatibility with existing `avatar_url` column

**Rejected Alternatives:**
1. **Filesystem Storage:** Risk of broken file paths, backup complexity, deployment issues
2. **Cloud Storage (S3/MinIO):** Additional infrastructure complexity, cost, and dependency
3. **Hybrid Approach:** Increased complexity without clear benefits

**Impact:**
- Improved system reliability and data consistency
- Simplified deployment and backup procedures
- Enhanced security for sensitive patient photos
- Foundation for future document management features

**Owner:** Development Team  
**Date:** 2026-01-16  
**Status:** IMPLEMENTED - Successfully deployed with comprehensive testing