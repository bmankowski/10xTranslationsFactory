# API Endpoint Implementation Plan: Create/Update User Preferences

## 1. Endpoint Overview
Creates or updates the preference settings of the currently authenticated user, including their primary and UI language preferences.

## 2. Request Details
- HTTP Method: PUT
- URL Pattern: `/api/users/me/preferences`
- Parameters: None
- Request Body: UpdateUserPreferencesCommand
- Authentication: Required (JWT token in Authorization header)

## 3. Used Types
- `UpdateUserPreferencesCommand` from types.ts:
  ```typescript
  interface UpdateUserPreferencesCommand {
    primary_language_id: string;
    ui_language_id: string;
  }
  ```
- `UserPreferencesDTO` from types.ts (for response)

## 4. Response Details
- Status Code: 200 OK
- Response Body: UserPreferencesDTO
- Error Codes:
  - 400 Bad Request: Invalid input data
  - 401 Unauthorized: Invalid or missing authentication token
  - 500 Internal Server Error: Server-side error

## 5. Data Flow
1. Extract user ID from JWT token
2. Validate request body using Zod schema
3. Verify language IDs exist and are active
4. Upsert user preferences in Supabase
5. Map updated record to UserPreferencesDTO
6. Return response

## 6. Security Considerations
- JWT token validation
- Row Level Security (RLS) ensures users can only update their own preferences
- Validate language IDs to prevent unauthorized access
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
- Upsert operation (insert or update)
- Join with languages table required
- Index on user_id (primary key)
- Clear preferences cache after update

## 9. Implementation Steps
1. Create Zod schema for request validation
   ```typescript
   const updatePreferencesSchema = z.object({
     primary_language_id: z.string().uuid(),
     ui_language_id: z.string().uuid()
   });
   ```

2. Add update method to UserPreferencesService
   ```typescript
   class UserPreferencesService {
     async updateUserPreferences(
       userId: string, 
       command: UpdateUserPreferencesCommand
     ): Promise<UserPreferencesDTO> {
       // Implementation
     }
   }
   ```

3. Implement endpoint handler
   ```typescript
   export const PUT = async ({ request, locals }: APIContext) => {
     try {
       const body = await request.json();
       const command = updatePreferencesSchema.parse(body);
       const preferences = await userPreferencesService.updateUserPreferences(
         locals.user.id, 
         command
       );
       return new Response(JSON.stringify(preferences), {
         status: 200,
         headers: { 'Content-Type': 'application/json' }
       });
     } catch (error) {
       // Error handling
     }
   };
   ```

4. Add language validation
   ```typescript
   const validateLanguages = async (
     primaryId: string, 
     uiId: string
   ): Promise<void> => {
     const languages = await languageService.getLanguagesByIds([primaryId, uiId]);
     if (languages.length !== 2) {
       throw new Error('Invalid language IDs');
     }
   };
   ```

5. Add cache invalidation
   ```typescript
   const invalidateCache = async (userId: string) => {
     await cache.delete(`user_preferences:${userId}`);
   };
   ```

6. Add unit tests
   ```typescript
   describe('PUT /api/users/me/preferences', () => {
     it('should create new preferences', async () => {
       // Test implementation
     });
     
     it('should update existing preferences', async () => {
       // Test implementation
     });
     
     it('should reject invalid language IDs', async () => {
       // Test implementation
     });
   });
   ```

7. Add integration tests
   ```typescript
   describe('User Preferences Update Integration', () => {
     it('should update preferences with valid languages', async () => {
       // Test implementation
     });
   });
   ```

8. Add transaction support
   ```typescript
   const updateWithTransaction = async (
     userId: string, 
     command: UpdateUserPreferencesCommand
   ) => {
     return await supabase.rpc('update_user_preferences', {
       p_user_id: userId,
       p_primary_language_id: command.primary_language_id,
       p_ui_language_id: command.ui_language_id
     });
   };
   ``` 