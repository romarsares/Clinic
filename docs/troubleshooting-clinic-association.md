# Fixing "Access denied: No clinic association" Error

## Problem
When trying to access patient data or other clinic resources, you receive the error:
```
Access denied: No clinic association
```

## Root Cause
This error occurs when a user account in the database doesn't have a valid `clinic_id` assigned. The CuraOne system is multi-tenant, meaning every user must be associated with a clinic to access data.

## Solution

### Option 1: Run the Automated Fix Script (Recommended)

1. Open a terminal in the project root directory
2. Run the fix script:
   ```bash
   node scripts/fix-user-clinic.js
   ```

This script will:
- Check for users without clinic associations
- Create a default clinic if none exists
- Assign all users to the default clinic
- Verify the fix was successful

### Option 2: Manual SQL Fix

1. Connect to your MySQL database
2. Check which users need fixing:
   ```sql
   SELECT id, email, full_name, clinic_id, status 
   FROM auth_users 
   WHERE clinic_id IS NULL OR clinic_id = 0;
   ```

3. Update users to associate them with a clinic (replace `1` with your clinic ID):
   ```sql
   UPDATE auth_users 
   SET clinic_id = 1 
   WHERE clinic_id IS NULL OR clinic_id = 0;
   ```

4. Or update a specific user:
   ```sql
   UPDATE auth_users 
   SET clinic_id = 1 
   WHERE email = 'your-email@example.com';
   ```

5. Verify the fix:
   ```sql
   SELECT id, email, full_name, clinic_id, status 
   FROM auth_users;
   ```

### Option 3: Create a New User with Clinic Association

If you're creating a new user, ensure you include the `clinic_id`:

```sql
INSERT INTO auth_users (clinic_id, email, password_hash, full_name, status, created_at, updated_at)
VALUES (1, 'newuser@clinic.com', '$2a$12$...', 'New User', 'active', NOW(), NOW());
```

## Prevention

When creating new users through the API, always include the `clinic_id` in the registration request:

```javascript
POST /api/v1/auth/register
{
  "email": "user@clinic.com",
  "password": "securepassword",
  "full_name": "John Doe",
  "clinic_id": 1
}
```

## Verification

After applying the fix:

1. Log out and log back in
2. Try accessing the patients page
3. The error should be resolved

If you still see the error:
- Clear your browser's local storage
- Check that your JWT token is valid
- Verify the user's clinic_id in the database

## Technical Details

The error originates from:
- **File**: `src/middleware/auth.js`
- **Check**: Validates that `req.user.clinic_id` exists after JWT authentication
- **Purpose**: Ensures multi-tenant data isolation

The system enforces strict tenant isolation to prevent users from accessing data from other clinics.
