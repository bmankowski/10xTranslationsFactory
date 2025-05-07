# API Endpoint Implementation Plan: Get Languages

## 1. Endpoint Overview
Retrieves a list of all available languages in the system, with optional filtering by active status.

## 2. Request Details
- HTTP Method: GET
- URL Pattern: `/api/languages`
- Parameters:
  - is_active (query parameter, optional): boolean
- Request Body: None
- Authentication: Required (JWT token in Authorization header)

## 3. Used Types
- `LanguageDTO` from types.ts:
  ```typescript
  interface LanguageDTO {
    id: string;
    code: string;
    name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }
  ```
- `ListDTO<LanguageDTO>` for response

## 4. Response Details
- Status Code: 200 OK
- Response Body: ListDTO<LanguageDTO>
- Error Codes:
  - 401 Unauthorized: Invalid or missing authentication token
  - 500 Internal Server Error: Server-side error

## 5. Data Flow
1. Extract query parameters
2. Validate query parameters using Zod schema
3. Query Supabase languages table with optional filter
4. Map database results to LanguageDTO array
5. Return response

## 6. Security Considerations
- JWT token validation
- Row Level Security (RLS) allows reading by all authenticated users
- Rate limiting to prevent abuse
- Input validation for query parameters

## 7. Error Handling
- 401: Invalid/missing token
  - Log: "Authentication failed: Invalid token"
  - Response: "Unauthorized: Invalid authentication token"
- 400: Invalid query parameters
  - Log: "Validation error: {error details}"
  - Response: "Bad Request: {validation error message}"
- 500: Database error
  - Log: "Database error: {error details}"
  - Response: "Internal server error"

## 8. Performance Considerations
- Index on is_active field
- Consider caching as languages rarely change
- No joins required
- Sort by name for consistent ordering

## 9. Implementation Steps
1. Create Zod schema for query parameter validation
   ```typescript
   const languagesQuerySchema = z.object({
     is_active: z.boolean().optional()
   });
   ```

2. Create LanguageService class
   ```typescript
   class LanguageService {
     async getLanguages(filter?: { is_active?: boolean }): Promise<LanguageDTO[]> {
       // Implementation
     }
   }
   ```

3. Implement endpoint handler
   ```typescript
   export const GET = async ({ url, locals }: APIContext) => {
     try {
       const queryParams = languagesQuerySchema.parse(
         Object.fromEntries(url.searchParams)
       );
       const languages = await languageService.getLanguages(queryParams);
       return new Response(JSON.stringify({ items: languages }), {
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
   const getCachedLanguages = async (filter?: { is_active?: boolean }) => {
     const cacheKey = `languages:${filter?.is_active ?? 'all'}`;
     const cached = await cache.get(cacheKey);
     if (cached) {
       return cached;
     }
     const languages = await languageService.getLanguages(filter);
     await cache.set(cacheKey, languages, 3600); // Cache for 1 hour
     return languages;
   };
   ```

5. Add sorting
   ```typescript
   const sortLanguages = (languages: LanguageDTO[]) => {
     return languages.sort((a, b) => a.name.localeCompare(b.name));
   };
   ```

6. Add unit tests
   ```typescript
   describe('GET /api/languages', () => {
     it('should return all languages', async () => {
       // Test implementation
     });
     
     it('should filter by active status', async () => {
       // Test implementation
     });
     
     it('should reject invalid query parameters', async () => {
       // Test implementation
     });
   });
   ```

7. Add integration tests
   ```typescript
   describe('Languages Integration', () => {
     it('should retrieve languages with filtering', async () => {
       // Test implementation
     });
   });
   ```

8. Add performance monitoring
   ```typescript
   const startTime = performance.now();
   // ... operation ...
   const duration = performance.now() - startTime;
   if (duration > 100) {
     logger.warn(`Slow languages query: ${duration}ms`);
   }
   ```

9. Add cache invalidation on language updates
   ```typescript
   const invalidateLanguageCache = async () => {
     await cache.delete('languages:all');
     await cache.delete('languages:true');
     await cache.delete('languages:false');
   };
   ``` 