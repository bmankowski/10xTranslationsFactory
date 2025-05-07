# API Endpoint Implementation Plan: Remove Learning Language

## 1. Endpoint Overview
Removes a language from the currently authenticated user's learning list.

## 2. Request Details
- HTTP Method: DELETE
- URL Pattern: `/api/users/me/learning-languages/{languageId}`
- Parameters:
  - languageId (path parameter): UUID of the language to remove
- Request Body: None
- Authentication: Required (JWT token in Authorization header)

## 3. Used Types
- No request/response DTOs needed
- Path parameter: languageId (string)

## 4. Response Details
- Status Code: 204 No Content
- Response Body: None
- Error Codes:
  - 401 Unauthorized: Invalid or missing authentication token
  - 404 Not Found: Language not in learning list
  - 500 Internal Server Error: Server-side error

## 5. Data Flow
1. Extract user ID from JWT token
2. Validate languageId format
3. Check if language exists in user's learning list
4. Delete learning language record
5. Return success response

## 6. Security Considerations
- JWT token validation
- Row Level Security (RLS) ensures users can only remove from their own learning list
- Validate languageId format
- Rate limiting to prevent abuse

## 7. Error Handling
- 401: Invalid/missing token
  - Log: "Authentication failed: Invalid token"
  - Response: "Unauthorized: Invalid authentication token"
- 404: Language not found
  - Log: "Not Found: Language not in learning list"
  - Response: "Not Found: Language not in learning list"
- 500: Database error
  - Log: "Database error: {error details}"
  - Response: "Internal server error"

## 8. Performance Considerations
- Single delete operation
- Index on user_id and language_id
- Clear learning languages cache after update
- Use unique constraint for user_id + language_id

## 9. Implementation Steps
1. Create Zod schema for path parameter validation
   ```typescript
   const languageIdSchema = z.string().uuid();
   ```

2. Add method to UserLearningLanguagesService
   ```typescript
   class UserLearningLanguagesService {
     async removeLearningLanguage(
       userId: string, 
       languageId: string
     ): Promise<void> {
       // Implementation
     }
   }
   ```

3. Implement endpoint handler
   ```typescript
   export const DELETE = async ({ params, locals }: APIContext) => {
     try {
       const languageId = languageIdSchema.parse(params.languageId);
       await userLearningLanguagesService.removeLearningLanguage(
         locals.user.id, 
         languageId
       );
       return new Response(null, { status: 204 });
     } catch (error) {
       // Error handling
     }
   };
   ```

4. Add existence check
   ```typescript
   const checkExists = async (
     userId: string, 
     languageId: string
   ): Promise<void> => {
     const exists = await userLearningLanguagesService.exists(userId, languageId);
     if (!exists) {
       throw new Error('Language not in learning list');
     }
   };
   ```

5. Add cache invalidation
   ```typescript
   const invalidateCache = async (userId: string) => {
     await cache.delete(`user_learning_languages:${userId}`);
   };
   ```

6. Add unit tests
   ```typescript
   describe('DELETE /api/users/me/learning-languages/{languageId}', () => {
     it('should remove learning language', async () => {
       // Test implementation
     });
     
     it('should return 404 if language not found', async () => {
       // Test implementation
     });
     
     it('should reject invalid language ID', async () => {
       // Test implementation
     });
   });
   ```

7. Add integration tests
   ```typescript
   describe('Remove Learning Language Integration', () => {
     it('should remove language from learning list', async () => {
       // Test implementation
     });
   });
   ```

8. Add transaction support
   ```typescript
   const removeWithTransaction = async (
     userId: string, 
     languageId: string
   ) => {
     return await supabase.rpc('remove_learning_language', {
       p_user_id: userId,
       p_language_id: languageId
     });
   };
   ```

9. Add cleanup for related data
   ```typescript
   const cleanupRelatedData = async (
     userId: string, 
     languageId: string
   ) => {
     // Remove related statistics, preferences if needed
     await userStatisticsService.removeLanguageStats(userId, languageId);
   };
   ``` 