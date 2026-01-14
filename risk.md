# risks.md
# Known Risks, Severity, and Mitigation

---

## Operational Risks

### R-OP-01: Appointment Notification Failures
- **Risk:** Appointment notifications may fail for some carriers  
- **Severity:** Medium  
- **Impact:** Increased no-shows, patient dissatisfaction
- **Mitigation:** 
  - Test multiple SMS/Email providers
  - Fallback notifications (SMS → Email → In-app)
  - Log all failures with alerts
  - Retry logic for transient failures
  - Monitor delivery rates per carrier

### R-OP-02: Multi-Tenant Data Leaks
- **Risk:** Multi-tenant data leaks between clinics  
- **Severity:** Critical (increased due to clinical data)
- **Impact:** Massive compliance violation, legal liability, loss of trust
- **Mitigation:** 
  - Strict RBAC with clinic_id enforcement at DB level
  - Tenant DB isolation validation in every query
  - QA with Breaker Agent specifically testing cross-tenant access
  - Automated tests for tenant isolation
  - Regular security audits
  - Penetration testing before launch

### R-OP-03: Parent Portal UX Complexity
- **Risk:** Parent portal UX may confuse non-tech-savvy users  
- **Severity:** Medium  
- **Impact:** Low adoption, support burden
- **Mitigation:** 
  - Simple, intuitive interface design
  - Onboarding guide and tutorials
  - Visual feedback for all actions
  - User testing with actual parents
  - Clear error messages
  - Help documentation

### R-OP-04: SMS Cost Overruns
- **Risk:** High-volume clinics could generate excessive SMS costs
- **Severity:** Medium
- **Impact:** Reduced profitability, unexpected expenses
- **Mitigation:**
  - SMS budget limits per clinic tier
  - Cost monitoring and alerts
  - Email as default with SMS opt-in
  - Bulk SMS optimization
  - Clear pricing communication to clients

---

## Product Risks

### R-PR-01: Feature Creep via AI Suggestions
- **Risk:** Feature creep due to AI suggestions outside scope
- **Severity:** High  
- **Impact:** Timeline delays, bloated product, technical debt
- **Mitigation:** 
  - Enforce `claude.md` rules strictly
  - Human-in-the-loop review for all AI outputs
  - Reference `prd.md` for scope validation
  - Clear "stop and ask" rules in AI instructions
  - Regular scope reviews against PRD

### R-PR-02: Phase Skipping
- **Risk:** Skipping development phases causes broken flows  
- **Severity:** High  
- **Impact:** Incomplete features, integration failures, rework
- **Mitigation:** 
  - Phase enforcement via `tasks.md` and exit criteria
  - AI role assignments per phase
  - Mandatory phase completion checklist
  - QA validation before phase transition

### R-PR-03: Clinic Resistance to SaaS Adoption
- **Risk:** Clinics resist adopting SaaS due to habit or cost concerns
- **Severity:** Medium  
- **Impact:** Slow customer acquisition, market validation issues
- **Mitigation:** 
  - Demonstrate clear ROI (time savings, revenue tracking)
  - Provide free trial period
  - Simple, affordable pricing
  - Success stories from pilot clinics
  - Excellent onboarding and support

### R-PR-04: Clinical Feature Complexity
- **Risk:** Clinical features (diagnosis, labs) increase development complexity beyond team capacity
- **Severity:** High
- **Impact:** Timeline delays, quality issues, incomplete MVP
- **Mitigation:**
  - Phased approach (Phase 2: Clinical, Phase 3: Labs)
  - Start with simple clinical documentation, add complexity later
  - Focus on common workflows first
  - Hire/consult with healthcare IT specialist if needed
  - User testing with actual doctors throughout development

---

## Technical Risks

### R-TC-01: Backend-Frontend Integration Failures
- **Risk:** Backend-frontend integration failures  
- **Severity:** High  
- **Impact:** Broken user flows, poor UX, rework required
- **Mitigation:** 
  - Integration tests per phase
  - CI/CD validation for all deployments
  - API contract testing
  - Shared API documentation
  - Regular sync between frontend/backend teams

### R-TC-02: Notification System Failures
- **Risk:** Notification failures or misrouting  
- **Severity:** Medium  
- **Impact:** Missed appointments, patient confusion
- **Mitigation:** 
  - Retry logic for failed sends
  - Comprehensive logging of all notifications
  - Alerts for high failure rates
  - Multiple provider fallbacks
  - Delivery status tracking

### R-TC-03: Clinical Data Encryption Failures
- **Risk:** Encryption failures expose sensitive health data
- **Severity:** Critical
- **Impact:** Massive compliance violation, legal penalties, reputation damage
- **Mitigation:**
  - Encryption at rest (AES-256) for all clinical fields
  - TLS 1.3 for all data in transit
  - Encrypted database backups
  - Regular encryption validation tests
  - Key rotation policies
  - Third-party security audit

### R-TC-04: Database Scaling Issues
- **Risk:** Database performance degrades with large patient bases and lab results
- **Severity:** Medium
- **Impact:** Slow queries, poor user experience, system timeouts
- **Mitigation:**
  - Proper indexing strategy (already in DDL)
  - Query optimization from day one
  - Partitioning strategy for large tables (visits, lab_results)
  - Regular performance monitoring
  - Load testing before launch
  - Database scaling plan (read replicas, sharding)

### R-TC-05: Lab Result Data Integrity
- **Risk:** Lab results entered incorrectly or linked to wrong patient
- **Severity:** Critical
- **Impact:** Medical errors, patient safety issues, legal liability
- **Mitigation:**
  - Double-entry verification for critical lab values
  - Patient identification validation before result entry
  - Audit trail for all lab result entries
  - Abnormal value flagging with required confirmation
  - Lab technician training requirements
  - Review workflow for critical results

### R-TC-06: Timezone Handling for Global Expansion
- **Risk:** Incorrect timezone handling causes appointment confusion
- **Severity:** Medium
- **Impact:** Missed appointments, scheduling conflicts
- **Mitigation:**
  - Store all timestamps in UTC
  - Display in clinic's local timezone
  - Clear timezone indicators in UI
  - Timezone testing across multiple regions
  - Clinic timezone configuration validation

---

## Regulatory / Compliance Risks

### R-CM-01: PH Data Privacy Act Violations (Clinical Data)
- **Risk:** Violation of PH Data Privacy Act for sensitive health information
- **Severity:** Critical
- **Impact:** Fines up to ₱5M, imprisonment, business closure, reputation damage
- **Mitigation:** 
  - Enhanced encryption for clinical data (diagnoses, lab results, medical history)
  - Role-based access strictly enforced (doctors only for diagnosis, lab techs only for results)
  - Comprehensive audit logs for all clinical data access
  - Patient consent mechanisms for data processing
  - Data retention policies (5-10 years for medical records)
  - Regular compliance audits
  - Legal review of data handling procedures
  - Data breach response plan with 72-hour notification
  - Staff training on data privacy

### R-CM-02: Accidental Clinical Data Storage
- **Risk:** Storing clinical diagnoses by mistake in non-clinical fields (ELIMINATED - Now intentional)
- **Severity:** N/A (Risk eliminated by scope change)
- **Previous Mitigation:** Explicitly enforce non-clinical free-text only in `claude.md`; human review
- **Current Status:** Clinical data storage is now intentional and properly secured

### R-CM-03: Medical Record Legal Standards Non-Compliance
- **Risk:** Medical records don't meet legal/professional standards for documentation
- **Severity:** High
- **Impact:** Legal liability, professional sanctions, audit failures
- **Mitigation:**
  - Consult with medical legal expert during design
  - Follow DOH guidelines for medical record keeping
  - Mandatory fields for complete clinical documentation
  - Template design reviewed by practicing physicians
  - Audit trail meets legal requirements
  - Documentation training for clinical users
  - Regular reviews of documentation completeness

### R-CM-04: Inadequate Medical Data Retention
- **Risk:** Medical records deleted prematurely or retained too long
- **Severity:** High
- **Impact:** Legal violations, inability to defend malpractice claims
- **Mitigation:**
  - Implement 5-10 year retention minimum (configurable by jurisdiction)
  - Automated retention policy enforcement
  - Soft delete with retention period before hard delete
  - Backup retention aligned with legal requirements
  - Clear policies communicated to clinics
  - Audit trail of all deletions

### R-CM-05: Unauthorized Clinical Data Access
- **Risk:** Staff accessing patient clinical data without authorization
- **Severity:** Critical
- **Impact:** Privacy violations, legal penalties, loss of trust
- **Mitigation:**
  - Strict RBAC enforcement (only doctors/treating providers access clinical data)
  - Audit log of ALL clinical data access with alerts for unusual patterns
  - "Break glass" emergency access with automatic logging and review
  - Regular access audits
  - Staff training on confidentiality
  - Disciplinary procedures for violations

### R-CM-06: Lab Result Confidentiality Breaches
- **Risk:** Lab results disclosed to unauthorized parties
- **Severity:** Critical
- **Impact:** Privacy violations, especially for sensitive tests (HIV, genetics)
- **Mitigation:**
  - Lab results only visible to ordering doctor and patient
  - Enhanced encryption for sensitive test types
  - Secure result delivery mechanisms
  - Patient consent for result disclosure
  - Audit trail for all lab result access
  - Special handling for sensitive tests

---

## Business Risks

### R-BZ-01: Insufficient Market Validation
- **Risk:** Product features don't match actual clinic needs
- **Severity:** High
- **Impact:** Low adoption, wasted development effort
- **Mitigation:**
  - Conduct thorough clinic interviews (Phase 0)
  - Pilot program with 3-5 clinics
  - Regular feedback collection during development
  - Iterative feature refinement based on user feedback
  - Beta testing with target customers

### R-BZ-02: Competitive Pressure
- **Risk:** Competitors launch similar products or add clinical features
- **Severity:** Medium
- **Impact:** Reduced market share, pricing pressure
- **Mitigation:**
  - Fast development cycle to market
  - Focus on superior UX and support
  - Build switching costs (data migration, training)
  - Continuous feature enhancement
  - Strong customer relationships

### R-BZ-03: Pricing Rejection
- **Risk:** Target market (SME clinics) rejects ₱1,999-₱4,999/month pricing
- **Severity:** Medium
- **Impact:** Low sales, need to revise pricing model
- **Mitigation:**
  - Demonstrate ROI clearly (staff time savings, revenue optimization)
  - Flexible pricing tiers based on clinic size
  - Free trial to prove value
  - Compare to cost of hiring additional staff
  - Success stories from pilot clinics

---

## Quality Assurance Risks

### R-QA-01: Incomplete Clinical Workflow Testing
- **Risk:** Clinical workflows not thoroughly tested before launch
- **Severity:** Critical
- **Impact:** Medical errors, patient safety issues, professional liability
- **Mitigation:**
  - Dedicated Phase 7 for clinical workflow testing
  - Test complete patient journey (registration → diagnosis → lab → follow-up)
  - Role-based testing (doctors, lab techs, staff)
  - Breaker agent testing for permission bypasses
  - UAT with actual clinic staff
  - Pilot program before full launch

### R-QA-02: Insufficient Breaker/Security Testing
- **Risk:** Security vulnerabilities not discovered before production
- **Severity:** Critical
- **Impact:** Data breaches, compliance violations
- **Mitigation:**
  - Dedicated QA/Breaker agent role in testing
  - Attempt cross-tenant data access
  - Test role permission bypasses
  - Penetration testing by third party
  - Automated security scanning
  - Bug bounty program post-launch

---

## Operational Risk Summary

### Critical Risks (Require Immediate Action)
1. R-OP-02: Multi-tenant data leaks
2. R-TC-03: Clinical data encryption failures
3. R-TC-05: Lab result data integrity
4. R-CM-01: PH Data Privacy Act violations
5. R-CM-05: Unauthorized clinical data access
6. R-CM-06: Lab result confidentiality breaches
7. R-QA-01: Incomplete clinical workflow testing
8. R-QA-02: Insufficient security testing

### High Risks (Require Careful Management)
1. R-PR-01: Feature creep
2. R-PR-02: Phase skipping
3. R-PR-04: Clinical feature complexity
4. R-TC-01: Backend-frontend integration
5. R-CM-03: Medical record legal standards
6. R-CM-04: Inadequate data retention
7. R-BZ-01: Insufficient market validation

### Medium Risks (Monitor and Mitigate)
1. R-OP-01: Notification failures
2. R-OP-03: Parent portal UX
3. R-OP-04: SMS cost overruns
4. R-PR-03: Clinic resistance
5. R-TC-02: Notification system failures
6. R-TC-04: Database scaling
7. R-TC-06: Timezone handling
8. R-BZ-02: Competitive pressure
9. R-BZ-03: Pricing rejection

---

## Risk Review Schedule
- **Daily:** Monitor critical risks during active development
- **Weekly:** Review high and medium risks in team meetings
- **Phase Completion:** Full risk assessment before moving to next phase
- **Pre-Launch:** Comprehensive risk audit with sign-off from all stakeholders
- **Post-Launch:** Monthly risk review and adjustment

---

**End of risks.md**

**MAJOR CHANGES FROM PREVIOUS VERSION:**
1. Added clinical data risks (R-CM-01 through R-CM-06)
2. Added technical risks for clinical features (R-TC-03, R-TC-05)
3. Elevated severity of multi-tenant risks due to clinical data
4. Added QA risks for clinical workflows (R-QA-01)
5. Added business risks for market validation and pricing
6. Removed R-CM-02 (accidental clinical data) as scope now includes clinical data intentionally
7. Reorganized into Critical/High/Medium severity categories
8. Added risk review schedule
9. Enhanced mitigation strategies for healthcare data protection