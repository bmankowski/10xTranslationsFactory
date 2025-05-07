# API Endpoint Implementation Plan: Update User Settings

## 1. Endpoint Overview
Updates a user's application settings, allowing modification of notification preferences, display options, learning preferences, and privacy settings.

## 2. Request Details
- HTTP Method: PATCH
- URL Pattern: `/api/users/me/settings`
- Parameters: None
- Request Body: UpdateUserSettingsCommand
  ```typescript
  interface UpdateUserSettingsCommand {
    notifications?: {
      email?: boolean;
      push?: boolean;
      daily_reminder?: boolean;
      weekly_summary?: boolean;
      achievement_alerts?: boolean;
    };
    display?: {
      language?: 'native' | 'learning' | 'both';
      theme?: 'light' | 'dark' | 'system';
      font_size?: 'small' | 'medium' | 'large';
    };
    learning?: {
      daily_goal_minutes?: number;
      default_language_id?: string;
      show_hints?: boolean;
      auto_play_audio?: boolean;
    };
    privacy?: {
      show_progress?: boolean;
      show_achievements?: boolean;
      allow_friend_requests?: boolean;
    };
  }
  ```
- Authentication: Required (JWT token in Authorization header)

## 3. Used Types
- `UserSettingsDTO` from types.ts (same as Get User Settings)
- Response type: `UserSettingsDTO`

## 4. Response Details
- Status Code: 200 OK
- Response Body: UserSettingsDTO
- Error Codes:
  - 400 Bad Request: Invalid input data
  - 401 Unauthorized: Invalid or missing authentication token
  - 404 Not Found: Settings not found
  - 500 Internal Server Error: Server-side error

## 5. Data Flow
1. Extract user ID from JWT token
2. Validate request body using Zod schema
3. Verify settings exist
4. Update settings record in Supabase
5. Map result to UserSettingsDTO
6. Return response

## 6. Security Considerations
- JWT token validation
- Row Level Security (RLS) ensures users can only update their own settings
- Input validation for all fields
- Rate limiting to prevent abuse
- Partial updates allowed

## 7. Error Handling
- 400: Invalid input
  - Log: "Validation error: {error details}"
  - Response: "Bad Request: {error message}"
- 401: Invalid/missing token
  - Log: "Authentication failed: Invalid token"
  - Response: "Unauthorized: Invalid authentication token"
- 404: Settings not found
  - Log: "Not found: Settings for user {userId}"
  - Response: "Not Found: Settings not found"
- 500: Database error
  - Log: "Database error: {error details}"
  - Response: "Internal server error"

## 8. Performance Considerations
- Indexes on user_id
- Cache invalidation on settings update
- Optimize settings update
- Use partial updates

## 9. Implementation Steps
1. Create Zod schema for validation
   ```typescript
   const updateUserSettingsSchema = z.object({
     notifications: z.object({
       email: z.boolean().optional(),
       push: z.boolean().optional(),
       daily_reminder: z.boolean().optional(),
       weekly_summary: z.boolean().optional(),
       achievement_alerts: z.boolean().optional()
     }).optional(),
     display: z.object({
       language: z.enum(['native', 'learning', 'both']).optional(),
       theme: z.enum(['light', 'dark', 'system']).optional(),
       font_size: z.enum(['small', 'medium', 'large']).optional()
     }).optional(),
     learning: z.object({
       daily_goal_minutes: z.number().min(0).optional(),
       default_language_id: z.string().uuid().optional(),
       show_hints: z.boolean().optional(),
       auto_play_audio: z.boolean().optional()
     }).optional(),
     privacy: z.object({
       show_progress: z.boolean().optional(),
       show_achievements: z.boolean().optional(),
       allow_friend_requests: z.boolean().optional()
     }).optional()
   });
   ```

2. Add method to UserService
   ```typescript
   class UserService {
     async updateUserSettings(
       userId: string,
       command: UpdateUserSettingsCommand
     ): Promise<UserSettingsDTO> {
       // Implementation
     }
   }
   ```

3. Implement endpoint handler
   ```typescript
   export const PATCH = async ({ request, locals }: APIContext) => {
     try {
       const body = await request.json();
       const validatedData = updateUserSettingsSchema.parse(body);
       const settings = await userService.updateUserSettings(
         locals.user.id,
         validatedData
       );
       return new Response(JSON.stringify(settings), {
         status: 200,
         headers: { 'Content-Type': 'application/json' }
       });
     } catch (error) {
       // Error handling
     }
   };
   ```

4. Add settings verification
   ```typescript
   const verifySettingsExist = async (
     userId: string
   ): Promise<void> => {
     const { data, error } = await supabase
       .from('user_settings')
       .select('id')
       .eq('user_id', userId)
       .single();
     
     if (error || !data) {
       throw new Error('Settings not found');
     }
   };
   ```

5. Add settings update logic
   ```typescript
   const updateSettings = async (
     userId: string,
     command: UpdateUserSettingsCommand
   ): Promise<UserSettingsDTO> => {
     const updateData: Partial<UserSettingsDTO> = {};
     
     if (command.notifications) {
       updateData.notifications = command.notifications;
     }
     if (command.display) {
       updateData.display = command.display;
     }
     if (command.learning) {
       updateData.learning = command.learning;
     }
     if (command.privacy) {
       updateData.privacy = command.privacy;
     }
     
     const { data, error } = await supabase
       .from('user_settings')
       .update(updateData)
       .eq('user_id', userId)
       .select()
       .single();
     
     if (error) throw error;
     return data;
   };
   ```

6. Add cache invalidation
   ```typescript
   const invalidateSettingsCache = async (userId: string) => {
     const cacheKey = `settings:${userId}`;
     await cache.del(cacheKey);
   };
   ```

7. Add unit tests
   ```typescript
   describe('PATCH /api/users/me/settings', () => {
     it('should update user settings', async () => {
       // Test implementation
     });
     
     it('should validate input data', async () => {
       // Test implementation
     });
     
     it('should handle non-existent settings', async () => {
       // Test implementation
     });
   });
   ```

8. Add integration tests
   ```typescript
   describe('User Settings Update Integration', () => {
     it('should update and invalidate cache', async () => {
       // Test implementation
     });
   });
   ```

9. Add performance monitoring
   ```typescript
   const startTime = performance.now();
   // ... operation ...
   const duration = performance.now() - startTime;
   if (duration > 1000) {
     logger.warn(`Slow settings update: ${duration}ms`);
   }
   ```

10. Add settings validation
    ```typescript
    const validateUpdatedSettings = (
      currentSettings: UserSettingsDTO,
      updates: UpdateUserSettingsCommand
    ): void => {
      // Validate notification settings
      if (updates.notifications) {
        Object.entries(updates.notifications).forEach(([key, value]) => {
          if (typeof value !== 'boolean') {
            throw new Error(`Invalid notification setting: ${key}`);
          }
        });
      }
      
      // Validate display settings
      if (updates.display) {
        if (updates.display.language && 
            !['native', 'learning', 'both'].includes(updates.display.language)) {
          throw new Error('Invalid language display setting');
        }
        if (updates.display.theme && 
            !['light', 'dark', 'system'].includes(updates.display.theme)) {
          throw new Error('Invalid theme setting');
        }
        if (updates.display.font_size && 
            !['small', 'medium', 'large'].includes(updates.display.font_size)) {
          throw new Error('Invalid font size setting');
        }
      }
      
      // Validate learning settings
      if (updates.learning) {
        if (updates.learning.daily_goal_minutes !== undefined && 
            updates.learning.daily_goal_minutes < 0) {
          throw new Error('Invalid daily goal minutes');
        }
        if (updates.learning.show_hints !== undefined && 
            typeof updates.learning.show_hints !== 'boolean') {
          throw new Error('Invalid show hints setting');
        }
        if (updates.learning.auto_play_audio !== undefined && 
            typeof updates.learning.auto_play_audio !== 'boolean') {
          throw new Error('Invalid auto play audio setting');
        }
      }
      
      // Validate privacy settings
      if (updates.privacy) {
        Object.entries(updates.privacy).forEach(([key, value]) => {
          if (typeof value !== 'boolean') {
            throw new Error(`Invalid privacy setting: ${key}`);
          }
        });
      }
    };
    ```

11. Add language verification
    ```typescript
    const verifyLanguage = async (languageId: string): Promise<void> => {
      if (!languageId) return;
      
      const { data, error } = await supabase
        .from('languages')
        .select('id')
        .eq('id', languageId)
        .single();
      
      if (error || !data) {
        throw new Error('Language not found');
      }
    };
    ``` 