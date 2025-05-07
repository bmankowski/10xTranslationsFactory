# API Endpoint Implementation Plan: Get User Settings

## 1. Endpoint Overview
Retrieves a user's application settings, including preferences for notifications, language display, and other user-specific configurations.

## 2. Request Details
- HTTP Method: GET
- URL Pattern: `/api/users/me/settings`
- Parameters: None
- Request Body: None
- Authentication: Required (JWT token in Authorization header)

## 3. Used Types
- `UserSettingsDTO` from types.ts:
  ```typescript
  interface UserSettingsDTO {
    id: string;
    user_id: string;
    notifications: {
      email: boolean;
      push: boolean;
      daily_reminder: boolean;
      weekly_summary: boolean;
      achievement_alerts: boolean;
    };
    display: {
      language: 'native' | 'learning' | 'both';
      theme: 'light' | 'dark' | 'system';
      font_size: 'small' | 'medium' | 'large';
    };
    learning: {
      daily_goal_minutes: number;
      default_language_id: string;
      show_hints: boolean;
      auto_play_audio: boolean;
    };
    privacy: {
      show_progress: boolean;
      show_achievements: boolean;
      allow_friend_requests: boolean;
    };
    created_at: string;
    updated_at: string;
  }
  ```
- Response type: `UserSettingsDTO`

## 4. Response Details
- Status Code: 200 OK
- Response Body: UserSettingsDTO
- Error Codes:
  - 401 Unauthorized: Invalid or missing authentication token
  - 500 Internal Server Error: Server-side error

## 5. Data Flow
1. Extract user ID from JWT token
2. Query Supabase for user's settings
3. If settings don't exist, create default settings
4. Map result to UserSettingsDTO
5. Return response

## 6. Security Considerations
- JWT token validation
- Row Level Security (RLS) ensures users can only access their own settings
- Rate limiting to prevent abuse
- Default settings fallback

## 7. Error Handling
- 401: Invalid/missing token
  - Log: "Authentication failed: Invalid token"
  - Response: "Unauthorized: Invalid authentication token"
- 500: Database error
  - Log: "Database error: {error details}"
  - Response: "Internal server error"

## 8. Performance Considerations
- Indexes on user_id
- Cache settings data
- Default settings in memory
- Optimize settings lookup

## 9. Implementation Steps
1. Add method to UserService
   ```typescript
   class UserService {
     async getUserSettings(
       userId: string
     ): Promise<UserSettingsDTO> {
       // Implementation
     }
   }
   ```

2. Implement endpoint handler
   ```typescript
   export const GET = async ({ locals }: APIContext) => {
     try {
       const settings = await userService.getUserSettings(locals.user.id);
       return new Response(JSON.stringify(settings), {
         status: 200,
         headers: { 'Content-Type': 'application/json' }
       });
     } catch (error) {
       // Error handling
     }
   };
   ```

3. Add default settings
   ```typescript
   const DEFAULT_SETTINGS: Omit<UserSettingsDTO, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
     notifications: {
       email: true,
       push: true,
       daily_reminder: true,
       weekly_summary: true,
       achievement_alerts: true
     },
     display: {
       language: 'both',
       theme: 'system',
       font_size: 'medium'
     },
     learning: {
       daily_goal_minutes: 30,
       default_language_id: null,
       show_hints: true,
       auto_play_audio: true
     },
     privacy: {
       show_progress: true,
       show_achievements: true,
       allow_friend_requests: true
     }
   };
   ```

4. Add settings retrieval logic
   ```typescript
   const getSettings = async (
     userId: string
   ): Promise<UserSettingsDTO> => {
     const { data, error } = await supabase
       .from('user_settings')
       .select('*')
       .eq('user_id', userId)
       .single();
     
     if (error) {
       if (error.code === 'PGRST116') {
         // Settings don't exist, create default
         return createDefaultSettings(userId);
       }
       throw error;
     }
     
     return data;
   };
   ```

5. Add default settings creation
   ```typescript
   const createDefaultSettings = async (
     userId: string
   ): Promise<UserSettingsDTO> => {
     const { data, error } = await supabase
       .from('user_settings')
       .insert({
         user_id: userId,
         ...DEFAULT_SETTINGS
       })
       .select()
       .single();
     
     if (error) throw error;
     return data;
   };
   ```

6. Add caching strategy
   ```typescript
   const getCachedSettings = async (userId: string) => {
     const cacheKey = `settings:${userId}`;
     const cached = await cache.get(cacheKey);
     if (cached) {
       return cached;
     }
     const settings = await userService.getUserSettings(userId);
     await cache.set(cacheKey, settings, 3600); // Cache for 1 hour
     return settings;
   };
   ```

7. Add unit tests
   ```typescript
   describe('GET /api/users/me/settings', () => {
     it('should return user settings', async () => {
       // Test implementation
     });
     
     it('should create default settings if none exist', async () => {
       // Test implementation
     });
     
     it('should handle database errors', async () => {
       // Test implementation
     });
   });
   ```

8. Add integration tests
   ```typescript
   describe('User Settings Integration', () => {
     it('should retrieve and cache settings', async () => {
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
     logger.warn(`Slow settings retrieval: ${duration}ms`);
   }
   ```

10. Add settings validation
    ```typescript
    const validateSettings = (settings: UserSettingsDTO): void => {
      // Validate notification settings
      Object.values(settings.notifications).forEach(value => {
        if (typeof value !== 'boolean') {
          throw new Error('Invalid notification settings');
        }
      });
      
      // Validate display settings
      if (!['native', 'learning', 'both'].includes(settings.display.language)) {
        throw new Error('Invalid language display setting');
      }
      if (!['light', 'dark', 'system'].includes(settings.display.theme)) {
        throw new Error('Invalid theme setting');
      }
      if (!['small', 'medium', 'large'].includes(settings.display.font_size)) {
        throw new Error('Invalid font size setting');
      }
      
      // Validate learning settings
      if (settings.learning.daily_goal_minutes < 0) {
        throw new Error('Invalid daily goal minutes');
      }
      if (typeof settings.learning.show_hints !== 'boolean') {
        throw new Error('Invalid show hints setting');
      }
      if (typeof settings.learning.auto_play_audio !== 'boolean') {
        throw new Error('Invalid auto play audio setting');
      }
      
      // Validate privacy settings
      Object.values(settings.privacy).forEach(value => {
        if (typeof value !== 'boolean') {
          throw new Error('Invalid privacy settings');
        }
      });
    };
    ```

11. Add cache invalidation
    ```typescript
    const invalidateSettingsCache = async (userId: string) => {
      const cacheKey = `settings:${userId}`;
      await cache.del(cacheKey);
    };
    ``` 