# Hybrid Permission System - Implementation Plan
# CuraOne Clinic SaaS
# Date: 2026-02-09
# Version: 1.0

---

## 📋 EXECUTIVE SUMMARY

**Objective:** Implement a hybrid permission system that combines role-based defaults with granular user-level overrides.

**Current State:**
- ✅ Role-based system exists (roles → permissions)
- ✅ 10 permissions defined in database
- ❌ No user-level permission overrides
- ❌ No audit trail for permission grants

**Target State:**
- ✅ Keep existing role system (backward compatible)
- ✅ Add user-level permission overrides
- ✅ Implement audit trail (who granted, when)
- ✅ Granular control per user per clinic

---

## 🎯 SYSTEM ARCHITECTURE

### Permission Resolution Flow

```
┌─────────────────────────────────────────────────────────┐
│  User requests access to feature (e.g., patient.add)   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Step 1: Check if user is Super User                   │
│  └─ YES → GRANT ACCESS (bypass all checks)             │
│  └─ NO  → Continue to Step 2                           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Step 2: Check user_permissions table                  │
│  └─ FOUND → Use user-specific permission               │
│  └─ NOT FOUND → Continue to Step 3                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Step 3: Check role_permissions via user's role        │
│  └─ FOUND → Use role default permission                │
│  └─ NOT FOUND → DENY ACCESS                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Return: GRANT or DENY                                  │
└─────────────────────────────────────────────────────────┘
```

### Database Schema

```sql
-- NEW TABLE: user_permissions
CREATE TABLE user_permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    clinic_id BIGINT NOT NULL,
    permission_key VARCHAR(100) NOT NULL,
    granted_by BIGINT NOT NULL,
    granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE,
    FOREIGN KEY (clinic_id) REFERENCES clinics(clinic_id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES auth_users(id),
    
    UNIQUE KEY unique_user_permission (user_id, clinic_id, permission_key),
    INDEX idx_user_clinic (user_id, clinic_id),
    INDEX idx_permission_key (permission_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- POPULATE: role_permissions (currently empty)
-- Map default permissions to roles
INSERT INTO role_permissions (role_id, permission_id) VALUES
-- Owner (role_id = 2) - Full access except clinical
(2, 1),  -- patients.view
(2, 2),  -- patients.create
(2, 3),  -- appointments.view
(2, 4),  -- appointments.create
(2, 9),  -- billing.invoices.view
(2, 10), -- admin.users.manage

-- Doctor (role_id = 3) - Clinical + Patient access
(3, 1),  -- patients.view
(3, 2),  -- patients.create
(3, 3),  -- appointments.view
(3, 4),  -- appointments.create
(3, 5),  -- clinical.diagnoses.create
(3, 6),  -- clinical.vitals.create
(3, 7),  -- labs.requests.create

-- Staff (role_id = 4) - Limited access
(4, 1),  -- patients.view
(4, 3),  -- appointments.view
(4, 4),  -- appointments.create

-- Lab Technician (role_id = 5) - Lab only
(5, 1),  -- patients.view
(5, 7),  -- labs.requests.create
(5, 8); -- labs.results.enter
```

---

## 📊 PERMISSION MODULES

### Module 1: Patient Management
```javascript
{
  'patient.view': 'View patient demographics and lists',
  'patient.add': 'Create new patient profiles',
  'patient.edit': 'Edit existing patient information',
  'patient.delete': 'Delete patient records (soft delete)'
}
```

### Module 2: Appointment Management
```javascript
{
  'appointment.view': 'View appointment schedules',
  'appointment.create': 'Schedule new appointments',
  'appointment.edit': 'Modify existing appointments',
  'appointment.cancel': 'Cancel appointments'
}
```

### Module 3: Billing
```javascript
{
  'billing.view': 'View invoices and billing history',
  'billing.create': 'Create new invoices',
  'billing.edit': 'Edit invoice details',
  'billing.payment': 'Process payments'
}
```

### Module 4: Clinical
```javascript
{
  'clinical.visit.create': 'Create visit records',
  'clinical.visit.edit': 'Edit visit documentation',
  'clinical.visit.view': 'View visit records',
  'clinical.diagnosis.create': 'Add diagnoses',
  'clinical.vitals.record': 'Record vital signs',
  'clinical.lab.order': 'Order lab tests'
}
```

### Module 5: Laboratory
```javascript
{
  'lab.request.create': 'Create lab requests',
  'lab.result.enter': 'Enter lab results',
  'lab.result.view': 'View lab results',
  'lab.dashboard': 'Access lab dashboard'
}
```

### Module 6: Reports
```javascript
{
  'reports.clinical': 'View clinical reports',
  'reports.financial': 'View financial reports',
  'reports.patient': 'View patient reports',
  'reports.export': 'Export reports to CSV/PDF'
}
```

### Module 7: Administration
```javascript
{
  'admin.users': 'Manage clinic users',
  'admin.permissions': 'Manage user permissions (User Group Access Settings)',
  'admin.settings': 'Modify clinic settings',
  'admin.audit': 'View audit logs'
}
```

---

## 🔧 IMPLEMENTATION PHASES

### Phase 1: Database Setup (Day 1)
**Duration:** 2-3 hours

**Tasks:**
1. Create `user_permissions` table
2. Populate `role_permissions` with defaults
3. Add new permissions to `permissions` table
4. Create database migration script
5. Test database constraints

**Deliverables:**
- `migrations/add-user-permissions.sql`
- `migrations/populate-role-permissions.sql`
- `migrations/add-new-permissions.sql`

**Testing:**
- Verify table creation
- Test UNIQUE constraint
- Test CASCADE delete
- Verify indexes created

---

### Phase 2: Backend Permission Service (Day 1-2)
**Duration:** 4-5 hours

**Tasks:**
1. Create `PermissionService` class
2. Implement `hasPermission(userId, clinicId, permissionKey)`
3. Implement `grantPermission(userId, clinicId, permissionKey, grantedBy)`
4. Implement `revokePermission(userId, clinicId, permissionKey)`
5. Implement `getUserPermissions(userId, clinicId)`
6. Add caching layer (Redis optional)

**Deliverables:**
- `src/services/PermissionService.js`
- `src/middleware/checkPermission.js`

**Testing:**
- Unit tests for each method
- Test permission resolution flow
- Test Super User bypass
- Test role fallback
- Test audit trail creation

---

### Phase 3: API Endpoints (Day 2)
**Duration:** 3-4 hours

**Tasks:**
1. `GET /api/v1/permissions/user/:userId` - Get user permissions
2. `POST /api/v1/permissions/grant` - Grant permission
3. `DELETE /api/v1/permissions/revoke` - Revoke permission
4. `GET /api/v1/permissions/available` - List all permissions
5. `GET /api/v1/permissions/audit/:userId` - Permission audit trail

**Deliverables:**
- `src/routes/permissionRoutes.js`
- `src/controllers/PermissionController.js`

**Testing:**
- API integration tests
- Test authorization (only Owner/Super User can grant)
- Test validation
- Test error handling

---

### Phase 4: Frontend UI (Day 3)
**Duration:** 6-8 hours

**Tasks:**
1. Create `/permissions` page
2. User selection dropdown
3. Permission module checkboxes
4. Grant/Revoke functionality
5. Audit trail display
6. Real-time permission updates

**Deliverables:**
- `public/views/user-permissions.html` (update existing)
- `public/js/user-permissions.js` (update existing)
- `public/css/permissions.css`

**Testing:**
- UI functionality tests
- Test checkbox state management
- Test API integration
- Test error display
- Test audit trail display

---

### Phase 5: Route Protection (Day 3-4)
**Duration:** 4-6 hours

**Tasks:**
1. Add permission checks to all routes
2. Update existing middleware
3. Add permission-based UI rendering
4. Test all protected routes

**Deliverables:**
- Updated route files with permission checks
- Frontend permission-aware rendering

**Testing:**
- Test each route with different permissions
- Test unauthorized access attempts
- Test UI element visibility

---

### Phase 6: Testing & Documentation (Day 4-5)
**Duration:** 6-8 hours

**Tasks:**
1. Comprehensive integration tests
2. Security testing
3. Performance testing
4. User acceptance testing
5. Documentation updates

**Deliverables:**
- `tests/permission-system.test.js`
- `docs/PERMISSION_SYSTEM.md`
- `docs/PERMISSION_API.md`
- User guide

---

## 🧪 TESTING STRATEGY

### Unit Tests

```javascript
// Test: Super User bypass
describe('PermissionService - Super User', () => {
  it('should grant all permissions to Super User', async () => {
    const hasPermission = await PermissionService.hasPermission(
      superUserId, clinicId, 'any.permission'
    );
    expect(hasPermission).toBe(true);
  });
});

// Test: User-specific permission
describe('PermissionService - User Permission', () => {
  it('should use user permission over role permission', async () => {
    // Grant specific permission to user
    await PermissionService.grantPermission(
      userId, clinicId, 'patient.delete', grantedBy
    );
    
    const hasPermission = await PermissionService.hasPermission(
      userId, clinicId, 'patient.delete'
    );
    expect(hasPermission).toBe(true);
  });
});

// Test: Role fallback
describe('PermissionService - Role Fallback', () => {
  it('should fallback to role permission if no user permission', async () => {
    // Doctor role has clinical.diagnoses.create
    const hasPermission = await PermissionService.hasPermission(
      doctorUserId, clinicId, 'clinical.diagnoses.create'
    );
    expect(hasPermission).toBe(true);
  });
});

// Test: Deny access
describe('PermissionService - Deny', () => {
  it('should deny access if no permission found', async () => {
    const hasPermission = await PermissionService.hasPermission(
      staffUserId, clinicId, 'admin.users'
    );
    expect(hasPermission).toBe(false);
  });
});
```

### Integration Tests

```javascript
// Test: Grant permission API
describe('POST /api/v1/permissions/grant', () => {
  it('should grant permission with audit trail', async () => {
    const response = await request(app)
      .post('/api/v1/permissions/grant')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        userId: staffUserId,
        clinicId: clinicId,
        permissionKey: 'billing.create'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.data.granted_by).toBe(ownerId);
  });
});

// Test: Unauthorized grant attempt
describe('POST /api/v1/permissions/grant - Unauthorized', () => {
  it('should deny permission grant by non-owner', async () => {
    const response = await request(app)
      .post('/api/v1/permissions/grant')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        userId: doctorUserId,
        clinicId: clinicId,
        permissionKey: 'admin.users'
      });
    
    expect(response.status).toBe(403);
  });
});
```

### Security Tests

```javascript
// Test: Cross-clinic permission grant
describe('Security - Cross-clinic', () => {
  it('should prevent granting permissions across clinics', async () => {
    const response = await request(app)
      .post('/api/v1/permissions/grant')
      .set('Authorization', `Bearer ${clinic1OwnerToken}`)
      .send({
        userId: clinic2UserId,
        clinicId: clinic2Id,
        permissionKey: 'patient.view'
      });
    
    expect(response.status).toBe(403);
  });
});

// Test: SQL injection
describe('Security - SQL Injection', () => {
  it('should prevent SQL injection in permission key', async () => {
    const response = await request(app)
      .post('/api/v1/permissions/grant')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        userId: staffUserId,
        clinicId: clinicId,
        permissionKey: "patient.view' OR '1'='1"
      });
    
    expect(response.status).toBe(400);
  });
});
```

### Performance Tests

```javascript
// Test: Permission check performance
describe('Performance - Permission Check', () => {
  it('should check permission in < 50ms', async () => {
    const start = Date.now();
    await PermissionService.hasPermission(
      userId, clinicId, 'patient.view'
    );
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(50);
  });
});

// Test: Bulk permission check
describe('Performance - Bulk Check', () => {
  it('should check 100 permissions in < 500ms', async () => {
    const permissions = Array(100).fill('patient.view');
    const start = Date.now();
    
    await Promise.all(
      permissions.map(p => 
        PermissionService.hasPermission(userId, clinicId, p)
      )
    );
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(500);
  });
});
```

---

## 📝 API DOCUMENTATION

### Grant Permission

```http
POST /api/v1/permissions/grant
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": 123,
  "clinicId": 1,
  "permissionKey": "patient.add"
}

Response 200:
{
  "success": true,
  "data": {
    "id": 456,
    "user_id": 123,
    "clinic_id": 1,
    "permission_key": "patient.add",
    "granted_by": 789,
    "granted_at": "2026-02-09T15:30:00Z"
  }
}
```

### Revoke Permission

```http
DELETE /api/v1/permissions/revoke
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": 123,
  "clinicId": 1,
  "permissionKey": "patient.add"
}

Response 200:
{
  "success": true,
  "message": "Permission revoked successfully"
}
```

### Get User Permissions

```http
GET /api/v1/permissions/user/123?clinicId=1
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "userId": 123,
    "clinicId": 1,
    "role": "Staff",
    "permissions": {
      "user_specific": ["patient.add", "billing.create"],
      "role_defaults": ["patient.view", "appointment.view"],
      "all": ["patient.view", "patient.add", "appointment.view", "billing.create"]
    }
  }
}
```

---

## 🚀 DEPLOYMENT PLAN

### Pre-Deployment Checklist
- [ ] All tests passing (100% coverage)
- [ ] Database migration tested on staging
- [ ] Backup current database
- [ ] Documentation complete
- [ ] User guide prepared
- [ ] Rollback plan ready

### Deployment Steps
1. Backup production database
2. Run database migrations
3. Deploy backend code
4. Deploy frontend code
5. Verify Super User access
6. Test Owner permission management
7. Monitor for errors (24 hours)

### Rollback Plan
1. Restore database backup
2. Revert code deployment
3. Clear Redis cache
4. Verify system functionality

---

## 📊 SUCCESS METRICS

### Technical Metrics
- Permission check latency < 50ms
- API response time < 200ms
- Zero permission bypass incidents
- 100% test coverage
- Zero SQL injection vulnerabilities

### Business Metrics
- Owner can manage all user permissions
- Doctors have appropriate clinical access
- Staff have limited operational access
- Audit trail captures all permission changes
- Zero unauthorized data access

---

## 🔒 SECURITY CONSIDERATIONS

### Threats & Mitigations

1. **Privilege Escalation**
   - Threat: User grants themselves admin permissions
   - Mitigation: Only Owner/Super User can grant permissions
   - Validation: Check grantor's role before allowing grant

2. **Cross-Clinic Access**
   - Threat: User accesses data from another clinic
   - Mitigation: Always filter by clinic_id
   - Validation: Verify user belongs to clinic

3. **SQL Injection**
   - Threat: Malicious permission keys
   - Mitigation: Parameterized queries, input validation
   - Validation: Whitelist permission keys

4. **Audit Trail Tampering**
   - Threat: Modification of granted_by/granted_at
   - Mitigation: Immutable audit fields
   - Validation: Database constraints

---

## 📚 REFERENCES

- Original Plan: `C:\Users\user\Downloads\permission_system_diagram.tsx`
- Current Database: `check-compatibility.js` output
- Existing Permissions: `permissions` table (10 entries)
- Existing Roles: `roles` table (5 roles)

---

## ✅ APPROVAL CHECKLIST

Before implementation:
- [ ] Architecture reviewed and approved
- [ ] Database schema validated
- [ ] API design approved
- [ ] Testing strategy confirmed
- [ ] Security review completed
- [ ] Documentation reviewed
- [ ] Timeline approved

---

**Document Status:** DRAFT - Awaiting Approval  
**Next Step:** Review and approve before implementation  
**Estimated Total Time:** 4-5 days (32-40 hours)
