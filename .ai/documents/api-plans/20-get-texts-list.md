# API Endpoint Implementation Plan: Get Texts List

## 1. Endpoint Overview
Retrieves a paginated list of texts with optional filtering by language, proficiency level, visibility, and user.

## 2. Request Details
- HTTP Method: GET
- URL Pattern: `/api/texts`
- Parameters:
  - language_id (query parameter, optional): UUID
  - proficiency_level_id (query parameter, optional): UUID
  - visibility (query parameter, optional): 'public' | 'private' | 'all'
  - user_id (query parameter, optional): UUID
  - limit (query parameter, optional): number
  - offset (query parameter, optional): number
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
- `PaginatedListDTO<TextDTO>` for response

## 4. Response Details
- Status Code: 200 OK
- Response Body: PaginatedListDTO<TextDTO>
- Error Codes:
  - 400 Bad Request: Invalid query parameters
  - 401 Unauthorized: Invalid or missing authentication token
  - 500 Internal Server Error: Server-side error

## 5. Data Flow
1. Extract query parameters
2. Validate query parameters using Zod schema
3. Build filter conditions based on parameters
4. Query Supabase texts table with joins and filters
5. Map database results to TextDTO array
6. Return paginated response

## 6. Security Considerations
- JWT token validation
- Row Level Security (RLS) ensures users can only access:
  - Their own texts
  - Public texts
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
- Indexes on filter fields
- Pagination to limit result size
- Join optimization
- Consider caching for public texts
- Implement cursor-based pagination for better performance

## 9. Implementation Steps
1. Create Zod schema for query parameter validation
   ```typescript
   const textsQuerySchema = z.object({
     language_id: z.string().uuid().optional(),
     proficiency_level_id: z.string().uuid().optional(),
     visibility: z.enum(['public', 'private', 'all']).optional(),
     user_id: z.string().uuid().optional(),
     limit: z.number().int().min(1).max(100).optional(),
     offset: z.number().int().min(0).optional()
   });
   ```

2. Add method to TextService
   ```typescript
   class TextService {
     async getTexts(
       filter: {
         language_id?: string;
         proficiency_level_id?: string;
         visibility?: 'public' | 'private' | 'all';
         user_id?: string;
       },
       pagination: {
         limit: number;
         offset: number;
       }
     ): Promise<PaginatedListDTO<TextDTO>> {
       // Implementation
     }
   }
   ```

3. Implement endpoint handler
   ```typescript
   export const GET = async ({ url, locals }: APIContext) => {
     try {
       const queryParams = textsQuerySchema.parse(
         Object.fromEntries(url.searchParams)
       );
       const result = await textService.getTexts(
         {
           language_id: queryParams.language_id,
           proficiency_level_id: queryParams.proficiency_level_id,
           visibility: queryParams.visibility,
           user_id: queryParams.user_id
         },
         {
           limit: queryParams.limit ?? 20,
           offset: queryParams.offset ?? 0
         }
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

4. Add caching strategy
   ```typescript
   const getCachedTexts = async (
     filter: TextFilter,
     pagination: PaginationParams
   ) => {
     const cacheKey = `texts:${JSON.stringify(filter)}:${JSON.stringify(pagination)}`;
     const cached = await cache.get(cacheKey);
     if (cached) {
       return cached;
     }
     const texts = await textService.getTexts(filter, pagination);
     await cache.set(cacheKey, texts, 300); // Cache for 5 minutes
     return texts;
   };
   ```

5. Add cursor-based pagination
   ```typescript
   const getTextsWithCursor = async (
     filter: TextFilter,
     cursor?: string
   ) => {
     // Implementation using cursor-based pagination
   };
   ```

6. Add unit tests
   ```typescript
   describe('GET /api/texts', () => {
     it('should return paginated texts', async () => {
       // Test implementation
     });
     
     it('should filter by parameters', async () => {
       // Test implementation
     });
     
     it('should handle invalid parameters', async () => {
       // Test implementation
     });
   });
   ```

7. Add integration tests
   ```typescript
   describe('Texts List Integration', () => {
     it('should retrieve texts with filters', async () => {
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
     logger.warn(`Slow texts query: ${duration}ms`);
   }
   ```

9. Add query optimization
   ```typescript
   const buildTextQuery = (
     filter: TextFilter,
     pagination: PaginationParams
   ) => {
     // Build optimized Supabase query
   };
   ``` 