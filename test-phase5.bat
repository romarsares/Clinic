@echo off
echo 🧪 Testing Phase 5 Implementation...

REM 1. Check billing schema
echo 📊 Checking billing schema...
if exist "scripts\billing-schema.sql" (
    echo ✅ Billing schema found
) else (
    echo ❌ Billing schema missing
)

REM 2. Check CSS files
echo 🎨 Checking CSS files...
if exist "public\css\medical-colors.css" (echo ✅ medical-colors.css found) else (echo ❌ medical-colors.css missing)
if exist "public\css\medical-components.css" (echo ✅ medical-components.css found) else (echo ❌ medical-components.css missing)
if exist "public\css\medical-icons.css" (echo ✅ medical-icons.css found) else (echo ❌ medical-icons.css missing)
if exist "public\css\medical-animations.css" (echo ✅ medical-animations.css found) else (echo ❌ medical-animations.css missing)

REM 3. Check JS files
echo 📱 Checking JavaScript files...
if exist "public\js\dark-mode.js" (echo ✅ dark-mode.js found) else (echo ❌ dark-mode.js missing)
if exist "public\js\ux-utils.js" (echo ✅ ux-utils.js found) else (echo ❌ ux-utils.js missing)

REM 4. Check billing backend
echo 🏗️ Checking billing backend...
if exist "src\models\Billing.js" (echo ✅ Billing.js found) else (echo ❌ Billing.js missing)
if exist "src\controllers\BillingController.js" (echo ✅ BillingController.js found) else (echo ❌ BillingController.js missing)
if exist "src\routes\billingRoutes.js" (echo ✅ billingRoutes.js found) else (echo ❌ billingRoutes.js missing)

echo.
echo 🚀 Ready to test! Run these commands:
echo.
echo 1. Setup database:
echo    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p clinic_saas ^< scripts\billing-schema.sql
echo.
echo 2. Start server:
echo    npm start
echo.
echo 3. Visit: http://localhost:3000/dashboard
echo.
echo 🧪 Test checklist:
echo   ✓ Dark mode toggle (Ctrl+Shift+D)
echo   ✓ Medical UI components
echo   ✓ Form validation
echo   ✓ Billing integration
echo   ✓ Responsive design
echo.
pause