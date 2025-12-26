# PowerShell Backend Test Suite
# Run this in Terminal 2 while server is running in Terminal 1

$BASE_URL = "http://localhost:3000"
$ADMIN_TOKEN = "admin_secure_token_2025"

# Color output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Error { Write-Host $args -ForegroundColor Red }
function Write-Info { Write-Host $args -ForegroundColor Cyan }

$testsPassed = 0
$testsFailed = 0

# Test function
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Path,
        [hashtable]$Headers,
        [string]$Body,
        [int]$ExpectedStatus
    )
    
    try {
        Write-Info "Test: $Name"
        
        $params = @{
            Uri = "$BASE_URL$Path"
            Method = $Method
            Headers = $Headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params.Body = $Body
        }
        
        $response = Invoke-WebRequest @params -ErrorAction Stop
        $statusCode = $response.StatusCode
        
        if ($statusCode -eq $ExpectedStatus) {
            Write-Success "✅ PASS - Status: $statusCode"
            $global:testsPassed++
            
            # Return response for use in dependent tests
            return $response.Content | ConvertFrom-Json
        } else {
            Write-Error "❌ FAIL - Expected $ExpectedStatus, got $statusCode"
            $global:testsFailed++
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.Value__
        if ($statusCode -eq $ExpectedStatus) {
            Write-Success "✅ PASS - Status: $statusCode"
            $global:testsPassed++
            return $_.Exception.Response.Content.ReadAsStringAsync().Result | ConvertFrom-Json
        } else {
            Write-Error "❌ FAIL - $($_.Exception.Message)"
            $global:testsFailed++
        }
    }
}

Write-Info "=========================================="
Write-Info "🚌 Bus Reservation Backend Test Suite"
Write-Info "=========================================="
Write-Info ""

# Test 1: Health Check
Write-Info "━━━ Test 1: Health Check ━━━"
Test-Endpoint -Name "Health Check" -Method GET -Path "/api/health" -Headers @{} -ExpectedStatus 200
Write-Info ""

# Test 2: Create Route
Write-Info "━━━ Test 2: Create Route (Admin) ━━━"
$routeBody = @{
    fromCity = "Karachi"
    toCity = "Lahore"
    distanceKm = 1270
} | ConvertTo-Json

$authHeaders = @{
    Authorization = "Bearer $ADMIN_TOKEN"
}

Test-Endpoint -Name "Create Route" -Method POST -Path "/api/routes" -Headers $authHeaders -Body $routeBody -ExpectedStatus 201
Write-Info ""

# Test 3: Create Bus
Write-Info "━━━ Test 3: Create Bus (Admin) ━━━"
$busBody = @{
    busName = "FastTrack Express"
    busType = "AC"
    seatType = "Seater"
    totalSeats = 40
} | ConvertTo-Json

Test-Endpoint -Name "Create Bus" -Method POST -Path "/api/buses" -Headers $authHeaders -Body $busBody -ExpectedStatus 201
Write-Info ""

# Test 4: Create Schedule
Write-Info "━━━ Test 4: Create Schedule (Admin) ━━━"
$scheduleBody = @{
    busId = 1
    fromCity = "Karachi"
    toCity = "Lahore"
    departureTime = "2025-01-10T08:00:00Z"
    arrivalTime = "2025-01-10T16:00:00Z"
    price = 3500
} | ConvertTo-Json

Test-Endpoint -Name "Create Schedule" -Method POST -Path "/api/admin/schedules" -Headers $authHeaders -Body $scheduleBody -ExpectedStatus 201
Write-Info ""

# Test 5: Search Buses
Write-Info "━━━ Test 5: Search Buses (Public) ━━━"
Test-Endpoint -Name "Search Buses" -Method GET -Path "/api/buses/search?from=Karachi&to=Lahore&date=2025-01-10&passengers=2" -Headers @{} -ExpectedStatus 200
Write-Info ""

# Test 6: Create Booking
Write-Info "━━━ Test 6: Create Booking (Public) ━━━"
$bookingBody = @{
    scheduleId = 1
    passengerName = "Ali Hassan"
    passengerEmail = "ali@example.com"
    passengerPhone = "+923001234567"
    seats = 2
    amount = 7000
} | ConvertTo-Json

Test-Endpoint -Name "Create Booking" -Method POST -Path "/api/bookings" -Headers @{} -Body $bookingBody -ExpectedStatus 201
Write-Info ""

# Test 7: View My Bookings
Write-Info "━━━ Test 7: View My Bookings (Public) ━━━"
Test-Endpoint -Name "View My Bookings" -Method GET -Path "/api/bookings?email=ali@example.com" -Headers @{} -ExpectedStatus 200
Write-Info ""

# Test 8: Submit Contact Message
Write-Info "━━━ Test 8: Submit Contact Message (Public) ━━━"
$contactBody = @{
    name = "Ahmed Khan"
    email = "ahmed@example.com"
    message = "I need help with my booking"
} | ConvertTo-Json

Test-Endpoint -Name "Submit Contact Message" -Method POST -Path "/api/contact" -Headers @{} -Body $contactBody -ExpectedStatus 201
Write-Info ""

# Test 9: Get Contact Messages
Write-Info "━━━ Test 9: Get Contact Messages (Admin) ━━━"
Test-Endpoint -Name "Get Contact Messages" -Method GET -Path "/api/contact/messages" -Headers $authHeaders -ExpectedStatus 200
Write-Info ""

# Test 10: Reply to Contact Message
Write-Info "━━━ Test 10: Reply to Contact Message (Admin) ━━━"
$replyBody = @{
    reply = "Thank you for contacting us. We will assist you shortly."
} | ConvertTo-Json

Test-Endpoint -Name "Reply to Contact Message" -Method POST -Path "/api/contact/messages/1/reply" -Headers $authHeaders -Body $replyBody -ExpectedStatus 200
Write-Info ""

# Test 11: Submit Feedback
Write-Info "━━━ Test 11: Submit Feedback (Public) ━━━"
$feedbackBody = @{
    name = "Sara Ahmed"
    email = "sara@example.com"
    rating = 5
    comment = "Excellent service! Comfortable bus and on-time arrival."
} | ConvertTo-Json

Test-Endpoint -Name "Submit Feedback" -Method POST -Path "/api/feedback" -Headers @{} -Body $feedbackBody -ExpectedStatus 201
Write-Info ""

# Test 12: Get All Feedback
Write-Info "━━━ Test 12: Get All Feedback (Admin) ━━━"
Test-Endpoint -Name "Get All Feedback" -Method GET -Path "/api/feedback" -Headers $authHeaders -ExpectedStatus 200
Write-Info ""

# Test 13: Prevent Overbooking
Write-Info "━━━ Test 13: Prevent Overbooking (Error Handling) ━━━"

# First, book 38 seats
$bookingBody2 = @{
    scheduleId = 1
    passengerName = "John Doe"
    passengerEmail = "john@example.com"
    passengerPhone = "+923009999999"
    seats = 38
    amount = 133000
} | ConvertTo-Json

Test-Endpoint -Name "Book 38 Seats" -Method POST -Path "/api/bookings" -Headers @{} -Body $bookingBody2 -ExpectedStatus 201

# Then try to book 3 more (should fail - only 0 seats left)
$bookingBody3 = @{
    scheduleId = 1
    passengerName = "Bob Smith"
    passengerEmail = "bob@example.com"
    passengerPhone = "+923008888888"
    seats = 3
    amount = 10500
} | ConvertTo-Json

Test-Endpoint -Name "Try to Overbooking (Should Fail)" -Method POST -Path "/api/bookings" -Headers @{} -Body $bookingBody3 -ExpectedStatus 400
Write-Info ""

# Test 14: Unauthorized Access
Write-Info "━━━ Test 14: Unauthorized Access (Error Handling) ━━━"
$routeBody2 = @{
    fromCity = "Islamabad"
    toCity = "Peshawar"
    distanceKm = 200
} | ConvertTo-Json

Test-Endpoint -Name "Create Route Without Auth (Should Fail)" -Method POST -Path "/api/routes" -Headers @{} -Body $routeBody2 -ExpectedStatus 401
Write-Info ""

# Test 15: Invalid Token
Write-Info "━━━ Test 15: Invalid Token (Error Handling) ━━━"
$busBody2 = @{
    busName = "Fake Bus"
    busType = "AC"
    seatType = "Seater"
    totalSeats = 50
} | ConvertTo-Json

$badHeaders = @{
    Authorization = "Bearer wrong_token_123"
}

Test-Endpoint -Name "Create Bus With Invalid Token (Should Fail)" -Method POST -Path "/api/buses" -Headers $badHeaders -Body $busBody2 -ExpectedStatus 401
Write-Info ""

# Summary
Write-Info "=========================================="
Write-Info "Test Summary:"
Write-Success "✅ Passed: $testsPassed"
Write-Error "❌ Failed: $testsFailed"
Write-Info "=========================================="

if ($testsFailed -eq 0) {
    Write-Success "🎉 All tests passed! Backend is stable and working correctly."
    exit 0
} else {
    Write-Error "⚠️ Some tests failed. Check the backend for issues."
    exit 1
}
