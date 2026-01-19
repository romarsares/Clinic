@echo off

rem === extract date & time (MM DD HH mm) ===
for /f "tokens=2-4 delims=/ " %%a in ("%date%") do (
    set MM=%%a
    set DD=%%b
    set YY=%%c
)

for /f "tokens=1-2 delims=: " %%h in ("%time%") do (
    set HH=%%h
    set MIN=%%i
)

rem === remove AM/PM if present ===
set HH=%HH: =0%
set MIN=%MIN:~0,2%

rem === final filename ===
set fn=clinic_saas_%MM%_%DD%_%HH%_%MIN%.sql

"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe" -uroot -pN1mbu$12354 --routines clinic_saas > "C:\Users\user\Documents\GitHub\Clinic\Backup\%fn%"
