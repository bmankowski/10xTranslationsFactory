# API Endpoint Implementation Plan: Delete Text

## 1. Endpoint Overview
Deletes a text and its associated questions from the system. This operation is permanent and cannot be undone.

## 2. Request Details
- HTTP Method: DELETE
- URL Pattern: `/api/texts/{textId}`
- Parameters:
  - textId (path parameter): UUID
- Request Body: None
- Authentication: Required (JWT token in Authorization header)

## 3. Used Types
- No request/response DTOs needed
- Path parameter: textId (string)

## 4. Response Details
- Status Code: 204 No Content
- Response Body: None
- Error Codes:
  - 401 Unauthorized: Invalid or missing authentication token
  - 403 Forbidden: User not authorized to delete this text
  - 404 Not Found: Text not found
  - 500 Internal Server Error: Server-side error

## 5. Data Flow
1. Extract textId from path parameters
2. Validate textId using Zod schema
3. Check user authorization
4. Delete associated questions
5. Delete text
6. Return success response

## 6. Security Considerations
- JWT token validation
- Row Level Security (RLS) ensures users can only delete their own texts
- Rate limiting to prevent abuse
- Input validation for path parameters
- Soft delete option for data recovery

## 7. Error Handling
- 401: Invalid/missing token
  - Log: "Authentication failed: Invalid token"
  - Response: "Unauthorized: Invalid authentication token"
- 403: Unauthorized deletion
  - Log: "Authorization failed: User {userId} attempted to delete text {textId}"
  - Response: "Forbidden: You don't have permission to delete this text"
- 404: Text not found
  - Log: "Text not found: {textId}"
  - Response: "Not Found: Text not found"
- 500: Database error
  - Log: "Database error: {error details}"
  - Response: "Internal server error"

## 8. Performance Considerations
- Indexes on text_id and user_id
- Transaction for deleting text and questions
- Cache invalidation after deletion
- Consider soft delete for data recovery

## 9. Implementation Steps
1. Create Zod schema for path parameter validation
   ```typescript
   const textIdSchema = z.string().uuid();
   ```

2. Add method to TextService
   ```typescript
   class TextService {
     async deleteText(
       textId: string,
       userId: string
     ): Promise<void> {
       // Implementation
     }
   }
   ```

3. Implement endpoint handler
   ```typescript
   export const DELETE = async ({ params, locals }: APIContext) => {
     try {
       const textId = textIdSchema.parse(params.textId);
       await textService.deleteText(textId, locals.user.id);
       return new Response(null, { status: 204 });
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

6. Add soft delete option
   ```typescript
   const softDeleteText = async (textId: string) => {
     await supabase
       .from('texts')
       .update({ deleted_at: new Date().toISOString() })
       .eq('id', textId);
   };
   ```

7. Add unit tests
   ```typescript
   describe('DELETE /api/texts/{textId}', () => {
     it('should delete text and questions', async () => {
       // Test implementation
     });
     
     it('should handle unauthorized deletion', async () => {
       // Test implementation
     });
     
     it('should handle non-existent text', async () => {
       // Test implementation
     });
   });
   ```

8. Add integration tests
   ```typescript
   describe('Text Deletion Integration', () => {
     it('should delete text and invalidate cache', async () => {
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
     logger.warn(`Slow text deletion: ${duration}ms`);
   }
   ```

10. Add transaction support
    ```typescript
    const deleteTextWithTransaction = async (textId: string) => {
      const { error } = await supabase.rpc('delete_text_with_questions', {
        p_text_id: textId
      });
      if (error) throw error;
    };
    ``` 