# CuraOne Granular Permission System Documentation

## Overview
CuraOne implements a comprehensive granular permission system that provides checkbox-based access control for every module and service within the clinic management platform.

## Permission Architecture

### Core Principles
1. **Granular Control**: Each action/service has individual permission checkboxes
2. **Default Deny**: Users have NO access by default (except Super User)
3. **Permission-Based UI**: Interface elements show/hide based on actual permissions
4. **Hierarchical Management**: Users with "User Group Access Settings" can manage others

### Permission Hierarchy

```
Super User
├── ALL permissions by default (cannot be restricted)
└── System-wide access

Owner
├── "admin.permissions" (User Group Access Settings) by default
├── Can grant/revoke permissions to other users
└── Can add new doctors, staff, etc.

All Other Users (Doctor, Staff, Lab Tech, etc.)
├── NO permissions by default
├── Must be granted access by Owner/Super User
└── Access controlled by specific permission keys
```

## Permission Categories & Keys

### 1. Patient Module
| Permission Key | Label | Description |
|---|---|---|
| `patient.add` | Add Patient | Create new patient records |
| `patient.edit` | Edit Patient | Modify patient information |
| `patient.view` | View Patient | Access patient records |
| `patient.delete` | Delete Patient | Remove patient records |

### 2. Appointment Module
| Permission Key | Label | Description |
|---|---|---|
| `appointment.create` | Create Appointment | Schedule new appointments |
| `appointment.edit` | Edit Appointment | Modify appointments |
| `appointment.view` | View Appointment | Access appointment details |
| `appointment.cancel` | Cancel Appointment | Cancel appointments |

### 3. Billing Module
| Permission Key | Label | Description |
|---|---|---|
| `billing.create` | Create Invoice | Generate bills and invoices |
| `billing.edit` | Edit Invoice | Modify billing information |
| `billing.view` | View Invoice | Access billing records |
| `billing.payment` | Process Payment | Handle payment processing |

### 4. Clinical Module
| Permission Key | Label | Description |
|---|---|---|
| `clinical.visit.create` | Create Visit | Document patient visits |
| `clinical.visit.edit` | Edit Visit | Modify visit records |
| `clinical.visit.view` | View Visit | Access visit history |
| `clinical.lab.order` | Order Lab Tests | Request laboratory tests |

### 5. Lab Module
| Permission Key | Label | Description |
|---|---|---|
| `lab.request.create` | Create Lab Request | Order lab tests |
| `lab.result.enter` | Enter Lab Results | Input test results |
| `lab.result.view` | View Lab Results | Access lab reports |
| `lab.dashboard` | Lab Dashboard | Access lab analytics |

### 6. Reports Module
| Permission Key | Label | Description |
|---|---|---|
| `reports.clinical` | Clinical Reports | Generate clinical reports |
| `reports.financial` | Financial Reports | Access financial analytics |
| `reports.patient` | Patient Reports | Generate patient summaries |
| `reports.export` | Export Reports | Export data and reports |

### 7. Admin Module
| Permission Key | Label | Description |
|---|---|---|
| `admin.users` | User Management | Manage clinic users |
| `admin.permissions` | User Group Access Settings | Manage user permissions |
| `admin.settings` | Clinic Settings | Configure clinic settings |
| `admin.audit` | Audit Logs | View system audit logs |

## Database Schema

### user_permissions Table
```sql
CREATE TABLE user_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    clinic_id INT NOT NULL,
    permission_key VARCHAR(100) NOT NULL,
    granted_by INT NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE,
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES auth_users(id),
    
    UNIQUE KEY unique_user_permission (user_id, clinic_id, permission_key)
);
```

## API Endpoints

### Permission Management
- `GET /api/v1/permissions/definitions` - Get all available permissions
- `GET /api/v1/permissions/users/:userId` - Get user's current permissions
- `PUT /api/v1/permissions/users/:userId` - Update user permissions
- `GET /api/v1/permissions/check/:permission` - Check specific permission
- `GET /api/v1/permissions/users` - Get all users with permissions

### Permission Checking Middleware
```javascript
// Example permission check
const hasPermission = await checkUserPermission(userId, clinicId, 'patient.add');
if (!hasPermission) {
    return res.status(403).json({ error: 'Insufficient permissions' });
}
```

## User Interface

### User Group Access Settings (`/permissions`)
- **Access**: Users with `admin.permissions` or Owner role
- **Features**:
  - List all clinic users
  - Manage permissions modal with organized checkboxes
  - Real-time permission updates
  - Visual permission count indicators

### Permission-Based Dashboard Rendering
Dashboards now show/hide features based on actual permissions:
```javascript
// Example: Show patient registration only if user has permission
if (userPermissions.includes('patient.add')) {
    showPatientRegistrationButton();
}
```

## Implementation Examples

### Staff Permission Example
```
Staff Member "John Doe":
✅ patient.add (Add Patient)
✅ patient.view (View Patient)
✅ appointment.create (Create Appointment)
✅ appointment.view (View Appointment)
❌ billing.* (No billing access)
❌ clinical.* (No clinical access)
```

### Doctor Permission Example
```
Doctor "Dr. Smith":
✅ patient.* (All patient permissions)
✅ appointment.* (All appointment permissions)
✅ clinical.* (All clinical permissions)
✅ lab.request.create (Order lab tests)
✅ lab.result.view (View lab results)
❌ billing.* (No billing access)
❌ admin.* (No admin access)
```

## Security Considerations

### Permission Validation
1. **Server-Side Validation**: All API endpoints validate permissions
2. **UI Rendering**: Frontend hides/shows based on permissions
3. **Audit Logging**: All permission changes are logged
4. **Multi-Tenant Isolation**: Permissions are clinic-specific

### Default Permissions
- **Super User**: All permissions (cannot be modified)
- **Owner**: `admin.permissions` by default
- **All Others**: No permissions by default

## Migration & Deployment

### Existing Users
- Run `scripts/setup-user-permissions.sql` to create tables
- Super Users and Owners get default permissions automatically
- Other users need permissions assigned manually

### Permission Assignment Workflow
1. Owner/Super User accesses `/permissions`
2. Selects user to manage
3. Checks/unchecks permission checkboxes by module
4. Saves permissions
5. User immediately gains/loses access to features

## Benefits

### For Clinic Owners
- **Granular Control**: Precise access management per user
- **Security**: Principle of least privilege
- **Flexibility**: Mix and match permissions as needed
- **Audit Trail**: Track who granted what permissions

### For Users
- **Clear Interface**: Only see features they can use
- **Role Flexibility**: Same person can have multiple roles
- **Customized Experience**: Dashboard adapts to permissions

### For Compliance
- **Access Control**: Detailed permission tracking
- **Audit Logs**: Complete permission change history
- **Data Protection**: Users only access authorized data
- **Regulatory Compliance**: Meets healthcare access requirements

This granular permission system provides the foundation for secure, flexible, and compliant clinic management operations.