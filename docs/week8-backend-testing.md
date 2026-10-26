
# Week 8 Backend Testing Report — CougarTutor+

## 1. Overview

This document records the backend test results reported for CougarTutor+ tutoring request submission and validation.

- **Reported test result:** 11/11 tests passed
- **Source of results:** using node backend/test-backend.js, we tested the test-backend.js file 
- **Testing scope:** Tutoring hours, time increments, required transaction data, and boundary conditions.

## 2. Test Results

### 2.1 Valid Requests

| Test ID | Test Case / Input | Expected Result | Reported Actual Result | Status |
|---|---|---|---|---|
| TC-01 | Valid requested time: 10:00 AM | Request accepted; status is `Submitted` | Request accepted; status is `Submitted`. Message: "Tutoring request submitted successfully." | PASS |
| TC-02 | Valid requested time: 2:30 PM | Request accepted; status is `Submitted` | Request accepted; status is `Submitted`. Message: "Tutoring request submitted successfully." | PASS |

### 2.2 Invalid Requests

| Test ID | Test Case / Input | Expected Result | Reported Actual Result | Status |
|---|---|---|---|---|
| TC-03 | Requested time: 8:00 AM (before tutoring hours) | Request rejected; status is `Validation Failed` | Request rejected; status is `Validation Failed`. Message: "Please select a time between 9:00 AM and 4:45 PM." | PASS |
| TC-04 | Requested time: 7:00 PM (after tutoring hours) | Request rejected; status is `Validation Failed` | Request rejected; status is `Validation Failed`. Message: "Please select a time between 9:00 AM and 4:45 PM." | PASS |
| TC-05 | Requested time: 10:10 AM (not a 15-minute increment) | Request rejected; status is `Validation Failed` | Request rejected; status is `Validation Failed`. Message: "Please select a time in 15-minute increments." | PASS |
| TC-06 | No transaction data sent | Request rejected; status is `Validation Failed` | Request rejected; status is `Validation Failed`. Message: "Transaction data is required." | PASS |
| TC-07 | Requested time is missing | Request rejected; status is `Validation Failed` | Request rejected; status is `Validation Failed`. Message: "A requested tutoring time is required." | PASS |

### 2.3 Boundary and Edge Cases

| Test ID | Test Case / Input | Expected Result | Reported Actual Result | Status |
|---|---|---|---|---|
| TC-08 | Requested time: 9:00 AM (opening time) | Request accepted; status is `Submitted` | Request accepted; status is `Submitted`. Message: "Tutoring request submitted successfully." | PASS |
| TC-09 | Requested time: 4:45 PM (latest allowed start time) | Request accepted; status is `Submitted` | Request accepted; status is `Submitted`. Message: "Tutoring request submitted successfully." | PASS |
| TC-10 | Requested time: 5:00 PM (closing time) | Request rejected; status is `Validation Failed` | Request rejected; status is `Validation Failed`. Message: "Please select a time between 9:00 AM and 4:45 PM." | PASS |
| TC-11 | Requested time: 4:59 PM (not a 15-minute increment) | Request rejected; status is `Validation Failed` | Request rejected; status is `Validation Failed`. Message: "Please select a time in 15-minute increments." | PASS |

## 3. Test Summary

The reported test cases cover the following backend validation requirements:

- Accepting valid requested times during tutoring hours.
- Rejecting requests before tutoring hours begin.
- Rejecting requests after tutoring hours end.
- Enforcing 15-minute time increments.
- Rejecting requests with missing transaction data.
- Rejecting requests with a missing requested time.
- Testing the opening time, latest permitted start time, and closing-time boundary.

