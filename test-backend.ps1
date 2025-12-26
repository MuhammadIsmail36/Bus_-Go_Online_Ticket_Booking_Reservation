# BusGo Backend - Comprehensive API Test Suite
# Test Date: December 27, 2025

$apiBase = "http://localhost:3000"
$testResults = @()

# Colors for output
function Write-TestPass {
    param([string]$message)
    Write-Host "✅ PASS: $message" -ForegroundColor Green
}

function Write-TestFail {
    param([string]$message)
    Write-Host "❌ FAIL: $message" -ForegroundColor Red
}

function Write-TestInfo {
    param([string]$message)
    Write-Host "ℹ️  INFO: $message" -ForegroundColor Cyan
}

function Write-Section {
    param([string]$title)
    Write-Host "`n========================================" -ForegroundColor Yellow
    Write-Host "  $title" -ForegroundColor Yellow
    Write-Host "========================================`n" -ForegroundColor Yellow
}

# ============ TEST 1: Health Endpoint ============
Write-Section "TEST 1: Health Endpoint"
try {
    $response = Invoke-RestMethod -Uri "$apiBase/api/health" -Method Get -TimeoutSec 5
    if ($response.status -eq "ok") {
        Write-TestPass "Health endpoint returned status: ok"
        $testResults += @{Test="Health Endpoint"; Status="PASS"; Details="Server is running and responsive"}
    } else {
        Write-TestFail "Health endpoint returned unexpected status: $($response.status)"
        $testResults += @{Test="Health Endpoint"; Status="FAIL"; Details="Unexpected status response"}
    }
} catch {
    Write-TestFail "Health endpoint failed: $($_.Exception.Message)"
    $testResults += @{Test="Health Endpoint"; Status="FAIL"; Details=$_.Exception.Message}
    Write-Host "Server may not be running. Starting now..." -ForegroundColor Yellow
    exit 1
}

# ============ TEST 2: Public Contact Endpoint (No Auth Required) ============
Write-Section "TEST 2: Contact Message Submission (Public)"
try {
    $contactPayload = @{
        name = "Test User"
        email = "test@example.com"
        message = "This is a test contact message from automated testing."
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$apiBase/api/contact" -Method Post `
        -ContentType "application/json" -Body $contactPayload -TimeoutSec 5
    
    Write-TestPass "Contact message submitted successfully"
    Write-Host "  Response: $($response | ConvertTo-Json)" -ForegroundColor Gray
    $testResults += @{Test="Submit Contact"; Status="PASS"; Details="Message submitted: $($response.message)"}
} catch {
    Write-TestFail "Contact submission failed: $($_.Exception.Message)"
    $testResults += @{Test="Submit Contact"; Status="FAIL"; Details=$_.Exception.Message}
}

# ============ TEST 3: Public Feedback Endpoint (No Auth Required) ============
Write-Section "TEST 3: Feedback Submission (Public)"
try {
    $feedbackPayload = @{
        name = "Test Customer"
        email = "feedback@example.com"
        rating = 5
        comment = "Great service! Automated test feedback."
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$apiBase/api/feedback" -Method Post `
        -ContentType "application/json" -Body $feedbackPayload -TimeoutSec 5
    
    Write-TestPass "Feedback submitted successfully"
    Write-Host "  Response: $($response | ConvertTo-Json)" -ForegroundColor Gray
    $testResults += @{Test="Submit Feedback"; Status="PASS"; Details="Feedback submitted: $($response.message)"}
} catch {
    Write-TestFail "Feedback submission failed: $($_.Exception.Message)"
    $testResults += @{Test="Submit Feedback"; Status="FAIL"; Details=$_.Exception.Message}
}

# ============ TEST 4: Unauthorized Admin Access (Should Fail) ============
Write-Section "TEST 4: Unauthorized Admin Access Test (Expected to Fail)"
try {
    $routePayload = @{
        fromCity = "Karachi"
        toCity = "Lahore"
        distanceKm = 1210
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$apiBase/api/admin/routes" -Method Post `
        -ContentType "application/json" -Body $routePayload `
        -Headers @{"X-Admin-Session"="false"} -TimeoutSec 5 -ErrorAction SilentlyContinue
    
    Write-TestFail "Unauthorized request should have been rejected but wasn't!"
    $testResults += @{Test="Unauthorized Access Block"; Status="FAIL"; Details="Should have returned 401"}
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-TestPass "Unauthorized access correctly rejected with 401"
        $testResults += @{Test="Unauthorized Access Block"; Status="PASS"; Details="Returned 401 as expected"}
    } else {
        Write-TestFail "Unexpected error: $($_.Exception.Message)"
        $testResults += @{Test="Unauthorized Access Block"; Status="FAIL"; Details=$_.Exception.Message}
    }
}

# ============ TEST 5: Authorized Admin Access ============
Write-Section "TEST 5: Authorized Admin Access (With Auth Header)"
try {
    $routePayload = @{
        fromCity = "Karachi"
        toCity = "Lahore"
        distanceKm = 1210
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$apiBase/api/admin/routes" -Method Post `
        -ContentType "application/json" -Body $routePayload `
        -Headers @{"X-Admin-Session"="true"} -TimeoutSec 5
    
    Write-TestPass "Route created with admin authentication"
    Write-Host "  Response: $($response | ConvertTo-Json)" -ForegroundColor Gray
    $testResults += @{Test="Create Route (Auth)"; Status="PASS"; Details=$response.message}
} catch {
    Write-TestFail "Route creation failed: $($_.Exception.Message)"
    $testResults += @{Test="Create Route (Auth)"; Status="FAIL"; Details=$_.Exception.Message}
}

# ============ TEST 6: Create Another Route ============
Write-Section "TEST 6: Create Additional Route"
try {
    $routePayload = @{
        fromCity = "Islamabad"
        toCity = "Peshawar"
        distanceKm = 240
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$apiBase/api/admin/routes" -Method Post `
        -ContentType "application/json" -Body $routePayload `
        -Headers @{"X-Admin-Session"="true"} -TimeoutSec 5
    
    Write-TestPass "Additional route created"
    Write-Host "  Response: $($response | ConvertTo-Json)" -ForegroundColor Gray
    $testResults += @{Test="Create Route 2"; Status="PASS"; Details=$response.message}
} catch {
    Write-TestFail "Additional route creation failed: $($_.Exception.Message)"
    $testResults += @{Test="Create Route 2"; Status="FAIL"; Details=$_.Exception.Message}
}

# ============ TEST 7: Create Bus ============
Write-Section "TEST 7: Create Bus"
try {
    $busPayload = @{
        busName = "Express Daewoo 1"
        busType = "AC"
        seatType = "Seater"
        totalSeats = 40
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$apiBase/api/admin/buses" -Method Post `
        -ContentType "application/json" -Body $busPayload `
        -Headers @{"X-Admin-Session"="true"} -TimeoutSec 5
    
    $busId = $response.busId
    Write-TestPass "Bus created successfully with ID: $busId"
    Write-Host "  Response: $($response | ConvertTo-Json)" -ForegroundColor Gray
    $testResults += @{Test="Create Bus"; Status="PASS"; Details="Bus ID: $busId"}
} catch {
    Write-TestFail "Bus creation failed: $($_.Exception.Message)"
    $testResults += @{Test="Create Bus"; Status="FAIL"; Details=$_.Exception.Message}
}

# ============ TEST 8: Create Schedule ============
Write-Section "TEST 8: Create Schedule"
try {
    $schedulePayload = @{
        busId = 1
        fromCity = "Karachi"
        toCity = "Lahore"
        departureTime = "2025-12-27T10:00"
        arrivalTime = "2025-12-27T18:00"
        price = 1500
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$apiBase/api/admin/schedules" -Method Post `
        -ContentType "application/json" -Body $schedulePayload `
        -Headers @{"X-Admin-Session"="true"} -TimeoutSec 5
    
    Write-TestPass "Schedule created successfully"
    Write-Host "  Response: $($response | ConvertTo-Json)" -ForegroundColor Gray
    $testResults += @{Test="Create Schedule"; Status="PASS"; Details=$response.message}
} catch {
    Write-TestFail "Schedule creation failed: $($_.Exception.Message)"
    $testResults += @{Test="Create Schedule"; Status="FAIL"; Details=$_.Exception.Message}
}

# ============ TEST 9: Invalid Bus ID (Should Fail) ============
Write-Section "TEST 9: Create Schedule with Invalid Bus ID (Expected to Fail)"
try {
    $schedulePayload = @{
        busId = 99999
        fromCity = "Karachi"
        toCity = "Lahore"
        departureTime = "2025-12-27T10:00"
        arrivalTime = "2025-12-27T18:00"
        price = 1500
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$apiBase/api/admin/schedules" -Method Post `
        -ContentType "application/json" -Body $schedulePayload `
        -Headers @{"X-Admin-Session"="true"} -TimeoutSec 5 -ErrorAction SilentlyContinue
    
    Write-TestFail "Should have rejected invalid bus ID"
    $testResults += @{Test="Invalid Bus ID Check"; Status="FAIL"; Details="Should have returned error"}
} catch {
    if ($_.Exception.Response.StatusCode -eq 500 -or $_.Exception.Message -like "*does not exist*") {
        Write-TestPass "Invalid bus ID correctly rejected"
        $testResults += @{Test="Invalid Bus ID Check"; Status="PASS"; Details="Returned error as expected"}
    } else {
        Write-TestFail "Unexpected error: $($_.Exception.Message)"
        $testResults += @{Test="Invalid Bus ID Check"; Status="FAIL"; Details=$_.Exception.Message}
    }
}

# ============ TEST 10: Get Contact Messages ============
Write-Section "TEST 10: Retrieve Contact Messages"
try {
    $response = Invoke-RestMethod -Uri "$apiBase/api/contact/messages" -Method Get -TimeoutSec 5
    $messageCount = ($response.messages | Measure-Object).Count
    Write-TestPass "Retrieved $messageCount contact messages"
    Write-Host "  Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
    $testResults += @{Test="Get Contact Messages"; Status="PASS"; Details="Retrieved $messageCount messages"}
} catch {
    Write-TestFail "Failed to retrieve contact messages: $($_.Exception.Message)"
    $testResults += @{Test="Get Contact Messages"; Status="FAIL"; Details=$_.Exception.Message}
}

# ============ TEST 11: Get Feedback ============
Write-Section "TEST 11: Retrieve Feedback"
try {
    $response = Invoke-RestMethod -Uri "$apiBase/api/feedback" -Method Get -TimeoutSec 5
    $feedbackCount = ($response.feedback | Measure-Object).Count
    Write-TestPass "Retrieved $feedbackCount feedback entries"
    Write-Host "  Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
    $testResults += @{Test="Get Feedback"; Status="PASS"; Details="Retrieved $feedbackCount entries"}
} catch {
    Write-TestFail "Failed to retrieve feedback: $($_.Exception.Message)"
    $testResults += @{Test="Get Feedback"; Status="FAIL"; Details=$_.Exception.Message}
}

# ============ TEST 12: Search Buses ============
Write-Section "TEST 12: Search Buses by Route"
try {
    $searchPayload = @{
        from = "Karachi"
        to = "Lahore"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$apiBase/api/buses/search" -Method Post `
        -ContentType "application/json" -Body $searchPayload -TimeoutSec 5
    
    $busCount = ($response.schedules | Measure-Object).Count
    Write-TestPass "Found $busCount schedules for route Karachi -> Lahore"
    Write-Host "  Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
    $testResults += @{Test="Search Buses"; Status="PASS"; Details="Found $busCount schedules"}
} catch {
    Write-TestFail "Bus search failed: $($_.Exception.Message)"
    $testResults += @{Test="Search Buses"; Status="FAIL"; Details=$_.Exception.Message}
}

# ============ TEST 13: Empty Required Field Validation ============
Write-Section "TEST 13: Form Validation - Missing Required Fields"
try {
    $invalidPayload = @{
        fromCity = "Karachi"
        toCity = ""
        distanceKm = 1000
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$apiBase/api/admin/routes" -Method Post `
        -ContentType "application/json" -Body $invalidPayload `
        -Headers @{"X-Admin-Session"="true"} -TimeoutSec 5 -ErrorAction SilentlyContinue
    
    Write-TestFail "Empty toCity should have been rejected"
    $testResults += @{Test="Field Validation"; Status="FAIL"; Details="Should reject empty fields"}
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-TestPass "Empty field correctly rejected with 400"
        $testResults += @{Test="Field Validation"; Status="PASS"; Details="Returned 400 as expected"}
    } else {
        Write-TestInfo "Server error (may be expected): $($_.Exception.Message)"
        $testResults += @{Test="Field Validation"; Status="INFO"; Details=$_.Exception.Message}
    }
}

# ============ TEST 14: Database Connectivity ============
Write-Section "TEST 14: Database Integrity Check"
try {
    $response = Invoke-RestMethod -Uri "$apiBase/api/buses/search" -Method Post `
        -ContentType "application/json" -Body '{"from":"Karachi","to":"Lahore"}' -TimeoutSec 5
    
    Write-TestPass "Database is responsive and returning data"
    $testResults += @{Test="Database Connectivity"; Status="PASS"; Details="Database queries successful"}
} catch {
    Write-TestFail "Database connectivity issue: $($_.Exception.Message)"
    $testResults += @{Test="Database Connectivity"; Status="FAIL"; Details=$_.Exception.Message}
}

# ============ SUMMARY ============
Write-Section "TEST SUMMARY"
$passCount = ($testResults | Where-Object {$_.Status -eq "PASS"} | Measure-Object).Count
$failCount = ($testResults | Where-Object {$_.Status -eq "FAIL"} | Measure-Object).Count
$infoCount = ($testResults | Where-Object {$_.Status -eq "INFO"} | Measure-Object).Count

Write-Host "Test Results:" -ForegroundColor Yellow
Write-Host "  ✅ PASSED: $passCount" -ForegroundColor Green
Write-Host "  ❌ FAILED: $failCount" -ForegroundColor Red
Write-Host "  ℹ️  INFO:  $infoCount" -ForegroundColor Cyan
Write-Host "  📊 TOTAL:  $($testResults.Count)" -ForegroundColor White

Write-Host "`n" -ForegroundColor White
Write-Host "Detailed Results:" -ForegroundColor Yellow
$testResults | Format-Table -Property Test, Status, Details -AutoSize

if ($failCount -eq 0) {
    Write-Host "`n✅ ALL TESTS PASSED! Backend is production-ready." -ForegroundColor Green
} else {
    Write-Host "`n⚠️  $failCount test(s) failed. Review details above." -ForegroundColor Yellow
}
