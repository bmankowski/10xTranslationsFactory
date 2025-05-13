# View Implementation Plan: Exercise Chat Page

## 1. Overview
The Exercise Chat Page provides an interactive interface for language learners to engage with AI-generated texts and questions. Users read a text and then answer a series of questions one by one, receiving immediate feedback on their responses. The view is designed as a chat dialogue, presenting AI questions, user answers, and system feedback in a sequential manner. Its primary purpose is to facilitate focused language comprehension practice.

## 2. View Routing
The Exercise Chat Page will be accessible at the following path:
`/exercises/{text-id}/attempt`
Where `{text-id}` is the unique identifier of the exercise text being attempted.

## 3. Component Structure
The view will be composed of the following main components in a hierarchical structure:

```
ExerciseChatPage (Astro Page, hosting React island)
  └── ExerciseChatIsland (React Root Component for the dynamic chat)
      ├── ExerciseTextView (Displays TextDTO.content) [React]
      └── ChatInterface [React]
          ├── ChatMessageList [React]
          │   └── ChatBubble (repeated for each message) [React]
          │       ├── (Content: Question, User's answer, Feedback)
          │       └── LoadingSkeleton (for pending AI question if applicable)
          ├── ChatInputArea [React]
          │   ├── TextInput (Shadcn Input)
          │   └── SubmitButton (Shadcn Button)
          └── NextButton (Shadcn Button, to go to next question) [React]
```

## 4. Component Details

### `ExerciseChatIsland` (React Root)
- **Component description**: The main React component that orchestrates the chat view. It fetches the exercise data (text and questions) based on `text-id` from the URL, manages the overall state of the chat (current question, chat history, loading/error states), and handles user interactions like answer submission and progressing to the next question.
- **Main elements**: Contains `ExerciseTextView` and `ChatInterface`.
- **Supported interactions**: Initial data loading.
- **Supported validation**: None directly, but manages components that perform validation.
- **Types**: Uses `TextDTO`, `QuestionDTO[]`, `ChatMessageVM[]` (see Section 5).
- **Props**: `textId: string` (passed from Astro page based on URL parameter).

### `ExerciseTextView` (React)
- **Component description**: Displays the main content of the exercise text.
- **Main elements**: Renders the `content` field of the `TextDTO`. Typically a `div` or `article` containing paragraphs of text.
- **Supported interactions**: None.
- **Supported validation**: None.
- **Types**: `TextDTO`.
- **Props**: `text: TextDTO`.

### `ChatInterface` (React)
- **Component description**: Manages and displays the interactive chat area, including the list of messages and the input field.
- **Main elements**: Contains `ChatMessageList`, `ChatInputArea`, and `NextButton`.
- **Supported interactions**: Receives `onAnswerSubmit` events from `ChatInputArea`, handles progression logic triggered by `NextButton`.
- **Supported validation**: None directly.
- **Types**: `ChatMessageVM[]`, `currentQuestion: QuestionDTO | null`, `isLoadingSubmission: boolean`, `isLastQuestion: boolean`.
- **Props**:
    - `messages: ChatMessageVM[]`
    - `currentQuestion: QuestionDTO | null`
    - `onAnswerSubmit: (answerText: string, questionId: string, responseTimeMs: number) => void`
    - `onNextQuestion: () => void`
    - `isLoadingSubmission: boolean`
    *   `isNextButtonDisabled: boolean`
    *   `isLastQuestion: boolean`

### `ChatMessageList` (React)
- **Component description**: Renders the sequence of chat messages.
- **Main elements**: Maps over an array of `ChatMessageVM` objects and renders a `ChatBubble` for each.
- **Supported interactions**: None.
- **Supported validation**: None.
- **Types**: `ChatMessageVM[]`.
- **Props**: `messages: ChatMessageVM[]`.

### `ChatBubble` (React)
- **Component description**: Displays a single message in the chat. Styling differs based on whether the sender is 'ai' (light-blue background) or 'user' (light-green background). Can display questions, answers, feedback, or a loading state.
- **Main elements**: A styled `div` containing the message text. May include a `LoadingSkeleton` for `LoadingAIMessageVM` type.
- **Supported interactions**: Potentially a "Retry" option for AI messages that failed to load (if applicable, though current plan assumes feedback is synchronous).
- **Supported validation**: None.
- **Types**: `ChatMessageVM`.
- **Props**: `message: ChatMessageVM`.

### `ChatInputArea` (React)
- **Component description**: Provides a text input field for the user to type their answer and a button to submit it. Supports "Enter" key for submission.
- **Main elements**:
    - `form` element to handle submission.
    - Shadcn `Input` component for text entry.
    - Shadcn `Button` component for submission.
- **Supported interactions**:
    - `onSubmit(answerText: string)`: Emitted when the user submits their answer.
    - Input field allows typing and editing.
- **Supported validation**:
    - The input field must not be empty before submission is allowed. A visual cue or disabled submit button should enforce this.
- **Types**: Props might include `isLoading: boolean` to disable the input and button during submission.
- **Props**:
    - `onSubmit: (answerText: string) => void`
    - `isLoading: boolean` (disables input/button during answer submission)
    - `currentQuestion: QuestionDTO | null` (to ensure input is enabled only when there's a question)

### `NextButton` (React)
- **Component description**: A button (likely Shadcn `Button`) that allows the user to proceed to the next question after they have received feedback on their current answer. If it's the last question, its text might change to "Finish Exercise" or similar.
- **Main elements**: Shadcn `Button` component.
- **Supported interactions**: `onClick` event triggers progression to the next question or conclusion of the exercise.
- **Supported validation**: None.
- **Types**: Props include `isDisabled: boolean`, `isLastQuestion: boolean`.
- **Props**:
    - `onClick: () => void`
    - `isDisabled: boolean` (disabled until feedback for the current question is shown)
    - `isLastQuestion: boolean` (to change button text, e.g., "Next Question" vs "Finish Exercise")

## 5. Types
This view will utilize existing DTOs from `src/types.ts` and introduce new ViewModel types for managing the chat display.

### Existing DTOs (from `src/types.ts`):
-   **`TextDTO`**: For the main exercise text.
    ```typescript
    export interface TextDTO {
      id: string;
      title: string;
      content: string;
      language_id: string;
      language?: LanguageDTO;
      proficiency_level_id: string;
      proficiency_level?: ProficiencyLevelDTO;
      topic: string;
      visibility: 'public' | 'private';
      word_count: number;
      user_id?: string;
      created_at: string;
      updated_at: string;
    }
    ```
-   **`QuestionDTO`**: Represents a question associated with the text.
    ```typescript
    export interface QuestionDTO {
      id: string;
      text_id: string;
      content: string;
      created_at: string;
      updated_at: string;
    }
    ```
-   **`SubmitResponseCommand`**: Used for the request body when submitting an answer.
    ```typescript
    export interface SubmitResponseCommand {
      response_text: string;
      response_time: number; // in milliseconds
    }
    ```
-   **`UserResponseDTO`**: The structure of the API response after submitting an answer.
    ```typescript
    export interface UserResponseDTO {
      id: string;
      user_id: string;
      question_id: string;
      response_text: string;
      is_correct: boolean;
      feedback?: string;
      response_time: number;
      created_at: string;
    }
    ```

### New ViewModel Types (for frontend state and rendering):
-   **`ChatMessageVM` (Chat Message ViewModel)**:
    -   **Purpose**: A discriminated union type to represent various messages in the chat log, simplifying rendering logic.
    -   **Structure**:
        ```typescript
        export type ChatMessageVM =
          | AIMessageVM
          | UserAnswerVM
          | FeedbackResultVM
          | LoadingAIMessageVM;

        interface BaseMessageVM {
          id: string; // Unique ID for React key
          timestamp: string; // ISO string for potential display or sorting
        }

        export interface AIMessageVM extends BaseMessageVM {
          type: 'ai_question';
          sender: 'ai'; // For styling chat bubble (light-blue)
          text: string; // Question content from QuestionDTO.content
          questionId: string; // Original QuestionDTO.id
        }

        export interface UserAnswerVM extends BaseMessageVM {
          type: 'user_answer';
          sender: 'user'; // For styling chat bubble (light-green)
          text: string; // User's response_text
          questionId: string; // The QuestionDTO.id this answers
          responseTimeMs?: number;
        }

        export interface FeedbackResultVM extends BaseMessageVM {
          type: 'feedback_result';
          sender: 'ai'; // System feedback, styled like AI messages
          questionId: string; // The QuestionDTO.id this feedback is for
          originalAnswerText: string; // The user's answer text
          isCorrect: boolean;
          feedbackText?: string; // Detailed feedback if incorrect, from UserResponseDTO.feedback
          userResponseId: string; // From UserResponseDTO.id
        }
        
        export interface LoadingAIMessageVM extends BaseMessageVM {
            type: 'loading_ai';
            sender: 'ai';
            // No text, implies a loading skeleton/animation in ChatBubble
        }
        ```

## 6. State Management
State will be primarily managed within the `ExerciseChatIsland` React component, potentially using a custom hook (`useExerciseChat`) for better organization.

### `useExerciseChat` Custom Hook State:
-   `textData: TextDTO | null`: Stores the loaded exercise text.
-   `questions: QuestionDTO[]`: Stores all questions for the current exercise.
-   `currentQuestionIndex: number`: Tracks the index of the current question being displayed (default: -1 or 0).
-   `chatMessages: ChatMessageVM[]`: An array holding all messages (questions, answers, feedback) in chronological order.
-   `isLoadingInitialData: boolean`: Flag for loading state while fetching initial text and questions.
-   `isLoadingSubmission: boolean`: Flag for loading state while submitting an answer and awaiting feedback.
-   `error: string | null`: Stores error messages related to data fetching or submission.
-   `startTimeCurrentQuestion: number | null`: Timestamp (e.g., `Date.now()`) set when a new question is displayed, used to calculate `response_time`.

### Hook Responsibilities (`useExerciseChat`):
-   **Data Fetching**: On mount, fetch the exercise text and questions using the `textId` prop.
    -   Updates `textData`, `questions`, `isLoadingInitialData`, and `error`.
    -   Adds the first question to `chatMessages` as an `AIMessageVM`.
    -   Sets `currentQuestionIndex` to 0 and records `startTimeCurrentQuestion`.
-   **Answer Submission**:
    -   Takes `answerText: string` as input.
    -   Calculates `responseTimeMs = Date.now() - startTimeCurrentQuestion`.
    -   Constructs `SubmitResponseCommand`.
    -   Makes the API call to `POST /api/questions/{currentQuestion.id}/responses`.
    -   Updates `isLoadingSubmission`.
    -   Appends `UserAnswerVM` to `chatMessages`.
    -   On API success, appends `FeedbackResultVM` to `chatMessages`.
    -   On API error, updates the `error` state.
-   **Question Progression**:
    -   Logic to advance `currentQuestionIndex`.
    -   Appends the new question as an `AIMessageVM` to `chatMessages`.
    -   Updates `startTimeCurrentQuestion`.
    -   Handles the end-of-exercise scenario.
-   **Derived State**: Provides computed values like `currentQuestion: QuestionDTO | null`, `isLastQuestion: boolean`.

## 7. API Integration

### 1. Fetching Exercise Data (Text and Questions)
-   **Endpoint**: `GET /api/exercises/{textId}/attempt-data`
    -   **Note**: This endpoint is assumed. The current `GET /api/exercises/{textId}` only returns `TextDTO`. It needs modification or a new endpoint to include `QuestionDTO[]`.
-   **Request**:
    -   Method: `GET`
    -   Path parameter: `textId` (UUID of the exercise)
-   **Expected Response (Success 200 OK)**:
    ```json
    {
      "text": TextDTO, // Full TextDTO object
      "questions": QuestionDTO[] // Array of QuestionDTO objects for this text
    }
    ```
-   **Frontend Action**: Called once when the `ExerciseChatIsland` component mounts. The fetched data populates `textData` and `questions` state variables. The first question is then displayed.

### 2. Submitting an Answer
-   **Endpoint**: `POST /api/questions/{questionId}/responses`
    -   **Note**: Implementation file for this endpoint was not located during analysis. Its existence and correct functioning as per the description is assumed.
-   **Request**:
    -   Method: `POST`
    -   Path parameter: `questionId` (UUID of the question being answered)
    -   Body (`SubmitResponseCommand`):
        ```json
        {
          "response_text": "User's answer string",
          "response_time": 15000 // Integer, time in milliseconds
        }
        ```
-   **Expected Response (Success 201 Created)** (`UserResponseDTO`):
    ```json
    {
      "id": "response-uuid",
      "user_id": "user-uuid",
      "question_id": "question-uuid",
      "response_text": "User's answer string",
      "is_correct": true, // boolean
      "feedback": "Optional feedback string",
      "response_time": 15000, // integer
      "created_at": "timestamp"
    }
    ```
-   **Frontend Action**: Called when the user submits an answer via `ChatInputArea`. The `UserResponseDTO` is used to create a `FeedbackResultVM` and append it to the `chatMessages`.

## 8. User Interactions

1.  **Page Load**:
    -   User navigates to `/exercises/{text-id}/attempt`.
    -   `ExerciseChatIsland` fetches text and questions.
    -   A loading indicator is shown.
    -   Once data arrives, `ExerciseTextView` displays the text.
    -   The first question appears in `ChatMessageList` as an `AIMessageVM`.
    -   `ChatInputArea` is enabled and focused. `NextButton` is disabled.
2.  **Typing an Answer**:
    -   User types their answer into the `ChatInputArea`.
    -   The input field updates.
3.  **Submitting an Answer**:
    -   User clicks the "Submit" button or presses "Enter" in the input field.
    -   `ChatInputArea` becomes disabled; `isLoadingSubmission` is true.
    -   The typed answer appears in `ChatMessageList` as a `UserAnswerVM`.
    -   The API call to `POST /api/questions/{questionId}/responses` is made.
    -   Upon receiving a response:
        -   `isLoadingSubmission` becomes false.
        -   A `FeedbackResultVM` (containing correctness and feedback text) appears in `ChatMessageList`.
        -   `ChatInputArea` is re-enabled (and possibly cleared).
        -   `NextButton` becomes enabled.
4.  **Proceeding to Next Question**:
    -   User clicks the enabled `NextButton`.
    -   If not the last question:
        -   `NextButton` becomes disabled again.
        -   The next question from `questions` state appears in `ChatMessageList` as an `AIMessageVM`.
        -   `ChatInputArea` is ready for the new answer and focused.
        -   `startTimeCurrentQuestion` is reset for the new question.
    -   If it was the last question:
        -   A completion message may appear.
        -   `NextButton` might change text to "Finish Exercise" or "Try Another".
        -   `ChatInputArea` is disabled.
5.  **Skipping a Question (Optional - "Next" button as per View Description)**:
    -   The "View Description" mentions a "skip ('Next') button". If this implies skipping *without answering*, it's an alternative flow to "Answer -> Feedback -> Next".
    -   If "Next" can be used to skip:
        -   Clicking "Next" (when it serves as "Skip") would advance `currentQuestionIndex` without submission. The current question is marked as skipped (state TBD). The next question is displayed.
    -   **Clarification needed**: For this plan, "NextButton" is assumed to be for progressing *after* an answer cycle, aligning with US-002. A dedicated "Skip" button would be a separate feature.

## 9. Conditions and Validation

### Frontend Validation (`ChatInputArea`):
-   **Condition**: User attempts to submit an answer.
-   **Validation**: `response_text` (user's answer) must not be an empty string.
-   **UI Effect**:
    -   If empty, the "Submit" button can be disabled, or an inline message can prompt the user to enter text.
    -   Submission is prevented if the validation fails.

### API Condition (`POST /api/questions/{questionId}/responses`):
-   The frontend ensures `response_text` is a string and `response_time` is an integer.
-   The `questionId` used in the path must correspond to the `currentQuestion.id`.
-   The backend API will perform its own validation (e.g., existence of `questionId`, user authorization, format of `response_text`).

### `NextButton` Enabling/Disabling:
-   **Condition**: The `NextButton`'s availability.
-   **Logic**:
    -   Disabled by default when a new question is presented.
    -   Enabled only after feedback (`FeedbackResultVM`) for the current question has been received and displayed.
    -   May be disabled or its function changed after the last question is answered.

## 10. Error Handling

1.  **Initial Data Fetch Failure** (e.g., `GET /api/exercises/{textId}/attempt-data` fails):
    -   **Scenarios**: Network error, server error (500), text not found (404), user not authorized (401/403).
    -   **UI Response**:
        -   Display a prominent error message within the `ExerciseChatIsland` area (e.g., "Failed to load exercise. Please try again or select another exercise.").
        -   Optionally, provide a "Retry" button to re-attempt the fetch.
        -   Log the error to the console or a monitoring service.
2.  **Answer Submission Failure** (e.g., `POST /api/questions/{questionId}/responses` fails):
    -   **Scenarios**:
        -   `400 Bad Request`: Invalid `response_text` or `response_time` (if not caught by frontend). UI should show a specific message like "Invalid answer format."
        -   `401 Unauthorized`: User's session expired. UI should prompt for re-login or redirect.
        -   `403 Forbidden`: User not permitted to answer this question. UI shows "You do not have permission."
        -   `404 Not Found`: `questionId` is invalid. UI shows a generic "Error submitting answer. Question not found."
        -   `5xx Server Error`: Backend issue. UI shows "An error occurred while submitting your answer. Please try again."
    -   **UI Response (General)**:
        -   The user's typed answer in `ChatInputArea` should be preserved.
        -   An error message should be displayed inline (e.g., below the input field, or as a temporary `ErrorMessageVM` in `ChatMessageList`).
        -   The "Submit" button in `ChatInputArea` should be re-enabled.
        -   The "View Description" mentions "inline retry on AI error." This could mean the failed `UserAnswerVM` in the chat gets a "Retry submission" button.
        -   Log the error.
3.  **General Network Issues**:
    -   Provide feedback if the application loses internet connectivity. A global banner or toast message could be used.

## 11. Implementation Steps

1.  **Setup Astro Page and React Island**:
    -   Create the Astro page file at `src/pages/exercises/[textId]/attempt.astro`.
    -   Extract `textId` from URL parameters in the Astro page.
    -   Create the main React component `ExerciseChatIsland.tsx` in `src/components/`.
    -   Pass `textId` as a prop from the Astro page to `ExerciseChatIsland`.
2.  **Define Types**:
    -   Add the new `ChatMessageVM` union type and its constituent interfaces (AIMessageVM, UserAnswerVM, FeedbackResultVM, LoadingAIMessageVM) to `src/types.ts` or a new view-specific types file (e.g., `src/features/exercise-chat/types.ts`).
3.  **Implement `useExerciseChat` Hook**:
    -   Create `src/hooks/useExerciseChat.ts`.
    -   Implement initial state setup (`textData`, `questions`, `chatMessages`, `currentQuestionIndex`, loading/error states, `startTimeCurrentQuestion`).
    -   Implement the data fetching logic for `GET /api/exercises/{textId}/attempt-data` (or its equivalent). Handle success and error states, update chat messages with the first question.
    -   Implement the answer submission logic:
        -   Function to take `answerText`.
        -   Calculate `responseTimeMs`.
        -   Make `POST /api/questions/{questionId}/responses` call.
        -   Update `chatMessages` with `UserAnswerVM` and then `FeedbackResultVM` on success. Handle errors.
    -   Implement question progression logic.
4.  **Develop Core UI Components (`ExerciseTextView`, `ChatMessageList`, `ChatBubble`)**:
    -   Create `ExerciseTextView.tsx`: Receives `TextDTO` prop, renders `text.content`.
    -   Create `ChatMessageList.tsx`: Receives `messages: ChatMessageVM[]` prop, maps and renders `ChatBubble` for each.
    -   Create `ChatBubble.tsx`:
        -   Receives `message: ChatMessageVM` prop.
        -   Conditionally renders content based on `message.type` and `message.sender`.
        -   Applies Tailwind CSS for styling (light-blue for AI, light-green for user).
        -   Includes a `LoadingSkeleton` for `LoadingAIMessageVM`.
5.  **Develop Interactive Components (`ChatInputArea`, `NextButton`)**:
    -   Create `ChatInputArea.tsx`:
        -   Use Shadcn `Input` and `Button`.
        -   Manage local input state.
        -   Implement basic non-empty validation.
        -   Handle form submission (Enter key and button click), calling the `onSubmit` prop.
        -   Disable input/button when `isLoading` prop is true.
    -   Create `NextButton.tsx`:
        -   Use Shadcn `Button`.
        -   Text changes based on `isLastQuestion` prop.
        -   Disabled state based on `isDisabled` prop.
        -   Calls `onClick` prop when clicked.
6.  **Assemble `ChatInterface` and `ExerciseChatIsland`**:
    -   Create `ChatInterface.tsx`:
        -   Arrange `ChatMessageList`, `ChatInputArea`, `NextButton`.
        -   Pass necessary props and callbacks down from `ExerciseChatIsland` (via `useExerciseChat` hook).
    -   Complete `ExerciseChatIsland.tsx`:
        -   Use the `useExerciseChat` hook to get state and action dispatchers.
        -   Render `ExerciseTextView` and `ChatInterface`, passing down the required state and callbacks.
        -   Handle overall loading and error states for the page.
7.  **API Implementation/Verification (Backend Task)**:
    -   Ensure `GET /api/exercises/{textId}/attempt-data` (or equivalent) endpoint exists and returns both `TextDTO` and `QuestionDTO[]`.
    -   Ensure `POST /api/questions/{questionId}/responses` endpoint is implemented and functions as described.
8.  **Styling and Accessibility**:
    -   Apply Tailwind CSS throughout for styling, adhering to the project's design system if one exists.
    -   Ensure color contrasts for chat bubbles meet accessibility standards (WCAG AA).
    -   Implement ARIA attributes where necessary for accessibility (e.g., for chat roles, live regions if messages are added dynamically).
    -   Test keyboard navigation (Tab focus on input, Enter to submit).
9.  **Testing**:
    -   Unit test individual components and the `useExerciseChat` hook.
    -   Integration test the chat flow: fetching data, submitting answers, receiving feedback, progressing through questions.
    -   Test error handling scenarios thoroughly.
    -   Test across supported browsers if applicable.
10. **Refinement**:
    -   Add loading skeletons or animations for a smoother UX during data fetching and submission.
    -   Refine UI based on feedback (e.g., clarity of instructions, feedback messages).
    -   Consider edge cases (e.g., very long text/questions/answers, no questions for a text).

</rewritten_file> 