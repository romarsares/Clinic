@echo off
echo Setting up Clinic SaaS Database...

REM Set MySQL path
set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
if not exist %MYSQL_PATH% (
    set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe"
)
if not exist %MYSQL_PATH% (
    echo ERROR: MySQL not found in Program Files
    echo Please check your MySQL installation
    pause
    exit /b 1
)

REM Create database if it doesn't exist
echo Creating database clinic_saas...
%MYSQL_PATH% -u root -p -e "CREATE DATABASE IF NOT EXISTS clinic_saas;"

REM Run initialization script
echo Running database initialization script...
%MYSQL_PATH% -u root -p clinic_saas < init-database.sql

if %errorlevel% equ 0 (
    echo.
    echo ✅ Database setup completed successfully!
    echo.
    echo Default admin credentials:
    echo Email: admin@clinic.com
    echo Password: admin12354
    echo.
    echo Database contains sample data for testing dashboard.
) else (
    echo.
    echo ❌ Database setup failed!
    echo Please check the error messages above.
)

pause