# CougarTutor+ API Contract (Milestone 4)

This is the shared contract for the team. The frontend (`app.js`), the Lambda (`index.js` + `backend/backend.js`), the test matrix and DynamoDB all use these exact field names and messages.

**Base URL:** `https://2f5wr6pvo1.execute-api.us-east-1.amazonaws.com`

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/tutoring-requests` | Validate a tutoring request, apply business rules, save it to DynamoDB, return a confirmation number |
| `GET` | `/tutoring-requests/{requestId}` | Look up one saved request by its confirmation number |

---

## 1. POST `/tutoring-requests` (submit a request)

### Request body (JSON)

| Field | Example | Rule checked in Lambda |
|---|---|---|
| `studentId` | `"1234567"` | Exactly 7 digits |
| `studentEmail` | `"jdoe@cougarnet.uh.edu"` | Must end with `@cougarnet.uh.edu` |
| `subject` | `"MIS3371"` | `MIS3371`, `accounting`, `economics`, `statistics` or `other` |
| `topicDescription` | `"Help with Excel pivot tables"` | 10–300 characters |
| `requestedDate` | `"2026-12-01"` | Real date, today or later (Houston time) |
| `requestedTime` | `"10:00"` | `HH:MM`, 9:00 AM to before 5:00 PM, 15-minute steps |
| `requestedDuration` | `"60"` | `"30"` or `"60"` |
| `format` | `"online"` | `online` or `in-person` |

**Business rule:** the session must end by 5:00 PM (30-minute sessions start by 4:30 PM, 60-minute sessions by 4:00 PM).

```json
{
  "studentId": "1234567",
  "studentEmail": "jdoe@cougarnet.uh.edu",
  "subject": "MIS3371",
  "topicDescription": "Help with Excel pivot tables",
  "requestedDate": "2026-12-01",
  "requestedTime": "10:00",
  "requestedDuration": "60",
  "format": "online"
}
```

### Responses

**200: valid and saved.** The confirmation number is returned only after the DynamoDB save succeeds.
```json
{
  "success": true,
  "valid": true,
  "status": "Submitted",
  "message": "Tutoring request submitted successfully.",
  "persisted": true,
  "requestId": "CT-20261115-C17D55",
  "submittedAt": "2026-11-15T19:55:54.434Z"
}
```

**400: invalid input.** Nothing is saved. `message` is one of the validation messages listed below.
```json
{
  "success": false,
  "valid": false,
  "status": "Validation Failed",
  "message": "Please use your UH student email (@cougarnet.uh.edu).",
  "persisted": false
}
```

**500: save failed** (for example, the database is unavailable). Nothing is saved, and no confirmation number is returned.
```json
{
  "success": false,
  "valid": true,
  "status": "Error",
  "message": "We could not save your request right now. Please try again later.",
  "persisted": false
}
```

### All validation messages (400)

| Situation | `message` |
|---|---|
| Body isn't valid JSON | `Request body must be valid JSON.` |
| No data sent | `Transaction data is required.` |
| Student ID not 7 digits | `Student ID must be exactly 7 digits, numbers only.` |
| Not a UH email | `Please use your UH student email (@cougarnet.uh.edu).` |
| Subject not in the list | `Please choose a valid course or subject.` |
| Topic under 10 or over 300 characters | `Tutoring topic must be between 10 and 300 characters.` |
| Date missing or not a real date | `A valid preferred date is required.` |
| Date in the past | `Preferred date must be today or a future date.` |
| Time missing | `A requested tutoring time is required.` |
| Time not `HH:MM` | `Requested time must use the complete HH:MM format.` |
| Length not 30 or 60 | `Session length must be 30 or 60 minutes.` |
| Format not online/in-person | `Please choose online or in-person.` |
| Before 9:00 AM or at/after 5:00 PM | `Please select a time between 9:00 AM and 5:00 PM.` |
| Not a 15-minute step | `Please select a time in 15-minute increments.` |
| Session ends after 5:00 PM | `This session would end after 5:00 PM. 30-minute sessions must start by 4:30 PM and 60-minute sessions by 4:00 PM.` |

---

## 2. GET `/tutoring-requests/{requestId}` (look up a request)

**Confirmation number format:** `CT-` + date (`YYYYMMDD`) + `-` + 6 characters `0-9`/`A-F`, for example `CT-20261115-C17D55`. Lowercase input is accepted and converted to uppercase.

**Example:** `GET /tutoring-requests/CT-20261115-C17D55`

### Responses

**200: found.** Student ID and email are not returned, for privacy.
```json
{
  "success": true,
  "request": {
    "requestId": "CT-20261115-C17D55",
    "status": "Pending Confirmation",
    "processingOutcome": "Accepted - passed all validation and business rules",
    "submittedAt": "2026-11-15T19:55:54.434Z",
    "subject": "MIS3371",
    "topicDescription": "Help with Excel pivot tables",
    "requestedDate": "2026-12-01",
    "requestedTime": "10:00",
    "requestedDuration": "60",
    "format": "online"
  }
}
```

**404: not found** (correct format, but no such request)
```json
{
  "success": false,
  "status": "Not Found",
  "message": "No tutoring request was found for that confirmation number."
}
```

**400: bad format** (for example `ABC123` or blank)
```json
{
  "success": false,
  "status": "Invalid",
  "message": "Please enter a valid confirmation number (for example, CT-20261115-7F3A9C)."
}
```

**500: lookup failed** (for example, the database is unavailable)
```json
{
  "success": false,
  "status": "Error",
  "message": "We could not look up your request right now. Please try again later."
}
```

---

## 3. DynamoDB table

| Setting | Value |
|---|---|
| Table name | `TutoringRequests` |
| Partition key | `requestId` (String) |
| Capacity | On-demand |
| Region | US East (N. Virginia), `us-east-1` |
| Lambda environment variable | `TABLE_NAME` = `TutoringRequests` |
| Lambda execution role | `LabRole` |

**Each saved item contains:** `requestId`, `studentId`, `studentEmail`, `subject`, `topicDescription`, `requestedDate`, `requestedTime`, `requestedDuration`, `format`, `status` (`Pending Confirmation`), `processingOutcome`, `submittedAt` (ISO date and time, UTC).

---

## 4. Notes for the team

- **Frontend (Cordy):**
  - After a 200 POST, show `requestId` to the user.
  - For lookups, call `GET API_URL + "/" + encodeURIComponent(number)`.
  - Display only what the GET response returns.
  - For 400, 404 and 500, show the response's `message`.
  - If the request fails entirely (no response), show a friendly error.
- **Testing (Jess):** use the request and response examples above for expected outcomes. Retrieval tests: R1 (found), R2 `CT-20200101-000000` (404), R3 blank (400), R4 `ABC123` (400).
- **Errors that can't be reproduced safely:** a database outage returns the 500 messages above. This was tested by simulating a database failure; it is not reproduced on the live site.
