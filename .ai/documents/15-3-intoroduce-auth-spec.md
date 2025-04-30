# User Authentication Architecture Specification

## Overview

This document outlines the architecture for implementing user authentication using Supabase Auth integrated with Astro. The implementation will include user registration, login, logout, and password recovery functionalities as specified in the product requirements document.

## 1. USER INTERFACE ARCHITECTURE

### 1.1 New UI Components

#### Authentication Pages
- **`/auth/login.astro`**: Login page with email/password and Google OAuth options
- **`/auth/register.astro`**: Registration page with email/password and Google OAuth options
- **`/auth/verify-email.astro`**: Email verification confirmation page
- **`/auth/reset-password.astro`**: Password reset request page
- **`/auth/new-password.astro`**: New password creation page (after reset)
- **`/auth/success.astro`**: Success confirmation page for various auth flows

#### Authentication Components (React)
- **`LoginForm.tsx`**: Interactive form for user login
- **`RegisterForm.tsx`**: Interactive form for user registration
- **`PasswordResetForm.tsx`**: Form for requesting password reset
- **`NewPasswordForm.tsx`**: Form for creating a new password
- **`GoogleAuthButton.tsx`**: Button component for Google OAuth
- **`AuthFormLayout.tsx`**: Shared layout for auth forms
- **`AuthError.tsx`**: Component for displaying authentication errors
- **`PasswordStrengthIndicator.tsx`**: Visual feedback for password strength
- **`FormField.tsx`**: Reusable form field with validation display

### 1.2 Extension of Existing Components

- **`Header.tsx`**: Add login/logout/profile buttons based on authentication state
- **`UserProfileDropdown.tsx`**: User profile menu with logout option
- **`ProtectedContent.tsx`**: Wrapper component to conditionally render content based on auth state
- **`Layout.astro`**: Update to include auth-aware navigation elements

### 1.3 Separation of Concerns

#### Client-side React Components
- Handle form state management and input validation
- Provide immediate feedback on input errors
- Manage submission state (loading, error, success)
- Execute authentication actions via hooks

#### Astro Pages
- Server-side rendering of page shells
- Redirect logic for authenticated/unauthenticated users
- Initial state hydration for React components
- Meta information and SEO optimization

#### Integration Points
- **`useAuth.ts`**: React hook for authentication operations
- **`AuthContext.tsx`**: React context for sharing auth state
- **`supabaseClient.ts`**: Client-side Supabase instance configuration
- **`authUtils.ts`**: Utility functions for auth-related operations

### 1.4 Validation and Error Handling

#### Form Validation
- **Email**: Format validation using regex pattern
- **Password**:
  - Minimum length (8 characters)
  - Complexity requirements (uppercase, lowercase, numbers, special characters)
  - Real-time strength indicator
- **Name/Username**: Required field validation, length constraints
- **Terms Acceptance**: Required checkbox validation for registration

#### Error Messages
- **User-friendly Errors**:
  - "This email is already registered"
  - "Invalid login credentials"
  - "Password must be at least 8 characters"
  - "Please check your email to verify your account"
  - "This link has expired, please request a new one"
- **Technical Errors**:
  - Supabase service unavailable
  - Network connection issues
  - Rate limit exceeded

### 1.5 Key User Scenarios

#### New User Registration
1. User navigates to registration page
2. Completes registration form with email/password or clicks Google sign-up
3. Submits form, sees loading state
4. On success, redirected to verification notice
5. Email notification sent with verification link
6. User clicks link in email
7. Redirected to verified confirmation page and automatically logged in

#### Login Flow
1. User navigates to login page
2. Enters credentials or uses Google login
3. On success, redirected to protected area
4. On failure, shown appropriate error message
5. Session persisted in browser storage

#### Logout Flow
1. User clicks logout in navigation/profile menu
2. Session terminated on client and server
3. Redirected to public home page
4. Protected routes become inaccessible

#### Password Reset Flow
1. User clicks "Forgot password" on login page
2. Enters email on reset request page
3. Confirmation message shown regardless of email existence
4. If email exists, reset link sent
5. User clicks link in email
6. Directed to new password creation page
7. Creates new password meeting requirements
8. On success, redirected to login with confirmation message

#### Session Persistence
- Session stored in local storage and/or cookies
- Automatic renewal of session tokens
- Timeout after extended inactivity
- Secure cookie attributes (HTTPOnly, SameSite)

## 2. BACKEND LOGIC

### 2.1 API Endpoint Structure

#### Authentication Endpoints
- **/api/auth/callback**: Handles OAuth callback redirects
- **/api/auth/verify**: Processes email verification tokens
- **/api/auth/session**: Returns current session information
- **/api/auth/profile**: Retrieves/updates user profile information

#### Service Layer
- **`auth.service.ts`**: Abstraction over Supabase Auth for server-side operations
- **`profile.service.ts`**: User profile management operations
- **`session.service.ts`**: Session validation and management

### 2.2 Data Model Extensions

#### User Metadata
```typescript
interface UserMetadata {
  preferredLanguage?: "English" | "Spanish";
  displayName?: string;
  lastActive?: string; // ISO date
  onboardingCompleted?: boolean;
}
```

#### Auth Session Model
```typescript
interface Session {
  userId: string;
  email: string;
  role: "user" | "admin";
  expires: string; // ISO date
  metadata?: UserMetadata;
}
```

### 2.3 Input Validation

#### Schema-based Validation
Using Zod for type-safe validation:

```typescript
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const registrationSchema = loginSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  })
});

const passwordResetSchema = z.object({
  email: z.string().email("Please enter a valid email")
});

const newPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});
```

#### Server-side Validation
- Double-check all client-validated data
- Rate limiting for auth attempts
- IP-based throttling for security
- Captcha integration for sensitive operations

### 2.4 Exception Handling

#### Error Categories
- **Authentication Errors**: Invalid credentials, expired tokens
- **Validation Errors**: Invalid input formats, missing fields
- **Service Errors**: Supabase unavailable, rate limits
- **Unknown Errors**: Unexpected failures requiring logging

#### Error Handling Strategy
- Try/catch blocks around Supabase operations
- Standardized error response format
- Logging to server logs for unexpected errors
- Friendly user messages with technical details hidden

```typescript
// Example error response structure
interface ErrorResponse {
  message: string;       // User-friendly message
  code?: string;         // Error code for client handling
  validationErrors?: {   // Field-specific validation errors
    field: string;
    message: string;
  }[];
  requestId?: string;    // For log correlation
}
```

### 2.5 Server-side Rendering Updates

#### Protected Route Configuration
```typescript
// astro.config.mjs
export default defineConfig({
  // ... other config
  auth: {
    protectedRoutes: ['/dashboard/**', '/profile/**', '/settings/**'],
    publicRoutes: ['/', '/auth/**', '/about', '/blog'],
    loginRoute: '/auth/login'
  }
});
```

#### Middleware for Auth Checking
```typescript
// src/middleware/index.ts
export const onRequest = async (context, next) => {
  const { request, redirect } = context;
  const url = new URL(request.url);
  
  // Check if path requires authentication
  const requiresAuth = isProtectedRoute(url.pathname);
  const session = await getSessionFromRequest(request);
  
  if (requiresAuth && !session) {
    return redirect('/auth/login?redirectTo=' + encodeURIComponent(url.pathname));
  }
  
  // Add session to locals for all routes
  context.locals.session = session;
  
  return next();
};
```

#### Conditional Rendering
```typescript
// In Astro pages
const { session } = Astro.locals;

// Render different content based on auth state
{session ? <AuthenticatedView user={session.user} /> : <GuestView />}
```

## 3. AUTHENTICATION SYSTEM

### 3.1 Supabase Auth Integration

#### Client-side Integration
```typescript
// src/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
```

#### Server-side Integration
```typescript
// src/lib/supabase/server.ts
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

export const createServerSupabaseClient = (cookies) => {
  return createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (key) => cookies.get(key)?.value,
        set: (key, value, options) => cookies.set(key, value, options),
        remove: (key, options) => cookies.delete(key, options),
      },
    }
  );
};
```

#### Authentication Context
```typescript
// src/components/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabaseClient } from '../lib/supabase/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const fetchSession = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };
    
    fetchSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  // Auth methods for components to use
  const login = (email, password) => 
    supabaseClient.auth.signInWithPassword({ email, password });
  
  const register = (email, password) => 
    supabaseClient.auth.signUp({ email, password });
  
  const loginWithGoogle = () => 
    supabaseClient.auth.signInWithOAuth({ provider: 'google' });
  
  const logout = () => supabaseClient.auth.signOut();
  
  const resetPassword = (email) => 
    supabaseClient.auth.resetPasswordForEmail(email);
  
  const updatePassword = (newPassword) => 
    supabaseClient.auth.updateUser({ password: newPassword });
  
  const value = {
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    resetPassword,
    updatePassword,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### 3.2 Supported Authentication Functionality

#### Registration
```typescript
// In RegisterForm.tsx
const { register, loginWithGoogle } = useAuth();

const handleEmailRegister = async (data) => {
  setLoading(true);
  try {
    const { error } = await register(data.email, data.password);
    if (error) throw error;
    // Show success message and verification instructions
    setSuccessMessage('Registration successful! Please check your email for verification.');
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};

const handleGoogleRegister = async () => {
  try {
    const { error } = await loginWithGoogle();
    if (error) throw error;
  } catch (error) {
    setError(error.message);
  }
};
```

#### Login
```typescript
// In LoginForm.tsx
const { login, loginWithGoogle } = useAuth();

const handleEmailLogin = async (data) => {
  setLoading(true);
  try {
    const { error } = await login(data.email, data.password);
    if (error) throw error;
    // Redirect to dashboard or protected area
    router.navigate('/dashboard');
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};

const handleGoogleLogin = async () => {
  try {
    const { error } = await loginWithGoogle();
    if (error) throw error;
  } catch (error) {
    setError(error.message);
  }
};
```

#### Logout
```typescript
// In navigation component
const { logout } = useAuth();

const handleLogout = async () => {
  try {
    await logout();
    // Redirect to home page
    window.location.href = '/';
  } catch (error) {
    console.error('Error logging out:', error);
  }
};
```

#### Password Recovery
```typescript
// In PasswordResetForm.tsx
const { resetPassword } = useAuth();

const handleResetRequest = async (data) => {
  setLoading(true);
  try {
    const { error } = await resetPassword(data.email);
    if (error) throw error;
    // Show success message
    setSuccessMessage('If an account exists with this email, you will receive password reset instructions.');
  } catch (error) {
    // Show generic message to prevent email enumeration
    setSuccessMessage('If an account exists with this email, you will receive password reset instructions.');
  } finally {
    setLoading(false);
  }
};

// In NewPasswordForm.tsx
const { updatePassword } = useAuth();

const handlePasswordUpdate = async (data) => {
  setLoading(true);
  try {
    const { error } = await updatePassword(data.password);
    if (error) throw error;
    // Show success message and redirect to login
    setSuccessMessage('Password updated successfully!');
    setTimeout(() => window.location.href = '/auth/login', 2000);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

#### Email Verification and Feedback
```typescript
// In VerifyEmail.astro
const token = Astro.url.searchParams.get('token');
const type = Astro.url.searchParams.get('type');

let verificationStatus = 'pending';
let message = 'Verifying your email...';

if (token && type === 'email_verification') {
  try {
    const supabase = createServerSupabaseClient(Astro.cookies);
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email',
    });
    
    if (error) {
      verificationStatus = 'error';
      message = 'There was an error verifying your email. The link may have expired.';
    } else {
      verificationStatus = 'success';
      message = 'Your email has been verified successfully!';
    }
  } catch (error) {
    verificationStatus = 'error';
    message = 'An unexpected error occurred during verification.';
  }
}
```

## 4. SECURITY CONSIDERATIONS

### 4.1 Protection Against Common Threats

- **CSRF Protection**: Implemented via Supabase's token-based authentication
- **XSS Mitigation**: Content Security Policy headers and proper input sanitization
- **Rate Limiting**: Implementation on sensitive auth endpoints
- **Brute Force Protection**: Account lockouts after multiple failed attempts
- **Session Fixation**: Session regeneration on authentication state changes
- **Secure Cookies**: HTTPOnly, Secure, SameSite attributes

### 4.2 Environment Configuration

```
# .env.example
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Server-side only!
AUTH_REDIRECT_URI=http://localhost:4321/auth/callback
```

## 5. IMPLEMENTATION ROADMAP

### Phase 1: Core Authentication
- Set up Supabase Auth configuration
- Implement basic login/registration forms
- Create auth context provider
- Implement protected routes in middleware

### Phase 2: Extended Functionality
- Add password reset flow
- Implement email verification
- Add OAuth providers (Google)
- Create user profile management

### Phase 3: Refinement and Security
- Add comprehensive form validation
- Implement proper error handling
- Set up security headers and CSP
- Add rate limiting and brute force protection

### Phase 4: Testing and Optimization
- Test all authentication flows
- Optimize performance
- Security audit
- Documentation

## 6. CONCLUSION

This authentication architecture leverages Supabase Auth integrated with Astro to provide a secure, user-friendly authentication system that meets all requirements specified in the PRD. The implementation follows best practices for authentication security while maintaining a clean separation of concerns between UI components, business logic, and authentication services. 