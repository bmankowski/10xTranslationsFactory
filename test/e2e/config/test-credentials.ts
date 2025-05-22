// Test user credentials for e2e testing
export const testUsers = {
  valid: {
    email: 'bmankowski@gmail.com',
    password: 'Test123'
  },
  invalid: {
    email: 'wrong@example.com',
    password: 'wrongPassword'
  }
} as const;

// Prevent accidental modification of test credentials
Object.freeze(testUsers); 