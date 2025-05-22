# Testing in 10x Translations Factory

This project uses two types of tests:

1. **Unit Tests** - using Vitest and React Testing Library
2. **E2E Tests** - using Playwright

## Test Directory Structure

All tests are organized within the `test` directory:

```
test/
├── setup.ts                 # Vitest setup file with global mocks
├── README.md                # This file
├── e2e/                     # E2E tests with Playwright
│   └── *.spec.ts            # E2E test files
└── unit/                    # Unit tests with Vitest
    ├── components/          # Component tests
    │   └── *.test.tsx       # Component test files
    ├── lib/                 # Utility/service tests
    │   └── *.test.ts        # Utility test files
    └── pages/               # Page tests
        └── *.test.tsx       # Page test files
```

## Unit Tests

Unit tests verify that individual components and functions work correctly in isolation.

### Running Unit Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (during development)
npm run test:watch

# Open the Vitest UI for visual test monitoring
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Test Structure

- Unit tests are located in `test/unit/` organized by type (components, lib, pages)
- Tests use the naming convention `*.test.tsx` or `*.test.ts`
- Follow the AAA pattern (Arrange-Act-Assert) within test cases

### Test File Example

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from '../../src/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    // Arrange
    render(<MyComponent />);
    
    // Assert
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    // Arrange
    const mockFn = vi.fn();
    render(<MyComponent onClick={mockFn} />);
    
    // Act
    await userEvent.click(screen.getByRole('button'));
    
    // Assert
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
```

## E2E Tests

End-to-end tests verify that the application works correctly as a whole, testing user journeys from start to finish.

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### Test Structure

- E2E tests are located in the `test/e2e` directory
- Tests use the naming convention `*.spec.ts`
- Test files are organized by page or feature

### E2E Test Example

```ts
import { test, expect } from '@playwright/test';

test('Counter component works correctly', async ({ page }) => {
  // Navigate to the counter test page
  await page.goto('/counter-test');
  
  // Check initial state
  await expect(page.getByTestId('count-value')).toHaveText('0');
  
  // Click increment button and verify count increases
  await page.getByRole('button', { name: 'Increment' }).click();
  await expect(page.getByTestId('count-value')).toHaveText('1');
});
```

## CI/CD Integration

Tests are automatically run in the CI/CD pipeline on every push and pull request to the main branch.

## Best Practices

1. **Test behavior, not implementation**: Focus on what the component does, not how it does it
2. **Use meaningful assertions**: Assertions should clearly document expected behavior
3. **Mock external dependencies**: Use `vi.mock()` to isolate unit tests from external dependencies
4. **Test edge cases**: Include tests for error states and edge conditions
5. **Keep tests fast**: Optimize tests to run quickly to maintain developer productivity 