# API Endpoint Implementation Plan: Submit Answer

## 1. Endpoint Overview
Submits a user's answer to a question and returns whether it was correct, along with an explanation.

## 2. Request Details
- HTTP Method: POST
- URL Pattern: `/api/questions/{questionId}/answer`
- Parameters:
  - questionId (path parameter): UUID
- Request Body: SubmitAnswerCommand
  ```typescript
  interface SubmitAnswerCommand {
    answer: string;
  }
  ```
- Authentication: Required (JWT token in Authorization header)

## 3. Used Types
- `AnswerResultDTO` from types.ts:
  ```typescript
  interface AnswerResultDTO {
    is_correct: boolean;
    correct_answer: string;
    explanation: string;
    score?: number;
  }
  ```
- Response type: `AnswerResultDTO`

## 4. Response Details
- Status Code: 200 OK
- Response Body: AnswerResultDTO
- Error Codes:
  - 400 Bad Request: Invalid request body
  - 401 Unauthorized: Invalid or missing authentication token
  - 403 Forbidden: User not authorized to answer this question
  - 404 Not Found: Question not found
  - 500 Internal Server Error: Server-side error

## 5. Data Flow
1. Extract questionId from path parameters
2. Validate questionId using Zod schema
3. Validate request body using Zod schema
4. Check user authorization for question access
5. Verify answer against correct answer
6. Record answer attempt
7. Return result with explanation

## 6. Security Considerations
- JWT token validation
- Row Level Security (RLS) ensures users can only answer questions for:
  - Their own texts
  - Public texts
- Rate limiting to prevent abuse
- Input validation for path parameters and request body
- Prevent answer manipulation

## 7. Error Handling
- 400: Invalid request body
  - Log: "Validation error: {error details}"
  - Response: "Bad Request: {validation error message}"
- 401: Invalid/missing token
  - Log: "Authentication failed: Invalid token"
  - Response: "Unauthorized: Invalid authentication token"
- 403: Unauthorized access
  - Log: "Authorization failed: User {userId} attempted to answer question {questionId}"
  - Response: "Forbidden: You don't have permission to answer this question"
- 404: Question not found
  - Log: "Question not found: {questionId}"
  - Response: "Not Found: Question not found"
- 500: Database error
  - Log: "Database error: {error details}"
  - Response: "Internal server error"

## 8. Performance Considerations
- Indexes on question_id and user_id
- Cache question data
- Optimize answer verification
- Consider rate limiting per user

## 9. Implementation Steps
1. Create Zod schemas for validation
   ```typescript
   const questionIdSchema = z.string().uuid();
   
   const submitAnswerSchema = z.object({
     answer: z.string().min(1)
   });
   ```

2. Add method to QuestionService
   ```typescript
   class QuestionService {
     async submitAnswer(
       questionId: string,
       userId: string,
       answer: string
     ): Promise<AnswerResultDTO> {
       // Implementation
     }
   }
   ```

3. Implement endpoint handler
   ```typescript
   export const POST = async ({ params, request, locals }: APIContext) => {
     try {
       const questionId = questionIdSchema.parse(params.questionId);
       const { answer } = submitAnswerSchema.parse(await request.json());
       const result = await questionService.submitAnswer(
         questionId,
         locals.user.id,
         answer
       );
       return new Response(JSON.stringify(result), {
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
   const checkQuestionAccess = async (
     questionId: string,
     userId: string
   ): Promise<boolean> => {
     const question = await questionService.getQuestionById(questionId);
     const text = await textService.getTextById(question.text_id);
     return text.visibility === 'public' || text.user_id === userId;
   };
   ```

5. Add answer verification
   ```typescript
   const verifyAnswer = (
     userAnswer: string,
     correctAnswer: string
   ): boolean => {
     return userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
   };
   ```

6. Add answer recording
   ```typescript
   const recordAnswerAttempt = async (
     questionId: string,
     userId: string,
     isCorrect: boolean
   ) => {
     await supabase.from('answer_attempts').insert({
       question_id: questionId,
       user_id: userId,
       is_correct: isCorrect,
       attempted_at: new Date().toISOString()
     });
   };
   ```

7. Add unit tests
   ```typescript
   describe('POST /api/questions/{questionId}/answer', () => {
     it('should verify correct answer', async () => {
       // Test implementation
     });
     
     it('should verify incorrect answer', async () => {
       // Test implementation
     });
     
     it('should handle unauthorized access', async () => {
       // Test implementation
     });
     
     it('should handle non-existent question', async () => {
       // Test implementation
     });
   });
   ```

8. Add integration tests
   ```typescript
   describe('Answer Submission Integration', () => {
     it('should submit answer and record attempt', async () => {
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
     logger.warn(`Slow answer submission: ${duration}ms`);
   }
   ```

10. Add rate limiting
    ```typescript
    const checkRateLimit = async (userId: string): Promise<boolean> => {
      const key = `answer:rate:${userId}`;
      const attempts = await cache.incr(key);
      if (attempts === 1) {
        await cache.expire(key, 60); // Reset after 1 minute
      }
      return attempts <= 10; // Max 10 attempts per minute
    };
    ``` 