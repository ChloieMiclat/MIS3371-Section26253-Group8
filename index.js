// Week 10 - Lambda handler for CougarTutor+
// Takes the API Gateway request, sends the data to our existing backend,
// and sends back the result as an HTTP response.
// All business rules stay in backend/backend.js.

const { processTutoringRequest } = require("./backend/backend.js");

function sendResponse(statusCode, body) {
    return {
        statusCode: statusCode,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    };
}

exports.handler = async (event) => {
    let transaction;

    // Turn the JSON text from the request into an object
    try {
        const rawBody = event.isBase64Encoded
            ? Buffer.from(event.body || "", "base64").toString("utf8")
            : event.body;
        transaction = JSON.parse(rawBody || "null");
    } catch (error) {
        return sendResponse(400, {
            success: false,
            valid: false,
            status: "Validation Failed",
            message: "Request body must be valid JSON.",
            persisted: false
        });
    }

    // Use the same backend logic from Week 8
    const result = processTutoringRequest(transaction);

    // 200 if the request passed validation, 400 if it was rejected
    return sendResponse(result.valid ? 200 : 400, {
        success: result.valid,
        valid: result.valid,
        status: result.status,
        message: result.message,
        persisted: false
    });
};
