@echo off
echo ========================================
echo Role Assignment Workflows Testing
echo ========================================
echo.

echo Starting role assignment workflow tests...
echo.

REM Set test environment
set NODE_ENV=test

REM Run the role assignment tests
echo Running comprehensive role assignment tests...
npx jest tests/role-assignment-workflows.test.js --verbose --detectOpenHandles

echo.
echo ========================================
echo Role Assignment Testing Complete
echo ========================================

pause