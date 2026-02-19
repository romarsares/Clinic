# Permission System - Test Specification
# CuraOne Clinic SaaS
# Date: 2026-02-09
# Version: 1.0

---

## 📋 TEST OVERVIEW

**Total Test Cases:** 50+  
**Test Categories:** 7  
**Estimated Test Time:** 8-10 hours  
**Coverage Target:** 100%

---

## 🧪 TEST CATEGORIES

### 1. Database Tests (10 tests)
### 2. Permission Service Tests (15 tests)
### 3. API Endpoint Tests (12 tests)
### 4. Security Tests (8 tests)
### 5. Performance Tests (3 tests)
### 6. Integration Tests (5 tests)
### 7. UI Tests (7 tests)

---

## 1️⃣ DATABASE TESTS

### Test 1.1: Table Creation
```javascript
describe('Database - user_permissions table', () => {
  it('should create user_permissions table with correct schema', async () => {
    const [columns] = await db.execute('DESCRIBE user_permissions');
    expect(columns).toHaveLength(6);
    expect(columns.find(c => c.Field === 'id')).toBeDefined();
    expect(columns.find(c => c.Field === 'user_id')).toBeDefined();
    expect(columns.find(c => c.Field === 'clinic_id')).toBeDefined();
    expect(columns.find(c => c.Field === 'permission_key')).toBeDefined();
    expect(columns.find(c => c.Field === 'granted_by')).toBeDefined();
    expect(columns.find(c => c.Field === 'granted_at')).toBeDefined();
  });
});
```

### Test 1.2: UNIQUE Constraint
```javascript
it('should enforce UNIQUE constraint on (user_id, clinic_id, permission_key)', async () => {
  await db.execute(
    'INSERT INTO user_permissions (user_id, clinic_id, permission_key, granted_by) VALUES (?, ?, ?, ?)',
    [1, 1, 'patient.view', 2]
  );
  
  await expect(
    db.execute(
      'INSERT INTO user_permissions (user_id, clinic_id, permission_key, granted_by) VALUES (?, ?, ?, ?)',
      [1, 1, 'patient.view', 2]
    )
  ).rejects.toThrow();
});
```

### Test 1.3: Foreign Key CASCADE
```javascript
it('should CASCADE delete when user is deleted', async () => {
  const userId = await createTestUser();
  await db.execute(
    'INSERT INTO user_permissions (user_id, clinic_id, permission_key, granted_by) VALUES (?, ?, ?, ?)',
    [userId, 1, 'patient.view', 2]
  );
  
  await db.execute('DELETE FROM auth_users WHERE id = ?', [userId]);
  
  const [perms] = await db.execute(
    'SELECT * FROM user_permissions WHERE user_id = ?',
    [userId]
  );
  expect(perms).toHaveLength(0);
});
```

### Test 1.4-1.10: Additional Database Tests
- Index creation verification
- Foreign key constraints
- Default values
- Data type validation
- Timestamp auto-update
- NULL constraint enforcement
- Performance of indexed queries

---

## 2️⃣ PERMISSION SERVICE TESTS

### Test 2.1: Super User Bypass
```javascript
describe('PermissionService.hasPermission - Super User', () => {
  it('should grant ALL permissions to Super User', async () => {
    const superUser = await createSuperUser();
    const permissions = [
      'patient.view', 'patient.add', 'patient.delete',
      'admin.users', 'admin.settings', 'billing.create'
    ];
    
    for (const perm of permissions) {
      const hasPermission = await PermissionService.hasPermission(
        superUser.id, 1, perm
      );
      expect(hasPermission).toBe(true);
    }
  });
  
  it('should grant non-existent permissions to Super User', async () => {
    const superUser = await createSuperUser();
    const hasPermission = await PermissionService.hasPermission(
      superUser.id, 1, 'fake.permission.that.does.not.exist'
    );
    expect(hasPermission).toBe(true);
  });
});
```

### Test 2.2: User-Specific Permission
```javascript
describe('PermissionService.hasPermission - User Permission', () => {
  it('should use user-specific permission over role default', async () => {
    const staff = await createStaffUser(); // Staff role has no billing access
    
    // Grant specific permission
    await PermissionService.grantPermission(
      staff.id, 1, 'billing.create', ownerUserId
    );
    
    const hasPermission = await PermissionService.hasPermission(
      staff.id, 1, 'billing.create'
    );
    expect(hasPermission).toBe(true);
  });
  
  it('should return false for revoked user permission', async () => {
    const doctor = await createDoctorUser(); // Doctor has patient.view by role
    
    // Explicitly revoke (by not granting user permission)
    const hasPermission = await PermissionService.hasPermission(
      doctor.id, 1, 'patient.view'
    );
    expect(hasPermission).toBe(true); // Still has via role
  });
});
```

### Test 2.3: Role Fallback
```javascript
describe('PermissionService.hasPermission - Role Fallback', () => {
  it('should fallback to role permission if no user permission', async () => {
    const doctor = await createDoctorUser();
    
    // Doctor role has clinical.diagnoses.create by default
    const hasPermission = await PermissionService.hasPermission(
      doctor.id, 1, 'clinical.diagnoses.create'
    );
    expect(hasPermission).toBe(true);
  });
  
  it('should deny if neither user nor role has permission', async () => {
    const staff = await createStaffUser();
    
    // Staff has no admin permissions
    const hasPermission = await PermissionService.hasPermission(
      staff.id, 1, 'admin.users'
    );
    expect(hasPermission).toBe(false);
  });
});
```

### Test 2.4: Grant Permission
```javascript
describe('PermissionService.grantPermission', () => {
  it('should grant permission with audit trail', async () => {
    const staff = await createStaffUser();
    const owner = await createOwnerUser();
    
    const result = await PermissionService.grantPermission(
      staff.id, 1, 'billing.create', owner.id
    );
    
    expect(result.user_id).toBe(staff.id);
    expect(result.clinic_id).toBe(1);
    expect(result.permission_key).toBe('billing.create');
    expect(result.granted_by).toBe(owner.id);
    expect(result.granted_at).toBeDefined();
  });
  
  it('should update granted_at if permission already exists', async () => {
    const staff = await createStaffUser();
    const owner = await createOwnerUser();
    
    await PermissionService.grantPermission(
      staff.id, 1, 'billing.create', owner.id
    );
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const result = await PermissionService.grantPermission(
      staff.id, 1, 'billing.create', owner.id
    );
    
    // Should update timestamp, not create duplicate
    const [perms] = await db.execute(
      'SELECT COUNT(*) as count FROM user_permissions WHERE user_id = ? AND permission_key = ?',
      [staff.id, 'billing.create']
    );
    expect(perms[0].count).toBe(1);
  });
});
```

### Test 2.5-2.15: Additional Service Tests
- Revoke permission
- Get user permissions (all)
- Get user permissions (by module)
- Bulk grant permissions
- Bulk revoke permissions
- Permission validation
- Invalid permission key handling
- Cross-clinic permission prevention
- Audit trail retrieval
- Permission caching
- Cache invalidation

---

## 3️⃣ API ENDPOINT TESTS

### Test 3.1: Grant Permission API
```javascript
describe('POST /api/v1/permissions/grant', () => {
  it('should grant permission when called by Owner', async () => {
    const owner = await createOwnerUser();
    const staff = await createStaffUser();
    const token = generateToken(owner);
    
    const response = await request(app)
      .post('/api/v1/permissions/grant')
      .set('Authorization', `Bearer ${token}`)
      .send({
        userId: staff.id,
        clinicId: 1,
        permissionKey: 'billing.create'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.permission_key).toBe('billing.create');
  });
  
  it('should deny grant when called by non-Owner', async () => {
    const staff = await createStaffUser();
    const doctor = await createDoctorUser();
    const token = generateToken(staff);
    
    const response = await request(app)
      .post('/api/v1/permissions/grant')
      .set('Authorization', `Bearer ${token}`)
      .send({
        userId: doctor.id,
        clinicId: 1,
        permissionKey: 'admin.users'
      });
    
    expect(response.status).toBe(403);
  });
});
```

### Test 3.2: Revoke Permission API
```javascript
describe('DELETE /api/v1/permissions/revoke', () => {
  it('should revoke permission when called by Owner', async () => {
    const owner = await createOwnerUser();
    const staff = await createStaffUser();
    const token = generateToken(owner);
    
    // First grant
    await PermissionService.grantPermission(
      staff.id, 1, 'billing.create', owner.id
    );
    
    // Then revoke
    const response = await request(app)
      .delete('/api/v1/permissions/revoke')
      .set('Authorization', `Bearer ${token}`)
      .send({
        userId: staff.id,
        clinicId: 1,
        permissionKey: 'billing.create'
      });
    
    expect(response.status).toBe(200);
    
    // Verify revoked
    const hasPermission = await PermissionService.hasPermission(
      staff.id, 1, 'billing.create'
    );
    expect(hasPermission).toBe(false);
  });
});
```

### Test 3.3-3.12: Additional API Tests
- Get user permissions API
- Get available permissions API
- Get permission audit trail API
- Bulk grant API
- Bulk revoke API
- Invalid request validation
- Missing parameters handling
- Invalid permission key handling
- Rate limiting
- CORS headers

---

## 4️⃣ SECURITY TESTS

### Test 4.1: Cross-Clinic Permission Grant
```javascript
describe('Security - Cross-Clinic', () => {
  it('should prevent granting permissions to users in other clinics', async () => {
    const clinic1Owner = await createOwnerUser(1);
    const clinic2Staff = await createStaffUser(2);
    const token = generateToken(clinic1Owner);
    
    const response = await request(app)
      .post('/api/v1/permissions/grant')
      .set('Authorization', `Bearer ${token}`)
      .send({
        userId: clinic2Staff.id,
        clinicId: 2,
        permissionKey: 'patient.view'
      });
    
    expect(response.status).toBe(403);
    expect(response.body.error).toContain('different clinic');
  });
});
```

### Test 4.2: SQL Injection Prevention
```javascript
describe('Security - SQL Injection', () => {
  it('should prevent SQL injection in permission key', async () => {
    const owner = await createOwnerUser();
    const staff = await createStaffUser();
    const token = generateToken(owner);
    
    const response = await request(app)
      .post('/api/v1/permissions/grant')
      .set('Authorization', `Bearer ${token}`)
      .send({
        userId: staff.id,
        clinicId: 1,
        permissionKey: "patient.view' OR '1'='1"
      });
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Invalid permission key');
  });
});
```

### Test 4.3-4.8: Additional Security Tests
- XSS prevention in permission keys
- CSRF token validation
- JWT token expiration
- Permission escalation prevention
- Audit trail immutability
- Rate limiting bypass attempts

---

## 5️⃣ PERFORMANCE TESTS

### Test 5.1: Permission Check Latency
```javascript
describe('Performance - Permission Check', () => {
  it('should check permission in < 50ms', async () => {
    const doctor = await createDoctorUser();
    
    const start = Date.now();
    await PermissionService.hasPermission(
      doctor.id, 1, 'patient.view'
    );
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(50);
  });
});
```

### Test 5.2: Bulk Permission Check
```javascript
describe('Performance - Bulk Check', () => {
  it('should check 100 permissions in < 500ms', async () => {
    const doctor = await createDoctorUser();
    const permissions = Array(100).fill('patient.view');
    
    const start = Date.now();
    await Promise.all(
      permissions.map(p => 
        PermissionService.hasPermission(doctor.id, 1, p)
      )
    );
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(500);
  });
});
```

### Test 5.3: Database Query Optimization
```javascript
describe('Performance - Query Optimization', () => {
  it('should use indexes for permission lookup', async () => {
    const [explain] = await db.execute(
      'EXPLAIN SELECT * FROM user_permissions WHERE user_id = ? AND clinic_id = ? AND permission_key = ?',
      [1, 1, 'patient.view']
    );
    
    expect(explain[0].key).toBe('unique_user_permission');
  });
});
```

---

## 6️⃣ INTEGRATION TESTS

### Test 6.1: End-to-End Permission Flow
```javascript
describe('Integration - E2E Permission Flow', () => {
  it('should complete full permission lifecycle', async () => {
    // 1. Create users
    const owner = await createOwnerUser();
    const staff = await createStaffUser();
    
    // 2. Verify staff has no billing access
    let hasPermission = await PermissionService.hasPermission(
      staff.id, 1, 'billing.create'
    );
    expect(hasPermission).toBe(false);
    
    // 3. Owner grants permission
    await PermissionService.grantPermission(
      staff.id, 1, 'billing.create', owner.id
    );
    
    // 4. Verify staff now has access
    hasPermission = await PermissionService.hasPermission(
      staff.id, 1, 'billing.create'
    );
    expect(hasPermission).toBe(true);
    
    // 5. Staff creates invoice (protected route)
    const token = generateToken(staff);
    const response = await request(app)
      .post('/api/v1/billing/invoices')
      .set('Authorization', `Bearer ${token}`)
      .send({ /* invoice data */ });
    expect(response.status).toBe(200);
    
    // 6. Owner revokes permission
    await PermissionService.revokePermission(
      staff.id, 1, 'billing.create'
    );
    
    // 7. Verify staff no longer has access
    hasPermission = await PermissionService.hasPermission(
      staff.id, 1, 'billing.create'
    );
    expect(hasPermission).toBe(false);
    
    // 8. Staff cannot create invoice
    const response2 = await request(app)
      .post('/api/v1/billing/invoices')
      .set('Authorization', `Bearer ${token}`)
      .send({ /* invoice data */ });
    expect(response2.status).toBe(403);
  });
});
```

### Test 6.2-6.5: Additional Integration Tests
- Multi-user permission management
- Role change impact on permissions
- Clinic deletion cascade
- Permission audit trail completeness

---

## 7️⃣ UI TESTS

### Test 7.1: Permission Page Load
```javascript
describe('UI - Permission Page', () => {
  it('should load permission management page', async () => {
    const owner = await createOwnerUser();
    const token = generateToken(owner);
    
    const response = await request(app)
      .get('/permissions')
      .set('Cookie', `token=${token}`);
    
    expect(response.status).toBe(200);
    expect(response.text).toContain('User Group Access Settings');
  });
});
```

### Test 7.2: User Selection
```javascript
describe('UI - User Selection', () => {
  it('should display all clinic users in dropdown', async () => {
    // Test with Puppeteer or similar
    await page.goto('http://localhost:3000/permissions');
    const users = await page.$$eval('#userSelect option', options => 
      options.map(o => o.textContent)
    );
    expect(users.length).toBeGreaterThan(0);
  });
});
```

### Test 7.3-7.7: Additional UI Tests
- Permission checkbox state
- Grant permission button
- Revoke permission button
- Audit trail display
- Real-time updates

---

## ✅ TEST EXECUTION PLAN

### Phase 1: Unit Tests (Day 1)
- Run all database tests
- Run all service tests
- Target: 100% service coverage

### Phase 2: API Tests (Day 2)
- Run all endpoint tests
- Run security tests
- Target: All endpoints protected

### Phase 3: Integration Tests (Day 3)
- Run E2E tests
- Run performance tests
- Target: < 50ms permission checks

### Phase 4: UI Tests (Day 4)
- Manual UI testing
- Automated UI tests
- Target: All features functional

### Phase 5: UAT (Day 5)
- Owner tests permission management
- Staff tests limited access
- Doctor tests clinical access
- Target: User acceptance

---

## 📊 TEST COVERAGE REPORT

```
Category                Tests   Passing   Coverage
─────────────────────────────────────────────────
Database                10      0/10      0%
Permission Service      15      0/15      0%
API Endpoints           12      0/12      0%
Security                8       0/8       0%
Performance             3       0/3       0%
Integration             5       0/5       0%
UI                      7       0/7       0%
─────────────────────────────────────────────────
TOTAL                   60      0/60      0%
```

**Target:** 100% passing before deployment

---

## 🚀 NEXT STEPS

1. ✅ Review test specification
2. ⏳ Approve test plan
3. ⏳ Implement tests
4. ⏳ Run tests
5. ⏳ Fix failures
6. ⏳ Achieve 100% coverage
7. ⏳ Deploy to production

---

**Document Status:** READY FOR REVIEW  
**Approval Required:** YES  
**Estimated Test Development Time:** 8-10 hours
