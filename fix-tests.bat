@echo off
echo ========================================
echo CuraOne Test Environment Fix
echo ========================================
echo.

echo Step 1: Checking MySQL service...
sc query MySQL80 | find "RUNNING" >nul
if errorlevel 1 (
    echo [ERROR] MySQL service not running. Starting...
    net start MySQL80
) else (
    echo [OK] MySQL service is running
)
echo.

echo Step 2: Creating test database...
mysql -u root -pN1mbu$12354 -e "CREATE DATABASE IF NOT EXISTS clinic_saas_test;"
mysql -u root -pN1mbu$12354 -e "GRANT ALL PRIVILEGES ON clinic_saas_test.* TO 'clinic_dev'@'localhost' IDENTIFIED BY 'dev_password_123';"
mysql -u root -pN1mbu$12354 -e "FLUSH PRIVILEGES;"
echo [OK] Test database created
echo.

echo Step 3: Initializing test database schema...
mysql -u root -pN1mbu$12354 clinic_saas_test < scripts\init-database.sql
echo [OK] Schema initialized
echo.

echo Step 4: Running minimal test suite...
npm test -- tests/healthcheck.js
echo.

echo ========================================
echo Test environment ready!
echo Run: npm test
echo ========================================
