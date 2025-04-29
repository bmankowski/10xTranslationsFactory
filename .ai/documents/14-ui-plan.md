# UI Architecture for AI-Powered Language Learning Platform

## 1. UI Structure Overview
A modular, single-page chat interface augmented by dedicated pages for exercise lists, user profile, and authentication. Pages use Astro layouts for static content and mount React components (Shadcn/ui) for dynamic behavior. A consistent header and sidebar (or bottom nav on mobile) provide global navigation.

## 2. List of Views

### 2.1 Login Page
- Path: `/login`
- Main Purpose: Authenticate existing users via email/password or Google OAuth.
- Key Information: Email and password fields, "Sign in" button, Google OAuth button, link to register and reset password.
- Key Components: AuthForm (inputs, buttons), OAuthButton, LinkList (register/reset).
- UX/Accessibility/Security: ARIA-labeled inputs, high-contrast form, keyboard navigation, CSRF protection via Supabase.

### 2.2 Register Page
- Path: `/register`
- Main Purpose: New user sign-up with email/password or Google OAuth.
- Key Information: Full name, email, password fields, "Create account" button, Google OAuth button, link to login.
- Key Components: AuthForm, OAuthButton, LinkList.
- UX/Accessibility/Security: Form validation feedback, password strength hint, secure handling of credentials.

### 2.3 Password Reset Page
- Path: `/reset-password`
- Main Purpose: Allow users to request a password reset email.
- Key Information: Email field, "Send reset link" button, confirmation message.
- Key Components: ResetForm, ToastNotification.
- UX/Accessibility/Security: Inline validation, clear success/error state, rate-limit requests.

### 2.4 Generate Exercise Page
- Path: `/exercise/new`
- Main Purpose: Configure and trigger AI text + question generation.
- Key Information: Select target language, proficiency level, topic input, public/private toggle, "Generate" button.
- Key Components: FormPanel (Selects, Input, Toggle, Button), LoadingSkeleton overlay.
- UX/Accessibility/Security: ARIA labels on all controls, focus management to first field, protected route.

### 2.5 Exercise Chat Page
- Path: `/exercise/[textId]`
- Main Purpose: Present generated text and questions as a chat; collect user responses and display feedback.
- Key Information: Sequence of chat bubbles (AI messages, user responses), input field, skip ("Next") button, inline feedback highlights.
- Key Components: ChatBubble (AI/user), ChatInputArea, NextButton, FeedbackMessage, LoadingSkeleton for pending AI.
- UX/Accessibility/Security: Color contrast for bubbles (light-blue AI, light-green user), enter to submit, tab focus on input, inline retry on AI error.

### 2.6 Exercises List Page
- Path: `/exercises`
- Main Purpose: Show paginated list of user and public exercises; allow reattempt or deletion of own items.
- Key Information: List of ExerciseCards (title, date, visibility, language), pagination controls, call-to-action if empty.
- Key Components: ExerciseCard, PaginationControls, EmptyState (CTA), ConfirmationModal for deletes.
- UX/Accessibility/Security: Keyboard-focusable list items, confirmation on delete, filter omitted in MVP, protected route.

### 2.7 Profile Page
- Path: `/profile`
- Main Purpose: Display and edit user preferences (learning languages, UI language).
- Key Information: Current full name, email (read-only), primary learning language(s), UI language select.
- Key Components: ProfileForm (Inputs, Selects), SaveButton, ToastNotification.
- UX/Accessibility/Security: Inline edits with immediate UI-language reload, secure PATCH to `/api/users/me/preferences`.

## 3. User Journey Map
1. **Unauthenticated Flow**: User lands on `/login` → logs in/registers → redirected to `/exercise/new`.
2. **Generate Exercise**: On `/exercise/new`, user selects settings → clicks Generate → navigated to `/exercise/{textId}` when ready.
3. **Q&A Chat**: User reads AI text, answers questions one at a time; correct answers auto-advance; "Next" skips if desired; inline feedback highlights correctness.
4. **Completion**: After final question, show summary banner with link to `/exercises`.
5. **Exercises List**: On `/exercises`, user reviews past/public exercises, clicks any to reattempt (back to `/exercise/{textId}`) or deletes own.
6. **Profile Management**: Via header avatar, user opens `/profile`, updates learning/UI languages and sees changes immediately.
7. **Session Handling**: Any protected route unauthorized redirects to `/login` and returns to intended page post-login.

## 4. Layout and Navigation Structure
- **Header**: Global brand logo on the left; UI-language switcher; user avatar with dropdown (Profile, Logout).
- **Sidebar (desktop)**: Links to Generate Exercise, My Exercises, Profile.
- **Bottom Nav (mobile)**: Icon buttons for Generate, Exercises, Profile pinned at screen bottom.
- **Content Area**: Central container that mounts page-specific components; responsive breakpoints via Tailwind.

## 5. Key Components
- **ChatBubble**: Renders AI or user messages with configurable color, alignment, and ARIA attributes.
- **ChatInputArea**: Text input with submit on Enter; manages focus and disabled state during loading.
- **FormPanel**: Grouped form controls for selects, input fields, toggles, and action buttons.
- **ExerciseCard**: Displays metadata (language, date, visibility) and action buttons (reattempt/delete).
- **PaginationControls**: Prev/Next buttons with page indicator; keyboard-accessible.
- **LoadingSkeleton**: Placeholder UI for asynchronous loads in form panel and chat.
- **FeedbackMessage**: Inline feedback banner for correct (green) or incorrect (red) answers with guidance.
- **EmptyState**: Illustrative CTA component for empty lists with descriptive text and primary action button.

---
*All views and components use TypeScript, React (Shadcn/ui), Astro layouts, Tailwind CSS, and adhere to WCAG Level A standards. API calls are handled via React Query or SWR, with JWT-based Supabase Auth and row-level security enforcing data access.* 