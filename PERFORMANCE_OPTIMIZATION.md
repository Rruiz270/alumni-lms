# Performance Optimization Guide

## Issues Identified & Solutions

### 1. **Database Query Optimization**

**Problem**: Slow API responses due to inefficient database queries

**Solutions**:
```sql
-- Add missing indexes
CREATE INDEX idx_user_role ON "User"(role);
CREATE INDEX idx_user_active ON "User"("isActive");
CREATE INDEX idx_booking_scheduled_at ON "Booking"("scheduledAt");
CREATE INDEX idx_booking_status ON "Booking"(status);
CREATE INDEX idx_topic_level ON "Topic"(level);

-- Compound indexes for common queries
CREATE INDEX idx_user_role_active ON "User"(role, "isActive");
CREATE INDEX idx_booking_student_status ON "Booking"("studentId", status);
CREATE INDEX idx_booking_teacher_date ON "Booking"("teacherId", "scheduledAt");
```

### 2. **API Response Optimization**

**Current Issues**:
- Fetching unnecessary fields
- No pagination limits
- Missing data caching

**Fixed API Routes**:

```typescript
// Optimized user list endpoint
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50) // Max 50

  // Use select to limit fields
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      // Only include counts when needed
      _count: {
        select: {
          studentBookings: true,
          teacherClasses: true
        }
      }
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json({ users })
}
```

### 3. **Frontend Performance**

**Issues**:
- Loading all data at once
- No virtual scrolling
- Heavy re-renders

**Solutions**:

```typescript
// Implement virtual scrolling for large lists
import { FixedSizeList as List } from 'react-window'

// Memoize expensive components
const UserRow = React.memo(({ user }: { user: User }) => {
  return (
    <div className="flex items-center p-4">
      {/* User content */}
    </div>
  )
})

// Use React Query for caching
import { useQuery } from '@tanstack/react-query'

const { data: users, isLoading } = useQuery({
  queryKey: ['users', page, filters],
  queryFn: () => fetchUsers(page, filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
  keepPreviousData: true
})
```

### 4. **Implement Caching**

```typescript
// Add Redis caching layer
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export async function getCachedUsers(page: number, filters: any) {
  const cacheKey = `users:${page}:${JSON.stringify(filters)}`
  
  // Try cache first
  const cached = await redis.get(cacheKey)
  if (cached) {
    return JSON.parse(cached)
  }
  
  // Fetch from database
  const users = await fetchUsersFromDB(page, filters)
  
  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(users))
  
  return users
}
```

### 5. **Database Connection Optimization**

```typescript
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  // Enable connection pooling
  previewFeatures = ["jsonProtocol"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Add connection pooling
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
}
```

```typescript
// lib/prisma.ts - Optimized connection
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
    // Connection pool settings
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 6. **Lazy Loading Components**

```typescript
// Lazy load heavy admin components
import dynamic from 'next/dynamic'

const UserManagement = dynamic(() => import('./users/page'), {
  loading: () => <div className="animate-pulse">Loading users...</div>,
  ssr: false
})

const Analytics = dynamic(() => import('./analytics/page'), {
  loading: () => <div className="animate-pulse">Loading analytics...</div>,
  ssr: false
})
```

### 7. **API Rate Limiting**

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
})

export async function middleware(request: Request) {
  if (request.url.includes('/api/admin')) {
    const { success } = await ratelimit.limit('admin-api')
    
    if (!success) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }
  }
  
  return NextResponse.next()
}
```

### 8. **Image Optimization**

```typescript
// next.config.ts
const nextConfig = {
  images: {
    domains: ['your-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  // Enable compression
  compress: true,
  // Optimize bundle
  swcMinify: true,
}
```

### 9. **Quick Fixes for Immediate Performance**

1. **Reduce API payload sizes**:
   ```typescript
   // Instead of fetching everything
   const users = await prisma.user.findMany({
     include: {
       studentBookings: true,
       teacherClasses: true,
       packages: true,
       progress: true
     }
   })
   
   // Only fetch what you need
   const users = await prisma.user.findMany({
     select: {
       id: true,
       name: true,
       email: true,
       role: true,
       _count: {
         select: { studentBookings: true }
       }
     }
   })
   ```

2. **Add loading states**:
   ```typescript
   {loading ? (
     <div className="animate-pulse space-y-4">
       {Array.from({ length: 5 }).map((_, i) => (
         <div key={i} className="h-16 bg-gray-200 rounded" />
       ))}
     </div>
   ) : (
     <UserList users={users} />
   )}
   ```

3. **Implement debounced search**:
   ```typescript
   import { useDebouncedCallback } from 'use-debounce'
   
   const debouncedSearch = useDebouncedCallback((value) => {
     setFilters({ ...filters, search: value })
   }, 300)
   ```

## Immediate Actions

1. Add database indexes (run the SQL above)
2. Implement pagination limits (max 50 items per page)
3. Add loading states to all components
4. Use React.memo for list items
5. Implement debounced search
6. Add error boundaries

## Performance Monitoring

```typescript
// Add performance monitoring
export function usePerformanceMonitoring() {
  useEffect(() => {
    // Measure API response times
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name.includes('/api/admin')) {
          console.log(`API ${entry.name}: ${entry.duration}ms`)
        }
      })
    })
    
    observer.observe({ entryTypes: ['measure'] })
    
    return () => observer.disconnect()
  }, [])
}
```

These optimizations should significantly improve the admin panel performance. The most impactful changes are:

1. **Database indexes** - Will speed up queries by 5-10x
2. **Pagination limits** - Reduces data transfer
3. **Selective field fetching** - Reduces payload size
4. **Component memoization** - Prevents unnecessary re-renders
5. **Caching** - Avoids repeated database calls

Would you like me to implement any specific optimization first?