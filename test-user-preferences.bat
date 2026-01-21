@echo off
echo ========================================
echo User Preferences Testing
echo ========================================
echo.

echo Testing user preferences functionality...
echo.

REM Set test environment
set NODE_ENV=test

REM Run the user preferences tests
echo Running user preferences tests...
npx jest tests/user-preferences.test.js --verbose --detectOpenHandles --forceExit

echo.
echo ========================================
echo User Preferences Testing Complete
echo ========================================

pause