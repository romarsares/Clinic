# 🧪 CuraOne Test Scenarios & Test Cases

**Source:** Extracted from task.md Phase 7 & 8
**Purpose:** Comprehensive test scenarios for all features
**Status:** Reference document for test implementation

---

## 📋 TABLE OF CONTENTS

1. [Authentication & RBAC Tests](#authentication--rbac-tests)
2. [Multi-Tenant Security Tests](#multi-tenant-security-tests)
3. [Clinical Workflow Tests](#clinical-workflow-tests)
4. [Laboratory Tests](#laboratory-tests)
5. [Billing Tests](#billing-tests)
6. [User Management Tests](#user-management-tests)
7. [Appointment Tests](#appointment-tests)
8. [Security & Penetration Tests](#security--penetration-tests)

---

## 🔐 AUTHENTICATION & RBAC TESTS

### Test Suite: auth-rbac.test.js

#### TC-AUTH-001: JWT Token Validation
**Priority:** Critical
**Scenario:** Verify JWT token expiration and validation
```javascript
- Test valid token access
- Test expired token rejection
- Test invalid token rejection
- Test token refresh mechanism
- Test concurrent session management
```

#### TC-AUTH-002: Password Security
**Priority:** Critical
**Scenario:** Validate password hashing and security
```javascript
- Test bcrypt hashing (12 rounds minimum)
- Test password complexity requirements
- Test password change functionality
- Test password reset workflow
- Test password history (last 5 passwords)
```

#### TC-AUTH-003: Rate Limiting
**Priority:** High
**Scenario:** Prevent brute force attacks
```javascript
- Test login rate limiting (5 attempts/15 min)
- Test API rate limiting (100 requests/min)
- Test account lockout after failed attempts
- Test rate limit reset after timeout
```

#### TC-AUTH-004: Session Management
**Priority:** High
**Scenario:** Validate session timeout and logout
```javascript
- Test 30-minute session timeout
- Test automatic logout on timeout
- Test manual logout functionality
- Test session invalidation
```

---

## 🏢 MULTI-TENANT SECURITY TESTS

### Test Suite: tenant-isolation.test.js

#### TC-TENANT-001: Data Isolation
**Priority:** Critical
**Scenario:** Clinic A cannot access Clinic B data
```javascript
- Create 2 test clinics with sample data
- Login as Clinic A user
- Attempt to access Clinic B patient data
- Verify 403 Forbidden response
- Verify no data leakage in responses
```

#### TC-TENANT-002: URL Manipulation
**Priority:** Critical
**Scenario:** Prevent clinic_id parameter tampering
```javascript
- Login as Clinic A user
- Modify URL with Clinic B clinic_id
- Attempt to access resources
- Verify automatic clinic_id filtering
- Verify audit log of attempt
```

#### TC-TENANT-003: Database Query Isolation
**Priority:** Critical
**Scenario:** All queries automatically scoped to tenant
```javascript
- Execute patient search query
- Verify clinic_id in WHERE clause
- Test JOIN queries include clinic_id
- Verify no cross-tenant results
```

---

## 👥 ROLE-BASED ACCESS CONTROL TESTS

### Test Suite: role-permissions.test.js

#### TC-ROLE-001: Owner Role Permissions
**Priority:** High
**Scenario:** Owner has full clinic access
```javascript
- Access all patient records ✅
- Modify clinic settings ✅
- Manage users and roles ✅
- View financial reports ✅
- Access system configuration ✅
```

#### TC-ROLE-002: Doctor Role Permissions
**Priority:** Critical
**Scenario:** Doctor has clinical data access only
```javascript
- View patient records ✅
- Add diagnoses ✅
- Create treatment plans ✅
- Order lab tests ✅
- Close visits ✅
- Access billing ❌
- Modify clinic settings ❌
```

#### TC-ROLE-003: Staff Role Permissions
**Priority:** High
**Scenario:** Staff has operational access, limited clinical
```javascript
- Schedule appointments ✅
- Check-in patients ✅
- View patient demographics ✅
- Record vital signs ✅
- Add diagnoses ❌
- Create treatment plans ❌
- Close visits ❌
```

#### TC-ROLE-004: Lab Technician Permissions
**Priority:** High
**Scenario:** Lab tech has lab module access only
```javascript
- View lab requests ✅
- Enter lab results ✅
- Update lab status ✅
- View clinical notes ❌
- Access billing ❌
- Modify patient data ❌
```

---

## 🏥 CLINICAL WORKFLOW TESTS

### Test Suite: clinical-workflow.test.js

#### TC-CLINICAL-001: Complete Visit Workflow
**Priority:** Critical
**Scenario:** End-to-end patient visit documentation
```javascript
1. Create new visit
2. Record chief complaint
3. Record vital signs
4. Add clinical assessment (Doctor only)
5. Add diagnosis (Doctor only)
6. Create treatment plan (Doctor only)
7. Add follow-up instructions
8. Close visit (Doctor only)
9. Verify audit trail
```

#### TC-CLINICAL-002: Diagnosis Entry
**Priority:** Critical
**Scenario:** Only doctors can add diagnoses
```javascript
- Doctor adds diagnosis ✅
- Staff attempts diagnosis ❌ (403 Forbidden)
- Verify ICD-10 code validation
- Test primary vs secondary diagnosis
- Verify audit logging
```

#### TC-CLINICAL-003: Treatment Plan Creation
**Priority:** Critical
**Scenario:** Only doctors can create treatment plans
```javascript
- Doctor creates treatment plan ✅
- Staff attempts treatment plan ❌
- Verify medication prescription
- Test procedure documentation
- Verify follow-up scheduling
```

#### TC-CLINICAL-004: Vital Signs Recording
**Priority:** High
**Scenario:** Staff and doctors can record vitals
```javascript
- Test temperature range (35-42°C)
- Test blood pressure range (60-200 systolic)
- Test heart rate range (40-200 bpm)
- Test weight/height recording
- Test BMI auto-calculation
- Verify validation errors
```

---

## 🔬 LABORATORY TESTS

### Test Suite: lab-workflow.test.js

#### TC-LAB-001: Lab Request Creation
**Priority:** High
**Scenario:** Doctor creates lab order
```javascript
- Create lab request from visit
- Select test type (CBC, Urinalysis, etc.)
- Set priority (normal, urgent, stat)
- Verify auto-billing integration
- Check lab request status
```

#### TC-LAB-002: Lab Result Entry
**Priority:** Critical
**Scenario:** Lab tech enters results
```javascript
- Lab tech views pending requests
- Enter test results
- Flag abnormal values automatically
- Attach result file (PDF)
- Update request status to completed
- Verify doctor notification
```

#### TC-LAB-003: Abnormal Value Flagging
**Priority:** High
**Scenario:** System flags out-of-range results
```javascript
- Enter normal value → No flag
- Enter high value → HIGH flag
- Enter low value → LOW flag
- Enter critical value → Alert doctor
- Verify normal range configuration
```

---

## 💰 BILLING TESTS

### Test Suite: billing-integration.test.js

#### TC-BILL-001: Auto-Billing on Visit Close
**Priority:** Critical
**Scenario:** Bill created when visit closes
```javascript
- Doctor closes visit
- Verify bill auto-created
- Check consultation fee added
- Verify diagnosis-based charges
- Test complexity multiplier
```

#### TC-BILL-002: Lab Charges Integration
**Priority:** High
**Scenario:** Lab charges auto-added to bill
```javascript
- Lab result entered
- Verify lab charge added to bill
- Check test pricing lookup
- Verify multiple test charges
- Test insurance coverage calculation
```

#### TC-BILL-003: Revenue Tracking
**Priority:** High
**Scenario:** Track revenue by service type
```javascript
- Generate revenue report
- Verify consultation revenue
- Verify lab revenue
- Verify procedure revenue
- Test date range filtering
```

---

## 👤 USER MANAGEMENT TESTS

### Test Suite: user-management.test.js

#### TC-USER-001: User Registration
**Priority:** High
**Scenario:** Create new user with role
```javascript
- Register new user
- Assign role (Doctor, Staff, etc.)
- Verify email validation
- Test password requirements
- Check user activation
```

#### TC-USER-002: Profile Management
**Priority:** Medium
**Scenario:** User updates profile
```javascript
- Update full name
- Change email address
- Update phone number
- Upload avatar photo
- Verify changes saved
```

#### TC-USER-003: Role Assignment
**Priority:** High
**Scenario:** Change user role
```javascript
- Assign Doctor role
- Verify permissions updated
- Change to Staff role
- Verify permission restrictions
- Test role hierarchy
```

---

## 📅 APPOINTMENT TESTS

### Test Suite: appointment-workflow.test.js

#### TC-APPT-001: Appointment Booking
**Priority:** Critical
**Scenario:** Book appointment with conflict check
```javascript
- Select doctor and date
- Check available time slots
- Book appointment
- Verify no conflicts
- Test double-booking prevention
```

#### TC-APPT-002: Appointment Rescheduling
**Priority:** High
**Scenario:** Reschedule existing appointment
```javascript
- Select appointment to reschedule
- Choose new date/time
- Verify availability
- Update appointment
- Send notification to patient
```

#### TC-APPT-003: Appointment Status Management
**Priority:** High
**Scenario:** Update appointment status
```javascript
- Mark as confirmed
- Mark as checked-in
- Mark as completed
- Mark as cancelled
- Mark as no-show
- Verify status transitions
```

---

## 🔒 SECURITY & PENETRATION TESTS

### Test Suite: security-penetration.test.js

#### TC-SEC-001: SQL Injection Prevention
**Priority:** Critical
**Scenario:** Attempt SQL injection attacks
```javascript
- Test patient search with SQL injection
- Test login with SQL injection
- Test appointment filters with injection
- Verify parameterized queries
- Check error message sanitization
```

#### TC-SEC-002: XSS Prevention
**Priority:** Critical
**Scenario:** Attempt cross-site scripting
```javascript
- Enter <script> tags in patient name
- Test XSS in clinical notes
- Test XSS in appointment notes
- Verify input sanitization
- Check output encoding
```

#### TC-SEC-003: CSRF Protection
**Priority:** High
**Scenario:** Prevent cross-site request forgery
```javascript
- Test state-changing operations
- Verify CSRF token validation
- Test token expiration
- Check token uniqueness
```

#### TC-SEC-004: File Upload Security
**Priority:** High
**Scenario:** Validate file upload restrictions
```javascript
- Test allowed file types (PDF, JPG, PNG)
- Test file size limits (10MB max)
- Attempt malicious file upload
- Verify file storage security
- Test file access permissions
```

---

## 📊 TEST COVERAGE SUMMARY

### Current Status (After Fixes)
```
✅ Smoke Tests: 4/4 (100%)
✅ User Profile: 10/10 (100%)
✅ Patient Photo: 8/8 (100%)
⚠️  Auth RBAC: 0/6 (0%) - NEEDS FIX
⚠️  Clinic Management: 0/10 (0%) - NEEDS FIX
⚠️  Appointments: 0/15 (0%) - NEEDS FIX
⚠️  Visits: 0/12 (0%) - NEEDS FIX
⚠️  Lab Workflow: 0/10 (0%) - NEEDS FIX

Total: 33/108 (30.6%)
Target: 54/108 (50%) by end of week
```

### Priority Order for Fixing
1. **auth-rbac.test.js** (Critical - Security foundation)
2. **clinic-management.test.js** (High - Core CRUD)
3. **appointment-workflow.test.js** (High - Business critical)
4. **visit-records.test.js** (High - Clinical core)
5. **lab-workflow.test.js** (Medium - Feature complete)

---

## 🎯 TEST IMPLEMENTATION GUIDE

### How to Use This Document

1. **For New Tests:**
   - Copy scenario from this document
   - Create test file in `tests/` directory
   - Implement test cases
   - Run and verify

2. **For Fixing Tests:**
   - Find failing test scenario here
   - Understand expected behavior
   - Fix implementation or test
   - Verify passes

3. **For Manual Testing:**
   - Use scenarios as checklist
   - Test in browser/Postman
   - Document results
   - Create automated test

---

**Document Status:** ✅ Complete
**Last Updated:** January 21, 2025
**Source:** task.md Phase 7 & 8, PHASE7_HARDENING_TASKS.md
**Usage:** Reference for test implementation and manual testing
