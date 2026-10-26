// Week 8 - Backend Transaction Processing

// Validates that time uses a complete HH:MM format
function isValidTimeFormat(time) {
    const timeFormat = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
    return timeFormat.test(time);
}
// Tutoring hours
const OPEN_TIME = "09:00";
const CLOSE_TIME = "17:00";

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

    return minutes === 0 ||
           minutes === 15 ||
           minutes === 30 ||
           minutes === 45;
}

// Rule 3: Request status depends on validation
function getRequestStatus(formIsValid) {
    if (formIsValid) {
        return "Submitted";
    } else {
        return "Validation Failed";
    }
}

// Processes a tutoring request using transaction data
// This function does not access HTML or DOM elements.
function processTutoringRequest(transaction) {

    // INVALID INPUT VALIDATION
    if (!transaction) {
        return {
            valid: false,
            status: "Validation Failed",
            message: "Transaction data is required."
        };
    }

    if (!transaction.requestedTime) {
        return {
            valid: false,
            status: "Validation Failed",
            message: "A requested tutoring time is required."
        };
    }

    // INVALID TIME FORMAT VALIDATION
if (!isValidTimeFormat(transaction.requestedTime)) {
    return {
        valid: false,
        status: "Validation Failed",
        message: "Requested time must use the complete HH:MM format."
    };
}

    // BUSINESS RULE 1: Tutoring hours
    const timeIsValid =
        isWithinTutoringHours(transaction.requestedTime);

    if (!timeIsValid) {
        return {
            valid: false,
            status: "Validation Failed",
            message:
                "Please select a time between 9:00 AM and 4:45 PM."
        };
    }

    // BUSINESS RULE 2: 15-minute increments
    const incrementIsValid =
        isValidTimeIncrement(transaction.requestedTime);

    if (!incrementIsValid) {
        return {
            valid: false,
            status: "Validation Failed",
            message:
                "Please select a time in 15-minute increments."
        };
    }

    // BUSINESS DECISION
    const status = getRequestStatus(true);

    return {
        valid: true,
        status: status,
        message: "Tutoring request submitted successfully."
    };
}

module.exports = {
    isValidTimeFormat,
    isWithinTutoringHours,
    isValidTimeIncrement,
    getRequestStatus,
    processTutoringRequest
};