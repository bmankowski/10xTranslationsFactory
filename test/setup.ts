import { afterEach, expect } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Extend Vitest's expect method with jest-dom's matchers
expect.extend({
  // Add any custom matchers here
});

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Mock global fetch if needed
// vi.stubGlobal('fetch', vi.fn());

// Global mocks for Supabase and other services
vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: vi.fn(() => ({
      auth: {
        signIn: vi.fn(),
        signOut: vi.fn(),
        getSession: vi.fn(),
        onAuthStateChange: vi.fn(),
      },
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      })),
    })),
  };
}); 