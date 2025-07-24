# PowerShell script to test ML Prediction API
Write-Host "🧪 Testing ML Prediction API Integration..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

$uri = "http://localhost:8080/api/yield/predict"
$body = @{
    District = "Anuradhapura"
    Major_Schemes_Sown = 3500
    Minor_Schemes_Sown = 2100
    Rainfed_Sown = 8500
    All_Schemes_Sown = 14100
    Nett_Extent_Harvested = 13000
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "Testing endpoint: POST $uri" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $uri -Method Post -Body $body -Headers $headers
    Write-Host "✅ Success!" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Test completed!" -ForegroundColor Green
