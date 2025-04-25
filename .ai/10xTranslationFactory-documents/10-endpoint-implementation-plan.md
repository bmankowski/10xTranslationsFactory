# API Endpoint Implementation Plan: Create Text with Questions

## 1. Endpoint Overview
This endpoint allows an authenticated user to create a new learning text along with the automatic generation of associated questions. The primary objectives are to validate the incoming data, persist the text in the database, trigger question generation (using AI services if applicable), and return both the created text and the generated questions as part of the response.

## 2. Request Details
- **HTTP Method:** POST
- **URL Pattern:** /api/texts
- **Parameters:**
  - **Required (in JSON body):**
    - `language_id` (UUID): Identifier for the language.
    - `proficiency_level_id` (UUID): Identifier for the proficiency level.
    - `topic` (string): Topic for the text.
    - `visibility` (enum: 'public' | 'private'): Visibility setting of the text.
  - **Optional:** None
- **Request Body Example:**
  ```json
  {
    "language_id": "uuid",
    "proficiency_level_id": "uuid",
    "topic": "Introduction to Grammar",
    "visibility": "public"
  }
  ```

## 3. Used Types
- **Command Model:** `CreateTextCommand`
- **DTOs:**
  - `TextDTO` for representing the text entity
  - `QuestionDTO` for each generated question
  - `CreateTextResponseDTO` for the aggregated response

## 4. Response Details
- **Success Status:** 201 Created
- **Response Body Example:**
  ```json
  {
    "text": { /* Detailed TextDTO object */ },
    "questions": [
      { /* QuestionDTO object */ },
      { /* QuestionDTO object */ }
    ]
  }
  ```
- **Error Status Codes:**
  - 400 Bad Request: For invalid input data or schema validation errors.
  - 401 Unauthorized: If the request is made by an unauthenticated user.
  - 500 Internal Server Error: For unforeseen errors such as failures in question generation or database issues.

## 5. Data Flow
1. **Request Reception:** The API handler receives the POST request at `/api/texts`.
2. **Authentication and Authorization:** Validate the JWT token and enforce RLS policies to ensure that only authenticated users can create a text.
3. **Input Validation:** Validate the request body against the `CreateTextCommand` schema. Ensure that required fields are provided and conform to expected data types.
4. **Database Transaction:** Open a database transaction to insert a new record into the `texts` table using the provided parameters.
5. **Question Generation:** Trigger an external AI service or existing business logic to generate associated questions. These questions are then inserted into the `questions` table with a reference to the newly created text's ID.
6. **Response Composition:** Construct a response using the `CreateTextResponseDTO` containing the newly created `TextDTO` and an array of `QuestionDTO` objects.
7. **Transaction Completion:** Commit the transaction and send the response back to the client.

## 6. Security Considerations
- **Authentication:** Ensure that the endpoint is accessible only to authenticated users via Supabase Auth/JWT.
- **Authorization:** Enforce row-level security on the `texts` and `questions` tables so that users can only create or modify their own records.
- **Input Sanitization:** Validate and sanitize input, particularly textual fields, to prevent injection attacks or malformed data.
- **Data Integrity:** Use database constraints and FK relationships to maintain consistency between texts and questions.
- **Sensitive Data Exposure:** Avoid exposing internal IDs or sensitive error information in the API responses.

## 7. Error Handling
- **400 Bad Request:** Return when input validation fails (e.g., missing required fields, invalid UUIDs).
- **401 Unauthorized:** Return if the JWT is missing or invalid, preventing unauthorized access.
- **500 Internal Server Error:** Catch any exceptions during database operations or AI service calls and return a generic error message. Log detailed error information in an error logging system or database error table for further analysis.

## 8. Performance Considerations
- **Database Transactions:** Use transactions to ensure atomicity between creating the text and associated questions.
- **AI Service Latency:** Consider asynchronous processing or timeouts for the AI-powered question generation to prevent long delays.
- **Connection Pooling:** Utilize connection pooling to handle concurrent database requests efficiently.
- **Caching:** If applicable, cache frequently used lookup data (e.g., language details) to reduce database load.

## 9. Implementation Steps
1. **Route Definition:** Define the route handler for POST `/api/texts` in your Astro backend or preferred framework.
2. **Authentication Middleware:** Ensure the endpoint has middleware for JWT validation and user extraction.
3. **Request Parsing:** Parse and validate the incoming JSON body against the `CreateTextCommand` type.
4. **Database Operation:** Start a database transaction.
   - Insert a new record into the `texts` table.
   - Capture the generated text ID.
5. **Question Generation:**
   - Call the AI service or internal logic to generate questions based on the text.
   - Insert each generated question into the `questions` table with a reference to the text ID.
6. **Response Construction:** Create an object conforming to `CreateTextResponseDTO` with the created text and questions.
7. **Transaction Commit:** Ensure the database transaction commits successfully; rollback in case of errors.
8. **Error Handling:** Implement try-catch blocks to capture and log errors. Return appropriate error responses with status codes 400, 401, or 500 as needed.
9. **Logging:** Integrate systematic logging of errors and significant events, possibly writing to an error table in the database for later review.
10. **Testing and Validation:** Write unit and integration tests to verify the endpoint behavior under normal conditions and error scenarios.
11. **Code Review & Documentation:** Ensure that the implementation follows the coding standards outlined in the implementation rules and document the endpoint for future maintenance. 