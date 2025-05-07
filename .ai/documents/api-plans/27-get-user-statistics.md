# API Endpoint Implementation Plan: Get User Statistics

## 1. Endpoint Overview
Retrieves detailed statistics about a user's learning activities, including daily streaks, time spent, and achievement metrics.

## 2. Request Details
- HTTP Method: GET
- URL Pattern: `/api/users/me/statistics`
- Parameters: None
- Request Body: None
- Authentication: Required (JWT token in Authorization header)

## 3. Used Types
- `UserStatisticsDTO` from types.ts:
  ```typescript
  interface UserStatisticsDTO {
    current_streak: number;
    longest_streak: number;
    total_days_active: number;
    total_time_spent_minutes: number;
    average_daily_time_minutes: number;
    achievements: {
      id: string;
      name: string;
      description: string;
      unlocked_at: string;
    }[];
    daily_activity: {
      date: string;
      texts_completed: number;
      questions_answered: number;
      correct_answers: number;
      time_spent_minutes: number;
    }[];
    language_statistics: {
      language_id: string;
      language_name: string;
      proficiency_level: string;
      texts_completed: number;
      questions_answered: number;
      correct_answers: number;
      time_spent_minutes: number;
    }[];
  }
  ```
- Response type: `UserStatisticsDTO`

## 4. Response Details
- Status Code: 200 OK
- Response Body: UserStatisticsDTO
- Error Codes:
  - 401 Unauthorized: Invalid or missing authentication token
  - 500 Internal Server Error: Server-side error

## 5. Data Flow
1. Extract user ID from JWT token
2. Query Supabase for user's activity data
3. Calculate streaks and time spent
4. Get achievements
5. Aggregate daily activity
6. Calculate language statistics
7. Map results to UserStatisticsDTO
8. Return response

## 6. Security Considerations
- JWT token validation
- Row Level Security (RLS) ensures users can only access their own statistics
- Rate limiting to prevent abuse
- Data aggregation security

## 7. Error Handling
- 401: Invalid/missing token
  - Log: "Authentication failed: Invalid token"
  - Response: "Unauthorized: Invalid authentication token"
- 500: Database error
  - Log: "Database error: {error details}"
  - Response: "Internal server error"

## 8. Performance Considerations
- Indexes on user_id and timestamps
- Cache statistics data
- Optimize aggregation queries
- Consider time-based partitioning
- Implement incremental updates

## 9. Implementation Steps
1. Add method to UserService
   ```typescript
   class UserService {
     async getUserStatistics(
       userId: string
     ): Promise<UserStatisticsDTO> {
       // Implementation
     }
   }
   ```

2. Implement endpoint handler
   ```typescript
   export const GET = async ({ locals }: APIContext) => {
     try {
       const statistics = await userService.getUserStatistics(locals.user.id);
       return new Response(JSON.stringify(statistics), {
         status: 200,
         headers: { 'Content-Type': 'application/json' }
       });
     } catch (error) {
       // Error handling
     }
   };
   ```

3. Add streak calculation
   ```typescript
   const calculateStreaks = async (userId: string) => {
     const { data: activity, error } = await supabase
       .from('user_activity')
       .select('date')
       .eq('user_id', userId)
       .order('date', { ascending: false });
     
     if (error) throw error;
     
     let currentStreak = 0;
     let longestStreak = 0;
     let currentStreakCount = 0;
     
     // Calculate streaks
     for (let i = 0; i < activity.length; i++) {
       const today = new Date();
       const activityDate = new Date(activity[i].date);
       const diffDays = Math.floor((today.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
       
       if (i === 0 && diffDays === 0) {
         currentStreak = 1;
         currentStreakCount = 1;
       } else if (i === 0 && diffDays === 1) {
         currentStreak = 1;
         currentStreakCount = 1;
       } else if (diffDays === currentStreakCount + 1) {
         currentStreakCount++;
         currentStreak = Math.max(currentStreak, currentStreakCount);
       } else {
         currentStreakCount = 0;
       }
       
       longestStreak = Math.max(longestStreak, currentStreakCount);
     }
     
     return { currentStreak, longestStreak };
   };
   ```

4. Add caching strategy
   ```typescript
   const getCachedStatistics = async (userId: string) => {
     const cacheKey = `statistics:${userId}`;
     const cached = await cache.get(cacheKey);
     if (cached) {
       return cached;
     }
     const statistics = await userService.getUserStatistics(userId);
     await cache.set(cacheKey, statistics, 300); // Cache for 5 minutes
     return statistics;
   };
   ```

5. Add time spent calculation
   ```typescript
   const calculateTimeSpent = async (userId: string) => {
     const { data: sessions, error } = await supabase
       .from('learning_sessions')
       .select('start_time, end_time')
       .eq('user_id', userId);
     
     if (error) throw error;
     
     let totalMinutes = 0;
     for (const session of sessions) {
       const start = new Date(session.start_time);
       const end = new Date(session.end_time);
       totalMinutes += (end.getTime() - start.getTime()) / (1000 * 60);
     }
     
     return totalMinutes;
   };
   ```

6. Add unit tests
   ```typescript
   describe('GET /api/users/me/statistics', () => {
     it('should return user statistics', async () => {
       // Test implementation
     });
     
     it('should calculate correct streaks', async () => {
       // Test implementation
     });
     
     it('should calculate correct time spent', async () => {
       // Test implementation
     });
   });
   ```

7. Add integration tests
   ```typescript
   describe('User Statistics Integration', () => {
     it('should retrieve and cache statistics', async () => {
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
     logger.warn(`Slow statistics calculation: ${duration}ms`);
   }
   ```

9. Add query optimization
   ```typescript
   const buildStatisticsQuery = (userId: string) => {
     // Build optimized Supabase query with aggregations
   };
   ```

10. Add cache invalidation
    ```typescript
    const invalidateStatisticsCache = async (userId: string) => {
      const cacheKey = `statistics:${userId}`;
      await cache.del(cacheKey);
    };
    ```

11. Add incremental updates
    ```typescript
    const updateStatisticsIncrementally = async (
      userId: string,
      newActivity: UserActivity
    ) => {
      // Update cached statistics with new activity
    };
    ``` 