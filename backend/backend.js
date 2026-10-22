// Week 8 - Backend Transaction Processing

// Tutoring hours
const OPEN_TIME = "09:00";
const CLOSE_TIME = "17:00";

// Rule 1: Requested time must be within tutoring hours
function isWithinTutoringHours(time) {
    return time >= OPEN_TIME && time < CLOSE_TIME;
}

// Rule 2: Request status depends on validation
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

    const timeIsValid =
        isWithinTutoringHours(transaction.requestedTime);

    const status =
        getRequestStatus(timeIsValid);

    if (!timeIsValid) {
        return {
            valid: false,
            status: status,
            message:
                "Please select a time between 9:00 AM and 4:45 PM in 15-minute increments."
        };
    }

    return {
        valid: true,
        status: status,
        message: "Time is available."
    };
}

module.exports = {
    isWithinTutoringHours,
    getRequestStatus,
    processTutoringRequest
};