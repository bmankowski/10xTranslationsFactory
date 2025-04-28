# View Implementation Plan: Generate Exercise Page

## 1. Overview
This plan outlines the implementation steps for the "Generate Exercise Page" (`/exercise/new`). This view allows authenticated users to configure parameters (target language, proficiency level, topic, visibility) and trigger an API call to generate a new learning text and associated comprehension questions using AI. The view will provide loading feedback during generation and handle potential errors. Upon successful generation, the user will be redirected to view the newly created text.

## 2. View Routing
- **Path:** `/exercise/new`
- **Protection:** This route must be protected. Access should only be granted to authenticated users. This should be enforced using Astro middleware, redirecting unauthenticated users to the login page.

## 3. Component Structure
The view will be composed of an Astro page that renders a primary React form component.

```
src/pages/exercise/new.astro        # Astro page, handles routing and layout
    └── src/components/GenerateExerciseForm.tsx (client:load) # React component, handles form logic & API call
        ├── (Shadcn UI Components used within):
        │   ├── Select (for Language)
        │   ├── Select (for Proficiency Level)
        │   ├── Input (for Topic)
        │   ├── Switch (for Visibility)
        │   └── Button (for Submit)
        └── (Internal Logic):
            ├── Loading State (e.g., Button spinner, Skeleton)
            └── Error Handling (e.g., Inline messages, Toast)
```

## 4. Component Details

### `GenerateExercisePage.astro`
- **Component Description:** The main Astro page for the `/exercise/new` route. Sets up the page layout, ensures user authentication via middleware, and renders the `GenerateExerciseForm` component with client-side loading. It may potentially fetch initial data (languages, levels) server-side and pass it down.
- **Main Elements:** Standard page layout (`src/layouts/...`), renders `<GenerateExerciseForm client:load />`.
- **Supported Interactions:** None directly; interactions are handled by the child React component.
- **Validation Conditions:** Authentication check via middleware.
- **Types:** None specific to this component, besides potential props passed to `GenerateExerciseForm`.
- **Props:** May receive and pass `languages: LanguageDTO[]` and `proficiencyLevels: ProficiencyLevelDTO[]` to `GenerateExerciseForm` if fetched server-side.

### `GenerateExerciseForm.tsx`
- **Component Description:** A client-side React component responsible for rendering the generation configuration form, managing its state, handling user input, performing client-side validation, interacting with the API, and displaying loading/error states.
- **Main Elements:** A `<form>` element containing Shadcn UI components:
    - `Select` for Language (`LanguageSelect`)
    - `Select` for Proficiency Level (`ProficiencyLevelSelect`)
    - `Input` for Topic (`TopicInput`)
    - `Switch` for Visibility (`VisibilityToggle`)
    - `Button` for Submit (`SubmitButton`)
    - Conditional rendering for loading indicators (e.g., spinner in Button) and error messages (e.g., inline text or triggering a `Toast`).
- **Supported Interactions:**
    - Selecting Language: Updates internal state (`languageId`).
    - Selecting Proficiency Level: Updates internal state (`proficiencyLevelId`).
    - Typing Topic: Updates internal state (`topic`).
    - Toggling Visibility: Updates internal state (`visibility`).
    - Submitting Form: Triggers validation and API call (`POST /api/texts`).
- **Supported Validation (Client-side before API call):**
    - Language: Must be selected (`languageId` is not undefined).
    - Proficiency Level: Must be selected (`proficiencyLevelId` is not undefined).
    - Topic: Must not be empty or whitespace-only (`topic.trim() !== ''`).
    - Submit button is disabled if the form is invalid or `isLoading` is true.
    - Validation errors displayed near respective fields.
- **Types:**
    - **Props:** `languages: LanguageDTO[]`, `proficiencyLevels: ProficiencyLevelDTO[]` (if passed from Astro).
    - **State (ViewModel):** `GenerateExerciseFormState` (see Section 5).
    - **API:** Uses `CreateTextCommand` for request, expects `CreateTextResponseDTO` for success.
- **Props:** Receives `languages` and `proficiencyLevels` arrays if fetched server-side by the parent Astro component.

## 5. Types

- **Existing DTOs (from `src/types.ts`):**
    - `LanguageDTO`: `{ id: string; code: string; name: string; ... }` - For language select options.
    - `ProficiencyLevelDTO`: `{ id: string; name: string; display_order: number; ... }` - For level select options.
    - `TextDTO`: Represents the generated text structure in the API response.
    - `QuestionDTO`: Represents generated questions in the API response.
    - `CreateTextCommand`: `{ language_id: string; proficiency_level_id: string; topic: string; visibility: 'public' | 'private'; }` - Used for the `POST /api/texts` request body.
    - `CreateTextResponseDTO`: `{ text: TextDTO; questions: QuestionDTO[]; }` - Expected shape of the successful API response (Status 201).

- **Custom ViewModel:**
    - `GenerateExerciseFormState` (Managed within `GenerateExerciseForm.tsx` using `useState`):
        ```typescript
        interface GenerateExerciseFormState {
          languageId: string | undefined;
          proficiencyLevelId: string | undefined;
          topic: string;
          visibility: 'public' | 'private';
          availableLanguages: LanguageDTO[];
          availableProficiencyLevels: ProficiencyLevelDTO[];
          isLoading: boolean;
          error: string | null; // For API/general errors
          formErrors: { // For client-side validation
            topic?: string;
            language?: string;
            level?: string;
          };
        }
        ```
        - `languageId`, `proficiencyLevelId`, `topic`, `visibility`: Hold current form values. `visibility` defaults to `'private'`.
        - `availableLanguages`, `availableProficiencyLevels`: Hold data fetched for the select dropdowns.
        - `isLoading`: Tracks the API request status.
        - `error`: Stores general/API error messages for display (e.g., via Toast).
        - `formErrors`: Stores specific field validation errors for display near inputs.

## 6. State Management
- State will be managed locally within the `GenerateExerciseForm.tsx` React component using `React.useState` hooks for each field defined in the `GenerateExerciseFormState` ViewModel.
- Data fetching for `availableLanguages` and `availableProficiencyLevels` will occur within `GenerateExerciseForm.tsx` using a `useEffect` hook on component mount (assuming client-side fetching). API calls (`GET /api/languages`, `GET /api/proficiency-levels`) are required.
- A custom hook (`useGenerateExerciseForm`) could be considered if the fetching, validation, and submission logic becomes overly complex within the component body, but standard `useState` and helper functions should suffice initially.

## 7. API Integration
- **Fetching Initial Data:**
    - `GET /api/languages`: Needs to be implemented. Called on form mount to populate the language select.
    - `GET /api/proficiency-levels`: Needs to be implemented. Called on form mount to populate the level select.
- **Submitting Form:**
    - `POST /api/texts`: Called when the user submits the valid form.
    - **Request Body:** An object matching the `CreateTextCommand` type, constructed from the form state.
    - **Response Handling:**
        - **Success (201 Created):** Parse the `CreateTextResponseDTO`. Clear loading/error states. Redirect the user to the new text page, e.g., `/texts/${response.text.id}`.
        - **Error (400 Bad Request):** Update `error` state with a message like "Invalid data submitted." Display error.
        - **Error (401 Unauthorized):** Should ideally be caught by middleware, but if occurs during API call, redirect to login.
        - **Error (500 Internal Server Error):** Update `error` state with a message like "Generation failed. Please try again later." Display error.
        - **Network Error:** Update `error` state with a network error message. Display error.
- Standard `fetch` API or a lightweight fetching library (like `axios` if already in use) will be used for API calls.

## 8. User Interactions
- **Page Load:**
    - Fetch languages and proficiency levels.
    - Display form with initial state (e.g., visibility private, topic empty).
    - Set focus to the first form field (Language Select).
- **Form Input:**
    - Selecting language/level updates the respective state.
    - Typing in topic updates the topic state.
    - Toggling visibility updates the visibility state.
    - Client-side validation runs on change or blur, updating `formErrors` and submit button disabled state.
- **Form Submission:**
    - User clicks "Generate" button.
    - If form is valid and not loading:
        - Set `isLoading` to true.
        - Disable submit button, show loading indicator.
        - Make `POST /api/texts` call.
        - Handle success (redirect) or error (show message, set `isLoading` false).
    - If form is invalid:
        - Show validation errors (`formErrors`).
        - Prevent API call.

## 9. Conditions and Validation
- **Authentication:** Checked by Astro middleware before rendering the page.
- **Client-Side Validation (in `GenerateExerciseForm.tsx`):**
    - Language: Required. Error message if `languageId` is undefined on submit attempt.
    - Proficiency Level: Required. Error message if `proficiencyLevelId` is undefined on submit attempt.
    - Topic: Required, non-empty. Error message if `topic.trim() === ''` on submit attempt.
    - UI State: Submit button is disabled if `isLoading` is true OR if any of the above validations fail. Error messages are displayed next to the relevant fields when `formErrors` state is updated.
- **Server-Side Validation (at `POST /api/texts`):**
    - Enforces `language_id` (UUID), `proficiency_level_id` (UUID), `topic` (min length 1), `visibility` (enum) via Zod schema.
    - Returns 400 Bad Request if validation fails.

## 10. Error Handling
- **Data Fetching Errors (Languages/Levels):** Display an error message (e.g., Toast or inline message). Disable the form or relevant parts until data is loaded successfully.
- **Client-Side Validation Errors:** Display specific error messages (`formErrors`) directly below or beside the invalid form fields. Prevent form submission.
- **API Call Errors:**
    - Catch errors from the `fetch` call.
    - Check the response status code (400, 401, 500, etc.).
    - Set the `error` state with a user-friendly message based on the status code or error type.
    - Display the `error` message prominently, likely using a Shadcn `Toast` component for non-blocking feedback.
    - Log detailed error information (from response body or caught error object) to the browser console for debugging.
    - Reset `isLoading` state to `false` on error.

## 11. Implementation Steps
1.  **Backend Prep:** Ensure `GET /api/languages` and `GET /api/proficiency-levels` endpoints exist and return `LanguageDTO[]` and `ProficiencyLevelDTO[]` respectively. Confirm `POST /api/texts` works as expected per the description.
2.  **Astro Page (`src/pages/exercise/new.astro`):**
    - Create the Astro file.
    - Add necessary layout.
    - Ensure middleware protects the route.
    - (Optional: Fetch languages/levels server-side if preferred).
    - Render the `<GenerateExerciseForm client:load ... />` component, passing data props if fetched server-side.
3.  **React Form Component (`src/components/GenerateExerciseForm.tsx`):**
    - Create the React component file.
    - Set up `useState` hooks for `GenerateExerciseFormState`.
    - Implement `useEffect` to fetch languages/levels if doing client-side fetching (handle loading/error states for fetch).
    - Render the form structure using Shadcn `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`.
    - Implement form fields using Shadcn `Select`, `Input`, `Switch`, wrapping them in `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` from Shadcn `Form` for structure and validation messages. Add appropriate `aria-label` attributes.
    - Populate selects with fetched `availableLanguages` and `availableProficiencyLevels`.
    - Implement state update handlers (`onChange`, `onValueChange`, `onCheckedChange`) for form inputs.
    - Implement client-side validation logic updating `formErrors` and controlling the submit button's disabled state.
4.  **API Interaction:**
    - Implement the `handleSubmit` function.
    - Prevent default form submission.
    - Perform final validation check.
    - Set `isLoading` to true.
    - Construct the `CreateTextCommand` payload.
    - Call `POST /api/texts` using `fetch`.
    - Handle success: parse response, redirect (`window.location.href = '/texts/' + response.text.id;`).
    - Handle errors: parse error, update `error` state, display Toast.
    - Set `isLoading` to false in both success and error cleanup (`finally` block).
5.  **Styling and Accessibility:**
    - Use Tailwind utilities for styling as needed.
    - Ensure Shadcn components are correctly configured and themed.
    - Verify ARIA labels are present and focus management works (focus on first field on load).
6.  **Testing:**
    - Test form validation logic.
    - Test successful generation and redirection.
    - Test handling of various API error responses (400, 401, 500) and network errors.
    - Test loading state appearance.
    - Test accessibility using browser tools or screen readers. 