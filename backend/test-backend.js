// Week 8 - backend tests for CougarTutor+
// run with: node backend/test-backend.js

const { processTutoringRequest } = require("./backend.js");

// each test has a sample request + what we expect the backend to return
const tests = [

    // valid cases
    {
        name: "Valid - 10:00 AM",
        transaction: { requestedTime: "10:00" },
        expected: { valid: true, status: "Submitted" }
    },
    {
        name: "Valid - 2:30 PM",
        transaction: { requestedTime: "14:30" },
        expected: { valid: true, status: "Submitted" }
    },

    // invalid cases
    {
        name: "Invalid - 8:00 AM (before tutoring hours)",
        transaction: { requestedTime: "08:00" },
        expected: { valid: false, status: "Validation Failed" }
    },
    {
        name: "Invalid - 7:00 PM (after tutoring hours)",
        transaction: { requestedTime: "19:00" },
        expected: { valid: false, status: "Validation Failed" }
    },
    {
        name: "Invalid - 10:10 AM (not a 15 min increment)",
        transaction: { requestedTime: "10:10" },
        expected: { valid: false, status: "Validation Failed" }
    },
    {
    name: "Invalid - incomplete time format",
    transaction: { requestedTime: "10:" },
    expected: { valid: false, status: "Validation Failed" }
    },
    {
        name: "Invalid - no transaction sent",
        transaction: null,
        expected: { valid: false, status: "Validation Failed" }
    },
    {
        name: "Invalid - requested time is missing",
        transaction: {},
        expected: { valid: false, status: "Validation Failed" }
    },

    // boundary / edge cases
    {
        name: "Boundary - 9:00 AM (opening time)",
        transaction: { requestedTime: "09:00" },
        expected: { valid: true, status: "Submitted" }
    },
    {
        name: "Boundary - 4:45 PM (latest start time available)",
        transaction: { requestedTime: "16:45" },
        expected: { valid: true, status: "Submitted" }
    },
    {
        name: "Boundary - 5:00 PM (closing time)",
        transaction: { requestedTime: "17:00" },
        expected: { valid: false, status: "Validation Failed" }
    },
    {
        name: "Edge - 4:59 PM (in hours but not a 15 min increment)",
        transaction: { requestedTime: "16:59" },
        expected: { valid: false, status: "Validation Failed" }
    }
];

let passed = 0;

for (const test of tests) {
    const result = processTutoringRequest(test.transaction);

    const didPass =
        result.valid === test.expected.valid &&
        result.status === test.expected.status;

    if (didPass) {
        passed++;
    }

    console.log("\n--- " + test.name + " ---");
    console.log("Expected:", test.expected.valid, "/", test.expected.status);
    console.log("Actual:  ", result.valid, "/", result.status);
    console.log("Message: ", result.message);
    console.log(didPass ? "PASS" : "FAIL");
}

console.log("\n" + passed + "/" + tests.length + " tests passed");