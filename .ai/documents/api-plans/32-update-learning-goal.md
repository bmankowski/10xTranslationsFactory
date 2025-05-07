# API Endpoint Implementation Plan: Update Learning Goal

## 1. Endpoint Overview
Updates an existing learning goal for a user, allowing modification of targets, dates, or other properties.

## 2. Request Details
- HTTP Method: PATCH
- URL Pattern: `/api/users/me/goals/:goalId`
- Parameters:
  - goalId: string (UUID)
- Request Body: UpdateLearningGoalCommand
  ```typescript
  interface UpdateLearningGoalCommand {
    target?: {
      texts?: number;
      questions?: number;
      minutes?: number;
      correct_answers?: number;
    };
    language_id?: string;
    start_date?: string;
    end_date?: string;
  }
  ```
- Authentication: Required (JWT token in Authorization header)

## 3. Used Types
- `LearningGoalDTO` from types.ts (same as Get User Learning Goals)
- Response type: `LearningGoalDTO`

## 4. Response Details
- Status Code: 200 OK
- Response Body: LearningGoalDTO
- Error Codes:
  - 400 Bad Request: Invalid input data
  - 401 Unauthorized: Invalid or missing authentication token
  - 403 Forbidden: Goal does not belong to user
  - 404 Not Found: Goal or language not found
  - 500 Internal Server Error: Server-side error

## 5. Data Flow
1. Extract user ID from JWT token
2. Validate request body using Zod schema
3. Verify goal exists and belongs to user
4. If language_id provided, verify language exists
5. Update goal record in Supabase
6. Map result to LearningGoalDTO
7. Return response

## 6. Security Considerations
- JWT token validation
- Row Level Security (RLS) ensures users can only update their own goals
- Input validation for all fields
- Rate limiting to prevent abuse
- Date range validation
- Ownership verification

## 7. Error Handling
- 400: Invalid input
  - Log: "Validation error: {error details}"
  - Response: "Bad Request: {error message}"
- 401: Invalid/missing token
  - Log: "Authentication failed: Invalid token"
  - Response: "Unauthorized: Invalid authentication token"
- 403: Goal ownership mismatch
  - Log: "Forbidden: Goal {goalId} does not belong to user {userId}"
  - Response: "Forbidden: Goal not found or access denied"
- 404: Goal/language not found
  - Log: "Not found: {entity} with id {id}"
  - Response: "Not Found: {entity} not found"
- 500: Database error
  - Log: "Database error: {error details}"
  - Response: "Internal server error"

## 8. Performance Considerations
- Indexes on user_id and goal_id
- Validate date ranges before database operations
- Cache invalidation on goal update
- Optimize language lookup
- Use partial updates

## 9. Implementation Steps
1. Create Zod schema for validation
   ```typescript
   const updateLearningGoalSchema = z.object({
     target: z.object({
       texts: z.number().min(1).optional(),
       questions: z.number().min(1).optional(),
       minutes: z.number().min(1).optional(),
       correct_answers: z.number().min(1).optional()
     }).optional(),
     language_id: z.string().uuid().optional(),
     start_date: z.string().datetime().optional(),
     end_date: z.string().datetime().optional()
   }).refine(
     data => {
       if (data.start_date && data.end_date) {
         return new Date(data.end_date) > new Date(data.start_date);
       }
       return true;
     },
     {
       message: "End date must be after start date"
     }
   );
   ```

2. Add method to UserService
   ```typescript
   class UserService {
     async updateLearningGoal(
       userId: string,
       goalId: string,
       command: UpdateLearningGoalCommand
     ): Promise<LearningGoalDTO> {
       // Implementation
     }
   }
   ```

3. Implement endpoint handler
   ```typescript
   export const PATCH = async ({ params, request, locals }: APIContext) => {
     try {
       const body = await request.json();
       const validatedData = updateLearningGoalSchema.parse(body);
       const goal = await userService.updateLearningGoal(
         locals.user.id,
         params.goalId,
         validatedData
       );
       return new Response(JSON.stringify(goal), {
         status: 200,
         headers: { 'Content-Type': 'application/json' }
       });
     } catch (error) {
       // Error handling
     }
   };
   ```

4. Add goal verification
   ```typescript
   const verifyGoalOwnership = async (
     userId: string,
     goalId: string
   ): Promise<LearningGoal> => {
     const { data, error } = await supabase
       .from('learning_goals')
       .select('*')
       .eq('id', goalId)
       .eq('user_id', userId)
       .single();
     
     if (error || !data) {
       throw new Error('Goal not found or access denied');
     }
     
     return data;
   };
   ```

5. Add goal update logic
   ```typescript
   const updateGoal = async (
     goalId: string,
     command: UpdateLearningGoalCommand
   ): Promise<LearningGoal> => {
     const updateData: Partial<LearningGoal> = {};
     
     if (command.target) {
       updateData.target = command.target;
     }
     if (command.language_id) {
       updateData.language_id = command.language_id;
     }
     if (command.start_date) {
       updateData.start_date = command.start_date;
     }
     if (command.end_date) {
       updateData.end_date = command.end_date;
     }
     
     const { data, error } = await supabase
       .from('learning_goals')
       .update(updateData)
       .eq('id', goalId)
       .select()
       .single();
     
     if (error) throw error;
     return data;
   };
   ```

6. Add cache invalidation
   ```typescript
   const invalidateGoalsCache = async (userId: string) => {
     const cacheKey = `goals:${userId}`;
     await cache.del(cacheKey);
   };
   ```

7. Add unit tests
   ```typescript
   describe('PATCH /api/users/me/goals/:goalId', () => {
     it('should update learning goal', async () => {
       // Test implementation
     });
     
     it('should validate input data', async () => {
       // Test implementation
     });
     
     it('should verify goal ownership', async () => {
       // Test implementation
     });
   });
   ```

8. Add integration tests
   ```typescript
   describe('Learning Goal Update Integration', () => {
     it('should update and cache goal', async () => {
       // Test implementation
     });
   });
   ```

9. Add date range validation
   ```typescript
   const validateDateRange = (
     startDate: string | undefined,
     endDate: string | undefined,
     existingGoal: LearningGoal
   ): void => {
     const start = startDate ? new Date(startDate) : new Date(existingGoal.start_date);
     const end = endDate ? new Date(endDate) : new Date(existingGoal.end_date);
     const now = new Date();
     
     if (start < now) {
       throw new Error('Start date cannot be in the past');
     }
     
     const maxDuration = {
       daily: 24 * 60 * 60 * 1000,
       weekly: 7 * 24 * 60 * 60 * 1000,
       monthly: 30 * 24 * 60 * 60 * 1000,
       language: 365 * 24 * 60 * 60 * 1000
     };
     
     if (end.getTime() - start.getTime() > maxDuration[existingGoal.type]) {
       throw new Error(
         `Goal duration exceeds maximum for ${existingGoal.type} goals`
       );
     }
   };
   ```

10. Add target validation
    ```typescript
    const validateTargets = (
      type: GoalType,
      target: GoalTarget | undefined,
      existingTarget: GoalTarget
    ): void => {
      if (!target) return;
      
      const maxTargets = {
        daily: {
          texts: 10,
          questions: 50,
          minutes: 120,
          correct_answers: 40
        },
        weekly: {
          texts: 50,
          questions: 250,
          minutes: 600,
          correct_answers: 200
        },
        monthly: {
          texts: 200,
          questions: 1000,
          minutes: 2400,
          correct_answers: 800
        },
        language: {
          texts: 1000,
          questions: 5000,
          minutes: 12000,
          correct_answers: 4000
        }
      };
      
      const mergedTarget = { ...existingTarget, ...target };
      
      Object.entries(mergedTarget).forEach(([key, value]) => {
        if (value > maxTargets[type][key]) {
          throw new Error(
            `${key} target exceeds maximum for ${type} goals`
          );
        }
      });
    };
    ```

11. Add performance monitoring
    ```typescript
    const startTime = performance.now();
    // ... operation ...
    const duration = performance.now() - startTime;
    if (duration > 1000) {
      logger.warn(`Slow goal update: ${duration}ms`);
    }
    ``` 