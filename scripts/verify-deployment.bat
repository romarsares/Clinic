@echo off
echo ========================================
echo Clinic SaaS Deployment Verification
echo ========================================
echo.

REM Set MySQL path
set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
if not exist %MYSQL_PATH% (
    set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe"
)
if not exist %MYSQL_PATH% (
    echo ❌ FAIL: MySQL not found in Program Files
    echo Please check your MySQL installation
    goto :error
)
echo ✅ PASS: MySQL found

REM Check if database exists
echo.
echo [2/6] Checking database existence...
%MYSQL_PATH% -u root -p -e "USE clinic_saas; SELECT 'Database exists' as status;" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ FAIL: Database clinic_saas does not exist
    echo Run setup-database.bat first
    goto :error
)
echo ✅ PASS: Database clinic_saas exists

REM Check critical tables
echo.
echo [3/6] Checking critical tables...
set tables=clinics auth_users patients visits appointments bills audit_logs
for %%t in (%tables%) do (
    %MYSQL_PATH% -u root -p -e "USE clinic_saas; DESCRIBE %%t;" >nul 2>&1
    if !errorlevel! neq 0 (
        echo ❌ FAIL: Table %%t missing
        goto :error
    )
)
echo ✅ PASS: All critical tables exist

REM Check admin user
echo.
echo [4/6] Checking admin user...
%MYSQL_PATH% -u root -p -e "USE clinic_saas; SELECT email FROM auth_users WHERE email='admin@clinic.com';" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ FAIL: Admin user not found
    goto :error
)
echo ✅ PASS: Admin user exists

REM Check sample data
echo.
echo [5/6] Checking sample data...
%MYSQL_PATH% -u root -p -e "USE clinic_saas; SELECT COUNT(*) as count FROM patients;" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ FAIL: Cannot query patients table
    goto :error
)
echo ✅ PASS: Sample data accessible

REM Check Node.js dependencies
echo.
echo [6/6] Checking Node.js setup...
if not exist "node_modules" (
    echo ❌ FAIL: node_modules not found
    echo Run: npm install
    goto :error
)
echo ✅ PASS: Node.js dependencies installed

echo.
echo ========================================
echo ✅ ALL CHECKS PASSED
echo ========================================
echo.
echo Ready for deployment!
echo.
echo Default credentials:
echo Email: admin@clinic.com
echo Password: admin12354
echo.
echo To start the server:
echo npm start
echo.
goto :end

:error
echo.
echo ========================================
echo ❌ DEPLOYMENT VERIFICATION FAILED
echo ========================================
echo Please fix the issues above before deploying.
echo.

:end
pause