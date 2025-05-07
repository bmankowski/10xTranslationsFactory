# API Endpoint Implementation Plan: Get User Preferences

## 1. Endpoint Overview
Retrieves the preference settings of the currently authenticated user, including their primary and UI language preferences.

## 2. Request Details
- HTTP Method: GET
- URL Pattern: `/api/users/me/preferences`
- Parameters: None
- Request Body: None
- Authentication: Required (JWT token in Authorization header)

## 3. Used Types
- `UserPreferencesDTO` from types.ts:
  ```typescript
  interface UserPreferencesDTO {
    user_id: string;
    primary_language: LanguageSummaryDTO;
    ui_language: LanguageSummaryDTO;
    updated_at: string;
  }
  ```

## 4. Response Details
- Status Code: 200 OK
- Response Body: UserPreferencesDTO
- Error Codes:
  - 401 Unauthorized: Invalid or missing authentication token
  - 404 Not Found: User preferences not found
  - 500 Internal Server Error: Server-side error

## 5. Data Flow
1. Extract user ID from JWT token
2. Query Supabase user_preferences table with language joins
3. Map database result to UserPreferencesDTO
4. Return response

## 6. Security Considerations
- JWT token validation
- Row Level Security (RLS) ensures users can only access their own preferences
- Rate limiting to prevent abuse

## 7. Error Handling
- 401: Invalid/missing token
  - Log: "Authentication failed: Invalid token"
  - Response: "Unauthorized: Invalid authentication token"
- 404: Preferences not found
  - Log: "User preferences not found for user: {userId}"
  - Response: "Not Found: User preferences not found"
- 500: Database error
  - Log: "Database error: {error details}"
  - Response: "Internal server error"

## 8. Performance Considerations
- Join with languages table required
- Index on user_id (primary key)
- Consider caching preferences if frequently accessed
- Optimize language table joins

## 9. Implementation Steps
1. Create Zod schema for response validation
   ```typescript
   const userPreferencesSchema = z.object({
     user_id: z.string().uuid(),
     primary_language: languageSummarySchema,
     ui_language: languageSummarySchema,
     updated_at: z.string().datetime()
   });
   ```

2. Create UserPreferencesService class
   ```typescript
   class UserPreferencesService {
     async getUserPreferences(userId: string): Promise<UserPreferencesDTO> {
       // Implementation
     }
   }
   ```

3. Implement endpoint handler
   ```typescript
   export const GET = async ({ locals }: APIContext) => {
     try {
       const preferences = await userPreferencesService.getUserPreferences(locals.user.id);
       return new Response(JSON.stringify(preferences), {
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
   const cacheKey = `user_preferences:${userId}`;
   const cachedPreferences = await cache.get(cacheKey);
   if (cachedPreferences) {
     return cachedPreferences;
   }
   ```

5. Add unit tests
   ```typescript
   describe('GET /api/users/me/preferences', () => {
     it('should return user preferences', async () => {
       // Test implementation
     });
     
     it('should return 404 if preferences not found', async () => {
       // Test implementation
     });
   });
   ```

6. Add integration tests
   ```typescript
   describe('User Preferences Integration', () => {
     it('should retrieve user preferences with language details', async () => {
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
     logger.warn(`Slow preferences query: ${duration}ms`);
   }
   ``` 