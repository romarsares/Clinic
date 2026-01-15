# Developer Workflow Cheat Sheet – Pediatric Clinic SaaS (Enhanced)

This is a **high-standard, developer-ready workflow guide** for building the Pediatric Clinic / Clinic Operations SaaS using **ChatGPT + VS Code + Phase-Based Vibe Coding**.

---

## 1️⃣ Project Setup

1. Clone Git repository: `git clone <repo-url>`
2. Open in VS Code
3. Verify folder structure:
```
/src/backend
/src/frontend
/config
/tests
/docs
    prd.md
    claude.md
    tasks.md
    decisions.md
    risks.md
```
4. Install dependencies (Node.js, Java, React/Vue, DB client)
5. Connect VS Code to Git & CI/CD
6. Install ChatGPT Code Extension or have browser ChatGPT ready

**Tip:** Always start your day by reviewing `tasks.md` and current phase.

---

## 2️⃣ AI Usage & Rules (`claude.md`)

- Always **assign a role** before giving instructions to AI:
```
You are now operating as [ROLE]: Backend Architect / Frontend Engineer / QA / Product Architect
```
- AI must follow **claude.md laws**:
  - No features outside `prd.md`
  - No skipping phases (`tasks.md`)
  - Stop and ask if unclear
  - Respect RBAC and tenant isolation

**Example instruction:**
```
You are now operating as Backend Architect.
Implement Phase 1: Tenant Management module using MySQL 8.
Follow claude.md rules and tasks.md Phase 1 tasks only.
```

---

## 3️⃣ Phase-Based Development (`tasks.md`)

- Follow **tasks.md** phase by phase:
  1. Validation & Setup
  2. Core Foundation
  3. Critical Paths
  4. UX Completion
  5. Hardening
  6. Pre-launch QA
  7. Launch
- After completing each task, update **decisions.md** and **risks.md**
- Verify **exit criteria** before moving to the next phase

**Tip:** Treat each phase as a **mini-project**. AI excels with scoped, small tasks.

---

## 4️⃣ Decisions & Risks

### decisions.md
- Record all **major choices**: technology, architecture, module scope
- Include **why alternatives were rejected**
- Include **owner & date**

**Example:**
```
Decision: Use MySQL 8 for multi-tenant DB
Reason: Familiar ecosystem, strong relational support, proven in SaaS applications
Rejected: NoSQL options (MongoDB/Firebase)
Owner: Mar
Date: 2026-01-11
```

### risks.md
- Record all **known risks and assumptions**
- Include **severity** and **mitigation plan**

**Example:**
```
Risk: Notification failure for some carriers
Severity: Medium
Mitigation: Retry logic, fallback email, logs
```

---

## 5️⃣ AI-Assisted Coding

- AI can generate **code snippets, config, and UI scaffolding** within current phase
- Always **human-review** before merging
- Maintain **human-in-the-loop QA** for security, data integrity, UX, and multi-tenant safety

**Example instruction:**
```
You are Backend Architect.
Create Patient model with Parent → Child relationship.
Constraints: Only operational fields, DOB immutable, follow claude.md rules.
```

---

## 6️⃣ QA / Breaker Role

- Role: QA / Breaker Agent (human or AI)
- Tasks:
  - Test invalid inputs and edge cases
  - Attempt permission bypasses
  - Validate multi-tenant isolation
- Log all issues in **risks.md**

---

## 7️⃣ Launch Readiness

- Confirm **Phase 6 exit criteria**:
  - Notifications working
  - Operational flows functional
  - Audit logs validated
  - No critical risks pending
- Deploy to pilot tenants
- Monitor metrics (appointments, logins, notifications)
- Collect feedback from clinics and parents
- Update **decisions.md** and **risks.md** as new issues arise

---

## 8️⃣ Future Pediatric Enhancements (Phase 7+)

- Vaccine schedule tracker
- Growth & developmental tracking (operational only)
- Pediatric dashboards for parents & staff
- Optional EHR module (diagnosis, prescriptions)
- Consent-based access control

**Note:** Do NOT implement until MVP is stable.

---

## 9️⃣ Daily Workflow Summary

1. Open `tasks.md` → identify current phase & tasks
2. Check `claude.md` → verify AI rules
3. Write instruction to ChatGPT specifying **role & task**
4. AI generates code or scaffold
5. Human reviews → merges into Git
6. Update `decisions.md` / `risks.md`
7. Run QA / Breaker tests
8. Confirm phase exit criteria → move to next phase

---

## 10️⃣ Text-Based Visual Workflow

```
PRD.md --> Claude.md --> Tasks.md --> AI Agent Role --> Human Review --> Decisions.md --> Risks.md --> QA / Breaker --> Next Phase / Launch
```

- Follow top-down flow
- Each block = control step
- AI acts only after role & task assigned
- Decisions & risks updated continuously
- Repeat per phase until launch

---

**This cheat sheet ensures:**
- Structured & phase-controlled development
- Safe AI-assisted coding
- Scalable, audit-ready SaaS
- Pediatric-safe operational data handling
- Readable in VS Code for day-to-day work

---

**End of Developer Workflow Cheat Sheet**

