# Permission System Testing Script
# Test all roles and verify menu visibility

## Test Credentials
- Super User: admin@clinic.com / admin12354
- Owner: test.owner@clinic.com / password123
- Doctor: test.doctor@clinic.com / password123
- Staff: test.staff@clinic.com / password123
- Lab Tech: test.labtech@clinic.com / password123

## Test Procedure

### Test 1: Super User (admin@clinic.com)
1. Login as Super User
2. Check Dashboard - Should see ALL menu items
3. Expected visible:
   ✅ Dashboard
   ✅ Patients
   ✅ Appointments
   ✅ Clinical Visits
   ✅ Laboratory
   ✅ Users
   ✅ Billing
   ✅ Reports
   ✅ Settings

### Test 2: Owner (test.owner@clinic.com)
1. Login as Owner
2. Check Dashboard - Should see admin menus
3. Expected visible:
   ✅ Dashboard
   ✅ Patients
   ✅ Appointments
   ❌ Clinical Visits (hidden)
   ❌ Laboratory (hidden)
   ✅ Users
   ✅ Billing
   ✅ Reports
   ✅ Settings

### Test 3: Doctor (test.doctor@clinic.com)
1. Login as Doctor
2. Check Dashboard - Should see clinical menus
3. Expected visible:
   ✅ Dashboard
   ✅ Patients
   ✅ Appointments
   ✅ Clinical Visits
   ✅ Laboratory
   ❌ Users (hidden)
   ❌ Billing (hidden)
   ❌ Reports (hidden)
   ❌ Settings (hidden)

### Test 4: Staff (test.staff@clinic.com)
1. Login as Staff
2. Check Dashboard - Should see limited menus
3. Expected visible:
   ✅ Dashboard
   ✅ Patients
   ✅ Appointments
   ❌ Clinical Visits (hidden)
   ❌ Laboratory (hidden)
   ❌ Users (hidden)
   ❌ Billing (hidden)
   ❌ Reports (hidden)
   ❌ Settings (hidden)

### Test 5: Lab Technician (test.labtech@clinic.com)
1. Login as Lab Tech
2. Check Dashboard - Should see only lab menu
3. Expected visible:
   ✅ Dashboard
   ❌ Patients (hidden)
   ❌ Appointments (hidden)
   ❌ Clinical Visits (hidden)
   ✅ Laboratory
   ❌ Users (hidden)
   ❌ Billing (hidden)
   ❌ Reports (hidden)
   ❌ Settings (hidden)

## Page Access Tests

### Test 6: Staff tries to access Users page
1. Login as Staff
2. Manually navigate to /users
3. Expected: Alert "You do not have permission" + redirect to /dashboard

### Test 7: Doctor tries to access Settings
1. Login as Doctor
2. Manually navigate to /settings
3. Expected: Alert "You do not have permission" + redirect to /dashboard

### Test 8: Lab Tech tries to access Patients
1. Login as Lab Tech
2. Manually navigate to /patients
3. Expected: Alert "You do not have permission" + redirect to /dashboard

## Browser Console Test

Open browser console and run:

```javascript
// Check current user role
const user = JSON.parse(localStorage.getItem('clinic_user'));
console.log('Current Role:', user.role);

// Check specific permission
console.log('Has patients permission:', window.PermissionSystem.hasPermission('patients'));
console.log('Has users permission:', window.PermissionSystem.hasPermission('users'));
console.log('Has visits permission:', window.PermissionSystem.hasPermission('visits'));
```

## Test Results Template

| Role | Dashboard | Patients | Appointments | Visits | Lab | Users | Settings | Result |
|------|-----------|----------|--------------|--------|-----|-------|----------|--------|
| Super User | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | PASS/FAIL |
| Owner | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | PASS/FAIL |
| Doctor | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | PASS/FAIL |
| Staff | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | PASS/FAIL |
| Lab Tech | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | PASS/FAIL |

## Issues Found

Document any issues here:

1. Issue: _______________________
   Role: _______________________
   Expected: ___________________
   Actual: _____________________
   
2. Issue: _______________________
   Role: _______________________
   Expected: ___________________
   Actual: _____________________

## Test Status

- [ ] Test 1: Super User - PASS/FAIL
- [ ] Test 2: Owner - PASS/FAIL
- [ ] Test 3: Doctor - PASS/FAIL
- [ ] Test 4: Staff - PASS/FAIL
- [ ] Test 5: Lab Tech - PASS/FAIL
- [ ] Test 6: Page Protection - PASS/FAIL
- [ ] Test 7: Page Protection - PASS/FAIL
- [ ] Test 8: Page Protection - PASS/FAIL

**Overall Result:** PASS / FAIL
**Tested By:** _______________
**Date:** 2026-02-09
