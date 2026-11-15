// Milestone 4 - Lambda handler for CougarTutor+
// POST /tutoring-requests              -> validate, apply business rules, save to DynamoDB, return a confirmation number
// GET  /tutoring-requests/{requestId}  -> look up a saved request in DynamoDB
// All validation and business rules stay in backend/backend.js (unchanged from Week 10).

const crypto = require("crypto");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { processTutoringRequest } = require("./backend/backend.js");

// Table name comes from the Lambda environment variable TABLE_NAME
const TABLE_NAME = process.env.TABLE_NAME || "TutoringRequests";

// One shared database connection (DocumentClient lets us use plain JavaScript objects)
const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// Confirmation numbers look like CT-20261115-7F3A9C
const REQUEST_ID_PATTERN = /^CT-\d{8}-[0-9A-F]{6}$/;

// What we store about every accepted request
const SAVED_STATUS = "Pending Confirmation";
const SAVED_OUTCOME = "Accepted - passed all validation and business rules";

// ---------- Helpers ----------

function sendResponse(statusCode, body) {
    return {
        statusCode: statusCode,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    };
}

// Today's date in Houston time as YYYYMMDD (used inside the confirmation number)
function getHoustonDateStamp() {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Chicago",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(new Date()).replace(/-/g, "");
}

// Creates a confirmation number: CT- + date + 6 random hex characters
function generateRequestId() {
    const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase();
    return "CT-" + getHoustonDateStamp() + "-" + randomPart;
}

// ---------- POST: submit a tutoring request ----------

async function handleSubmit(event) {
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

    // Same validation and business rules as Week 10
    const result = processTutoringRequest(transaction);

    // Invalid requests are rejected and NEVER saved
    if (!result.valid) {
        return sendResponse(400, {
            success: false,
            valid: false,
            status: result.status,
            message: result.message,
            persisted: false
        });
    }

    // Build the record we save (only the known form fields, cleaned up)
    const requestId = generateRequestId();
    const submittedAt = new Date().toISOString();
    const item = {
        requestId: requestId,
        studentId: String(transaction.studentId).trim(),
        studentEmail: String(transaction.studentEmail).trim(),
        subject: String(transaction.subject).trim(),
        topicDescription: String(transaction.topicDescription).trim(),
        requestedDate: String(transaction.requestedDate).trim(),
        requestedTime: String(transaction.requestedTime).trim(),
        requestedDuration: String(transaction.requestedDuration).trim(),
        format: String(transaction.format).trim(),
        status: SAVED_STATUS,
        processingOutcome: SAVED_OUTCOME,
        submittedAt: submittedAt
    };

    // Save to DynamoDB. The condition stops a duplicate ID from overwriting a record.
    try {
        await db.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: item,
            ConditionExpression: "attribute_not_exists(requestId)"
        }));
    } catch (error) {
        console.error("DynamoDB save failed:", error);
        return sendResponse(500, {
            success: false,
            valid: true,
            status: "Error",
            message: "We could not save your request right now. Please try again later.",
            persisted: false
        });
    }

    // Only AFTER a successful save do we return the confirmation number
    return sendResponse(200, {
        success: true,
        valid: true,
        status: result.status,
        message: result.message,
        persisted: true,
        requestId: requestId,
        submittedAt: submittedAt
    });
}

// ---------- GET: look up a saved request ----------

async function handleLookup(event) {
    const rawId = (event.pathParameters && event.pathParameters.requestId) || "";
    const requestId = decodeURIComponent(rawId).trim().toUpperCase();

    // Check the format before touching the database
    if (!REQUEST_ID_PATTERN.test(requestId)) {
        return sendResponse(400, {
            success: false,
            status: "Invalid",
            message: "Please enter a valid confirmation number (for example, CT-20261115-7F3A9C)."
        });
    }

    let saved;
    try {
        const response = await db.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: { requestId: requestId }
        }));
        saved = response.Item;
    } catch (error) {
        console.error("DynamoDB lookup failed:", error);
        return sendResponse(500, {
            success: false,
            status: "Error",
            message: "We could not look up your request right now. Please try again later."
        });
    }

    if (!saved) {
        return sendResponse(404, {
            success: false,
            status: "Not Found",
            message: "No tutoring request was found for that confirmation number."
        });
    }

    // Send back the saved details (student ID and email are left out for privacy)
    return sendResponse(200, {
        success: true,
        request: {
            requestId: saved.requestId,
            status: saved.status,
            processingOutcome: saved.processingOutcome,
            submittedAt: saved.submittedAt,
            subject: saved.subject,
            topicDescription: saved.topicDescription,
            requestedDate: saved.requestedDate,
            requestedTime: saved.requestedTime,
            requestedDuration: saved.requestedDuration,
            format: saved.format
        }
    });
}

// ---------- Entry point: API Gateway calls this ----------

exports.handler = async (event) => {
    const method = (event.requestContext && event.requestContext.http && event.requestContext.http.method) || "POST";

    if (method === "GET") {
        return handleLookup(event);
    }

    if (method === "POST") {
        return handleSubmit(event);
    }

    return sendResponse(405, {
        success: false,
        status: "Error",
        message: "This method is not supported."
    });
};
