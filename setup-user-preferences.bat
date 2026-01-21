@echo off
echo ========================================
echo Adding User Preferences Table
echo ========================================
echo.

echo Creating user_preferences table...

REM Run the SQL script using Program Files MySQL path
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p"N1mbu$12354" clinic_saas < scripts\user-preferences.sql

if %ERRORLEVEL% EQU 0 (
    echo ✅ User preferences table created successfully!
) else (
    echo ❌ Failed to create user preferences table
)

echo.
echo ========================================
echo User Preferences Setup Complete
echo ========================================

pause