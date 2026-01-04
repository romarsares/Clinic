Clinic Operations SaaS - API Endpoint Design (MVP v1)

Design Principles:
- Multi-tenant aware (clinic_id in all requests)
- RESTful endpoints
- Minimal, essential endpoints only
- JSON request/response
- Clear and direct for developers

---
# 1. Authentication & Access Control

## Auth Users
POST /auth/register -> Create user
POST /auth/login -> Authenticate user
GET /auth/users -> List users (clinic scoped)
GET /auth/users/{id} -> Get user details
PUT /auth/users/{id} -> Update user
DELETE /auth/users/{id} -> Soft delete user

## Roles
GET /roles -> List roles for clinic
POST /roles -> Create role
PUT /roles/{id} -> Update role
DELETE /roles/{id} -> Delete role

## User Roles
POST /user_roles -> Assign role to user
DELETE /user_roles/{id} -> Remove role from user

---
# 2. Clinic Management

## Clinics
GET /clinics -> List clinics (admin only)
GET /clinics/{id} -> Get clinic details
PUT /clinics/{id} -> Update clinic info

## Clinic Settings
GET /clinic_settings -> List settings
POST /clinic_settings -> Create setting
PUT /clinic_settings/{id} -> Update setting
DELETE /clinic_settings/{id} -> Delete setting

---
# 3. Patient Management

## Patients
GET /patients -> List patients
GET /patients/{id} -> Get patient details
POST /patients -> Create patient
PUT /patients/{id} -> Update patient
DELETE /patients/{id} -> Soft delete patient

---
# 4. Appointment Management

## Appointments
GET /appointments -> List appointments
GET /appointments/{id} -> Appointment details
POST /appointments -> Schedule appointment
PUT /appointments/{id} -> Update appointment
DELETE /appointments/{id} -> Cancel appointment

---
# 5. Consultation / Visit Records

## Visits
GET /visits -> List visits
GET /visits/{id} -> Visit details
POST /visits -> Record visit
PUT /visits/{id} -> Update visit

## Visit Notes
GET /visit_notes?visit_id={id} -> List notes
POST /visit_notes -> Add note
PUT /visit_notes/{id} -> Update note
DELETE /visit_notes/{id} -> Delete note

## Visit Attachments
POST /visit_attachments -> Upload file
GET /visit_attachments/{id} -> Download file
DELETE /visit_attachments/{id} -> Remove attachment

---
# 6. Billing

## Services
GET /services -> List services
POST /services -> Create service
PUT /services/{id} -> Update service
DELETE /services/{id} -> Deactivate service

## Billings
GET /billings -> List bills
GET /billings/{id} -> Bill details
POST /billings -> Create bill
PUT /billings/{id} -> Update bill
DELETE /billings/{id} -> Void bill

## Payments
POST /payments -> Record payment
GET /payments/{id} -> Payment details

---
# 7. Audit Logs
GET /audit_logs -> List logs (admin/owner)
GET /audit_logs/{id} -> Log details

---
# Notes
- All endpoints must include `clinic_id` in request headers or JWT for multi-tenant scoping.
- Pagination and filtering supported on all GET lists.
- Advanced features like reporting or integrations are deferred to later releases.

