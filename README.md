# MIS3371 Capstone Project: CougarTutor+ Tutoring Appointment Booking System

## I. Project Overview

<u>**Scenario:**</u>

**CougarTutor+** is a tutoring appointment booking system designed to improve the process of connecting students seeking academic assistance with available tutors. The system provides a centralized platform for organizing tutoring requests and appointment management, replacing informal coordination methods such as emails, sign-up sheets, and word-of-mouth communication.

<u>**Project Purpose:**</u>

The purpose of **CougarTutor+** is to create a more organized, efficient, and transparent process for managing tutoring appointment requests. The system provides a structured approach for students to request tutoring support and for tutoring activities to be coordinated through a centralized platform.

<u>**Project Focus**</u>

The project focuses on improving the tutoring appointment request process by providing a reliable system for submitting, managing, and tracking tutoring requests.

## II. Repository Structure

The repository is organized into the following sections to document the project development process, design artifacts, implementation files, testing, and AWS cloud deployment.

| Folder / File | Description |
|---|---|
| [AWS Deployment](./AWS%20Deployment) | Contains the AWS cloud deployment documentation, including the API contract ([API.md](./AWS%20Deployment/API.md)) that defines the POST and GET routes, request fields, validation messages, and DynamoDB table used by the application. |
| [Client Interface Development](./Client%20Interface%20Development) | Contains the CougarTutor+ frontend (HTML, CSS, and JavaScript) hosted on AWS Amplify, including the tutoring request form, the confirmation number display, and the Check Request Status section. |
| [Design & Planning](./Design%20%26%20Planning/) | Contains system design documents including workflow diagrams, state transition diagrams, data dictionary, architecture diagrams, and responsibility notes. |
| [In-Class Practice](./In-Class%20Practice) | Contains practice activities and exercises completed during class sessions. |
| [Milestone Documents](./Milestone%20Documents) | Contains project milestone deliverables, including requirements, user stories, business rules, and team documentation. |
| [Validation & Test Cases](./Validation%20%26%20Test%20Cases) | Contains the test case documents for form validation, backend testing, AWS deployment, and the final test matrix used to verify the application. |
| [backend](./backend) | Contains the backend business logic (`backend.js`) that validates each tutoring request and enforces the business rules, along with its test file. |
| [index.js](./index.js) | The AWS Lambda handler. It receives requests from API Gateway, runs the validation in `backend/backend.js`, saves valid requests to DynamoDB with a confirmation number (POST), and retrieves saved requests by confirmation number (GET). |

**Live application:** [https://main.dz3mjcsko6gno.amplifyapp.com/](https://main.dz3mjcsko6gno.amplifyapp.com/)

**Architecture:** Frontend (AWS Amplify) → Amazon API Gateway → AWS Lambda → Backend business logic → Amazon DynamoDB → Response to frontend

## III. Milestone Documents

- [01 - Business Problem + Scope](./Milestone%20Documents/01%20-%20Business%20Problem%20%2B%20Scope.docx)
- [02 - Stakeholders](./Milestone%20Documents/02%20-%20Stakeholders.docx)
- [03 - Main Transaction](./Milestone%20Documents/03%20-%20Main%20Transaction.docx)
- [04 - Functional Requirements](./Milestone%20Documents/04%20-%20Functional%20Requirements.docx)
- [05 - User Stories + Acceptance Criteria](./Milestone%20Documents/05%20-%20User%20Stories%20%2B%20Acceptance%20Criteria.docx)
- [06 - Business Rules](./Milestone%20Documents/06%20-%20Business%20Rules.docx)
- [07 - Team Charter](./Milestone%20Documents/07%20-%20Team%20Charter.docx)


## IV. Team Members

- Cordy Hoang
- Chloie Miclat
- Jessica Ngo
- Catherine Nguyen
- Tina Thay
