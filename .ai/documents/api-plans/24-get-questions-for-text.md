# API Endpoint Implementation Plan: Get Questions for Text

## 1. Endpoint Overview
Retrieves all questions associated with a specific text, including their options and correct answers.

## 2. Request Details
- HTTP Method: GET
- URL Pattern: `/api/texts/{textId}/questions`
- Parameters:
  - textId (path parameter): UUID
- Request Body: None
- Authentication: Required (JWT token in Authorization header)

## 3. Used Types
- `QuestionDTO` from types.ts:
  ```typescript
  interface QuestionDTO {
    id: string;
    text_id: string;
    question: string;
    correct_answer: string;
    options: string[];
    explanation: string;
    created_at: string;
    updated_at: string;
  }
  ```
- Response type: `ListDTO<QuestionDTO>`

## 4. Response Details
- Status Code: 200 OK
- Response Body: ListDTO<QuestionDTO>
- Error Codes:
  - 401 Unauthorized: Invalid or missing authentication token
  - 403 Forbidden: User not authorized to access these questions
  - 404 Not Found: Text not found
  - 500 Internal Server Error: Server-side error

## 5. Data Flow
1. Extract textId from path parameters
2. Validate textId using Zod schema
3. Check user authorization for text access
4. Query Supabase questions table
5. Map database results to QuestionDTO array
6. Return response

## 6. Security Considerations
- JWT token validation
- Row Level Security (RLS) ensures users can only access questions for:
  - Their own texts
  - Public texts
- Rate limiting to prevent abuse
- Input validation for path parameters

## 7. Error Handling
- 401: Invalid/missing token
  - Log: "Authentication failed: Invalid token"
  - Response: "Unauthorized: Invalid authentication token"
- 403: Unauthorized access
  - Log: "Authorization failed: User {userId} attempted to access questions for text {textId}"
  - Response: "Forbidden: You don't have permission to access these questions"
- 404: Text not found
  - Log: "Text not found: {textId}"
  - Response: "Not Found: Text not found"
- 500: Database error
  - Log: "Database error: {error details}"
  - Response: "Internal server error"

## 8. Performance Considerations
- Indexes on text_id
- Consider caching for public texts
- Eager loading of questions
- Pagination if needed for large sets

## 9. Implementation Steps
1. Create Zod schema for path parameter validation
   ```typescript
   const textIdSchema = z.string().uuid();
   ```

2. Add method to QuestionService
   ```typescript
   class QuestionService {
     async getQuestionsForText(
       textId: string,
       userId: string
     ): Promise<QuestionDTO[]> {
       // Implementation
     }
   }
   ```

3. Implement endpoint handler
   ```typescript
   export const GET = async ({ params, locals }: APIContext) => {
     try {
       const textId = textIdSchema.parse(params.textId);
       const questions = await questionService.getQuestionsForText(
         textId,
         locals.user.id
       );
       return new Response(JSON.stringify({ items: questions }), {
         status: 200,
         headers: { 'Content-Type': 'application/json' }
       });
     } catch (error) {
       // Error handling
     }
   };
   ```

4. Add authorization check
   ```typescript
   const checkTextAccess = async (
     textId: string,
     userId: string
   ): Promise<boolean> => {
     const text = await textService.getTextById(textId);
     return text.visibility === 'public' || text.user_id === userId;
   };
   ```

5. Add caching strategy
   ```typescript
   const getCachedQuestions = async (textId: string) => {
     const cacheKey = `questions:${textId}`;
     const cached = await cache.get(cacheKey);
     if (cached) {
       return cached;
     }
     const questions = await questionService.getQuestionsForText(textId);
     await cache.set(cacheKey, questions, 300); // Cache for 5 minutes
     return questions;
   };
   ```

6. Add unit tests
   ```typescript
   describe('GET /api/texts/{textId}/questions', () => {
     it('should return questions for text', async () => {
       // Test implementation
     });
     
     it('should handle unauthorized access', async () => {
       // Test implementation
     });
     
     it('should handle non-existent text', async () => {
       // Test implementation
     });
   });
   ```

7. Add integration tests
   ```typescript
   describe('Questions for Text Integration', () => {
     it('should retrieve questions with caching', async () => {
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
     logger.warn(`Slow questions retrieval: ${duration}ms`);
   }
   ```

9. Add query optimization
   ```typescript
   const buildQuestionsQuery = (textId: string) => {
     // Build optimized Supabase query
   };
   ```

10. Add pagination support
    ```typescript
    const getPaginatedQuestions = async (
      textId: string,
      page: number,
      pageSize: number
    ) => {
      // Implementation with pagination
    };
    ``` 