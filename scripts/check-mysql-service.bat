@echo off
echo Checking MySQL Service Status...
sc query MySQL80
if %errorlevel% neq 0 (
    echo Service MySQL80 not found. Checking MySQL...
    sc query MySQL
)
pause
