# API Endpoint Implementation Plan: Get User Learning History

## 1. Endpoint Overview
Retrieves a user's learning history, including completed texts, answered questions, and time spent learning.

## 2. Request Details
- HTTP Method: GET
- URL Pattern: `/api/users/me/history`
- Parameters:
  - start_date (query parameter, optional): ISO date string
  - end_date (query parameter, optional): ISO date string
  - language_id (query parameter, optional): UUID
  - limit (query parameter, optional): number
  - offset (query parameter, optional): number
- Request Body: None
- Authentication: Required (JWT token in Authorization header)

## 3. Used Types
- `LearningHistoryDTO` from types.ts:
  ```typescript
  interface LearningHistoryDTO {
    completed_texts: {
      id: string;
      title: string;
      language_id: string;
      language_name: string;
      completed_at: string;
      score: number;
      time_spent_minutes: number;
    }[];
    answered_questions: {
      id: string;
      text_id: string;
      text_title: string;
      question: string;
      is_correct: boolean;
      answered_at: string;
    }[];
    total_time_spent_minutes: number;
    average_score: number;
  }
  ```
- Response type: `LearningHistoryDTO`

## 4. Response Details
- Status Code: 200 OK
- Response Body: LearningHistoryDTO
- Error Codes:
  - 400 Bad Request: Invalid query parameters
  - 401 Unauthorized: Invalid or missing authentication token
  - 500 Internal Server Error: Server-side error

## 5. Data Flow
1. Extract user ID from JWT token
2. Validate query parameters using Zod schema
3. Query Supabase for completed texts
4. Query Supabase for answered questions
5. Calculate total time spent and average score
6. Map results to LearningHistoryDTO
7. Return response

## 6. Security Considerations
- JWT token validation
- Row Level Security (RLS) ensures users can only access their own history
- Rate limiting to prevent abuse
- Input validation for query parameters

## 7. Error Handling
- 400: Invalid query parameters
  - Log: "Validation error: {error details}"
  - Response: "Bad Request: {validation error message}"
- 401: Invalid/missing token
  - Log: "Authentication failed: Invalid token"
  - Response: "Unauthorized: Invalid authentication token"
- 500: Database error
  - Log: "Database error: {error details}"
  - Response: "Internal server error"

## 8. Performance Considerations
- Indexes on user_id, dates, and language_id
- Cache history data
- Pagination for large result sets
- Optimize date range queries

## 9. Implementation Steps
1. Create Zod schema for query parameter validation
   ```typescript
   const historyQuerySchema = z.object({
     start_date: z.string().datetime().optional(),
     end_date: z.string().datetime().optional(),
     language_id: z.string().uuid().optional(),
     limit: z.number().int().min(1).max(100).optional(),
     offset: z.number().int().min(0).optional()
   });
   ```

2. Add method to UserService
   ```typescript
   class UserService {
     async getLearningHistory(
       userId: string,
       filter: {
         startDate?: string;
         endDate?: string;
         languageId?: string;
       },
       pagination: {
         limit: number;
         offset: number;
       }
     ): Promise<LearningHistoryDTO> {
       // Implementation
     }
   }
   ```

3. Implement endpoint handler
   ```typescript
   export const GET = async ({ url, locals }: APIContext) => {
     try {
       const queryParams = historyQuerySchema.parse(
         Object.fromEntries(url.searchParams)
       );
       const history = await userService.getLearningHistory(
         locals.user.id,
         {
           startDate: queryParams.start_date,
           endDate: queryParams.end_date,
           languageId: queryParams.language_id
         },
         {
           limit: queryParams.limit ?? 20,
           offset: queryParams.offset ?? 0
         }
       );
       return new Response(JSON.stringify(history), {
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
   const getCachedHistory = async (
     userId: string,
     filter: HistoryFilter,
     pagination: PaginationParams
   ) => {
     const cacheKey = `history:${userId}:${JSON.stringify(filter)}:${JSON.stringify(pagination)}`;
     const cached = await cache.get(cacheKey);
     if (cached) {
       return cached;
     }
     const history = await userService.getLearningHistory(userId, filter, pagination);
     await cache.set(cacheKey, history, 300); // Cache for 5 minutes
     return history;
   };
   ```

5. Add date range filtering
   ```typescript
   const buildDateFilter = (
     startDate?: string,
     endDate?: string
   ): string => {
     let filter = '';
     if (startDate) {
       filter += `completed_at >= '${startDate}'`;
     }
     if (endDate) {
       filter += filter ? ' AND ' : '';
       filter += `completed_at <= '${endDate}'`;
     }
     return filter;
   };
   ```

6. Add unit tests
   ```typescript
   describe('GET /api/users/me/history', () => {
     it('should return learning history', async () => {
       // Test implementation
     });
     
     it('should filter by date range', async () => {
       // Test implementation
     });
     
     it('should filter by language', async () => {
       // Test implementation
     });
     
     it('should handle pagination', async () => {
       // Test implementation
     });
   });
   ```

7. Add integration tests
   ```typescript
   describe('Learning History Integration', () => {
     it('should retrieve and cache history', async () => {
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
     logger.warn(`Slow history retrieval: ${duration}ms`);
   }
   ```

9. Add query optimization
   ```typescript
   const buildHistoryQuery = (
     userId: string,
     filter: HistoryFilter,
     pagination: PaginationParams
   ) => {
     // Build optimized Supabase query with joins
   };
   ```

10. Add cache invalidation
    ```typescript
    const invalidateHistoryCache = async (userId: string) => {
      const pattern = `history:${userId}:*`;
      const keys = await cache.keys(pattern);
      await Promise.all(keys.map(key => cache.del(key)));
    };
    ```

11. Add cursor-based pagination
    ```typescript
    const getHistoryWithCursor = async (
      userId: string,
      filter: HistoryFilter,
      cursor?: string
    ) => {
      // Implementation using cursor-based pagination
    };
    ``` 