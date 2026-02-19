# UI Testing Checklist - Week 1
# CuraOne Clinic SaaS
# Date: 2026-02-09

---

## 🎯 TESTING SCOPE

**Pages to Test:**
1. Login Page
2. Dashboard (Owner/Doctor/Staff)
3. Patients Page
4. Appointments Page
5. Users Page
6. Settings Page
7. Visits Page

**Test Credentials:**
- Super User: `admin@clinic.com` / `admin12354`
- Owner: `test.owner@clinic.com` / `password123`
- Doctor: `test.doctor@clinic.com` / `password123`
- Staff: `test.staff@clinic.com` / `password123`

---

## 1️⃣ LOGIN PAGE TESTING

### URL: http://localhost:3000/login

**Visual Tests:**
- [ ] Logo displays correctly
- [ ] "CuraOne" title visible
- [ ] "One Platform. Better Care." tagline visible
- [ ] Email input field present
- [ ] Password input field present
- [ ] Login button visible
- [ ] "Register here" link visible
- [ ] Right side branding panel visible (desktop)
- [ ] Responsive on mobile (branding hidden)

**Functional Tests:**
- [ ] Email field accepts input
- [ ] Password field masks input
- [ ] Empty email shows validation error
- [ ] Invalid email format shows error
- [ ] Empty password shows validation error
- [ ] Wrong credentials show error message
- [ ] Correct credentials redirect to dashboard
- [ ] Token stored in localStorage
- [ ] User data stored in localStorage

**Test Cases:**

```javascript
// Test 1: Empty form submission
1. Leave both fields empty
2. Click Login
Expected: Validation errors appear

// Test 2: Invalid email
1. Enter: "notanemail"
2. Enter password: "test123"
3. Click Login
Expected: Email validation error

// Test 3: Wrong credentials
1. Enter: "wrong@email.com"
2. Enter: "wrongpassword"
3. Click Login
Expected: "Login failed" error message

// Test 4: Successful login
1. Enter: "admin@clinic.com"
2. Enter: "admin12354"
3. Click Login
Expected: Redirect to /dashboard
```

---

## 2️⃣ DASHBOARD TESTING

### URL: http://localhost:3000/dashboard

**Visual Tests:**
- [ ] Sidebar navigation visible
- [ ] CuraOne logo in sidebar
- [ ] User profile dropdown in header
- [ ] Breadcrumb navigation visible
- [ ] Statistics cards display
- [ ] Charts render correctly
- [ ] Recent activity section visible
- [ ] Quick actions buttons visible

**Navigation Tests:**
- [ ] Patients link works
- [ ] Appointments link works
- [ ] Visits link works
- [ ] Users link works
- [ ] Settings link works
- [ ] Logout button works

**Role-Based Tests:**

**Super User Dashboard:**
- [ ] All menu items visible
- [ ] All statistics visible
- [ ] Admin section accessible

**Owner Dashboard:**
- [ ] Revenue statistics visible
- [ ] User management accessible
- [ ] Clinic settings accessible
- [ ] Reports accessible

**Doctor Dashboard:**
- [ ] Today's appointments visible
- [ ] Patient queue visible
- [ ] Clinical tools accessible
- [ ] Lab orders accessible

**Staff Dashboard:**
- [ ] Appointment management visible
- [ ] Patient check-in visible
- [ ] Limited menu items (no admin)

**Test Cases:**

```javascript
// Test 1: Dashboard loads
1. Login as admin@clinic.com
2. Wait for dashboard to load
Expected: Statistics cards appear, no errors

// Test 2: Navigation works
1. Click "Patients" in sidebar
Expected: Navigate to /patients

// Test 3: Logout works
1. Click user dropdown
2. Click "Logout"
Expected: Redirect to /login, token cleared
```

---

## 3️⃣ PATIENTS PAGE TESTING

### URL: http://localhost:3000/patients

**Visual Tests:**
- [ ] Page title "Patients" visible
- [ ] "Add Patient" button visible
- [ ] Search bar present
- [ ] Filter options visible
- [ ] Patient list/table displays
- [ ] Pagination controls visible

**Functional Tests:**
- [ ] Search filters patients
- [ ] Add Patient button opens modal/form
- [ ] Patient list loads from database
- [ ] View patient details works
- [ ] Edit patient works
- [ ] Patient photo displays

**Test Cases:**

```javascript
// Test 1: Page loads
1. Navigate to /patients
Expected: Patient list appears

// Test 2: Search works
1. Type "John" in search
Expected: Filter patients with "John"

// Test 3: Add patient
1. Click "Add Patient"
Expected: Form/modal appears
```

---

## 4️⃣ APPOINTMENTS PAGE TESTING

### URL: http://localhost:3000/appointments

**Visual Tests:**
- [ ] Timeline view displays
- [ ] Calendar view available
- [ ] Appointment cards visible
- [ ] Status badges (scheduled, completed, cancelled)
- [ ] Quick actions panel visible
- [ ] Statistics cards visible

**Functional Tests:**
- [ ] Timeline shows today's appointments
- [ ] Drag-and-drop rescheduling works
- [ ] Create appointment button works
- [ ] Edit appointment works
- [ ] Cancel appointment works
- [ ] Status change works
- [ ] Filter by doctor works
- [ ] Filter by status works

**Test Cases:**

```javascript
// Test 1: Timeline loads
1. Navigate to /appointments
Expected: Today's appointments in timeline

// Test 2: Create appointment
1. Click "New Appointment"
Expected: Form appears

// Test 3: Filter works
1. Select doctor from dropdown
Expected: Show only that doctor's appointments
```

---

## 5️⃣ USERS PAGE TESTING

### URL: http://localhost:3000/users

**Visual Tests:**
- [ ] User list displays
- [ ] "Add User" button visible
- [ ] User roles shown
- [ ] User status badges visible
- [ ] Action buttons (edit, deactivate)

**Functional Tests:**
- [ ] User list loads
- [ ] Add user button works
- [ ] Edit user works
- [ ] Role assignment works
- [ ] User search works
- [ ] Deactivate user works

**Test Cases:**

```javascript
// Test 1: Page loads
1. Navigate to /users
Expected: User list appears

// Test 2: Add user
1. Click "Add User"
Expected: Form appears

// Test 3: Edit user
1. Click edit icon on a user
Expected: Edit form appears with user data
```

---

## 6️⃣ SETTINGS PAGE TESTING

### URL: http://localhost:3000/settings

**Visual Tests:**
- [ ] Settings tabs visible
- [ ] Clinic information section
- [ ] User profile section
- [ ] Notification settings
- [ ] Security settings

**Functional Tests:**
- [ ] Update clinic info works
- [ ] Update user profile works
- [ ] Change password works
- [ ] Upload logo works
- [ ] Save settings works

---

## 7️⃣ VISITS PAGE TESTING

### URL: http://localhost:3000/visits

**Visual Tests:**
- [ ] Visit list displays
- [ ] Clinical workflow tabs visible
- [ ] Visit status badges
- [ ] Patient information visible

**Functional Tests:**
- [ ] Create visit works
- [ ] Record vitals works
- [ ] Add diagnosis works
- [ ] Add treatment plan works
- [ ] Close visit works

---

## 🔍 CROSS-PAGE TESTS

### Navigation Flow
```
Login → Dashboard → Patients → View Patient → Create Appointment → Dashboard
```

### Data Consistency
- [ ] Patient created in Patients appears in Appointments
- [ ] Appointment created appears in Dashboard
- [ ] User created appears in Users list

### Session Management
- [ ] Token persists across page refreshes
- [ ] Logout clears token
- [ ] Expired token redirects to login

---

## 🐛 BUG TRACKING

### Issues Found:

**Issue #1:**
- Page: ___________
- Description: ___________
- Steps to Reproduce: ___________
- Expected: ___________
- Actual: ___________
- Priority: High/Medium/Low

**Issue #2:**
- Page: ___________
- Description: ___________
- Steps to Reproduce: ___________
- Expected: ___________
- Actual: ___________
- Priority: High/Medium/Low

---

## ✅ TESTING PROGRESS

```
Page                Status      Issues      Notes
─────────────────────────────────────────────────
Login               ⏳ Testing   0          
Dashboard           ⏳ Pending   0          
Patients            ⏳ Pending   0          
Appointments        ⏳ Pending   0          
Users               ⏳ Pending   0          
Settings            ⏳ Pending   0          
Visits              ⏳ Pending   0          
─────────────────────────────────────────────────
TOTAL               0/7         0          
```

---

## 🚀 NEXT STEPS

1. Start server: `npm start`
2. Open browser: http://localhost:3000
3. Follow test cases above
4. Document any issues found
5. Create bug reports for critical issues
6. Retest after fixes

---

**Tester:** ___________  
**Date:** 2026-02-09  
**Browser:** Chrome/Firefox/Edge  
**Screen Size:** Desktop/Tablet/Mobile
