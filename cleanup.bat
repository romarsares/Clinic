@echo off
echo 🧹 Cleaning up unnecessary files...

REM Delete temporary test files
if exist "generate-hash.js" del "scripts\generate-hash.js"
if exist "create-admin.js" del "scripts\create-admin.js"
if exist "fix-audit-tables.sql" del "scripts\fix-audit-tables.sql"
if exist "fix-audit-user-id.sql" del "scripts\fix-audit-user-id.sql"
if exist "create-admin-user.sql" del "scripts\create-admin-user.sql"

REM Delete test scripts
if exist "test-phase5.sh" del "test-phase5.sh"
if exist "install-deps.bat" del "install-deps.bat"
if exist "setup-admin.bat" del "setup-admin.bat"

echo ✅ Cleanup complete!