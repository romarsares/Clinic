# Project Issue Log

This document tracks issues, bugs, and logical errors encountered during development.
**Task Ref** corresponds to the task ID in `docs/task.md`.

| ID | Task Ref | Type | Description | Impact/Outcome | Root Cause / Basis of Error | Expected Behavior | Status |
|----|----------|------|-------------|----------------|-----------------------------|-------------------|--------|
| 001 | 1.1.1 | Security | ReferenceError: tokens is not defined | Tests fail to run | Variable `tokens` is defined inside `describe` scope but exported at module level in `auth-rbac.test.js`. | Tests should run without syntax/reference errors. | Fixed |
| 002 | 1.1.1 | Database | Encoding not recognized: 'cesu8' | Database connection fails | MySQL2 driver or iconv-lite issue with 'utf8mb4' charset mapping to 'cesu8'. | Database should connect successfully using utf8mb4. | Fixed |
| 003 | 1.1.2 | Testing | Jest detected open handles | Tests hang or warn on exit | Application server or database pool not gracefully closed after tests. Affects multiple files (e.g. `role-assignment-workflows.test.js`). | Tests should exit cleanly. | Open |
| 004 | 1.1.1 | Security | Rate limiting test failed | Expected 429, got 401 | Rate limiter might be misconfigured, or 401 Auth error takes precedence over Rate Limit. | Rate limit should trigger after 5 failed attempts. | Open |
| 005 | 1.1.2 | Security | RBAC Owner/Doctor Access Denied | Expected 200/Success, got 403 | Tokens generated in tests might be invalid, or role permissions are not correctly seeded in test DB. | Owner/Doctor should have access to patients/visits. | Open |
