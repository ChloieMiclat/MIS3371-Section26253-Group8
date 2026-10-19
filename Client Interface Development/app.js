// Tutoring hours 
const OPEN_TIME = "09:00";
const CLOSE_TIME = "17:00";

// Checks if the requested time is during tutoring hours
function isWithinTutoringHours(time) {
  return time >= OPEN_TIME && time < CLOSE_TIME;
}

const requestedTime = document.querySelector("#requestedTime");
const timeMessage = document.querySelector("#timeMessage");

requestedTime.addEventListener("change", function () {

    if (isWithinTutoringHours(requestedTime.value)) {
        timeMessage.textContent = "Time is available.";
    } else {
        timeMessage.textContent =
            "Please select a time between 9:00 AM and 4:45 PM in 15-minute increments.";
    }

});
// BR-7: A request becomes Submitted only after validation passes
function getRequestStatus(formIsValid) {
    if (formIsValid) {
        return "Submitted";
    } else {
        return "Validation Failed";
    }
}

const form = document.querySelector("form");
const requestStatus = document.querySelector("#requestStatus");

form.addEventListener("submit", function (event) {

    event.preventDefault();

    const timeIsValid =
        isWithinTutoringHours(requestedTime.value);

    if (!timeIsValid) {

        timeMessage.textContent =
            "Please select a time between 9:00 AM and 4:45 PM in 15-minute increments.";

        requestStatus.textContent =
            "Request status: Validation Failed";

        return;
    }

    const status = getRequestStatus(timeIsValid);

    requestStatus.textContent =
        "Request status: " + status;
});