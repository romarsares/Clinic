# ✅ CuraOne Test Recovery Checklist

**Goal:** Get from 0% to 50% test coverage in 2 days
**Status:** 🔴 START HERE

---

## 🚀 PHASE 1: IMMEDIATE (Next 2 Hours)

### Step 1: Understand the Problem ⏱️ 5 min
- [ ] Read QUICK_START_CARD.txt
- [ ] Read ARCHITECT_RECOMMENDATION.md (skim)
- [ ] Understand: We have code but no validation

### Step 2: Diagnose ⏱️ 5 min
```bash
node diagnose-tests.js
```
- [ ] Command runs without errors
- [ ] Database connection shows ✅
- [ ] Tables exist (auth_users, clinics, patients, etc.)
- [ ] At least 1 user found
- [ ] Note any ❌ errors

**If errors:** Check MySQL service running, .env.test exists

### Step 3: Fix Test Database ⏱️ 10 min
```bash
fix-tests.bat
```
- [ ] MySQL service starts
- [ ] Test database created
- [ ] Schema initialized
- [ ] No errors in output

**If errors:** Run commands manually from fix-tests.bat

### Step 4: Run Smoke Test ⏱️ 5 min
```bash
npm test -- tests/smoke.test.js
```
**Expected Results:**
- [ ] ✅ Health endpoint responds
- [ ] ✅ Database health check works
- [ ] ✅ Login endpoint exists
- [ ] ✅ Protected route requires auth

**If fails:** Check TEST_FIX_PLAN.md troubleshooting

### Step 5: Manual Browser Test ⏱️ 10 min
```bash
npm start
```
Then in browser:
- [ ] http://localhost:3000/health returns JSON
- [ ] http://localhost:3000/login shows login page
- [ ] Can login with admin@clinic.com / admin12354
- [ ] Dashboard loads after login
- [ ] No console errors

### Step 6: Document Results ⏱️ 5 min
Create file: `TEST_RESULTS_DAY1.md`
```markdown
# Test Results - Day 1

## Smoke Test
- Status: [PASS/FAIL]
- Tests Passing: X/4
- Issues Found: [list]

## Manual Test
- Login: [PASS/FAIL]
- Dashboard: [PASS/FAIL]
- Issues: [list]

## Next Steps
- [what to fix next]
```

---

## 🔧 PHASE 2: FIX CORE TESTS (Next 4 Hours)

### Test Suite 1: Authentication ⏱️ 1 hour
```bash
npm test -- tests/security/auth-rbac.test.js
```
**Goal:** Get at least 3/6 tests passing

- [ ] Review test file
- [ ] Identify why tests fail
- [ ] Fix database setup issues
- [ ] Fix authentication flow
- [ ] Re-run until 3+ pass

### Test Suite 2: Clinic Management ⏱️ 1 hour
```bash
npm test -- tests/clinic-management.test.js
```
**Goal:** Get at least 5/10 tests passing

- [ ] Review test file
- [ ] Fix clinic creation
- [ ] Fix clinic retrieval
- [ ] Fix clinic updates
- [ ] Re-run until 5+ pass

### Test Suite 3: Appointments ⏱️ 1 hour
```bash
npm test -- tests/appointment-types.test.js
```
**Goal:** Get at least 4/8 tests passing

- [ ] Review test file
- [ ] Fix appointment type CRUD
- [ ] Fix validation
- [ ] Re-run until 4+ pass

### Test Suite 4: User Operations ⏱️ 1 hour
```bash
npm test -- tests/user-profile-operations.test.js
```
**Goal:** Get at least 5/10 tests passing

- [ ] Review test file
- [ ] Fix user profile updates
- [ ] Fix password changes
- [ ] Re-run until 5+ pass

---

## 📊 PHASE 3: EXPAND COVERAGE (Day 2)

### Morning Session ⏱️ 4 hours
- [ ] Fix role assignment tests
- [ ] Fix visit records tests
- [ ] Fix appointment time slots tests
- [ ] Target: 40/104 tests passing

### Afternoon Session ⏱️ 4 hours
- [ ] Fix remaining CRUD tests
- [ ] Fix file upload tests
- [ ] Fix user preferences tests
- [ ] Target: 52/104 tests passing (50%)

---

## 🎯 SUCCESS METRICS

### End of Day 1 (2 hours from now)
- [ ] Smoke test: 4/4 passing ✅
- [ ] Manual login works ✅
- [ ] Dashboard loads ✅
- [ ] 1 test suite partially working (3+ tests)

### End of Day 2 (Tomorrow)
- [ ] 50% tests passing (52/104) ✅
- [ ] Authentication verified ✅
- [ ] Core CRUD operations work ✅
- [ ] Can create appointment manually ✅

### End of Week
- [ ] 80% tests passing (83/104) ✅
- [ ] All critical paths tested ✅
- [ ] Manual test checklist complete ✅
- [ ] Ready for Phase 7 ✅

---

## 🆘 TROUBLESHOOTING GUIDE

### Problem: MySQL not running
```bash
sc query MySQL80
net start MySQL80
```

### Problem: Test database doesn't exist
```bash
mysql -u root -pN1mbu$12354 -e "CREATE DATABASE clinic_saas_test;"
```

### Problem: Schema not initialized
```bash
mysql -u root -pN1mbu$12354 clinic_saas_test < scripts\init-database.sql
```

### Problem: No test users
```bash
node scripts/setup-admin-complete.js
```

### Problem: Tests timeout
- Increase timeout in jest.config.js
- Check database connection
- Close other MySQL connections

### Problem: Port already in use
```bash
netstat -ano | findstr :3000
taskkill /PID [PID] /F
```

---

## 📝 DAILY STANDUP FORMAT

Use this to track progress:

```markdown
## Day X Progress

### Completed ✅
- [what worked]

### In Progress 🔄
- [what you're working on]

### Blocked 🚫
- [what's stopping you]

### Tests Status
- Passing: X/104 (Y%)
- Fixed today: Z tests
- Target: [next milestone]

### Next Actions
1. [immediate next step]
2. [then this]
3. [then this]
```

---

## 🎓 LEARNING NOTES

As you fix tests, document:

### Common Issues Found
- [ ] Issue 1: [description] → Fix: [solution]
- [ ] Issue 2: [description] → Fix: [solution]
- [ ] Issue 3: [description] → Fix: [solution]

### Patterns Discovered
- [ ] Pattern 1: [what you learned]
- [ ] Pattern 2: [what you learned]
- [ ] Pattern 3: [what you learned]

### Code Improvements Needed
- [ ] Improvement 1: [what to refactor]
- [ ] Improvement 2: [what to refactor]
- [ ] Improvement 3: [what to refactor]

---

## 🏁 COMPLETION CRITERIA

You're done with test recovery when:

- [ ] ✅ 50%+ tests passing (52/104 minimum)
- [ ] ✅ All authentication tests pass
- [ ] ✅ Core CRUD operations verified
- [ ] ✅ Manual test checklist complete
- [ ] ✅ No critical bugs found
- [ ] ✅ Can demo system to stakeholder
- [ ] ✅ Confident to proceed with Phase 6

---

## 🚀 AFTER TESTS FIXED

Once you hit 50% test coverage:

1. **Update Documentation**
   - Mark task.md with actual status
   - Update README with test results
   - Document known issues

2. **Resume Development**
   - Complete Phase 6 UI/UX
   - Add tests for new features
   - Maintain 50%+ coverage

3. **Plan Phase 7**
   - Security hardening
   - Increase coverage to 80%
   - Penetration testing

---

## 📞 NEED HELP?

If stuck for more than 30 minutes:

1. Check TEST_FIX_PLAN.md troubleshooting
2. Review error logs in logs/error.log
3. Re-run diagnose-tests.js
4. Check if MySQL service running
5. Verify .env.test configuration

---

**START NOW:** `node diagnose-tests.js`

**Time Commitment:** 2 hours today, 6 hours tomorrow
**Payoff:** Know your system works, can deploy safely
**Priority:** HIGHEST - Block everything else

---

*Remember: Every test that passes is proof your system works.*
*Every test that fails is a bug you found before users did.*

**Let's fix this! 💪**
