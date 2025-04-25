# REST API Plan

## 1. Resources

- **Users**: Maps to `users` table - Represents users of the platform
- **Languages**: Maps to `languages` table - Represents available languages (English, Spanish)
- **ProficiencyLevels**: Maps to `proficiency_levels` table - Represents language proficiency levels
- **Texts**: Maps to `texts` table - Represents generated learning texts
- **Questions**: Maps to `questions` table - Represents questions generated for texts
- **Responses**: Maps to `user_responses` table - Represents user answers to questions
- **UserPreferences**: Maps to `user_preferences` table - Represents user settings
- **UserLearningLanguages**: Maps to `user_learning_languages` table - Represents languages a user is learning
- **UserStatistics**: Maps to `user_statistics` table - Represents performance metrics for users

## 2. Endpoints

### Authentication
Authentication will be handled by Supabase Auth API directly from the frontend.

### Users

#### Get Current User
- Method: GET
- Path: `/api/users/me`
- Description: Retrieves the currently authenticated user's profile
- Response Structure:
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
- Success Codes: 200 OK
- Error Codes: 401 Unauthorized

#### Update Current User
- Method: PATCH
- Path: `/api/users/me`
- Description: Updates the current user's profile information
- Request Structure:
  ```json
  {
    "full_name": "string"
  }
  ```
- Response Structure:
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
- Success Codes: 200 OK
- Error Codes: 400 Bad Request, 401 Unauthorized

### User Preferences

#### Get User Preferences
- Method: GET
- Path: `/api/users/me/preferences`
- Description: Retrieves the current user's preferences
- Response Structure:
  ```json
  {
    "user_id": "uuid",
    "primary_language_id": "uuid",
    "ui_language_id": "uuid",
    "primary_language": {
      "code": "string",
      "name": "string"
    },
    "ui_language": {
      "code": "string",
      "name": "string"
    },
    "updated_at": "timestamp"
  }
  ```
- Success Codes: 200 OK
- Error Codes: 401 Unauthorized, 404 Not Found

#### Create/Update User Preferences
- Method: PUT
- Path: `/api/users/me/preferences`
- Description: Creates or updates the current user's preferences
- Request Structure:
  ```json
  {
    "primary_language_id": "uuid",
    "ui_language_id": "uuid"
  }
  ```
- Response Structure:
  ```json
  {
    "user_id": "uuid",
    "primary_language_id": "uuid",
    "ui_language_id": "uuid",
    "updated_at": "timestamp"
  }
  ```
- Success Codes: 200 OK
- Error Codes: 400 Bad Request, 401 Unauthorized

### User Learning Languages

#### Get User Learning Languages
- Method: GET
- Path: `/api/users/me/learning-languages`
- Description: Retrieves languages the current user is learning
- Response Structure:
  ```json
  {
    "items": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "language_id": "uuid",
        "language": {
          "code": "string",
          "name": "string"
        },
        "created_at": "timestamp"
      }
    ]
  }
  ```
- Success Codes: 200 OK
- Error Codes: 401 Unauthorized

#### Add Learning Language
- Method: POST
- Path: `/api/users/me/learning-languages`
- Description: Adds a new language to the user's learning list
- Request Structure:
  ```json
  {
    "language_id": "uuid"
  }
  ```
- Response Structure:
  ```json
  {
    "id": "uuid",
    "user_id": "uuid",
    "language_id": "uuid",
    "created_at": "timestamp"
  }
  ```
- Success Codes: 201 Created
- Error Codes: 400 Bad Request, 401 Unauthorized, 409 Conflict (if language already added)

#### Remove Learning Language
- Method: DELETE
- Path: `/api/users/me/learning-languages/{languageId}`
- Description: Removes a language from the user's learning list
- Success Codes: 204 No Content
- Error Codes: 401 Unauthorized, 404 Not Found

### Languages

#### Get Languages
- Method: GET
- Path: `/api/languages`
- Description: Retrieves all available languages
- Query Parameters:
  - `is_active`: Filter by active status (boolean)
- Response Structure:
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
- Success Codes: 200 OK
- Error Codes: 401 Unauthorized (if required)

### Proficiency Levels

#### Get Proficiency Levels
- Method: GET
- Path: `/api/proficiency-levels`
- Description: Retrieves all available proficiency levels
- Response Structure:
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
- Success Codes: 200 OK
- Error Codes: 401 Unauthorized (if required)

### Texts

#### Create Text with Questions
- Method: POST
- Path: `/api/texts`
- Description: Generates a new text and associated questions based on user inputs
- Request Structure:
  ```json
  {
    "language_id": "uuid",
    "proficiency_level_id": "uuid",
    "topic": "string",
    "visibility": "public|private"
  }
  ```
- Response Structure:
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
- Success Codes: 201 Created
- Error Codes: 400 Bad Request, 401 Unauthorized, 500 Internal Server Error (for AI generation failures)

#### Get Texts
- Method: GET
- Path: `/api/texts`
- Description: Retrieves a list of texts based on filters
- Query Parameters:
  - `language_id`: Filter by language ID (uuid)
  - `proficiency_level_id`: Filter by proficiency level ID (uuid)
  - `visibility`: Filter by visibility (public|private|all)
  - `user_id`: Filter by user ID (uuid)
  - `limit`: Limit number of results (integer)
  - `offset`: Offset for pagination (integer)
- Response Structure:
  ```json
  {
    "items": [
      {
        "id": "uuid",
        "title": "string",
        "content": "string",
        "language_id": "uuid",
        "language": {
          "code": "string",
          "name": "string"
        },
        "proficiency_level_id": "uuid",
        "proficiency_level": {
          "name": "string",
          "display_order": "integer"
        },
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
- Success Codes: 200 OK
- Error Codes: 401 Unauthorized

#### Get Text by ID
- Method: GET
- Path: `/api/texts/{textId}`
- Description: Retrieves a specific text by ID
- Response Structure:
  ```json
  {
    "id": "uuid",
    "title": "string",
    "content": "string",
    "language_id": "uuid",
    "language": {
      "code": "string",
      "name": "string"
    },
    "proficiency_level_id": "uuid",
    "proficiency_level": {
      "name": "string",
      "display_order": "integer"
    },
    "topic": "string",
    "visibility": "public|private",
    "word_count": "integer",
    "user_id": "uuid",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
  ```
- Success Codes: 200 OK
- Error Codes: 401 Unauthorized, 403 Forbidden (if private text from another user), 404 Not Found

#### Update Text Visibility
- Method: PATCH
- Path: `/api/texts/{textId}`
- Description: Updates a text's visibility
- Request Structure:
  ```json
  {
    "visibility": "public|private"
  }
  ```
- Response Structure:
  ```json
  {
    "id": "uuid",
    "visibility": "public|private",
    "updated_at": "timestamp"
  }
  ```
- Success Codes: 200 OK
- Error Codes: 400 Bad Request, 401 Unauthorized, 403 Forbidden (if not the owner), 404 Not Found

#### Delete Text
- Method: DELETE
- Path: `/api/texts/{textId}`
- Description: Soft-deletes a text (sets is_deleted to true)
- Success Codes: 204 No Content
- Error Codes: 401 Unauthorized, 403 Forbidden (if not the owner), 404 Not Found

### Questions

#### Get Questions for Text
- Method: GET
- Path: `/api/texts/{textId}/questions`
- Description: Retrieves all questions for a specific text
- Response Structure:
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
- Success Codes: 200 OK
- Error Codes: 401 Unauthorized, 403 Forbidden (if private text from another user), 404 Not Found

#### Get Question by ID
- Method: GET
- Path: `/api/questions/{questionId}`
- Description: Retrieves a specific question by ID
- Response Structure:
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
      "language": {
        "code": "string",
        "name": "string" 
      }
    }
  }
  ```
- Success Codes: 200 OK
- Error Codes: 401 Unauthorized, 403 Forbidden (if associated with private text from another user), 404 Not Found

### Responses

#### Submit Response
- Method: POST
- Path: `/api/questions/{questionId}/responses`
- Description: Submits an answer to a question and receives assessment
- Request Structure:
  ```json
  {
    "response_text": "string",
    "response_time": "integer" 
  }
  ```
- Response Structure:
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
- Success Codes: 201 Created
- Error Codes: 400 Bad Request, 401 Unauthorized, 403 Forbidden (if question associated with private text from another user), 404 Not Found

#### Get User Responses for a Question
- Method: GET
- Path: `/api/questions/{questionId}/responses`
- Description: Retrieves a user's responses to a specific question
- Response Structure:
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
- Success Codes: 200 OK
- Error Codes: 401 Unauthorized, 404 Not Found

### User Statistics

#### Get User Statistics
- Method: GET
- Path: `/api/users/me/statistics`
- Description: Retrieves learning statistics for the current user
- Query Parameters:
  - `language_id`: Filter by language ID (uuid)
- Response Structure:
  ```json
  {
    "items": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "language_id": "uuid",
        "language": {
          "code": "string",
          "name": "string"
        },
        "total_attempts": "integer",
        "correct_answers": "integer", 
        "last_activity_date": "timestamp",
        "updated_at": "timestamp"
      }
    ]
  }
  ```
- Success Codes: 200 OK
- Error Codes: 401 Unauthorized

## 3. Authentication and Authorization

### Authentication

Authentication will leverage the built-in Supabase Auth system that provides:

- Email/password signup and login
- Google OAuth integration
- Password reset functionality
- Email verification
- JWT tokens for session management
- Secure credential storage

The frontend will interact directly with Supabase Auth API. For the REST API endpoints, the JWTs will be verified on the server side through the Supabase middleware. Every API request (except public endpoints) will require a valid JWT in the Authorization header.

### Authorization

Authorization will be implemented through:

1. **Row-Level Security (RLS) Policies**: Leveraging PostgreSQL's RLS as defined in the database schema:
   - Users can only modify their own data
   - Public texts are readable by anyone
   - Private texts are only accessible by their creators
   - Reference data (languages, proficiency levels) is readable by all

2. **API-Level Authorization**:
   - Request validation to ensure users can only access/modify resources they own
   - Visibility checks for texts and related resources (questions, responses)
   - Admin-only endpoints protected with role-based access control

## 4. Validation and Business Logic

### Validation Rules

#### Users
- Email must be valid and unique
- Full name is optional

#### Languages
- Code must be a valid ISO 639-1 code
- Name must be unique
- Codes and names are required

#### Proficiency Levels
- Name must be unique and required
- Display order must be a positive integer

#### Texts
- Topic is required
- Language ID must reference an existing active language
- Proficiency level ID must reference an existing proficiency level
- Visibility must be either 'public' or 'private'
- Word count must be positive
- Soft deletion implemented via is_deleted flag

#### Questions
- Content is required
- Must be associated with a non-deleted text

#### User Responses
- Response text is required
- Is_correct flag is required
- Response time must be non-negative if provided
- Must be unique for user/question/timestamp combination

#### User Preferences
- Primary and UI language IDs must reference existing languages

#### User Learning Languages
- Language ID must reference an existing language
- Must be unique per user/language combination

### Business Logic Implementation

1. **Text and Question Generation**:
   - AI integration through OpenRouter.ai when creating a text
   - Generate 4 questions per text
   - Store generated content with appropriate metadata
   - Handle AI service failures gracefully

2. **Response Assessment**:
   - Evaluate answers using AI model
   - Generate helpful feedback for incorrect answers
   - Update user statistics when responses are processed

3. **Text Management**:
   - Implement soft deletion to maintain referential integrity
   - Enforce visibility permissions
   - Validate inputs against database constraints

4. **User Statistics**:
   - Update statistics automatically when new responses are submitted
   - Track total attempts and correct answers
   - Update last activity date

5. **Error Handling**:
   - Provide clear error messages localized to user's preferred language
   - Implement proper HTTP status codes for different error scenarios
   - Handle external service failures gracefully 