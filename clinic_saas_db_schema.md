Clinic Operations SaaS - Database Schema (MVP v1)

Design Goals:
- Multi-tenant (one system, many clinics)
- Simple but scalable
- Audit-friendly
- Global-ready
- Developer-friendly

---

# Core Tables Overview

auth_users
clinics
clinic_settings
roles
user_roles
patients
appointments
visits
visit_notes
visit_attachments
services
billings
billing_items
payments
audit_logs

---

# 1. Authentication & Access Control

## auth_users
id
clinic_id
email
password_hash
full_name
status (active, suspended)
last_login_at
created_at
updated_at
deleted_at

## roles
id
clinic_id
name (Owner, Doctor, Staff)
description
created_at
updated_at

## user_roles
id
user_id
role_id
created_at

---
# 2. Clinic Management

## clinics
id
name
address
contact_number
email
timezone
status (trial, active, suspended)
subscription_plan
trial_ends_at
created_at
updated_at

## clinic_settings
id
clinic_id
key
value
created_at
updated_at

---
# 3. Patient Management

## patients
id
clinic_id
patient_code
full_name
birth_date
gender
contact_number
email
notes
created_at
updated_at
deleted_at

---
# 4. Appointment Management

## appointments
id
clinic_id
patient_id
doctor_id
scheduled_date
scheduled_time
status (scheduled, completed, cancelled, no_show)
remarks
created_at
updated_at
deleted_at

---
# 5. Consultation / Visit Records

## visits
id
clinic_id
appointment_id
patient_id
doctor_id
visit_date
status (open, closed)
created_at
updated_at

## visit_notes
id
visit_id
clinic_id
note_type (complaint, diagnosis, treatment, remarks)
content (TEXT)
created_at
updated_at

## visit_attachments
id
visit_id
clinic_id
file_name
file_path
uploaded_by
created_at

---
# 6. Billing

## services
id
clinic_id
name
price
is_active
created_at
updated_at

## billings
id
clinic_id
patient_id
visit_id
total_amount
discount_amount
net_amount
status (unpaid, paid, void)
created_at
updated_at

## billing_items
id
billing_id
service_id
description
quantity
unit_price
amount
created_at

## payments
id
billing_id
clinic_id
amount
payment_method (cash, card, gcash)
payment_date
received_by
created_at

---
# 7. Audit & Accountability

audit_logs
id
clinic_id
user_id
action (create, update, delete, login)
entity (patients, appointments, billings, etc)
entity_id
old_value (JSON)
new_value (JSON)
ip_address
created_at

---
# 8. Relationships (Mental Model)

clinic
 ├── users
 ├── roles
 ├── patients
 ├── appointments
 │    └── visits
 │         └── visit_notes
 ├── services
 ├── billings
 │    └── billing_items
 │    └── payments
 └── audit_logs

---
# 9. Excluded Features for MVP
- Insurance
- PhilHealth
- Payroll
- Inventory
- Lab integrations

