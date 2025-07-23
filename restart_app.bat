@echo off
echo Restarting Spring Boot Application...
echo.

echo Checking for running Spring Boot processes...
for /f "tokens=2" %%a in ('netstat -ano ^| findstr :8080') do (
    echo Killing process %%a
    taskkill /F /PID %%a 2>nul
)

echo.
echo Starting Spring Boot application...
cd backend
.\mvnw.cmd spring-boot:run
