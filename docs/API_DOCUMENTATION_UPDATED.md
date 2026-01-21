# CuraOne API Documentation - Updated with Granular Permissions

## Authentication & Permissions

All API endpoints require JWT authentication via `Authorization: Bearer <token>` header.
Additionally, endpoints now validate **granular permissions** for each action.

### Permission System Overview

CuraOne uses a **checkbox-based granular permission system** where:
- Each action requires a specific permission key
- Users have NO access by default (except Super User)
- Owners can manage permissions via User Group Access Settings
- Permissions are clinic-specific and multi-tenant isolated

## Permission Management Endpoints

### Get Permission Definitions
```http
GET /api/v1/permissions/definitions
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "patient": [
      {
        "key": "patient.add",
        "label": "Add Patient",
        "description": "Create new patient records"
      },
      {
        "key": "patient.edit",
        "label": "Edit Patient", 
        "description": "Modify patient information"
      }
    ],
    "appointment": [...],
    "billing": [...],
    "clinical": [...],
    "lab": [...],
    "reports": [...],
    "admin": [...]
  }
}
```

### Get User Permissions
```http
GET /api/v1/permissions/users/:userId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    "patient.add",
    "patient.view",
    "appointment.create",
    "appointment.view"
  ]
}
```

### Update User Permissions
```http
PUT /api/v1/permissions/users/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "permissions": [
    "patient.add",
    "patient.view",
    "appointment.create"
  ]
}
```

**Required Permission:** `admin.permissions` or Owner role

**Response:**
```json
{
  "success": true,
  "message": "User permissions updated successfully"
}
```

### Check Specific Permission
```http
GET /api/v1/permissions/check/:permission
Authorization: Bearer <token>
```

**Example:** `GET /api/v1/permissions/check/patient.add`

**Response:**
```json
{
  "success": true,
  "hasPermission": true
}
```

### Get All Users with Permissions
```http
GET /api/v1/permissions/users
Authorization: Bearer <token>
```

**Required Permission:** `admin.permissions`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "full_name": "John Doe",
      "email": "john@clinic.com",
      "roles": ["Staff"],
      "status": "active",
      "permissions": ["patient.add", "patient.view"]
    }
  ]
}
```

## Updated Existing Endpoints with Permission Requirements

### Patient Management

#### Create Patient
```http
POST /api/v1/patients
Authorization: Bearer <token>
```
**Required Permission:** `patient.add`

#### Get Patient Details
```http
GET /api/v1/patients/:id
Authorization: Bearer <token>
```
**Required Permission:** `patient.view`

#### Update Patient
```http
PUT /api/v1/patients/:id
Authorization: Bearer <token>
```
**Required Permission:** `patient.edit`

#### Delete Patient
```http
DELETE /api/v1/patients/:id
Authorization: Bearer <token>
```
**Required Permission:** `patient.delete`

### Appointment Management

#### Create Appointment
```http
POST /api/v1/appointments
Authorization: Bearer <token>
```
**Required Permission:** `appointment.create`

#### Update Appointment
```http
PUT /api/v1/appointments/:id
Authorization: Bearer <token>
```
**Required Permission:** `appointment.edit`

#### View Appointments
```http
GET /api/v1/appointments
Authorization: Bearer <token>
```
**Required Permission:** `appointment.view`

#### Cancel Appointment
```http
DELETE /api/v1/appointments/:id
Authorization: Bearer <token>
```
**Required Permission:** `appointment.cancel`

### Clinical Documentation

#### Create Visit
```http
POST /api/v1/visits
Authorization: Bearer <token>
```
**Required Permission:** `clinical.visit.create`

#### Update Visit
```http
PUT /api/v1/visits/:id
Authorization: Bearer <token>
```
**Required Permission:** `clinical.visit.edit`

#### View Visit
```http
GET /api/v1/visits/:id
Authorization: Bearer <token>
```
**Required Permission:** `clinical.visit.view`

#### Order Lab Tests
```http
POST /api/v1/lab/requests
Authorization: Bearer <token>
```
**Required Permission:** `clinical.lab.order`

### Laboratory Management

#### Create Lab Request
```http
POST /api/v1/lab/requests
Authorization: Bearer <token>
```
**Required Permission:** `lab.request.create`

#### Enter Lab Results
```http
POST /api/v1/lab/results
Authorization: Bearer <token>
```
**Required Permission:** `lab.result.enter`

#### View Lab Results
```http
GET /api/v1/lab/results/:id
Authorization: Bearer <token>
```
**Required Permission:** `lab.result.view`

#### Lab Dashboard
```http
GET /api/v1/lab/dashboard
Authorization: Bearer <token>
```
**Required Permission:** `lab.dashboard`

### Billing Management

#### Create Invoice
```http
POST /api/v1/billing/invoices
Authorization: Bearer <token>
```
**Required Permission:** `billing.create`

#### Update Invoice
```http
PUT /api/v1/billing/invoices/:id
Authorization: Bearer <token>
```
**Required Permission:** `billing.edit`

#### View Invoice
```http
GET /api/v1/billing/invoices/:id
Authorization: Bearer <token>
```
**Required Permission:** `billing.view`

#### Process Payment
```http
POST /api/v1/billing/payments
Authorization: Bearer <token>
```
**Required Permission:** `billing.payment`

### Reports & Analytics

#### Clinical Reports
```http
GET /api/v1/reports/clinical
Authorization: Bearer <token>
```
**Required Permission:** `reports.clinical`

#### Financial Reports
```http
GET /api/v1/reports/financial
Authorization: Bearer <token>
```
**Required Permission:** `reports.financial`

#### Patient Reports
```http
GET /api/v1/reports/patients
Authorization: Bearer <token>
```
**Required Permission:** `reports.patient`

#### Export Reports
```http
GET /api/v1/reports/export
Authorization: Bearer <token>
```
**Required Permission:** `reports.export`

### Administration

#### User Management
```http
GET /api/v1/users
POST /api/v1/users
PUT /api/v1/users/:id
DELETE /api/v1/users/:id
Authorization: Bearer <token>
```
**Required Permission:** `admin.users`

#### Clinic Settings
```http
GET /api/v1/settings
PUT /api/v1/settings
Authorization: Bearer <token>
```
**Required Permission:** `admin.settings`

#### Audit Logs
```http
GET /api/v1/audit/logs
Authorization: Bearer <token>
```
**Required Permission:** `admin.audit`

## Permission Validation Flow

1. **Request Received** - API endpoint receives request with JWT token
2. **Token Validation** - JWT token is validated and user info extracted
3. **Permission Check** - System checks if user has required permission for the action
4. **Multi-Tenant Isolation** - Permission is validated within user's clinic context
5. **Action Execution** - If permission exists, action is executed
6. **Audit Logging** - All permission checks and actions are logged

## Error Responses

### Insufficient Permissions
```json
{
  "success": false,
  "error": "Insufficient permissions",
  "code": 403,
  "required_permission": "patient.add"
}
```

### Permission Not Found
```json
{
  "success": false,
  "error": "Permission not found",
  "code": 404,
  "permission": "invalid.permission"
}
```

### Unauthorized Access
```json
{
  "success": false,
  "error": "Unauthorized access",
  "code": 401,
  "message": "Valid JWT token required"
}
```

## Permission Keys Reference

### Complete Permission List

| Module | Permission Key | Description |
|--------|---------------|-------------|
| **Patient** | `patient.add` | Create new patient records |
| | `patient.edit` | Modify patient information |
| | `patient.view` | Access patient records |
| | `patient.delete` | Remove patient records |
| **Appointment** | `appointment.create` | Schedule new appointments |
| | `appointment.edit` | Modify appointments |
| | `appointment.view` | Access appointment details |
| | `appointment.cancel` | Cancel appointments |
| **Billing** | `billing.create` | Generate bills and invoices |
| | `billing.edit` | Modify billing information |
| | `billing.view` | Access billing records |
| | `billing.payment` | Handle payment processing |
| **Clinical** | `clinical.visit.create` | Document patient visits |
| | `clinical.visit.edit` | Modify visit records |
| | `clinical.visit.view` | Access visit history |
| | `clinical.lab.order` | Request laboratory tests |
| **Lab** | `lab.request.create` | Order lab tests |
| | `lab.result.enter` | Input test results |
| | `lab.result.view` | Access lab reports |
| | `lab.dashboard` | Access lab analytics |
| **Reports** | `reports.clinical` | Generate clinical reports |
| | `reports.financial` | Access financial analytics |
| | `reports.patient` | Generate patient summaries |
| | `reports.export` | Export data and reports |
| **Admin** | `admin.users` | Manage clinic users |
| | `admin.permissions` | Manage user permissions |
| | `admin.settings` | Configure clinic settings |
| | `admin.audit` | View system audit logs |

## Implementation Notes

### Super User Privileges
- Super Users have ALL permissions by default
- Super User permissions cannot be modified
- Super Users bypass all permission checks

### Owner Default Permissions
- Owners get `admin.permissions` by default
- Owners can manage all other users' permissions
- Owners can grant themselves additional permissions

### Multi-Tenant Security
- All permissions are clinic-specific
- Users cannot access data from other clinics
- Permission checks include clinic_id validation

### Performance Considerations
- Permission checks are cached per request
- Database queries are optimized with proper indexing
- Permission validation adds minimal overhead

This granular permission system provides unprecedented security and flexibility for clinic management operations.