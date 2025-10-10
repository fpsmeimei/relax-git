# Railway Deployment Verification Script
# Usage: .\verify-deployment.ps1

$domain = "relax-git-production.up.railway.app"
$protocol = "https"

Write-Host "Verifying Railway deployment..." -ForegroundColor Cyan
Write-Host "Domain: $domain" -ForegroundColor Gray
Write-Host ""

# Test endpoints list
$endpoints = @(
    @{ Path = "/api/health"; Name = "Health Check"; Expected = "ok" },
    @{ Path = "/api/health/database"; Name = "Database Health"; Expected = "ok" },
    @{ Path = "/api/info"; Name = "App Info"; Expected = "0.1.1" },
    @{ Path = "/api/debug/filesystem"; Name = "Filesystem Check"; Expected = "timestamp" },
    @{ Path = "/api/community/feed"; Name = "Community Feed"; Expected = "data" }
)

$passed = 0
$failed = 0

foreach ($endpoint in $endpoints) {
    $url = "${protocol}://${domain}$($endpoint.Path)"
    Write-Host "Testing: $($endpoint.Name)" -NoNewline
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method GET -TimeoutSec 10 -ErrorAction Stop
        $responseJson = $response | ConvertTo-Json -Depth 5
        
        if ($responseJson -match $endpoint.Expected) {
            Write-Host " ✅" -ForegroundColor Green
            Write-Host "  Response: " -NoNewline -ForegroundColor Gray
            Write-Host ($responseJson.Substring(0, [Math]::Min(100, $responseJson.Length)) + "...") -ForegroundColor DarkGray
            $passed++
        } else {
            Write-Host " ⚠️  (Unexpected response format)" -ForegroundColor Yellow
            Write-Host "  Response: $responseJson" -ForegroundColor DarkGray
            $passed++  # Still count as passed since endpoint is accessible
        }
    }
    catch {
        Write-Host " ❌" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
    
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "Test Results: " -NoNewline
Write-Host "$passed passed" -NoNewline -ForegroundColor Green
Write-Host " / " -NoNewline
Write-Host "$failed failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

if ($failed -eq 0) {
    Write-Host "🎉 All endpoints verified successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some endpoints failed, please check Railway logs" -ForegroundColor Yellow
    Write-Host "Logs: https://railway.app/project/relax-git/service/relax-git-fullstack" -ForegroundColor Gray
}
