# Test Plan for ChatInterface Component

## 1. Overview

This document outlines the testing strategy for the `ChatInterface` component, which is a critical part of the exercise chat functionality in 10xTranslationsFactory. The component handles the display of chat messages and user input for language exercises.

## 2. Component Responsibilities

- Display chat message history
- Handle user input for exercise answers
- Show/hide input area based on exercise completion
- Handle loading states during answer submission
- Manage question state and completion state

## 3. Test Types and Tools

### 3.1 Unit Tests (Vitest + React Testing Library)

Selected for component-level testing because:
- Component is UI-focused with clear props and state management
- Need to test React component rendering and interactions
- Matches the project's existing testing setup
- Allows testing component in isolation

### 3.2 Integration Tests (Playwright)

Selected for end-to-end testing because:
- Need to test real user interactions
- Verify integration with backend services
- Test actual chat flow in browser environment
- Validate complete exercise completion flow

## 4. Unit Test Scenarios (Vitest)

### 4.2 User Interaction Tests

```typescript
describe('ChatInterface User Interactions', () => {
  test('submits answer when user enters text and clicks send')
  test('clears input after submission')
  test('handles empty input validation')
})
```

### 4.3 State Management Tests

```typescript
describe('ChatInterface State Management', () => {
  test('updates UI when new messages arrive')
})
```


## 5. Integration Test Scenarios (Playwright)

### 5.1 Chat Flow Tests

```typescript
describe('Chat Flow', () => {
  test('answer submission and feedback flow')
  test('exercise completion and summary view')
})
```

## 6. Test Data Requirements

### 6.1 Mock Messages
```typescript
const mockMessages = [
  {
    id: '1',
    type: 'ai_question',
    content: 'Hello! Let\'s practice your English.',
    questionId: 'q1'
  },
  {
    id: '2',
    type: 'user_answer',
    content: 'Hi! I\'m ready to practice.',
    questionId: 'q1'
  }
]
```

### 6.2 Mock Questions
```typescript
const mockQuestion = {
  id: 'q1',
  text: 'Introduce yourself in English.',
  type: 'open_ended'
}
```

## 7. Implementation Guidelines

### 7.1 Unit Test Setup

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import ChatInterface from './ChatInterface'

describe('ChatInterface', () => {
  const defaultProps = {
    messages: [],
    currentQuestion: null,
    onAnswerSubmit: vi.fn(),
    isLoadingSubmission: false
  }
  
  beforeEach(() => {
    vi.clearAllMocks()
  })
})
```

### 7.2 Playwright Test Setup

```typescript
import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  // Login and navigate to exercise page
  await page.goto('/exercises/27af84a8-2e64-4cd1-91c7-0ae3afb1c050')
})
```
## 13. Test Execution

### 13.1 Local Development
```bash
# Unit tests
npm run test:unit

# E2E tests
npm run test:e2e
```