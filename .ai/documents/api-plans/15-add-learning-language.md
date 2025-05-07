# API Endpoint Implementation Plan: Add Learning Language

## 1. Endpoint Overview
Adds a new language to the currently authenticated user's learning list.

## 2. Request Details
- HTTP Method: POST
- URL Pattern: `/api/users/me/learning-languages`
- Parameters: None
- Request Body: AddUserLearningLanguageCommand
- Authentication: Required (JWT token in Authorization header)

## 3. Used Types
- `AddUserLearningLanguageCommand` from types.ts:
  ```typescript
  interface AddUserLearningLanguageCommand {
    language_id: string;
  }
  ```
- `UserLearningLanguageDTO` from types.ts (for response)

## 4. Response Details
- Status Code: 201 Created
- Response Body: UserLearningLanguageDTO
- Error Codes:
  - 400 Bad Request: Invalid input data
  - 401 Unauthorized: Invalid or missing authentication token
  - 409 Conflict: Language already in learning list
  - 500 Internal Server Error: Server-side error

## 5. Data Flow
1. Extract user ID from JWT token
2. Validate request body using Zod schema
3. Verify language exists and is active
4. Check if language is already in user's learning list
5. Insert new learning language record
6. Map database result to UserLearningLanguageDTO
7. Return response

## 6. Security Considerations
- JWT token validation
- Row Level Security (RLS) ensures users can only add to their own learning list
- Validate language ID to prevent unauthorized access
- Rate limiting to prevent abuse

## 7. Error Handling
- 400: Invalid input
  - Log: "Validation error: {error details}"
  - Response: "Bad Request: {validation error message}"
- 401: Invalid/missing token
  - Log: "Authentication failed: Invalid token"
  - Response: "Unauthorized: Invalid authentication token"
- 409: Language already exists
  - Log: "Conflict: Language already in learning list"
  - Response: "Conflict: Language already in learning list"
- 500: Database error
  - Log: "Database error: {error details}"
  - Response: "Internal server error"

## 8. Performance Considerations
- Check for existing language before insert
- Index on user_id and language_id
- Clear learning languages cache after update
- Use unique constraint for user_id + language_id

## 9. Implementation Steps
1. Create Zod schema for request validation
   ```typescript
   const addLearningLanguageSchema = z.object({
     language_id: z.string().uuid()
   });
   ```

2. Add method to UserLearningLanguagesService
   ```typescript
   class UserLearningLanguagesService {
     async addLearningLanguage(
       userId: string, 
       command: AddUserLearningLanguageCommand
     ): Promise<UserLearningLanguageDTO> {
       // Implementation
     }
   }
   ```

3. Implement endpoint handler
   ```typescript
   export const POST = async ({ request, locals }: APIContext) => {
     try {
       const body = await request.json();
       const command = addLearningLanguageSchema.parse(body);
       const language = await userLearningLanguagesService.addLearningLanguage(
         locals.user.id, 
         command
       );
       return new Response(JSON.stringify(language), {
         status: 201,
         headers: { 'Content-Type': 'application/json' }
       });
     } catch (error) {
       // Error handling
     }
   };
   ```

4. Add language validation
   ```typescript
   const validateLanguage = async (languageId: string): Promise<void> => {
     const language = await languageService.getLanguageById(languageId);
     if (!language || !language.is_active) {
       throw new Error('Invalid or inactive language');
     }
   };
   ```

5. Add duplicate check
   ```typescript
   const checkDuplicate = async (
     userId: string, 
     languageId: string
   ): Promise<void> => {
     const exists = await userLearningLanguagesService.exists(userId, languageId);
     if (exists) {
       throw new Error('Language already in learning list');
     }
   };
   ```

6. Add cache invalidation
   ```typescript
   const invalidateCache = async (userId: string) => {
     await cache.delete(`user_learning_languages:${userId}`);
   };
   ```

7. Add unit tests
   ```typescript
   describe('POST /api/users/me/learning-languages', () => {
     it('should add new learning language', async () => {
       // Test implementation
     });
     
     it('should reject duplicate language', async () => {
       // Test implementation
     });
     
     it('should reject invalid language ID', async () => {
       // Test implementation
     });
   });
   ```

8. Add integration tests
   ```typescript
   describe('Add Learning Language Integration', () => {
     it('should add language to learning list', async () => {
       // Test implementation
     });
   });
   ```

9. Add transaction support
   ```typescript
   const addWithTransaction = async (
     userId: string, 
     languageId: string
   ) => {
     return await supabase.rpc('add_learning_language', {
       p_user_id: userId,
       p_language_id: languageId
     });
   };
   ``` 