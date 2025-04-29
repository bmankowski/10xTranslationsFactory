<conversation_summary>
<decisions>
1. Use a single-page "Generate Exercise" and Q&A chat flow.
2. Include a global UI-language toggle distinct from the content-language selection.
3. Enforce forward-only progression; remove the back button in the chat flow.
4. Surface public/private visibility via a toggle on the same form.
5. Use paginated list views for "My Exercises" and community texts.
6. Handle minor errors with inline retry/toast and critical errors with a full-page error state.
7. Target WCAG Level A, using skeleton placeholders for loading and displaying full conversation history.
8. Skip light/dark mode, font-size adjustments, filters, bulk actions, and comments/likes in MVP.
9. Style AI messages as right-aligned light-blue bubbles and user messages as left-aligned light-green bubbles in a full-width panel, with inline expansion of long text.
10. Submit answers on Enter; maintain standard tab focus order; skip mobile gestures.
11. Highlight feedback with light-red for wrong answers and light-green for correct answers.
12. Show a call-to-action for empty "My Exercises" states; inline retry on AI failures.
13. Load UI label translations dynamically for immediate effect.
</decisions>

<matched_recommendations>
1. Single-page chat-style UI for text generation and Q&A flows using Shadcn/ui chat components.
2. Use Shadcn/ui form components for initial controls, including target language, proficiency level, topic input, and visibility toggle.
3. Implement skeleton loading placeholders and full conversation history in the chat UI.
4. Build "My Exercises" as a paginated list view with React Query (or SWR) for caching and page controls.
5. Implement error UI patterns: inline retry buttons and toast notifications for minor errors; full-page error layout for critical failures.
6. Apply WCAG Level A accessibility: ARIA labels on form elements, keyboard navigation, and color-contrast checks.
7. Ensure responsive design via Tailwind CSS: collapse sidebar to bottom nav on mobile; full-width chat panel.
8. Use React Query or SWR for API integration and state caching; maintain exercise state in React context.
9. Define keyboard shortcuts (Enter to submit) and rely on standard tab order for navigation.
10. Dynamically load UI-language settings from user preferences to reflect changes immediately.
</matched_recommendations>

<ui_architecture_planning_summary>
Main Requirements:
- A single, chat-style interface for text generation and Q&A, with initial form controls for target language, proficiency, topic, and visibility.
- Real-time AI feedback shown via color-coded chat bubbles and inline feedback highlights.
- Pagination for both user-specific and public exercise lists.

Key Views & User Flows:
1. Generate Exercise Screen: Top collapsible panel with Shadcn/ui form controls; "Generate" button triggers AI text + questions.
2. Q&A Chat Flow: Right-aligned light-blue AI bubbles and left-aligned light-green user bubbles; users answer questions one at a time, auto-advance on correct, skip with "Next" button if desired.
3. My Exercises List: Paginated table of past and public texts, call-to-action on empty state, inline retry for AI failures.
4. Profile Page: UI-language toggle and user preferences view; changes apply immediately without page reload.

API Integration & State Management:
- Use React Query (or SWR) to fetch and cache data from endpoints such as `/api/texts`, `/api/questions`, and `/api/users/me/preferences`.
- Persist exercise state (current text, questions, responses) in React context or a lightweight state store to survive reloads and hot-module updates.
- Protect API routes with Supabase Auth (JWT verification and RLS policies) to ensure secure data access.

Responsiveness, Accessibility & Security:
- Responsive layout using Tailwind CSS: collapse sidebar to a bottom tab bar on narrow viewports; full-width chat for readability on mobile.
- WCAG Level A compliance: include ARIA labels, keyboard-only navigation via tab order, and maintain sufficient color contrast for chat bubbles and feedback highlights.
- Secure authentication flows: redirect unauthenticated users to `/login` and return them to the original page after login.
</ui_architecture_planning_summary>

<unresolved_issues>
- None; all key UI architecture questions have been addressed for the MVP.
</unresolved_issues>
</conversation_summary> 