// Week 10 - CougarTutor+ frontend
// The browser gives quick feedback; the Lambda backend makes the final decision.

// API Gateway endpoint (Lambda backend)
const API_URL = "https://2f5wr6pvo1.execute-api.us-east-1.amazonaws.com/tutoring-requests";

// Tutoring hours (sessions must end by 5:00 PM)
const OPEN_TIME = "09:00";
const CLOSE_TIME = "17:00";

// Turns "HH:MM" into minutes after midnight
function toMinutes(time) {
    const parts = time.split(":");
    return Number(parts[0]) * 60 + Number(parts[1]);
}

// Form fields
const form = document.querySelector("form");
const studentId = document.querySelector("#studentId");
const studentEmail = document.querySelector("#studentEmail");
const subject = document.querySelector("#subject");
const topicDescription = document.querySelector("#topicDescription");
const requestedDate = document.querySelector("#requestedDate");
const requestedTime = document.querySelector("#requestedTime");
const requestedDuration = document.querySelector("#requestedDuration");
const timeMessage = document.querySelector("#timeMessage");
const requestStatus = document.querySelector("#requestStatus");
// Confirmation box (shows the confirmation number from the backend)
const confirmationBox = document.querySelector("#confirmationBox");
const confirmationNumber = document.querySelector("#confirmationNumber");


// Live time feedback - matches the backend rules
function updateTimeMessage() {
    const time = requestedTime.value;
    const duration = Number(requestedDuration.value);

    if (!time) {
        timeMessage.textContent = "Available hours: 9:00 AM - 5:00 PM.";
        return;
    }

    const minutes = Number(time.split(":")[1]);

    if (time < OPEN_TIME || time >= CLOSE_TIME || minutes % 15 !== 0) {
        timeMessage.textContent =
            "Please select a time between 9:00 AM and 5:00 PM in 15-minute increments.";
    } else if (duration && toMinutes(time) + duration > toMinutes(CLOSE_TIME)) {
        timeMessage.textContent =
            "This session would end after 5:00 PM. 30-minute sessions must start by 4:30 PM and 60-minute sessions by 4:00 PM.";
    } else {
        timeMessage.textContent = "Time is available.";
    }
}

requestedTime.addEventListener("change", updateTimeMessage);
requestedDuration.addEventListener("change", updateTimeMessage);

// Sends the whole request to the Lambda backend through API Gateway
form.addEventListener("submit", async function (event) {

    event.preventDefault();

    const selectedFormat = document.querySelector('input[name="format"]:checked');

    const transaction = {
        studentId: studentId.value.trim(),
        studentEmail: studentEmail.value.trim(),
        subject: subject.value,
        topicDescription: topicDescription.value.trim(),
        requestedDate: requestedDate.value,
        requestedTime: requestedTime.value,
        requestedDuration: requestedDuration.value,
        format: selectedFormat ? selectedFormat.value : ""
    };

    requestStatus.textContent = "Request status: Sending...";
    confirmationBox.hidden = true; 

      try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(transaction)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            requestStatus.textContent =
                "Request status: " + result.status + " - " + result.message;

            // The backend only sends a requestId AFTER the request is saved in DynamoDB
            if (result.requestId) {
                confirmationNumber.textContent = result.requestId;
                confirmationBox.hidden = false;
            }
        } else {
            requestStatus.textContent =
                "Request status: " + (result.message || "Something went wrong. Please try again.");
        }

    } catch (error) {
        requestStatus.textContent =
            "Request status: Could not reach the server. Please try again.";
    }
});
