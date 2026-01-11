# risks.md
# Known Risks, Severity, and Mitigation

## Operational Risks
- **Risk:** Appointment notifications may fail for some carriers  
  **Severity:** Medium  
  **Mitigation:** Test multiple SMS/Email providers; fallback notifications; log failures

- **Risk:** Multi-tenant data leaks between clinics  
  **Severity:** High  
  **Mitigation:** Strict RBAC, tenant DB isolation, QA with Breaker Agent

- **Risk:** Parent portal UX may confuse non-tech-savvy users  
  **Severity:** Medium  
  **Mitigation:** Simple interface, onboarding guide, visual feedback for actions

## Product Risks
- **Risk:** Feature creep due to AI suggestions  
  **Severity:** High  
  **Mitigation:** Enforce `claude.md` rules; human-in-the-loop review

- **Risk:** Skipping development phases causes broken flows  
  **Severity:** High  
  **Mitigation:** Phase enforcement via `tasks.md` and AI roles

- **Risk:** Clinics resist adopting SaaS due to habit or cost  
  **Severity:** Medium  
  **Mitigation:** Demonstrate ROI; provide free trial; simple pricing

## Technical Risks
- **Risk:** Backend-frontend integration failures  
  **Severity:** High  
  **Mitigation:** Integration tests per phase; CI/CD validation

- **Risk:** Notification failures or misrouting  
  **Severity:** Medium  
  **Mitigation:** Retry logic, logging, alerts for failed messages

## Regulatory / Compliance Risks
- **Risk:** Pediatric patient data privacy issues (PH Data Privacy Act)  
  **Severity:** Medium  
  **Mitigation:** Only operational data stored; encrypted sensitive fields; consent flags

- **Risk:** Storing clinical diagnoses by mistake  
  **Severity:** High  
  **Mitigation:** Explicitly enforce non-clinical free-text only in `claude.md`; human review

