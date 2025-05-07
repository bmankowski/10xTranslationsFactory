# API Endpoint Implementation Plan: Update Current User

## 1. Endpoint Overview
Updates the profile information of the currently authenticated user. Currently only allows updating the full_name field.

## 2. Request Details
- HTTP Method: PATCH
- URL Pattern: `/api/users/me`
- Parameters: None
- Request Body: UpdateUserCommand
- Authentication: Required (JWT token in Authorization header)

## 3. Used Types
- `UpdateUserCommand` from types.ts:
  ```typescript
  interface UpdateUserCommand {
    full_name: string;
  }
  ```
- `UserDTO` from types.ts (for response)

## 4. Response Details
- Status Code: 200 OK
- Response Body: UserDTO
- Error Codes:
  - 400 Bad Request: Invalid input data
  - 401 Unauthorized: Invalid or missing authentication token
  - 500 Internal Server Error: Server-side error

## 5. Data Flow
1. Extract user ID from JWT token
2. Validate request body using Zod schema
3. Update user record in Supabase users table
4. Map updated record to UserDTO
5. Return response

## 6. Security Considerations
- JWT token validation
- Row Level Security (RLS) ensures users can only update their own data
- Input sanitization for full_name
- Rate limiting to prevent abuse

## 7. Error Handling
- 400: Invalid input
  - Log: "Validation error: {error details}"
  - Response: "Bad Request: {validation error message}"
- 401: Invalid/missing token
  - Log: "Authentication failed: Invalid token"
  - Response: "Unauthorized: Invalid authentication token"
- 500: Database error
  - Log: "Database error: {error details}"
  - Response: "Internal server error"

## 8. Performance Considerations
- Single database update operation
- No joins required
- Index on user_id (primary key)
- Optimistic locking not required for this simple update

## 9. Implementation Steps
1. Create Zod schema for request validation
   ```typescript
   const updateUserSchema = z.object({
     full_name: z.string().min(1).max(100)
   });
   ```

2. Add update method to UserService
   ```typescript
   class UserService {
     async updateUser(userId: string, command: UpdateUserCommand): Promise<UserDTO> {
       // Implementation
     }
   }
   ```

3. Implement endpoint handler
   ```typescript
   export const PATCH = async ({ request, locals }: APIContext) => {
     try {
       const body = await request.json();
       const command = updateUserSchema.parse(body);
       const user = await userService.updateUser(locals.user.id, command);
       return new Response(JSON.stringify(user), {
         status: 200,
         headers: { 'Content-Type': 'application/json' }
       });
     } catch (error) {
       // Error handling
     }
   };
   ```

4. Add input sanitization
   ```typescript
   const sanitizeInput = (input: string): string => {
     return input.trim().replace(/[<>]/g, '');
   };
   ```

5. Add unit tests
   ```typescript
   describe('PATCH /api/users/me', () => {
     it('should update user full name', async () => {
       // Test implementation
     });
     
     it('should reject invalid input', async () => {
       // Test implementation
     });
   });
   ```

6. Add integration tests
   ```typescript
   describe('User Update Integration', () => {
     it('should update user profile', async () => {
       // Test implementation
     });
   });
   ``` 