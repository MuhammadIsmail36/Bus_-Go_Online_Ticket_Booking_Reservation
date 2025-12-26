Add-Type -AssemblyName System.Net.Http

$client = New-Object System.Net.Http.HttpClient
$client.Timeout = [TimeSpan]::FromSeconds(5)
$apiBase = "http://localhost:3000"

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [string]$Body,
        [hashtable]$Headers,
        [bool]$ShouldFail = $false
    )
    
    Write-Host "`n✓ $Name" -ForegroundColor Cyan
    
    try {
        $uri = "$apiBase$Endpoint"
        
        if ($Method -eq "GET") {
            $response = Invoke-WebRequest -Uri $uri -Method Get -Headers $Headers -TimeoutSec 5 -ErrorAction Stop
        } else {
            $response = Invoke-WebRequest -Uri $uri -Method Post -Headers $Headers -Body $Body -ContentType "application/json" -TimeoutSec 5 -ErrorAction Stop
        }
        
        if ($ShouldFail) {
            Write-Host "  ❌ Should have failed but succeeded" -ForegroundColor Red
            return $false
        }
        
        Write-Host "  ✅ Status: $($response.StatusCode)" -ForegroundColor Green
        if ($response.Content) {
            $json = $response.Content | ConvertFrom-Json
            Write-Host "  Response: $($json | ConvertTo-Json -Compress)" -ForegroundColor Gray
        }
        return $true
    }
    catch {
        if ($ShouldFail -and $_.Exception.Response.StatusCode -eq 401) {
            Write-Host "  ✅ Correctly rejected with 401" -ForegroundColor Green
            return $true
        }
        Write-Host "  ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

Write-Host "
╔════════════════════════════════════════════════╗
║  BusGo Backend - Comprehensive Test Suite      ║
║  API Base: $apiBase                            ║
╚════════════════════════════════════════════════╝
" -ForegroundColor Magenta

$results = @()

# TEST 1: Health
$pass = Test-Endpoint -Name "TEST 1: Health Endpoint" `
    -Method "GET" -Endpoint "/api/health" -Headers @{}
$results += @{Name="Health Endpoint"; Status=$pass}

# TEST 2: Contact Submission
$contactBody = @{name="John Doe"; email="john@test.com"; message="This is a test message from automation."} | ConvertTo-Json
$pass = Test-Endpoint -Name "TEST 2: Submit Contact Message" `
    -Method "POST" -Endpoint "/api/contact" -Body $contactBody -Headers @{"Content-Type"="application/json"}
$results += @{Name="Submit Contact"; Status=$pass}

# TEST 3: Feedback Submission
$feedbackBody = @{name="Jane Smith"; email="jane@test.com"; rating=5; comment="Excellent service!"} | ConvertTo-Json
$pass = Test-Endpoint -Name "TEST 3: Submit Feedback" `
    -Method "POST" -Endpoint "/api/feedback" -Body $feedbackBody -Headers @{"Content-Type"="application/json"}
$results += @{Name="Submit Feedback"; Status=$pass}

# TEST 4: Unauthorized Admin (Should Fail)
$routeBody = @{fromCity="Karachi"; toCity="Lahore"; distanceKm=1210} | ConvertTo-Json
$pass = Test-Endpoint -Name "TEST 4: Unauthorized Admin Access (Expected to Fail)" `
    -Method "POST" -Endpoint "/api/admin/routes" -Body $routeBody -Headers @{"Content-Type"="application/json"; "X-Admin-Session"="false"} -ShouldFail $true
$results += @{Name="Auth Protection"; Status=$pass}

# TEST 5: Authorized Admin - Create Route
$pass = Test-Endpoint -Name "TEST 5: Create Route (With Auth)" `
    -Method "POST" -Endpoint "/api/admin/routes" -Body $routeBody -Headers @{"Content-Type"="application/json"; "X-Admin-Session"="true"}
$results += @{Name="Create Route"; Status=$pass}

# TEST 6: Create Another Route
$routeBody2 = @{fromCity="Islamabad"; toCity="Peshawar"; distanceKm=240} | ConvertTo-Json
$pass = Test-Endpoint -Name "TEST 6: Create Route 2" `
    -Method "POST" -Endpoint "/api/admin/routes" -Body $routeBody2 -Headers @{"Content-Type"="application/json"; "X-Admin-Session"="true"}
$results += @{Name="Create Route 2"; Status=$pass}

# TEST 7: Create Bus
$busBody = @{busName="Express Daewoo"; busType="AC"; seatType="Seater"; totalSeats=40} | ConvertTo-Json
$pass = Test-Endpoint -Name "TEST 7: Create Bus" `
    -Method "POST" -Endpoint "/api/admin/buses" -Body $busBody -Headers @{"Content-Type"="application/json"; "X-Admin-Session"="true"}
$results += @{Name="Create Bus"; Status=$pass}

# TEST 8: Create Schedule
$scheduleBody = @{busId=1; fromCity="Karachi"; toCity="Lahore"; departureTime="2025-12-27T10:00"; arrivalTime="2025-12-27T18:00"; price=1500} | ConvertTo-Json
$pass = Test-Endpoint -Name "TEST 8: Create Schedule" `
    -Method "POST" -Endpoint "/api/admin/schedules" -Body $scheduleBody -Headers @{"Content-Type"="application/json"; "X-Admin-Session"="true"}
$results += @{Name="Create Schedule"; Status=$pass}

# TEST 9: Create Schedule with Invalid Bus (Should Fail)
$invalidScheduleBody = @{busId=99999; fromCity="Karachi"; toCity="Lahore"; departureTime="2025-12-27T10:00"; arrivalTime="2025-12-27T18:00"; price=1500} | ConvertTo-Json
$pass = Test-Endpoint -Name "TEST 9: Invalid Bus ID Validation" `
    -Method "POST" -Endpoint "/api/admin/schedules" -Body $invalidScheduleBody -Headers @{"Content-Type"="application/json"; "X-Admin-Session"="true"} -ShouldFail $true
$results += @{Name="Bus Validation"; Status=$pass}

# TEST 10: Get Contact Messages
$pass = Test-Endpoint -Name "TEST 10: Retrieve Contact Messages" `
    -Method "GET" -Endpoint "/api/contact/messages" -Headers @{}
$results += @{Name="Get Contacts"; Status=$pass}

# TEST 11: Get Feedback
$pass = Test-Endpoint -Name "TEST 11: Retrieve Feedback" `
    -Method "GET" -Endpoint "/api/feedback" -Headers @{}
$results += @{Name="Get Feedback"; Status=$pass}

# TEST 12: Bus Search
$searchBody = @{from="Karachi"; to="Lahore"} | ConvertTo-Json
$pass = Test-Endpoint -Name "TEST 12: Search Buses by Route" `
    -Method "POST" -Endpoint "/api/buses/search" -Body $searchBody -Headers @{"Content-Type"="application/json"}
$results += @{Name="Bus Search"; Status=$pass}

# SUMMARY
Write-Host "
╔════════════════════════════════════════════════╗
║  TEST SUMMARY                                  ║
╚════════════════════════════════════════════════╝
" -ForegroundColor Magenta

$passed = ($results | Where-Object {$_.Status -eq $true} | Measure-Object).Count
$failed = ($results | Where-Object {$_.Status -eq $false} | Measure-Object).Count

Write-Host "
Results:" -ForegroundColor Yellow
Write-Host "  ✅ PASSED: $passed" -ForegroundColor Green
Write-Host "  ❌ FAILED: $failed" -ForegroundColor Red
Write-Host "  📊 TOTAL:  $($results.Count)" -ForegroundColor Cyan

Write-Host "`nDetailed Summary:" -ForegroundColor Yellow
foreach ($result in $results) {
    $icon = if ($result.Status) { "✅" } else { "❌" }
    Write-Host "  $icon $($result.Name)" -ForegroundColor (if ($result.Status) { "Green" } else { "Red" })
}

Write-Host "
" -ForegroundColor White
if ($failed -eq 0) {
    Write-Host "✅ ALL TESTS PASSED! Backend is fully functional." -ForegroundColor Green
} else {
    Write-Host "⚠️  $failed test(s) failed. Review output above." -ForegroundColor Yellow
}
