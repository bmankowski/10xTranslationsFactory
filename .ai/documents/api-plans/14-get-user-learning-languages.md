# API Endpoint Implementation Plan: Get User Learning Languages

## 1. Endpoint Overview
Retrieves the list of languages that the currently authenticated user is learning.

## 2. Request Details
- HTTP Method: GET
- URL Pattern: `/api/users/me/learning-languages`
- Parameters: None
- Request Body: None
- Authentication: Required (JWT token in Authorization header)

## 3. Used Types
- `UserLearningLanguageDTO` from types.ts:
  ```typescript
  interface UserLearningLanguageDTO {
    id: string;
    user_id: string;
    language: LanguageSummaryDTO;
    created_at: string;
  }
  ```
- `ListDTO<UserLearningLanguageDTO>` for response

## 4. Response Details
- Status Code: 200 OK
- Response Body: ListDTO<UserLearningLanguageDTO>
- Error Codes:
  - 401 Unauthorized: Invalid or missing authentication token
  - 500 Internal Server Error: Server-side error

## 5. Data Flow
1. Extract user ID from JWT token
2. Query Supabase user_learning_languages table with language joins
3. Map database results to UserLearningLanguageDTO array
4. Return response

## 6. Security Considerations
- JWT token validation
- Row Level Security (RLS) ensures users can only access their own learning languages
- Rate limiting to prevent abuse

## 7. Error Handling
- 401: Invalid/missing token
  - Log: "Authentication failed: Invalid token"
  - Response: "Unauthorized: Invalid authentication token"
- 500: Database error
  - Log: "Database error: {error details}"
  - Response: "Internal server error"

## 8. Performance Considerations
- Join with languages table required
- Index on user_id
- Consider caching if frequently accessed
- Optimize language table joins

## 9. Implementation Steps
1. Create Zod schema for response validation
   ```typescript
   const learningLanguagesSchema = z.object({
     items: z.array(z.object({
       id: z.string().uuid(),
       user_id: z.string().uuid(),
       language: languageSummarySchema,
       created_at: z.string().datetime()
     }))
   });
   ```

2. Create UserLearningLanguagesService class
   ```typescript
   class UserLearningLanguagesService {
     async getUserLearningLanguages(userId: string): Promise<UserLearningLanguageDTO[]> {
       // Implementation
     }
   }
   ```

3. Implement endpoint handler
   ```typescript
   export const GET = async ({ locals }: APIContext) => {
     try {
       const languages = await userLearningLanguagesService.getUserLearningLanguages(
         locals.user.id
       );
       return new Response(JSON.stringify({ items: languages }), {
         status: 200,
         headers: { 'Content-Type': 'application/json' }
       });
     } catch (error) {
       // Error handling
     }
   };
   ```

4. Add caching strategy
   ```typescript
   const cacheKey = `user_learning_languages:${userId}`;
   const cachedLanguages = await cache.get(cacheKey);
   if (cachedLanguages) {
     return cachedLanguages;
   }
   ```

5. Add unit tests
   ```typescript
   describe('GET /api/users/me/learning-languages', () => {
     it('should return user learning languages', async () => {
       // Test implementation
     });
     
     it('should return empty array if no languages', async () => {
       // Test implementation
     });
   });
   ```

6. Add integration tests
   ```typescript
   describe('User Learning Languages Integration', () => {
     it('should retrieve learning languages with details', async () => {
       // Test implementation
     });
   });
   ```

7. Add performance monitoring
   ```typescript
   const startTime = performance.now();
   // ... operation ...
   const duration = performance.now() - startTime;
   if (duration > 100) {
     logger.warn(`Slow learning languages query: ${duration}ms`);
   }
   ```

8. Add sorting
   ```typescript
   const sortLanguages = (languages: UserLearningLanguageDTO[]) => {
     return languages.sort((a, b) => 
       a.language.name.localeCompare(b.language.name)
     );
   };
   ``` 