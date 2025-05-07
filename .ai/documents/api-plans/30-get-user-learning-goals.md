# API Endpoint Implementation Plan: Get User Learning Goals

## 1. Endpoint Overview
Retrieves a user's learning goals, including daily targets, language-specific goals, and progress towards those goals.

## 2. Request Details
- HTTP Method: GET
- URL Pattern: `/api/users/me/goals`
- Parameters: None
- Request Body: None
- Authentication: Required (JWT token in Authorization header)

## 3. Used Types
- `LearningGoalDTO` from types.ts:
  ```typescript
  interface LearningGoalDTO {
    id: string;
    user_id: string;
    type: 'daily' | 'weekly' | 'monthly' | 'language';
    target: {
      texts?: number;
      questions?: number;
      minutes?: number;
      correct_answers?: number;
    };
    progress: {
      texts?: number;
      questions?: number;
      minutes?: number;
      correct_answers?: number;
    };
    language_id?: string;
    language_name?: string;
    start_date: string;
    end_date: string;
    is_completed: boolean;
    created_at: string;
    updated_at: string;
  }
  ```
- Response type: `ListDTO<LearningGoalDTO>`

## 4. Response Details
- Status Code: 200 OK
- Response Body: ListDTO<LearningGoalDTO>
- Error Codes:
  - 401 Unauthorized: Invalid or missing authentication token
  - 500 Internal Server Error: Server-side error

## 5. Data Flow
1. Extract user ID from JWT token
2. Query Supabase for user's goals
3. Calculate progress for each goal
4. Map results to LearningGoalDTO array
5. Return response

## 6. Security Considerations
- JWT token validation
- Row Level Security (RLS) ensures users can only access their own goals
- Rate limiting to prevent abuse
- Goal progress validation

## 7. Error Handling
- 401: Invalid/missing token
  - Log: "Authentication failed: Invalid token"
  - Response: "Unauthorized: Invalid authentication token"
- 500: Database error
  - Log: "Database error: {error details}"
  - Response: "Internal server error"

## 8. Performance Considerations
- Indexes on user_id and dates
- Cache goals data
- Optimize progress calculations
- Consider pagination for large goal sets

## 9. Implementation Steps
1. Add method to UserService
   ```typescript
   class UserService {
     async getLearningGoals(
       userId: string
     ): Promise<LearningGoalDTO[]> {
       // Implementation
     }
   }
   ```

2. Implement endpoint handler
   ```typescript
   export const GET = async ({ locals }: APIContext) => {
     try {
       const goals = await userService.getLearningGoals(locals.user.id);
       return new Response(JSON.stringify({ items: goals }), {
         status: 200,
         headers: { 'Content-Type': 'application/json' }
       });
     } catch (error) {
       // Error handling
     }
   };
   ```

3. Add goal progress calculation
   ```typescript
   const calculateGoalProgress = async (
     userId: string,
     goal: LearningGoal
   ): Promise<GoalProgress> => {
     const { data: activity, error } = await supabase
       .from('user_activity')
       .select('*')
       .eq('user_id', userId)
       .gte('date', goal.start_date)
       .lte('date', goal.end_date);
     
     if (error) throw error;
     
     return {
       texts: calculateTextsProgress(activity),
       questions: calculateQuestionsProgress(activity),
       minutes: calculateTimeProgress(activity),
       correct_answers: calculateCorrectAnswersProgress(activity)
     };
   };
   ```

4. Add caching strategy
   ```typescript
   const getCachedGoals = async (userId: string) => {
     const cacheKey = `goals:${userId}`;
     const cached = await cache.get(cacheKey);
     if (cached) {
       return cached;
     }
     const goals = await userService.getLearningGoals(userId);
     await cache.set(cacheKey, goals, 300); // Cache for 5 minutes
     return goals;
   };
   ```

5. Add progress calculation helpers
   ```typescript
   const calculateTextsProgress = (activity: UserActivity[]): number => {
     return activity.reduce((sum, a) => sum + (a.texts_completed || 0), 0);
   };
   
   const calculateQuestionsProgress = (activity: UserActivity[]): number => {
     return activity.reduce((sum, a) => sum + (a.questions_answered || 0), 0);
   };
   
   const calculateTimeProgress = (activity: UserActivity[]): number => {
     return activity.reduce((sum, a) => sum + (a.time_spent_minutes || 0), 0);
   };
   
   const calculateCorrectAnswersProgress = (activity: UserActivity[]): number => {
     return activity.reduce((sum, a) => sum + (a.correct_answers || 0), 0);
   };
   ```

6. Add unit tests
   ```typescript
   describe('GET /api/users/me/goals', () => {
     it('should return learning goals', async () => {
       // Test implementation
     });
     
     it('should calculate correct progress', async () => {
       // Test implementation
     });
     
     it('should handle no goals', async () => {
       // Test implementation
     });
   });
   ```

7. Add integration tests
   ```typescript
   describe('Learning Goals Integration', () => {
     it('should retrieve and cache goals', async () => {
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
     logger.warn(`Slow goals retrieval: ${duration}ms`);
   }
   ```

9. Add query optimization
   ```typescript
   const buildGoalsQuery = (userId: string) => {
     // Build optimized Supabase query with joins
   };
   ```

10. Add cache invalidation
    ```typescript
    const invalidateGoalsCache = async (userId: string) => {
      const cacheKey = `goals:${userId}`;
      await cache.del(cacheKey);
    };
    ```

11. Add goal completion check
    ```typescript
    const checkGoalCompletion = async (
      userId: string,
      goal: LearningGoal
    ): Promise<boolean> => {
      const progress = await calculateGoalProgress(userId, goal);
      return (
        (!goal.target.texts || progress.texts >= goal.target.texts) &&
        (!goal.target.questions || progress.questions >= goal.target.questions) &&
        (!goal.target.minutes || progress.minutes >= goal.target.minutes) &&
        (!goal.target.correct_answers || progress.correct_answers >= goal.target.correct_answers)
      );
    };
    ``` 