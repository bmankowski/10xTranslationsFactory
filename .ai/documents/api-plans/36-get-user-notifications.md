# API Endpoint Implementation Plan: Get User Notifications

## 1. Endpoint Overview
Retrieves a user's notifications, including unread and read notifications, with support for pagination and filtering.

## 2. Request Details
- HTTP Method: GET
- URL Pattern: `/api/users/me/notifications`
- Parameters:
  - limit: number (optional, default: 20)
  - offset: number (optional, default: 0)
  - status: 'all' | 'unread' | 'read' (optional, default: 'all')
- Request Body: None
- Authentication: Required (JWT token in Authorization header)

## 3. Used Types
- `NotificationDTO` from types.ts:
  ```typescript
  interface NotificationDTO {
    id: string;
    user_id: string;
    type: 'achievement' | 'reminder' | 'system' | 'friend' | 'progress';
    title: string;
    message: string;
    data?: Record<string, unknown>;
    is_read: boolean;
    created_at: string;
    read_at?: string;
  }
  ```
- Response type: `ListDTO<NotificationDTO>`

## 4. Response Details
- Status Code: 200 OK
- Response Body: ListDTO<NotificationDTO>
- Error Codes:
  - 400 Bad Request: Invalid query parameters
  - 401 Unauthorized: Invalid or missing authentication token
  - 500 Internal Server Error: Server-side error

## 5. Data Flow
1. Extract user ID from JWT token
2. Validate query parameters using Zod schema
3. Query Supabase for user's notifications
4. Map results to NotificationDTO array
5. Return response

## 6. Security Considerations
- JWT token validation
- Row Level Security (RLS) ensures users can only access their own notifications
- Rate limiting to prevent abuse
- Input validation for query parameters

## 7. Error Handling
- 400: Invalid query parameters
  - Log: "Validation error: {error details}"
  - Response: "Bad Request: {error message}"
- 401: Invalid/missing token
  - Log: "Authentication failed: Invalid token"
  - Response: "Unauthorized: Invalid authentication token"
- 500: Database error
  - Log: "Database error: {error details}"
  - Response: "Internal server error"

## 8. Performance Considerations
- Indexes on user_id, created_at, and is_read
- Cache notifications data
- Pagination for large result sets
- Optimize notification queries

## 9. Implementation Steps
1. Create Zod schema for validation
   ```typescript
   const getNotificationsSchema = z.object({
     limit: z.number().min(1).max(100).optional().default(20),
     offset: z.number().min(0).optional().default(0),
     status: z.enum(['all', 'unread', 'read']).optional().default('all')
   });
   ```

2. Add method to UserService
   ```typescript
   class UserService {
     async getNotifications(
       userId: string,
       params: {
         limit: number;
         offset: number;
         status: 'all' | 'unread' | 'read';
       }
     ): Promise<ListDTO<NotificationDTO>> {
       // Implementation
     }
   }
   ```

3. Implement endpoint handler
   ```typescript
   export const GET = async ({ url, locals }: APIContext) => {
     try {
       const params = {
         limit: Number(url.searchParams.get('limit')) || 20,
         offset: Number(url.searchParams.get('offset')) || 0,
         status: url.searchParams.get('status') || 'all'
       };
       
       const validatedParams = getNotificationsSchema.parse(params);
       const notifications = await userService.getNotifications(
         locals.user.id,
         validatedParams
       );
       
       return new Response(JSON.stringify(notifications), {
         status: 200,
         headers: { 'Content-Type': 'application/json' }
       });
     } catch (error) {
       // Error handling
     }
   };
   ```

4. Add notifications retrieval logic
   ```typescript
   const getNotifications = async (
     userId: string,
     params: {
       limit: number;
       offset: number;
       status: 'all' | 'unread' | 'read';
     }
   ): Promise<ListDTO<NotificationDTO>> => {
     let query = supabase
       .from('notifications')
       .select('*', { count: 'exact' })
       .eq('user_id', userId)
       .order('created_at', { ascending: false })
       .range(params.offset, params.offset + params.limit - 1);
     
     if (params.status !== 'all') {
       query = query.eq('is_read', params.status === 'read');
     }
     
     const { data, error, count } = await query;
     
     if (error) throw error;
     
     return {
       items: data,
       total: count || 0,
       limit: params.limit,
       offset: params.offset
     };
   };
   ```

5. Add caching strategy
   ```typescript
   const getCachedNotifications = async (
     userId: string,
     params: {
       limit: number;
       offset: number;
       status: 'all' | 'unread' | 'read';
     }
   ) => {
     const cacheKey = `notifications:${userId}:${params.status}:${params.offset}:${params.limit}`;
     const cached = await cache.get(cacheKey);
     if (cached) {
       return cached;
     }
     const notifications = await userService.getNotifications(userId, params);
     await cache.set(cacheKey, notifications, 300); // Cache for 5 minutes
     return notifications;
   };
   ```

6. Add unit tests
   ```typescript
   describe('GET /api/users/me/notifications', () => {
     it('should return notifications', async () => {
       // Test implementation
     });
     
     it('should handle pagination', async () => {
       // Test implementation
     });
     
     it('should filter by status', async () => {
       // Test implementation
     });
   });
   ```

7. Add integration tests
   ```typescript
   describe('User Notifications Integration', () => {
     it('should retrieve and cache notifications', async () => {
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
     logger.warn(`Slow notifications retrieval: ${duration}ms`);
   }
   ```

9. Add notification formatting
   ```typescript
   const formatNotification = (
     notification: Notification
   ): NotificationDTO => {
     return {
       ...notification,
       title: formatNotificationTitle(notification),
       message: formatNotificationMessage(notification)
     };
   };
   
   const formatNotificationTitle = (
     notification: Notification
   ): string => {
     switch (notification.type) {
       case 'achievement':
         return `Achievement Unlocked: ${notification.data?.achievement_name}`;
       case 'reminder':
         return 'Learning Reminder';
       case 'system':
         return 'System Notification';
       case 'friend':
         return `Friend Request: ${notification.data?.friend_name}`;
       case 'progress':
         return 'Learning Progress Update';
       default:
         return 'Notification';
     }
   };
   
   const formatNotificationMessage = (
     notification: Notification
   ): string => {
     switch (notification.type) {
       case 'achievement':
         return `Congratulations! You've unlocked the "${notification.data?.achievement_name}" achievement.`;
       case 'reminder':
         return 'Time to continue your learning journey!';
       case 'system':
         return notification.message;
       case 'friend':
         return `${notification.data?.friend_name} wants to connect with you.`;
       case 'progress':
         return `You've completed ${notification.data?.completed_items} items today!`;
       default:
         return notification.message;
     }
   };
   ```

10. Add cache invalidation
    ```typescript
    const invalidateNotificationsCache = async (userId: string) => {
      const patterns = [
        `notifications:${userId}:all:*`,
        `notifications:${userId}:unread:*`,
        `notifications:${userId}:read:*`
      ];
      
      await Promise.all(
        patterns.map(pattern => cache.delPattern(pattern))
      );
    };
    ```

11. Add notification count
    ```typescript
    const getNotificationCounts = async (
      userId: string
    ): Promise<{ total: number; unread: number }> => {
      const { data, error } = await supabase
        .from('notifications')
        .select('is_read', { count: 'exact' })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      const unread = data.filter(n => !n.is_read).length;
      
      return {
        total: data.length,
        unread
      };
    };
    ``` 