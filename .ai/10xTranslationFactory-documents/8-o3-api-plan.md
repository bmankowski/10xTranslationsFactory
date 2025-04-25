# REST API Plan

## 1. Resources

- **Users**: Maps to the `users` table. Represents the platform's users with fields such as id, email, full_name, is_admin, and timestamps.
- **Languages**: Maps to the `languages` table. Represents the languages available on the platform (e.g., English, Spanish) along with their active status and metadata.
- **ProficiencyLevels**: Maps to the `proficiency_levels` table. Represents language proficiency levels such as beginner, intermediate, and advanced.
- **Texts**: Maps to the `texts` table. Represents generated learning texts created by users. Includes metadata such as title, content, language, proficiency level, topic, visibility, word_count, and soft deletion status.
- **Questions**: Maps to the `questions` table. Represents questions automatically generated for each text.
- **UserResponses (Responses)**: Maps to the `user_responses` table. Stores users' answers to questions, including assessment data and feedback.
- **UserPreferences**: Maps to the `user_preferences` table. Represents the user settings like primary and UI language preferences.
- **UserLearningLanguages**: Maps to the `user_learning_languages` table. Represents the relationship between users and the languages they are learning.
- **UserStatistics**: Maps to the `user_statistics` table. Represents aggregated performance metrics for users such as total attempts, correct answers, and last activity date.

## 2. Endpoints

### General Considerations

- **Pagination, Filtering, Sorting**: List endpoints (e.g., listing texts, languages) should support pagination (limit/offset), filtering by relevant fields (language, proficiency level, visibility), and sorting where applicable.
- **HTTP Methods**: Use GET for retrieval, POST for creation, PATCH/PUT for updates, and DELETE for soft-deletion or removal.
- **Content-Type**: JSON will be used for both request and response payloads.

### 2.1 Users

#### 2.1.1 Get Current User
- **Method**: GET
- **URL**: `/api/users/me`
- **Description**: Retrieves the currently authenticated user's profile.
- **Response JSON**:
  ```json
  {
    "id": "uuid",
    "email": "string",
    "full_name": "string",
    "is_admin": "boolean",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
  ```
- **Success Code**: 200 OK
- **Error Codes**: 401 Unauthorized

#### 2.1.2 Update Current User
- **Method**: PATCH
- **URL**: `/api/users/me`
- **Description**: Updates profile information (e.g., full_name).
- **Request JSON**:
  ```json
  { "full_name": "string" }
  ```
- **Response JSON**:
  ```json
  {
    "id": "uuid",
    "email": "string",
    "full_name": "string",
    "is_admin": "boolean",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
  ```
- **Success Code**: 200 OK
- **Error Codes**: 400 Bad Request, 401 Unauthorized

### 2.2 User Preferences

#### 2.2.1 Get User Preferences
- **Method**: GET
- **URL**: `/api/users/me/preferences`
- **Description**: Retrieves the current user's preference settings.
- **Response JSON**:
  ```json
  {
    "user_id": "uuid",
    "primary_language_id": "uuid",
    "ui_language_id": "uuid",
    "primary_language": { "code": "string", "name": "string" },
    "ui_language": { "code": "string", "name": "string" },
    "updated_at": "timestamp"
  }
  ```
- **Success Code**: 200 OK
- **Error Codes**: 401 Unauthorized, 404 Not Found

#### 2.2.2 Create/Update User Preferences
- **Method**: PUT
- **URL**: `/api/users/me/preferences`
- **Description**: Creates or updates the user's preference settings.
- **Request JSON**:
  ```json
  {
    "primary_language_id": "uuid",
    "ui_language_id": "uuid"
  }
  ```
- **Response JSON**:
  ```json
  {
    "user_id": "uuid",
    "primary_language_id": "uuid",
    "ui_language_id": "uuid",
    "updated_at": "timestamp"
  }
  ```
- **Success Code**: 200 OK
- **Error Codes**: 400 Bad Request, 401 Unauthorized

### 2.3 User Learning Languages

#### 2.3.1 Get User Learning Languages
- **Method**: GET
- **URL**: `/api/users/me/learning-languages`
- **Description**: Retrieves the languages the user is learning.
- **Response JSON**:
  ```json
  {
    "items": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "language_id": "uuid",
        "language": { "code": "string", "name": "string" },
        "created_at": "timestamp"
      }
    ]
  }
  ```
- **Success Code**: 200 OK
- **Error Codes**: 401 Unauthorized

#### 2.3.2 Add Learning Language
- **Method**: POST
- **URL**: `/api/users/me/learning-languages`
- **Description**: Adds a language to the user's learning list.
- **Request JSON**:
  ```json
  { "language_id": "uuid" }
  ```
- **Response JSON**:
  ```json
  {
    "id": "uuid",
    "user_id": "uuid",
    "language_id": "uuid",
    "created_at": "timestamp"
  }
  ```
- **Success Code**: 201 Created
- **Error Codes**: 400 Bad Request, 401 Unauthorized, 409 Conflict

#### 2.3.3 Remove Learning Language
- **Method**: DELETE
- **URL**: `/api/users/me/learning-languages/{languageId}`
- **Description**: Removes a language from the learning list.
- **Success Code**: 204 No Content
- **Error Codes**: 401 Unauthorized, 404 Not Found

### 2.4 Languages

#### 2.4.1 Get Languages
- **Method**: GET
- **URL**: `/api/languages`
- **Description**: Retrieves all available languages. Supports filtering by active status.
- **Query Parameters**: `is_active` (boolean)
- **Response JSON**:
  ```json
  {
    "items": [
      {
        "id": "uuid",
        "code": "string",
        "name": "string",
        "is_active": "boolean",
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
    ]
  }
  ```
- **Success Code**: 200 OK
- **Error Codes**: 401 Unauthorized (if applicable)

### 2.5 Proficiency Levels

#### 2.5.1 Get Proficiency Levels
- **Method**: GET
- **URL**: `/api/proficiency-levels`
- **Description**: Retrieves all proficiency levels available.
- **Response JSON**:
  ```json
  {
    "items": [
      {
        "id": "uuid",
        "name": "string",
        "display_order": "integer",
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
    ]
  }
  ```
- **Success Code**: 200 OK
- **Error Codes**: 401 Unauthorized (if applicable)

### 2.6 Texts

#### 2.6.1 Create Text with Questions
- **Method**: POST
- **URL**: `/api/texts`
- **Description**: Generates a new learning text along with 4 auto-generated questions based on user inputs (topic, language, proficiency level, visibility).
- **Request JSON**:
  ```json
  {
    "language_id": "uuid",
    "proficiency_level_id": "uuid",
    "topic": "string",
    "visibility": "public|private"
  }
  ```
- **Response JSON**:
  ```json
  {
    "text": {
      "id": "uuid",
      "title": "string",
      "content": "string",
      "language_id": "uuid",
      "proficiency_level_id": "uuid",
      "topic": "string",
      "visibility": "public|private",
      "word_count": "integer",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    },
    "questions": [
      {
        "id": "uuid",
        "text_id": "uuid",
        "content": "string",
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
    ]
  }
  ```
- **Success Code**: 201 Created
- **Error Codes**: 400 Bad Request, 401 Unauthorized, 500 Internal Server Error

#### 2.6.2 Get Texts (List)
- **Method**: GET
- **URL**: `/api/texts`
- **Description**: Retrieves a list of texts with optional filters.
- **Query Parameters**: 
  - `language_id` (uuid)
  - `proficiency_level_id` (uuid)
  - `visibility` (public|private|all)
  - `user_id` (uuid)
  - `limit` (integer)
  - `offset` (integer)
- **Response JSON**:
  ```json
  {
    "items": [
      {
        "id": "uuid",
        "title": "string",
        "content": "string",
        "language_id": "uuid",
        "language": { "code": "string", "name": "string" },
        "proficiency_level_id": "uuid",
        "proficiency_level": { "name": "string", "display_order": "integer" },
        "topic": "string",
        "visibility": "public|private",
        "word_count": "integer",
        "user_id": "uuid",
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
    ],
    "total": "integer",
    "limit": "integer",
    "offset": "integer"
  }
  ```
- **Success Code**: 200 OK
- **Error Codes**: 401 Unauthorized

#### 2.6.3 Get Text by ID
- **Method**: GET
- **URL**: `/api/texts/{textId}`
- **Description**: Retrieves details for a specific text.
- **Response JSON**:
  ```json
  {
    "id": "uuid",
    "title": "string",
    "content": "string",
    "language_id": "uuid",
    "language": { "code": "string", "name": "string" },
    "proficiency_level_id": "uuid",
    "proficiency_level": { "name": "string", "display_order": "integer" },
    "topic": "string",
    "visibility": "public|private",
    "word_count": "integer",
    "user_id": "uuid",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
  ```
- **Success Code**: 200 OK
- **Error Codes**: 401 Unauthorized, 403 Forbidden, 404 Not Found

#### 2.6.4 Update Text Visibility
- **Method**: PATCH
- **URL**: `/api/texts/{textId}`
- **Description**: Updates the visibility of a text (public or private).
- **Request JSON**:
  ```json
  { "visibility": "public|private" }
  ```
- **Response JSON**:
  ```json
  { "id": "uuid", "visibility": "public|private", "updated_at": "timestamp" }
  ```
- **Success Code**: 200 OK
- **Error Codes**: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found

#### 2.6.5 Delete Text
- **Method**: DELETE
- **URL**: `/api/texts/{textId}`
- **Description**: Soft-deletes a text by setting its `is_deleted` flag to true.
- **Success Code**: 204 No Content
- **Error Codes**: 401 Unauthorized, 403 Forbidden, 404 Not Found

### 2.7 Questions

#### 2.7.1 Get Questions for a Text
- **Method**: GET
- **URL**: `/api/texts/{textId}/questions`
- **Description**: Retrieves all questions associated with a given text.
- **Response JSON**:
  ```json
  {
    "items": [
      {
        "id": "uuid",
        "text_id": "uuid",
        "content": "string",
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
    ]
  }
  ```
- **Success Code**: 200 OK
- **Error Codes**: 401 Unauthorized, 403 Forbidden, 404 Not Found

#### 2.7.2 Get Question by ID
- **Method**: GET
- **URL**: `/api/questions/{questionId}`
- **Description**: Retrieves details for a specific question.
- **Response JSON**:
  ```json
  {
    "id": "uuid",
    "text_id": "uuid",
    "content": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp",
    "text": {
      "id": "uuid",
      "title": "string",
      "content": "string",
      "language_id": "uuid",
      "language": { "code": "string", "name": "string" }
    }
  }
  ```
- **Success Code**: 200 OK
- **Error Codes**: 401 Unauthorized, 403 Forbidden, 404 Not Found

### 2.8 Responses

#### 2.8.1 Submit Response
- **Method**: POST
- **URL**: `/api/questions/{questionId}/responses`
- **Description**: Submits an answer to a specific question and triggers assessment.
- **Request JSON**:
  ```json
  { "response_text": "string", "response_time": "integer" }
  ```
- **Response JSON**:
  ```json
  {
    "id": "uuid",
    "user_id": "uuid",
    "question_id": "uuid",
    "response_text": "string",
    "is_correct": "boolean",
    "feedback": "string",
    "response_time": "integer",
    "created_at": "timestamp"
  }
  ```
- **Success Code**: 201 Created
- **Error Codes**: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found

#### 2.8.2 Get User Responses for a Question
- **Method**: GET
- **URL**: `/api/questions/{questionId}/responses`
- **Description**: Retrieves a list of responses provided by the user for a particular question.
- **Response JSON**:
  ```json
  {
    "items": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "question_id": "uuid",
        "response_text": "string",
        "is_correct": "boolean",
        "feedback": "string",
        "response_time": "integer",
        "created_at": "timestamp"
      }
    ]
  }
  ```
- **Success Code**: 200 OK
- **Error Codes**: 401 Unauthorized, 404 Not Found

### 2.9 User Statistics

#### 2.9.1 Get User Statistics
- **Method**: GET
- **URL**: `/api/users/me/statistics`
- **Description**: Retrieves learning statistics for the user. Supports filtering by language.
- **Query Parameters**: `language_id` (uuid)
- **Response JSON**:
  ```json
  {
    "items": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "language_id": "uuid",
        "language": { "code": "string", "name": "string" },
        "total_attempts": "integer",
        "correct_answers": "integer",
        "last_activity_date": "timestamp",
        "updated_at": "timestamp"
      }
    ]
  }
  ```
- **Success Code**: 200 OK
- **Error Codes**: 401 Unauthorized

## 3. Authentication and Authorization

### Authentication

- The application utilizes Supabase Auth for user registration, login (email/password and Google OAuth), password reset, and email verification.
- JSON Web Tokens (JWTs) are used for session management. The JWT is passed in the `Authorization` header for secured endpoints.

### Authorization

- **Database-Level**: PostgreSQL Row-Level Security (RLS) policies ensure that users can only access and modify their own records. This applies to resources such as texts (private vs. public), responses, and preferences.
- **API-Level**: Endpoints enforce ownership (e.g., only the creator of a text can update or delete it) and validate the visibility of resources. Admin endpoints (if any) are protected via role-based access control.

## 4. Validation and Business Logic

### Validation Rules (Per Resource)

- **Users**: Validate email format and uniqueness. Full name is optional.
- **Languages**: Ensure ISO 639-1 code validity; name must be unique and provided.
- **ProficiencyLevels**: Name is required and unique; display_order must be a positive integer.
- **Texts**: 
  - Topic is required.
  - `language_id` must reference an existing and active language.
  - `proficiency_level_id` must reference an existing level.
  - `visibility` must be either 'public' or 'private'.
  - `word_count` must be greater than zero (enforced by a CHECK constraint).
  - Soft deletion is implemented via the `is_deleted` flag.
- **Questions**: Content is required and must be linked to a non-deleted text.
- **UserResponses**: Response text is required; `is_correct` flag is mandatory; response time must be non-negative; ensure uniqueness per user/question/timestamp if applicable.
- **UserPreferences**: IDs must reference existing languages.
- **UserLearningLanguages**: Each language entry must be unique per user.
- **UserStatistics**: Updates occur automatically based on responses and must adhere to data integrity rules.

### Business Logic Mapping

1. **Text and Question Generation**:
   - When a user creates a text, the system integrates with an AI service (via OpenRouter.ai) to generate a 100-200 word text along with 4 related questions.
   - On failure of AI generation, return an error with a retry option.

2. **Response Assessment**:
   - User responses are evaluated (either via built-in logic or external AI assessment) and feedback is provided.
   - User statistics are updated accordingly based on each response.

3. **Resource Ownership and Visibility**:
   - Private texts are accessible only to their creator.
   - Public texts are available for all users.
   - Soft deletion ensures data consistency and referential integrity.

4. **Performance and Security Considerations**:
   - Database indexes (e.g., on language codes, user_id) aid performance for filtering and sorting.
   - Rate limiting, input sanitization, and proper HTTP status responses are implemented at the API layer.
   - Authentication and authorization mechanisms ensure that all data access is secure. 