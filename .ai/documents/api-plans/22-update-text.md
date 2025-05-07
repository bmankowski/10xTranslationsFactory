# API Endpoint Implementation Plan: Update Text

## 1. Endpoint Overview
Updates an existing text's metadata and content, including title, content, language, proficiency level, topic, and visibility.

## 2. Request Details
- HTTP Method: PUT
- URL Pattern: `/api/texts/{textId}`
- Parameters:
  - textId (path parameter): UUID
- Request Body: UpdateTextCommand
  ```typescript
  interface UpdateTextCommand {
    title?: string;
    content?: string;
    language_id?: string;
    proficiency_level_id?: string;
    topic?: string;
    visibility?: 'public' | 'private';
  }
  ```
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
- Response type: `TextDTO`

## 4. Response Details
- Status Code: 200 OK
- Response Body: TextDTO
- Error Codes:
  - 400 Bad Request: Invalid request body
  - 401 Unauthorized: Invalid or missing authentication token
  - 403 Forbidden: User not authorized to update this text
  - 404 Not Found: Text not found
  - 500 Internal Server Error: Server-side error

## 5. Data Flow
1. Extract textId from path parameters
2. Validate textId using Zod schema
3. Validate request body using Zod schema
4. Check user authorization
5. Verify language and proficiency level exist if provided
6. Update text in Supabase
7. Map database result to TextDTO
8. Return updated text

## 6. Security Considerations
- JWT token validation
- Row Level Security (RLS) ensures users can only update their own texts
- Rate limiting to prevent abuse
- Input validation for path parameters and request body
- Content sanitization for text content

## 7. Error Handling
- 400: Invalid request body
  - Log: "Validation error: {error details}"
  - Response: "Bad Request: {validation error message}"
- 401: Invalid/missing token
  - Log: "Authentication failed: Invalid token"
  - Response: "Unauthorized: Invalid authentication token"
- 403: Unauthorized update
  - Log: "Authorization failed: User {userId} attempted to update text {textId}"
  - Response: "Forbidden: You don't have permission to update this text"
- 404: Text not found
  - Log: "Text not found: {textId}"
  - Response: "Not Found: Text not found"
- 500: Database error
  - Log: "Database error: {error details}"
  - Response: "Internal server error"

## 8. Performance Considerations
- Indexes on text_id and user_id
- Optimistic locking to prevent conflicts
- Cache invalidation after update
- Transaction for related updates

## 9. Implementation Steps
1. Create Zod schemas for validation
   ```typescript
   const textIdSchema = z.string().uuid();
   
   const updateTextSchema = z.object({
     title: z.string().min(1).max(255).optional(),
     content: z.string().min(1).optional(),
     language_id: z.string().uuid().optional(),
     proficiency_level_id: z.string().uuid().optional(),
     topic: z.string().min(1).max(100).optional(),
     visibility: z.enum(['public', 'private']).optional()
   });
   ```

2. Add method to TextService
   ```typescript
   class TextService {
     async updateText(
       textId: string,
       userId: string,
       update: UpdateTextCommand
     ): Promise<TextDTO> {
       // Implementation
     }
   }
   ```

3. Implement endpoint handler
   ```typescript
   export const PUT = async ({ params, request, locals }: APIContext) => {
     try {
       const textId = textIdSchema.parse(params.textId);
       const update = updateTextSchema.parse(await request.json());
       const result = await textService.updateText(textId, locals.user.id, update);
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
   const checkTextOwnership = async (
     textId: string,
     userId: string
   ): Promise<boolean> => {
     const text = await textService.getTextById(textId);
     return text.user_id === userId;
   };
   ```

5. Add cache invalidation
   ```typescript
   const invalidateTextCache = async (textId: string) => {
     const cacheKey = `text:${textId}`;
     await cache.del(cacheKey);
   };
   ```

6. Add unit tests
   ```typescript
   describe('PUT /api/texts/{textId}', () => {
     it('should update text', async () => {
       // Test implementation
     });
     
     it('should handle unauthorized update', async () => {
       // Test implementation
     });
     
     it('should handle non-existent text', async () => {
       // Test implementation
     });
     
     it('should validate request body', async () => {
       // Test implementation
     });
   });
   ```

7. Add integration tests
   ```typescript
   describe('Text Update Integration', () => {
     it('should update text and invalidate cache', async () => {
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
     logger.warn(`Slow text update: ${duration}ms`);
   }
   ```

9. Add optimistic locking
   ```typescript
   const updateTextWithLock = async (
     textId: string,
     update: UpdateTextCommand,
     version: number
   ) => {
     // Implementation with optimistic locking
   };
   ``` 