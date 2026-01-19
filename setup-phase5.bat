@echo off
echo 🚀 Phase 5 Complete Setup Script
echo ================================

echo 1. Installing dependencies...
npm install joi nodemailer bcrypt mysql2

echo.
echo 2. Setting up database...
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p -e "CREATE DATABASE IF NOT EXISTS clinic_saas;"
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p clinic_saas < scripts\init-db.sql
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p clinic_saas < scripts\billing-schema.sql

echo.
echo 3. Creating admin user...
node scripts\setup-admin-complete.js

echo.
echo ✅ Phase 5 Setup Complete!
echo.
echo 🎯 Ready to test:
echo   📧 Email: admin@clinic.com
echo   🔑 Password: admin12354
echo   🌐 URL: http://localhost:3000/login
echo.
echo Run: npm start
pause