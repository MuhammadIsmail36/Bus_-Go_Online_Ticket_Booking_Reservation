@echo off
setlocal enabledelayedexpansion

set API_URL=http://localhost:3000
set /a PASS=0
set /a FAIL=0

echo ========================================
echo COMPREHENSIVE API TEST SUITE
echo ========================================

REM TEST 1: Health Check
echo.
echo TEST 1: Health Check
curl -s %API_URL%/api/health
if !errorlevel! equ 0 (
    set /a PASS+=1
    echo [PASS] Health check successful
) else (
    set /a FAIL+=1
    echo [FAIL] Health check failed
)

REM TEST 2: Get All Buses
echo.
echo TEST 2: Get All Buses
curl -s %API_URL%/api/buses
if !errorlevel! equ 0 (
    set /a PASS+=1
    echo [PASS] Get buses successful
) else (
    set /a FAIL+=1
    echo [FAIL] Get buses failed
)

REM TEST 3: Get Routes
echo.
echo TEST 3: Get Routes
curl -s %API_URL%/api/routes
if !errorlevel! equ 0 (
    set /a PASS+=1
    echo [PASS] Get routes successful
) else (
    set /a FAIL+=1
    echo [FAIL] Get routes failed
)

REM TEST 4: Submit Contact Message
echo.
echo TEST 4: Submit Contact Message
curl -s -X POST %API_URL%/api/contact -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"message\":\"Test message\"}"
if !errorlevel! equ 0 (
    set /a PASS+=1
    echo [PASS] Contact message submitted
) else (
    set /a FAIL+=1
    echo [FAIL] Contact message failed
)

REM TEST 5: Submit Feedback
echo.
echo TEST 5: Submit Feedback
curl -s -X POST %API_URL%/api/feedback -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"rating\":5,\"message\":\"Great service\"}"
if !errorlevel! equ 0 (
    set /a PASS+=1
    echo [PASS] Feedback submitted
) else (
    set /a FAIL+=1
    echo [FAIL] Feedback failed
)

REM TEST 6: Test Admin Endpoint WITHOUT Auth (should fail)
echo.
echo TEST 6: Test Admin Endpoint WITHOUT Auth ^(should return 401^)
curl -s -w "\nHTTP Status: %%{http_code}\n" -X GET %API_URL%/api/admin/routes
if !errorlevel! equ 0 (
    set /a PASS+=1
    echo [PASS] Unauthorized request blocked
) else (
    set /a FAIL+=1
    echo [FAIL] Authorization check failed
)

REM TEST 7: Test Admin Endpoint WITH Auth
echo.
echo TEST 7: Test Admin Endpoint WITH Auth
curl -s -H "X-Admin-Session: true" -X GET %API_URL%/api/admin/routes
if !errorlevel! equ 0 (
    set /a PASS+=1
    echo [PASS] Authorized request successful
) else (
    set /a FAIL+=1
    echo [FAIL] Authorized request failed
)

REM TEST 8: Create Route (with auth)
echo.
echo TEST 8: Create Route ^(with auth^)
curl -s -X POST %API_URL%/api/admin/routes ^
  -H "Content-Type: application/json" ^
  -H "X-Admin-Session: true" ^
  -d "{\"from_city\":\"New York\",\"to_city\":\"Boston\",\"distance\":215,\"duration\":4}"
if !errorlevel! equ 0 (
    set /a PASS+=1
    echo [PASS] Route created
) else (
    set /a FAIL+=1
    echo [FAIL] Route creation failed
)

REM TEST 9: Create Bus (with auth)
echo.
echo TEST 9: Create Bus ^(with auth^)
curl -s -X POST %API_URL%/api/admin/buses ^
  -H "Content-Type: application/json" ^
  -H "X-Admin-Session: true" ^
  -d "{\"name\":\"Express Bus\",\"bus_number\":\"EXP001\",\"total_seats\":50}"
if !errorlevel! equ 0 (
    set /a PASS+=1
    echo [PASS] Bus created
) else (
    set /a FAIL+=1
    echo [FAIL] Bus creation failed
)

echo.
echo ========================================
echo TEST SUMMARY
echo ========================================
echo Passed: !PASS!
echo Failed: !FAIL!
echo ========================================
