# View Implementation Plan: Exercises List

## 1. Overview
This document outlines the implementation plan for the Exercises List view. This view allows authenticated users to browse a paginated list of their own generated texts and public texts (initially English and Spanish). Users can filter these texts by language, reattempt the exercises associated with a text, and delete texts they own after confirmation.

## 2. View Routing
- **Path:** `/exercises`
- **Accessibility:** Protected route, requires user authentication.

## 3. Component Structure
The view will be built using Astro for the page structure and React for interactive components.

```
src/pages/exercises.astro (Astro Page)
  └── src/layouts/Layout.astro (Astro Layout)
      └── src/components/ExercisesListContainer.tsx (React Client Component)
          ├── src/components/LanguageFilter.tsx (React Component - Shadcn Select)
          ├── div (List Display Area)
          │   ├── src/components/ExerciseCard.tsx (React Component - Shadcn Card) (Rendered in a loop)
          │   │   ├── Shadcn Button (Reattempt)
          │   │   └── Shadcn Button (Delete - Conditional)
          │   └── src/components/EmptyState.tsx (React Component - Conditional)
          │       └── Shadcn Button (CTA - e.g., "Generate New Text")
          ├── src/components/PaginationControls.tsx (React Component - Shadcn Pagination)
          └── src/components/ConfirmationModal.tsx (React Component - Shadcn AlertDialog) (Conditional)
```

## 4. Component Details

### `ExercisesListPage` (`src/pages/exercises.astro`)
- **Component description:** Astro page component. Sets up the page structure, applies the layout, enforces authentication, and renders the main React container (`ExercisesListContainer`) with client-side hydration (`client:load` or `client:visible`).
- **Main elements:** Imports layout, renders `<ExercisesListContainer client:load />`. Includes logic to check authentication status (e.g., using Astro middleware or checking session on page load) and redirect if not authenticated.
- **Supported interactions:** None (static structure).
- **Supported validation:** Authentication check.
- **Types:** None directly.
- **Props:** None.

### `ExercisesListContainer` (`src/components/ExercisesListContainer.tsx`)
- **Component description:** The main stateful React component responsible for fetching data, managing state (filters, pagination, loading, errors, modal), and rendering child components.
- **Main elements:** Contains state hooks (`useState`, `useEffect`), fetches data, renders `LanguageFilter`, maps `texts` state to `ExerciseCard` components, conditionally renders `EmptyState`, renders `PaginationControls`, and manages the `ConfirmationModal`.
- **Supported interactions:** Handles pagination changes, language filter selection, initiating deletion flow.
- **Supported validation:** Manages loading and error states from API calls. Handles empty list state.
- **Types:** `ExercisesListState` (internal state), `PaginatedListDTO<TextDTO>`, `TextDTO`, `LanguageDTO`. Uses `ExerciseCardViewModel`.
- **Props:** None (receives data via hooks/API calls).

### `LanguageFilter` (`src/components/LanguageFilter.tsx`)
- **Component description:** A dropdown component allowing users to filter the list by language. Uses Shadcn UI `Select`.
- **Main elements:** Renders a `Select` component populated with available languages fetched from the API. Includes an "All Languages" option.
- **Supported interactions:** Selecting a language triggers the `onFilterChange` callback.
- **Supported validation:** None specific.
- **Types:** `LanguageDTO[]` (for options).
- **Props:**
    - `languages: LanguageDTO[]`: List of available languages.
    - `selectedLanguageId: string | null`: The currently selected language ID.
    - `onFilterChange: (languageId: string | null) => void`: Callback function when the filter changes.

### `ExerciseCard` (`src/components/ExerciseCard.tsx`)
- **Component description:** Displays information for a single text exercise using Shadcn UI `Card`. Shows title, formatted creation date, visibility status, and language. Includes "Reattempt" and conditional "Delete" buttons.
- **Main elements:** `Card` containing text elements for data display and `Button` components for actions. Uses Tailwind for styling within the card.
- **Supported interactions:** Clicking "Reattempt" button triggers `onReattempt`. Clicking "Delete" button triggers `onDelete`. Should be keyboard focusable.
- **Supported validation:** The "Delete" button is only rendered if the `isOwner` prop is true.
- **Types:** `ExerciseCardViewModel`.
- **Props:**
    - `exercise: ExerciseCardViewModel`: The data for the exercise to display.
    - `onReattempt: (textId: string) => void`: Callback when reattempt is clicked.
    - `onDelete: (textId: string) => void`: Callback when delete is clicked.

### `PaginationControls` (`src/components/PaginationControls.tsx`)
- **Component description:** Provides pagination controls using Shadcn UI `Pagination`.
- **Main elements:** Renders `Pagination` component with previous/next buttons and potentially page number indicators.
- **Supported interactions:** Clicking previous/next buttons triggers `onPageChange`.
- **Supported validation:** Disables "Previous" button on the first page and "Next" button on the last page.
- **Types:** `number`.
- **Props:**
    - `currentPage: number`: The current active page (1-indexed).
    - `totalPages: number`: The total number of pages.
    - `onPageChange: (newPage: number) => void`: Callback function when the page changes.

### `EmptyState` (`src/components/EmptyState.tsx`)
- **Component description:** A component displayed when the exercise list is empty (either initially or after filters are applied). Includes a message and a Call-to-Action (CTA) button.
- **Main elements:** Contains text elements for the message and a Shadcn `Button` for the CTA.
- **Supported interactions:** Clicking the CTA button triggers navigation (e.g., to the text generation page).
- **Supported validation:** None specific.
- **Types:** None specific.
- **Props:**
    - `message?: string`: Custom message to display (optional).
    - `ctaText?: string`: Text for the CTA button (optional).
    - `onCtaClick?: () => void`: Callback for the CTA button click (e.g., to navigate).

### `ConfirmationModal` (`src/components/ConfirmationModal.tsx`)
- **Component description:** A modal dialog (using Shadcn UI `AlertDialog`) asking the user to confirm the deletion of an exercise.
- **Main elements:** `AlertDialog` containing title, description, "Confirm" button, and "Cancel" button.
- **Supported interactions:** Clicking "Confirm" triggers `onConfirm`. Clicking "Cancel" triggers `onCancel`.
- **Supported validation:** Requires explicit user interaction.
- **Types:** `boolean`.
- **Props:**
    - `isOpen: boolean`: Controls the visibility of the modal.
    - `onConfirm: () => void`: Callback function when confirm is clicked.
    - `onCancel: () => void`: Callback function when cancel is clicked.
    - `title?: string`: Modal title (optional).
    - `message?: string`: Modal message (optional).

## 5. Types

### Existing DTOs (from `src/types.ts`)
- `TextDTO`: Represents a text exercise fetched from the API. Includes `id`, `title`, `created_at`, `visibility`, `language` (nested `LanguageDTO`), and importantly `user_id`.
- `LanguageDTO`: Represents a language (ID, code, name). Used for filtering and display.
- `PaginatedListDTO<T>`: Generic wrapper for paginated API responses, contains `items`, `total`, `limit`, `offset`.

### Custom ViewModels and State Types

- **`ExerciseCardViewModel`**: Derived type used specifically for the `ExerciseCard` component.
  ```typescript
  interface ExerciseCardViewModel {
    id: string;           // Text ID
    title: string;        // Text title
    displayDate: string;  // Formatted creation date (e.g., "MMMM D, YYYY")
    visibility: 'public' | 'private'; // Text visibility
    languageName: string; // Language name (e.g., "English", "Spanish")
    isOwner: boolean;     // True if the logged-in user created this text
  }
  ```
- **`ExercisesListState`**: Represents the combined state managed within `ExercisesListContainer`.
  ```typescript
  interface ExercisesListState {
    texts: ExerciseCardViewModel[]; // Data for display
    isLoading: boolean;             // API loading status
    error: string | null;           // API error message
    pagination: {
      currentPage: number;        // Current page (1-indexed)
      totalPages: number;         // Total pages available
      limit: number;              // Items per page
      totalItems: number;         // Total items matching filter
    };
    filter: {
      selectedLanguageId: string | null; // Currently selected language ID
    };
    availableLanguages: LanguageDTO[]; // Languages for the filter dropdown
    modal: {
      isDeleteModalOpen: boolean; // Confirmation modal visibility
      textToDeleteId: string | null; // ID of text pending deletion
    };
    loggedInUserId: string | null; // ID of the current user
  }
  ```

## 6. State Management

- State will be primarily managed within the `ExercisesListContainer.tsx` React component using standard React hooks (`useState`, `useEffect`).
- **Consideration:** For better organization and testability, the state logic (fetching, filtering, pagination, deletion flow) can be extracted into a custom hook, e.g., `useExercisesList`.
  ```typescript
  // Example signature for the custom hook
  function useExercisesList(): {
    state: ExercisesListState;
    actions: {
      setPage: (newPage: number) => void;
      setLanguageFilter: (languageId: string | null) => void;
      initiateDelete: (textId: string) => void;
      confirmDelete: () => Promise<void>;
      cancelDelete: () => void;
      retryFetch: () => void;
      navigateToReattempt: (textId: string) => void;
      navigateToGenerate: () => void;
    };
  }
  ```
- The logged-in user's ID is required to determine text ownership (`isOwner`). This should be obtained via an authentication context or hook (e.g., `useAuth()`) provided elsewhere in the application.

## 7. API Integration

**Assumptions:**
- A `GET /api/texts` endpoint exists and functions as described in the requirements, returning `PaginatedListDTO<TextDTO>`. It correctly filters texts based on the session user (showing their private texts + all public texts) and the optional `language_id` query parameter.
- A `DELETE /api/texts/{textId}` endpoint exists for deleting a text, requiring authentication and ownership. It returns a success status (e.g., 204) or an appropriate error code (401, 403, 404, 500).
- A `GET /api/languages` endpoint exists to fetch the list of available `LanguageDTO` objects for the filter.

**API Calls:**

1.  **Fetch Languages:**
    - **Endpoint:** `GET /api/languages`
    - **Trigger:** On mount of `ExercisesListContainer`.
    - **Request:** No parameters.
    - **Response:** `LanguageDTO[]`.
    - **Action:** Populate `availableLanguages` state. Handle loading/error states.
2.  **Fetch Texts:**
    - **Endpoint:** `GET /api/texts`
    - **Trigger:** On mount, page change, filter change, after successful deletion.
    - **Request:** Query parameters: `limit` (from state), `offset` (calculated from `currentPage` and `limit`), `language_id` (optional, from `filter.selectedLanguageId`).
    - **Response:** `PaginatedListDTO<TextDTO>`. Expected success code: 200. Expected error codes: 401, 500.
    - **Action:** Update `texts` state (mapping `TextDTO` to `ExerciseCardViewModel` including `isOwner` check), update `pagination` state, handle `isLoading` and `error` states.
3.  **Delete Text:**
    - **Endpoint:** `DELETE /api/texts/{textId}` (where `textId` is `modal.textToDeleteId`)
    - **Trigger:** User confirms deletion in the modal.
    - **Request:** `textId` in path. Requires authentication header.
    - **Response:** Expected success code: 204. Expected error codes: 401, 403, 404, 500.
    - **Action:** On success, close modal, trigger refetch of current text page, potentially show success notification. On error, close modal, update `error` state, show error notification.

- An API client instance (e.g., configured `fetch` or `axios`) should be used for making calls, potentially with interceptors to handle common scenarios like adding auth tokens or redirecting on 401s.

## 8. User Interactions

- **Page Load:** Fetch languages and the first page of texts. Display loading indicator, then either the list/pagination or the empty state.
- **Select Language Filter:** Update filter state, reset to page 1, fetch texts with the new language filter. Update list display.
- **Click Pagination Control:** Update current page state, fetch texts for the new page with the current filter. Update list display.
- **Click "Reattempt" Button:** Trigger navigation to the exercise attempt page (`/exercise/{textId}/attempt`). The specific navigation mechanism depends on the Astro/React setup (e.g., `Astro.redirect` or React Router if used).
- **Click "Delete" Button (on owned text):** Set `modal.isDeleteModalOpen` to `true` and store the `textId` in `modal.textToDeleteId`.
- **Click "Confirm" in Delete Modal:** Call the delete API endpoint. Handle success/error (refetch list on success, show message). Close modal.
- **Click "Cancel" in Delete Modal:** Set `modal.isDeleteModalOpen` to `false`, clear `modal.textToDeleteId`.
- **Click CTA in Empty State:** Trigger navigation to the text generation page (e.g., `/generate`).

## 9. Conditions and Validation

- **Authentication:** The `/exercises` route must be protected. API calls will fail with 401 if the user is not authenticated; the frontend should handle this gracefully (e.g., redirect to login).
- **Ownership for Deletion:** The "Delete" button in `ExerciseCard` is only visible if `ExerciseCardViewModel.isOwner` is true. The backend (`DELETE /api/texts/{textId}`) performs the definitive validation, returning 403 if the user is not the owner.
- **API Input Validation:**
    - `GET /api/texts`: `limit` and `offset` must be valid integers. `language_id` (if provided) must be a valid UUID. Handled by frontend state logic.
    - `DELETE /api/texts/{textId}`: `textId` must be a valid UUID. Ensured by deriving it from a fetched `TextDTO`.
- **UI State Validation:**
    - `PaginationControls`: Buttons are disabled when at the first or last page.
    - Loading indicators are shown during API requests.
    - Error messages are displayed if API requests fail.
    - `EmptyState` is shown when the `texts` array is empty after a successful fetch.

## 10. Error Handling

- **API Errors (General):** Catch errors during API calls (`fetch`, `axios`). Update the `error` state in `ExercisesListContainer`. Display a user-friendly message (e.g., using Shadcn `Toast` or an inline message) indicating failure (e.g., "Failed to load exercises", "Failed to delete text"). Offer a retry mechanism if appropriate.
- **401 Unauthorized:** Intercept 401 responses globally or locally and redirect the user to the login page.
- **403 Forbidden (Delete):** Inform the user they don't have permission. This shouldn't occur with correct UI logic but should be handled defensively.
- **404 Not Found (Delete):** Inform the user the text wasn't found (maybe already deleted). Refetch the list to update the UI.
- **Empty List:** Handled by conditionally rendering the `EmptyState` component instead of the list of `ExerciseCard`s.
- **Failed Language Fetch:** Display an error, potentially disable the language filter or proceed without it if possible (though filtering is a core requirement).

## 11. Implementation Steps

1.  **Backend Setup (Assumption):** Ensure the required API endpoints (`GET /api/texts`, `DELETE /api/texts/{id}`, `GET /api/languages`) are implemented, tested, and adhere to the contracts described above, including authentication and authorization checks.
2.  **Create Astro Page:** Create `src/pages/exercises.astro`. Implement authentication check (redirect if not logged in). Add basic layout and render `<ExercisesListContainer client:load />`.
3.  **Create Container Component:** Create `src/components/ExercisesListContainer.tsx`. Set up initial state structure (`ExercisesListState`). Implement `useEffect` hooks to fetch languages and initial texts on mount using placeholders for API calls. Implement basic rendering structure.
4.  **Implement Auth Hook Usage:** Integrate `useAuth` (or equivalent) to get `loggedInUserId`.
5.  **Implement API Client:** Set up functions or a class to interact with the backend API endpoints (`fetchLanguages`, `fetchTexts`, `deleteText`).
6.  **Implement Language Filter:** Create `src/components/LanguageFilter.tsx` using Shadcn `Select`. Populate it with data from `fetchLanguages`. Implement the `onFilterChange` callback to update state in the container and trigger a refetch.
7.  **Implement Exercise Card:** Create `src/components/ExerciseCard.tsx` using Shadcn `Card` and `Button`. Implement data display based on `ExerciseCardViewModel`. Implement conditional rendering of the "Delete" button based on `isOwner`. Implement `onReattempt` and `onDelete` callbacks. Format date using a library like `date-fns` or `dayjs`.
8.  **Implement List Rendering:** In `ExercisesListContainer`, map the fetched `texts` state (after transforming to `ExerciseCardViewModel`) to `ExerciseCard` components. Handle the loading state display.
9.  **Implement Empty State:** Create `src/components/EmptyState.tsx`. Conditionally render it in `ExercisesListContainer` when `texts` is empty and not loading. Implement CTA navigation.
10. **Implement Pagination:** Create `src/components/PaginationControls.tsx` using Shadcn `Pagination`. Connect its `onPageChange` callback to update state in the container and trigger a refetch for the new page. Pass `currentPage` and `totalPages` from the container's state.
11. **Implement Delete Flow:**
    - Create `src/components/ConfirmationModal.tsx` using Shadcn `AlertDialog`.
    - In `ExercisesListContainer`, implement `initiateDelete` (called by `ExerciseCard`) to open the modal and store `textId`.
    - Implement `confirmDelete` to call the `deleteText` API function, handle success/error (refetching list on success), and close the modal.
    - Implement `cancelDelete` to close the modal.
    - Connect modal state (`isOpen`) and callbacks (`onConfirm`, `onCancel`) to the `ConfirmationModal` component.
12. **Implement Reattempt Navigation:** In `ExercisesListContainer` (or `ExerciseCard`), implement the `onReattempt` logic to navigate the user to `/exercise/{textId}/attempt` using the appropriate Astro/React navigation method.
13. **Styling:** Apply Tailwind CSS classes for layout and styling as needed, leveraging Shadcn UI's styling conventions.
14. **Error Handling:** Implement robust error display (e.g., Toasts) for API failures during fetch and delete operations.
15. **Testing:** Add unit/integration tests for components, especially the container, state logic (or custom hook), and API interactions. Test edge cases (empty list, errors, pagination boundaries, permissions). Test keyboard navigation and accessibility.
16. **Refinement:** Refactor state management into `useExercisesList` custom hook if `ExercisesListContainer` becomes too complex. 