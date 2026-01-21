@echo off
echo ========================================
echo Role Assignment Testing - Simplified
echo ========================================
echo.

echo Testing role assignment workflows...
echo.

REM Set test environment
set NODE_ENV=test

REM Run the simplified role assignment tests
echo Running role assignment functionality tests...
npx jest tests/role-assignment-simple.test.js --verbose --detectOpenHandles --forceExit

echo.
echo ========================================
echo Role Assignment Testing Complete
echo ========================================

pause