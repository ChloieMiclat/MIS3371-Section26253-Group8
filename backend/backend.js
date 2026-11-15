// Week 10 - Backend Transaction Processing (runs in AWS Lambda)
// This function does not access HTML or DOM elements.

// Tutoring hours
const OPEN_TIME = "09:00";
const CLOSE_TIME = "17:00";

const ALLOWED_SUBJECTS = ["MIS3371", "accounting", "economics", "statistics", "other"];
const ALLOWED_DURATIONS = [30, 60];
const ALLOWED_FORMATS = ["online", "in-person"];
const UH_EMAIL_DOMAIN = "@cougarnet.uh.edu";

// ---------- Helper checks ----------

// Validates that time uses a complete HH:MM format
function isValidTimeFormat(time) {
    const timeFormat = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
    return timeFormat.test(time);
}

// Turns "HH:MM" into minutes after midnight (ex: "16:30" -> 990)
function toMinutes(time) {
    const parts = time.split(":");
    return Number(parts[0]) * 60 + Number(parts[1]);
}

// Student ID must be exactly 7 digits
function isValidStudentId(studentId) {
    return /^\d{7}$/.test(studentId);
}

// Email must be a UH student email
function isValidUhEmail(email) {
    const pattern = /^[^\s@]+@cougarnet\.uh\.edu$/i;
    return pattern.test(email);
}

// Today's date in Houston time, as YYYY-MM-DD
function getTodayInHouston() {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Chicago",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(new Date());
}

// Date must be a real YYYY-MM-DD date
function isValidDateFormat(date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return false;
    }
    const parsed = new Date(date + "T00:00:00Z");
    return !isNaN(parsed) && parsed.toISOString().slice(0, 10) === date;
}

// Rule 1: Requested time must be within tutoring hours
function isWithinTutoringHours(time) {
    return time >= OPEN_TIME && time < CLOSE_TIME;
}

// Rule 2: Requested time must be in 15-minute increments
function isValidTimeIncrement(time) {
    if (!isValidTimeFormat(time)) {
        return false;
    }
    const minutes = Number(time.split(":")[1]);
    return minutes % 15 === 0;
}

// Rule 3 (conditional): the session must END by 5:00 PM
// Uses two fields together: requested time + session length
function endsByClosingTime(time, duration) {
    return toMinutes(time) + duration <= toMinutes(CLOSE_TIME);
}

// Rule 4: Request status depends on validation
function getRequestStatus(formIsValid) {
    if (formIsValid) {
        return "Submitted";
    } else {
        return "Validation Failed";
    }
}

function fail(message) {
    return {
        valid: false,
        status: getRequestStatus(false),
        message: message
    };
}

// ---------- Main function ----------

function processTutoringRequest(transaction) {

    // INVALID INPUT VALIDATION
    if (!transaction || typeof transaction !== "object") {
        return fail("Transaction data is required.");
    }

    const studentId = String(transaction.studentId || "").trim();
    const studentEmail = String(transaction.studentEmail || "").trim();
    const subject = String(transaction.subject || "").trim();
    const topicDescription = String(transaction.topicDescription || "").trim();
    const requestedDate = String(transaction.requestedDate || "").trim();
    const requestedTime = String(transaction.requestedTime || "").trim();
    const requestedDuration = Number(transaction.requestedDuration);
    const format = String(transaction.format || "").trim();

    if (!isValidStudentId(studentId)) {
        return fail("Student ID must be exactly 7 digits, numbers only.");
    }

    if (!isValidUhEmail(studentEmail)) {
        return fail("Please use your UH student email (" + UH_EMAIL_DOMAIN + ").");
    }

    if (!ALLOWED_SUBJECTS.includes(subject)) {
        return fail("Please choose a valid course or subject.");
    }

    if (topicDescription.length < 10 || topicDescription.length > 300) {
        return fail("Tutoring topic must be between 10 and 300 characters.");
    }

    if (!isValidDateFormat(requestedDate)) {
        return fail("A valid preferred date is required.");
    }

    if (requestedDate < getTodayInHouston()) {
        return fail("Preferred date must be today or a future date.");
    }

    if (!requestedTime) {
        return fail("A requested tutoring time is required.");
    }

    if (!isValidTimeFormat(requestedTime)) {
        return fail("Requested time must use the complete HH:MM format.");
    }

    if (!ALLOWED_DURATIONS.includes(requestedDuration)) {
        return fail("Session length must be 30 or 60 minutes.");
    }

    if (!ALLOWED_FORMATS.includes(format)) {
        return fail("Please choose online or in-person.");
    }

    // BUSINESS RULE 1: Tutoring hours
    if (!isWithinTutoringHours(requestedTime)) {
        return fail("Please select a time between 9:00 AM and 5:00 PM.");
    }

    // BUSINESS RULE 2: 15-minute increments
    if (!isValidTimeIncrement(requestedTime)) {
        return fail("Please select a time in 15-minute increments.");
    }

    // BUSINESS RULE 3: Session must end by 5:00 PM
    if (!endsByClosingTime(requestedTime, requestedDuration)) {
        return fail(
            "This session would end after 5:00 PM. " +
            "30-minute sessions must start by 4:30 PM and 60-minute sessions by 4:00 PM."
        );
    }

    // BUSINESS DECISION
    return {
        valid: true,
        status: getRequestStatus(true),
        message: "Tutoring request submitted successfully."
    };
}

module.exports = {
    isValidTimeFormat,
    isWithinTutoringHours,
    isValidTimeIncrement,
    endsByClosingTime,
    getRequestStatus,
    processTutoringRequest
};
