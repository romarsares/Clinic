@echo off
echo Initializing Clinic SaaS Database...
echo.

"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pN1mbu412354 < "%~dp0init-db.sql"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Database initialized successfully!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo Error initializing database!
    echo Please check your MySQL connection.
    echo ========================================
)

pause
