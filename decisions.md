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
**Decision:** Operational visit records only; no clinical diagnoses or prescriptions  
**Reason:** Avoids EHR-level compliance and legal risk; MVP can launch faster  
**Rejected:** Full EHR module – too complex for initial launch

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

## 2026-01-15
**Decision:** Corrected `visit_notes` table to remove clinical terms from `note_type` ENUM.
**Reason:** The DDL included `'diagnosis'` and `'treatment'`, which directly contradicted the core requirement in `prd.md` to store "operational notes ONLY". This change enforces the non-clinical scope at the database level, mitigating compliance risks (e.g., PH Data Privacy Act for health data) and aligning the schema with the product's strategic decision to avoid being a full EHR.
**Rejected:** Relying on application-level validation alone was deemed too risky.

## 2026-01-15
**Decision:** Corrected `patients` table by adding `parent_patient_id`.
**Reason:** The PRD and workflow documents specify a "Parent account → child profiles" relationship as a core feature for pediatric clinics. The original schema was missing this link. Adding a self-referencing foreign key (`parent_patient_id`) directly implements this requirement, enabling the parent portal and other pediatric-specific features.
**Rejected:** A separate mapping table was considered but rejected as overly complex for a simple hierarchical need.
