# API Endpoint Implementation Plan: Get User Achievements

## 1. Endpoint Overview
Retrieves a user's unlocked achievements and progress towards locked achievements.

## 2. Request Details
- HTTP Method: GET
- URL Pattern: `/api/users/me/achievements`
- Parameters: None
- Request Body: None
- Authentication: Required (JWT token in Authorization header)

## 3. Used Types
- `AchievementDTO` from types.ts:
  ```typescript
  interface AchievementDTO {
    id: string;
    name: string;
    description: string;
    category: 'streak' | 'texts' | 'questions' | 'languages' | 'special';
    requirement: number;
    icon_url: string;
    unlocked_at?: string;
    progress?: number;
  }
  ```
- Response type: `ListDTO<AchievementDTO>`

## 4. Response Details
- Status Code: 200 OK
- Response Body: ListDTO<AchievementDTO>
- Error Codes:
  - 401 Unauthorized: Invalid or missing authentication token
  - 500 Internal Server Error: Server-side error

## 5. Data Flow
1. Extract user ID from JWT token
2. Query Supabase for all achievements
3. Query user's unlocked achievements
4. Calculate progress for locked achievements
5. Map results to AchievementDTO array
6. Return response

## 6. Security Considerations
- JWT token validation
- Row Level Security (RLS) ensures users can only access their own achievements
- Rate limiting to prevent abuse
- Achievement progress validation

## 7. Error Handling
- 401: Invalid/missing token
  - Log: "Authentication failed: Invalid token"
  - Response: "Unauthorized: Invalid authentication token"
- 500: Database error
  - Log: "Database error: {error details}"
  - Response: "Internal server error"

## 8. Performance Considerations
- Indexes on user_id and achievement_id
- Cache achievements data
- Optimize progress calculations
- Consider pagination for large achievement sets

## 9. Implementation Steps
1. Add method to UserService
   ```typescript
   class UserService {
     async getUserAchievements(
       userId: string
     ): Promise<AchievementDTO[]> {
       // Implementation
     }
   }
   ```

2. Implement endpoint handler
   ```typescript
   export const GET = async ({ locals }: APIContext) => {
     try {
       const achievements = await userService.getUserAchievements(locals.user.id);
       return new Response(JSON.stringify({ items: achievements }), {
         status: 200,
         headers: { 'Content-Type': 'application/json' }
       });
     } catch (error) {
       // Error handling
     }
   };
   ```

3. Add achievement progress calculation
   ```typescript
   const calculateAchievementProgress = async (
     userId: string,
     achievement: Achievement
   ): Promise<number> => {
     switch (achievement.category) {
       case 'streak':
         return calculateStreakProgress(userId);
       case 'texts':
         return calculateTextsProgress(userId);
       case 'questions':
         return calculateQuestionsProgress(userId);
       case 'languages':
         return calculateLanguagesProgress(userId);
       default:
         return 0;
     }
   };
   ```

4. Add caching strategy
   ```typescript
   const getCachedAchievements = async (userId: string) => {
     const cacheKey = `achievements:${userId}`;
     const cached = await cache.get(cacheKey);
     if (cached) {
       return cached;
     }
     const achievements = await userService.getUserAchievements(userId);
     await cache.set(cacheKey, achievements, 300); // Cache for 5 minutes
     return achievements;
   };
   ```

5. Add progress calculation helpers
   ```typescript
   const calculateStreakProgress = async (userId: string): Promise<number> => {
     const { data: streaks, error } = await supabase
       .from('user_streaks')
       .select('current_streak')
       .eq('user_id', userId)
       .single();
     
     if (error) throw error;
     return streaks?.current_streak || 0;
   };
   
   const calculateTextsProgress = async (userId: string): Promise<number> => {
     const { count, error } = await supabase
       .from('completed_texts')
       .select('*', { count: 'exact' })
       .eq('user_id', userId);
     
     if (error) throw error;
     return count || 0;
   };
   ```

6. Add unit tests
   ```typescript
   describe('GET /api/users/me/achievements', () => {
     it('should return user achievements', async () => {
       // Test implementation
     });
     
     it('should calculate correct progress', async () => {
       // Test implementation
     });
     
     it('should handle no achievements', async () => {
       // Test implementation
     });
   });
   ```

7. Add integration tests
   ```typescript
   describe('User Achievements Integration', () => {
     it('should retrieve and cache achievements', async () => {
       // Test implementation
     });
   });
   ```

8. Add performance monitoring
   ```typescript
   const startTime = performance.now();
   // ... operation ...
   const duration = performance.now() - startTime;
   if (duration > 1000) {
     logger.warn(`Slow achievements retrieval: ${duration}ms`);
   }
   ```

9. Add query optimization
   ```typescript
   const buildAchievementsQuery = (userId: string) => {
     // Build optimized Supabase query with joins
   };
   ```

10. Add cache invalidation
    ```typescript
    const invalidateAchievementsCache = async (userId: string) => {
      const cacheKey = `achievements:${userId}`;
      await cache.del(cacheKey);
    };
    ```

11. Add achievement unlocking check
    ```typescript
    const checkAchievementUnlock = async (
      userId: string,
      achievement: Achievement
    ): Promise<boolean> => {
      const progress = await calculateAchievementProgress(userId, achievement);
      if (progress >= achievement.requirement) {
        await unlockAchievement(userId, achievement.id);
        return true;
      }
      return false;
    };
    ``` 