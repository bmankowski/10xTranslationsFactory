# API Endpoint Implementation Plan: Create Learning Goal

## 1. Endpoint Overview
Creates a new learning goal for a user, specifying targets for texts, questions, time spent, or correct answers.

## 2. Request Details
- HTTP Method: POST
- URL Pattern: `/api/users/me/goals`
- Parameters: None
- Request Body: CreateLearningGoalCommand
  ```typescript
  interface CreateLearningGoalCommand {
    type: 'daily' | 'weekly' | 'monthly' | 'language';
    target: {
      texts?: number;
      questions?: number;
      minutes?: number;
      correct_answers?: number;
    };
    language_id?: string;
    start_date: string;
    end_date: string;
  }
  ```
- Authentication: Required (JWT token in Authorization header)

## 3. Used Types
- `LearningGoalDTO` from types.ts (same as Get User Learning Goals)
- Response type: `LearningGoalDTO`

## 4. Response Details
- Status Code: 201 Created
- Response Body: LearningGoalDTO
- Error Codes:
  - 400 Bad Request: Invalid input data
  - 401 Unauthorized: Invalid or missing authentication token
  - 404 Not Found: Language not found (if language_id provided)
  - 500 Internal Server Error: Server-side error

## 5. Data Flow
1. Extract user ID from JWT token
2. Validate request body using Zod schema
3. If language_id provided, verify language exists
4. Create goal record in Supabase
5. Map result to LearningGoalDTO
6. Return response

## 6. Security Considerations
- JWT token validation
- Row Level Security (RLS) ensures users can only create their own goals
- Input validation for all fields
- Rate limiting to prevent abuse
- Date range validation

## 7. Error Handling
- 400: Invalid input
  - Log: "Validation error: {error details}"
  - Response: "Bad Request: {error message}"
- 401: Invalid/missing token
  - Log: "Authentication failed: Invalid token"
  - Response: "Unauthorized: Invalid authentication token"
- 404: Language not found
  - Log: "Language not found: {language_id}"
  - Response: "Not Found: Language not found"
- 500: Database error
  - Log: "Database error: {error details}"
  - Response: "Internal server error"

## 8. Performance Considerations
- Indexes on user_id and dates
- Validate date ranges before database operations
- Cache invalidation on goal creation
- Optimize language lookup

## 9. Implementation Steps
1. Create Zod schema for validation
   ```typescript
   const createLearningGoalSchema = z.object({
     type: z.enum(['daily', 'weekly', 'monthly', 'language']),
     target: z.object({
       texts: z.number().min(1).optional(),
       questions: z.number().min(1).optional(),
       minutes: z.number().min(1).optional(),
       correct_answers: z.number().min(1).optional()
     }).refine(data => Object.keys(data).length > 0, {
       message: "At least one target must be specified"
     }),
     language_id: z.string().uuid().optional(),
     start_date: z.string().datetime(),
     end_date: z.string().datetime()
   }).refine(data => new Date(data.end_date) > new Date(data.start_date), {
     message: "End date must be after start date"
   });
   ```

2. Add method to UserService
   ```typescript
   class UserService {
     async createLearningGoal(
       userId: string,
       command: CreateLearningGoalCommand
     ): Promise<LearningGoalDTO> {
       // Implementation
     }
   }
   ```

3. Implement endpoint handler
   ```typescript
   export const POST = async ({ request, locals }: APIContext) => {
     try {
       const body = await request.json();
       const validatedData = createLearningGoalSchema.parse(body);
       const goal = await userService.createLearningGoal(
         locals.user.id,
         validatedData
       );
       return new Response(JSON.stringify(goal), {
         status: 201,
         headers: { 'Content-Type': 'application/json' }
       });
     } catch (error) {
       // Error handling
     }
   };
   ```

4. Add language verification
   ```typescript
   const verifyLanguage = async (languageId: string): Promise<void> => {
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

5. Add goal creation logic
   ```typescript
   const createGoal = async (
     userId: string,
     command: CreateLearningGoalCommand
   ): Promise<LearningGoal> => {
     const { data, error } = await supabase
       .from('learning_goals')
       .insert({
         user_id: userId,
         type: command.type,
         target: command.target,
         language_id: command.language_id,
         start_date: command.start_date,
         end_date: command.end_date,
         is_completed: false
       })
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
   describe('POST /api/users/me/goals', () => {
     it('should create learning goal', async () => {
       // Test implementation
     });
     
     it('should validate input data', async () => {
       // Test implementation
     });
     
     it('should verify language exists', async () => {
       // Test implementation
     });
   });
   ```

8. Add integration tests
   ```typescript
   describe('Learning Goal Creation Integration', () => {
     it('should create and cache goal', async () => {
       // Test implementation
     });
   });
   ```

9. Add date range validation
   ```typescript
   const validateDateRange = (
     startDate: string,
     endDate: string,
     type: GoalType
   ): void => {
     const start = new Date(startDate);
     const end = new Date(endDate);
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
     
     if (end.getTime() - start.getTime() > maxDuration[type]) {
       throw new Error(`Goal duration exceeds maximum for ${type} goals`);
     }
   };
   ```

10. Add target validation
    ```typescript
    const validateTargets = (
      type: GoalType,
      target: GoalTarget
    ): void => {
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
      
      Object.entries(target).forEach(([key, value]) => {
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
      logger.warn(`Slow goal creation: ${duration}ms`);
    }
    ``` 