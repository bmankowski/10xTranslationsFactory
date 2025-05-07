# API Endpoint Implementation Plan: Get Proficiency Levels

## 1. Endpoint Overview
Retrieves a list of all available proficiency levels in the system, ordered by their display order.

## 2. Request Details
- HTTP Method: GET
- URL Pattern: `/api/proficiency-levels`
- Parameters: None
- Request Body: None
- Authentication: Required (JWT token in Authorization header)

## 3. Used Types
- `ProficiencyLevelDTO` from types.ts:
  ```typescript
  interface ProficiencyLevelDTO {
    id: string;
    name: string;
    display_order: number;
    created_at: string;
    updated_at: string;
  }
  ```
- `ListDTO<ProficiencyLevelDTO>` for response

## 4. Response Details
- Status Code: 200 OK
- Response Body: ListDTO<ProficiencyLevelDTO>
- Error Codes:
  - 401 Unauthorized: Invalid or missing authentication token
  - 500 Internal Server Error: Server-side error

## 5. Data Flow
1. Query Supabase proficiency_levels table
2. Order results by display_order
3. Map database results to ProficiencyLevelDTO array
4. Return response

## 6. Security Considerations
- JWT token validation
- Row Level Security (RLS) allows reading by all authenticated users
- Rate limiting to prevent abuse

## 7. Error Handling
- 401: Invalid/missing token
  - Log: "Authentication failed: Invalid token"
  - Response: "Unauthorized: Invalid authentication token"
- 500: Database error
  - Log: "Database error: {error details}"
  - Response: "Internal server error"

## 8. Performance Considerations
- Index on display_order field
- Consider caching as proficiency levels rarely change
- No joins required
- Small dataset, can be fully loaded

## 9. Implementation Steps
1. Create ProficiencyLevelService class
   ```typescript
   class ProficiencyLevelService {
     async getProficiencyLevels(): Promise<ProficiencyLevelDTO[]> {
       // Implementation
     }
   }
   ```

2. Implement endpoint handler
   ```typescript
   export const GET = async ({ locals }: APIContext) => {
     try {
       const levels = await proficiencyLevelService.getProficiencyLevels();
       return new Response(JSON.stringify({ items: levels }), {
         status: 200,
         headers: { 'Content-Type': 'application/json' }
       });
     } catch (error) {
       // Error handling
     }
   };
   ```

3. Add caching strategy
   ```typescript
   const getCachedProficiencyLevels = async () => {
     const cacheKey = 'proficiency_levels';
     const cached = await cache.get(cacheKey);
     if (cached) {
       return cached;
     }
     const levels = await proficiencyLevelService.getProficiencyLevels();
     await cache.set(cacheKey, levels, 3600); // Cache for 1 hour
     return levels;
   };
   ```

4. Add sorting
   ```typescript
   const sortProficiencyLevels = (levels: ProficiencyLevelDTO[]) => {
     return levels.sort((a, b) => a.display_order - b.display_order);
   };
   ```

5. Add unit tests
   ```typescript
   describe('GET /api/proficiency-levels', () => {
     it('should return proficiency levels in order', async () => {
       // Test implementation
     });
     
     it('should return empty array if no levels', async () => {
       // Test implementation
     });
   });
   ```

6. Add integration tests
   ```typescript
   describe('Proficiency Levels Integration', () => {
     it('should retrieve proficiency levels', async () => {
       // Test implementation
     });
   });
   ```

7. Add performance monitoring
   ```typescript
   const startTime = performance.now();
   // ... operation ...
   const duration = performance.now() - startTime;
   if (duration > 100) {
     logger.warn(`Slow proficiency levels query: ${duration}ms`);
   }
   ```

8. Add cache invalidation on updates
   ```typescript
   const invalidateProficiencyLevelsCache = async () => {
     await cache.delete('proficiency_levels');
   };
   ```

9. Add validation for display order
   ```typescript
   const validateDisplayOrder = (levels: ProficiencyLevelDTO[]) => {
     const orders = levels.map(level => level.display_order);
     const uniqueOrders = new Set(orders);
     if (uniqueOrders.size !== orders.length) {
       throw new Error('Duplicate display order found');
     }
   };
   ``` 