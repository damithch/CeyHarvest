# PowerShell script to restart Spring Boot application
Write-Host "Restarting Spring Boot Application..." -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green

# Kill any existing Spring Boot processes
Write-Host "`nChecking for running processes on port 8080..." -ForegroundColor Yellow
$processes = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($processes) {
    foreach ($process in $processes) {
        $pid = $process.OwningProcess
        Write-Host "Killing process PID: $pid" -ForegroundColor Yellow
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
}

# Start the application
Write-Host "`nStarting Spring Boot application..." -ForegroundColor Yellow
Set-Location "d:\CeyHarvest\backend"
Start-Process -FilePath ".\mvnw.cmd" -ArgumentList "spring-boot:run" -Wait:$false
Write-Host "Spring Boot application started in background" -ForegroundColor Green
Write-Host "Application will be available at: http://localhost:8080" -ForegroundColor Cyan
