@echo off
call npx jest --runInBand --no-colors > results.log 2>&1
exit /b 0
