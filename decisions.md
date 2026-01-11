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

