@echo off
setlocal enabledelayedexpansion

REM Simple API tests using curl

echo.
echo ========== TEST SUITE: BusGo Backend API ==========
echo.

REM TEST 1: Health Endpoint
echo TEST 1: Health Endpoint
curl -s http://localhost:3000/api/health && echo. || echo FAILED
echo.

REM TEST 2: Contact Submission
echo TEST 2: Contact Submission
curl -s -X POST http://localhost:3000/api/contact ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test User\",\"email\":\"test@test.com\",\"message\":\"Test message\"}" && echo. || echo FAILED
echo.

REM TEST 3: Feedback Submission
echo TEST 3: Feedback Submission
curl -s -X POST http://localhost:3000/api/feedback ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test User\",\"email\":\"test@test.com\",\"rating\":5,\"comment\":\"Test feedback\"}" && echo. || echo FAILED
echo.

REM TEST 4: Unauthorized Admin Access (should fail)
echo TEST 4: Unauthorized Admin Access (should return 401)
curl -s -X POST http://localhost:3000/api/admin/routes ^
  -H "Content-Type: application/json" ^
  -H "X-Admin-Session: false" ^
  -d "{\"fromCity\":\"Karachi\",\"toCity\":\"Lahore\",\"distanceKm\":1210}" && echo. || echo PASS - correctly rejected
echo.

REM TEST 5: Authorized Admin Access
echo TEST 5: Authorized Admin Access (with auth header)
curl -s -X POST http://localhost:3000/api/admin/routes ^
  -H "Content-Type: application/json" ^
  -H "X-Admin-Session: true" ^
  -d "{\"fromCity\":\"Karachi\",\"toCity\":\"Lahore\",\"distanceKm\":1210}" && echo. || echo FAILED
echo.

REM TEST 6: Create Bus
echo TEST 6: Create Bus
curl -s -X POST http://localhost:3000/api/admin/buses ^
  -H "Content-Type: application/json" ^
  -H "X-Admin-Session: true" ^
  -d "{\"busName\":\"Test Bus\",\"busType\":\"AC\",\"seatType\":\"Seater\",\"totalSeats\":40}" && echo. || echo FAILED
echo.

REM TEST 7: Create Schedule
echo TEST 7: Create Schedule
curl -s -X POST http://localhost:3000/api/admin/schedules ^
  -H "Content-Type: application/json" ^
  -H "X-Admin-Session: true" ^
  -d "{\"busId\":1,\"fromCity\":\"Karachi\",\"toCity\":\"Lahore\",\"departureTime\":\"2025-12-27T10:00\",\"arrivalTime\":\"2025-12-27T18:00\",\"price\":1500}" && echo. || echo FAILED
echo.

REM TEST 8: Get Contact Messages
echo TEST 8: Get Contact Messages
curl -s http://localhost:3000/api/contact/messages && echo. || echo FAILED
echo.

REM TEST 9: Get Feedback
echo TEST 9: Get Feedback
curl -s http://localhost:3000/api/feedback && echo. || echo FAILED
echo.

REM TEST 10: Bus Search
echo TEST 10: Bus Search
curl -s -X POST http://localhost:3000/api/buses/search ^
  -H "Content-Type: application/json" ^
  -d "{\"from\":\"Karachi\",\"to\":\"Lahore\"}" && echo. || echo FAILED
echo.

echo ========== END OF TESTS ==========
