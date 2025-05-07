# API Endpoint Implementation Plan: Get Text by ID

## 1. Endpoint Overview
Retrieves a specific text by its ID, including its associated questions and metadata.

## 2. Request Details
- HTTP Method: GET
- URL Pattern: `/api/texts/{textId}`
- Parameters:
  - textId (path parameter): UUID
- Request Body: None
- Authentication: Required (JWT token in Authorization header)

## 3. Used Types
- `TextDTO` from types.ts:
  ```typescript
  interface TextDTO {
    id: string;
    title: string;
    content: string;
    language_id: string;
    language?: LanguageDTO;
    proficiency_level_id: string;
    proficiency_level?: ProficiencyLevelDTO;
    topic: string;
    visibility: 'public' | 'private';
    word_count: number;
    user_id?: string;
    created_at: string;
    updated_at: string;
  }
  ```
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
- Response type: `TextWithQuestionsDTO`:
  ```typescript
  interface TextWithQuestionsDTO {
    text: TextDTO;
    questions: QuestionDTO[];
  }
  ```

## 4. Response Details
- Status Code: 200 OK
- Response Body: TextWithQuestionsDTO
- Error Codes:
  - 401 Unauthorized: Invalid or missing authentication token
  - 403 Forbidden: User not authorized to access this text
  - 404 Not Found: Text not found
  - 500 Internal Server Error: Server-side error

## 5. Data Flow
1. Extract textId from path parameters
2. Validate textId using Zod schema
3. Query Supabase texts table with joins
4. Check user authorization
5. Query associated questions
6. Map database results to DTOs
7. Return combined response

## 6. Security Considerations
- JWT token validation
- Row Level Security (RLS) ensures users can only access:
  - Their own texts
  - Public texts
- Rate limiting to prevent abuse
- Input validation for path parameters

## 7. Error Handling
- 401: Invalid/missing token
  - Log: "Authentication failed: Invalid token"
  - Response: "Unauthorized: Invalid authentication token"
- 403: Unauthorized access
  - Log: "Authorization failed: User {userId} attempted to access text {textId}"
  - Response: "Forbidden: You don't have permission to access this text"
- 404: Text not found
  - Log: "Text not found: {textId}"
  - Response: "Not Found: Text not found"
- 500: Database error
  - Log: "Database error: {error details}"
  - Response: "Internal server error"

## 8. Performance Considerations
- Indexes on text_id and user_id
- Join optimization
- Consider caching for public texts
- Eager loading of questions to avoid N+1 queries

## 9. Implementation Steps
1. Create Zod schema for path parameter validation
   ```typescript
   const textIdSchema = z.string().uuid();
   ```

2. Add method to TextService
   ```typescript
   class TextService {
     async getTextById(
       textId: string,
       userId: string
     ): Promise<TextWithQuestionsDTO> {
       // Implementation
     }
   }
   ```

3. Implement endpoint handler
   ```typescript
   export const GET = async ({ params, locals }: APIContext) => {
     try {
       const textId = textIdSchema.parse(params.textId);
       const result = await textService.getTextById(textId, locals.user.id);
       return new Response(JSON.stringify(result), {
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
   const getCachedText = async (textId: string) => {
     const cacheKey = `text:${textId}`;
     const cached = await cache.get(cacheKey);
     if (cached) {
       return cached;
     }
     const text = await textService.getTextById(textId);
     await cache.set(cacheKey, text, 300); // Cache for 5 minutes
     return text;
   };
   ```

5. Add authorization check
   ```typescript
   const checkTextAccess = async (
     textId: string,
     userId: string
   ): Promise<boolean> => {
     const text = await textService.getTextById(textId);
     return text.visibility === 'public' || text.user_id === userId;
   };
   ```

6. Add unit tests
   ```typescript
   describe('GET /api/texts/{textId}', () => {
     it('should return text with questions', async () => {
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
   describe('Text Detail Integration', () => {
     it('should retrieve text with questions', async () => {
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
     logger.warn(`Slow text retrieval: ${duration}ms`);
   }
   ```

9. Add query optimization
   ```typescript
   const buildTextQuery = (textId: string) => {
     // Build optimized Supabase query with joins
   };
   ``` 