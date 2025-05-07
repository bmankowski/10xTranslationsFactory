# API Endpoint Implementation Plan: Create Text with Questions

## 1. Endpoint Overview
Creates a new learning text along with automatically generated questions based on user inputs. This endpoint integrates with OpenRouter.ai for text and question generation.

## 2. Request Details
- HTTP Method: POST
- URL Pattern: `/api/texts`
- Parameters: None
- Request Body: CreateTextCommand
- Authentication: Required (JWT token in Authorization header)

## 3. Used Types
- `CreateTextCommand` from types.ts:
  ```typescript
  interface CreateTextCommand {
    language_id: string;
    proficiency_level_id: string;
    topic: string;
    visibility: 'public' | 'private';
  }
  ```
- `CreateTextResponseDTO` from types.ts:
  ```typescript
  interface CreateTextResponseDTO {
    text: TextDTO;
    questions: QuestionDTO[];
  }
  ```

## 4. Response Details
- Status Code: 201 Created
- Response Body: CreateTextResponseDTO
- Error Codes:
  - 400 Bad Request: Invalid input data
  - 401 Unauthorized: Invalid or missing authentication token
  - 500 Internal Server Error: Server-side error

## 5. Data Flow
1. Extract user ID from JWT token
2. Validate request body using Zod schema
3. Verify language and proficiency level exist
4. Call OpenRouter.ai API to generate text and questions
5. Create text record in Supabase
6. Create question records in Supabase
7. Map database results to DTOs
8. Return response

## 6. Security Considerations
- JWT token validation
- Row Level Security (RLS) ensures users can only create their own texts
- Validate language and proficiency level IDs
- Rate limiting to prevent abuse
- Sanitize AI-generated content

## 7. Error Handling
- 400: Invalid input
  - Log: "Validation error: {error details}"
  - Response: "Bad Request: {validation error message}"
- 401: Invalid/missing token
  - Log: "Authentication failed: Invalid token"
  - Response: "Unauthorized: Invalid authentication token"
- 500: AI generation error
  - Log: "AI generation error: {error details}"
  - Response: "Internal server error: Failed to generate content"
- 500: Database error
  - Log: "Database error: {error details}"
  - Response: "Internal server error"

## 8. Performance Considerations
- AI generation may take time (implement timeout)
- Use transactions for text and questions creation
- Index on user_id and language_id
- Consider implementing retry mechanism for AI calls

## 9. Implementation Steps
1. Create Zod schema for request validation
   ```typescript
   const createTextSchema = z.object({
     language_id: z.string().uuid(),
     proficiency_level_id: z.string().uuid(),
     topic: z.string().min(1).max(200),
     visibility: z.enum(['public', 'private'])
   });
   ```

2. Create TextService class
   ```typescript
   class TextService {
     async createTextWithQuestions(
       userId: string,
       command: CreateTextCommand
     ): Promise<CreateTextResponseDTO> {
       // Implementation
     }
   }
   ```

3. Implement endpoint handler
   ```typescript
   export const POST = async ({ request, locals }: APIContext) => {
     try {
       const body = await request.json();
       const command = createTextSchema.parse(body);
       const result = await textService.createTextWithQuestions(
         locals.user.id,
         command
       );
       return new Response(JSON.stringify(result), {
         status: 201,
         headers: { 'Content-Type': 'application/json' }
       });
     } catch (error) {
       // Error handling
     }
   };
   ```

4. Add AI integration
   ```typescript
   const generateContent = async (
     topic: string,
     language: string,
     level: string
   ) => {
     const response = await openRouter.generateText({
       prompt: `Generate a ${level} level text about ${topic} in ${language}`,
       max_tokens: 500
     });
     return response.text;
   };
   ```

5. Add transaction support
   ```typescript
   const createWithTransaction = async (
     userId: string,
     text: TextDTO,
     questions: QuestionDTO[]
   ) => {
     return await supabase.rpc('create_text_with_questions', {
       p_user_id: userId,
       p_text: text,
       p_questions: questions
     });
   };
   ```

6. Add retry mechanism
   ```typescript
   const withRetry = async <T>(
     operation: () => Promise<T>,
     maxRetries: number = 3
   ): Promise<T> => {
     // Implementation
   };
   ```

7. Add unit tests
   ```typescript
   describe('POST /api/texts', () => {
     it('should create text with questions', async () => {
       // Test implementation
     });
     
     it('should handle AI generation failure', async () => {
       // Test implementation
     });
     
     it('should validate input data', async () => {
       // Test implementation
     });
   });
   ```

8. Add integration tests
   ```typescript
   describe('Text Creation Integration', () => {
     it('should create text and questions', async () => {
       // Test implementation
     });
   });
   ```

9. Add content sanitization
   ```typescript
   const sanitizeContent = (content: string): string => {
     // Remove potentially harmful content
     return content.replace(/<[^>]*>/g, '');
   };
   ```

10. Add timeout handling
    ```typescript
    const withTimeout = async <T>(
      promise: Promise<T>,
      timeout: number = 30000
    ): Promise<T> => {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Operation timed out')), timeout);
      });
      return Promise.race([promise, timeoutPromise]);
    };
    ``` 