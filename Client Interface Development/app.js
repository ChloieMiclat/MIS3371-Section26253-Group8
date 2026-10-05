// Tutoring hours (change these if the group picks different hours)
const OPEN_TIME = "09:00";
const CLOSE_TIME = "17:00";

// Checks if the requested time is during tutoring hours
function isWithinTutoringHours(time) {
  return time >= OPEN_TIME && time < CLOSE_TIME;
}