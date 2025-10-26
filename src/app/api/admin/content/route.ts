import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

// GET /api/admin/content - Get content management overview
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (adminUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const contentType = searchParams.get('type') // 'topics', 'exercises', 'slides'
    const level = searchParams.get('level')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const skip = (page - 1) * limit

    if (contentType === 'topics') {
      // Get topics with their content counts
      const where: any = {}
      if (level && level !== 'ALL') {
        where.level = level
      }

      const [topics, totalCount] = await Promise.all([
        prisma.topic.findMany({
          where,
          select: {
            id: true,
            name: true,
            level: true,
            orderIndex: true,
            description: true,
            recursoGramatical: true,
            vocabulario: true,
            tema: true,
            objetivoImplicito: true,
            classroomLink: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                exercises: true,
                liveClassSlides: true,
                bookings: true,
                contents: true
              }
            }
          },
          skip,
          take: limit,
          orderBy: [{ level: 'asc' }, { orderIndex: 'asc' }]
        }),
        prisma.topic.count({ where })
      ])

      return NextResponse.json({
        topics,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1
        }
      })
    }

    if (contentType === 'exercises') {
      // Get exercises with topic information
      const where: any = {}
      if (level && level !== 'ALL') {
        where.topic = { level: level }
      }

      const [exercises, totalCount] = await Promise.all([
        prisma.exercise.findMany({
          where,
          select: {
            id: true,
            title: true,
            phase: true,
            category: true,
            type: true,
            instructions: true,
            points: true,
            orderIndex: true,
            createdAt: true,
            topic: {
              select: {
                id: true,
                name: true,
                level: true
              }
            },
            _count: {
              select: {
                submissions: true
              }
            }
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.exercise.count({ where })
      ])

      return NextResponse.json({
        exercises,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1
        }
      })
    }

    if (contentType === 'slides') {
      // Get slides with topic information
      const where: any = {}
      if (level && level !== 'ALL') {
        where.topic = { level: level }
      }

      const [slides, totalCount] = await Promise.all([
        prisma.slide.findMany({
          where,
          select: {
            id: true,
            slideNumber: true,
            title: true,
            type: true,
            notes: true,
            order: true,
            createdAt: true,
            topic: {
              select: {
                id: true,
                name: true,
                level: true
              }
            },
            _count: {
              select: {
                exercises: true
              }
            }
          },
          skip,
          take: limit,
          orderBy: [{ topicId: 'asc' }, { slideNumber: 'asc' }]
        }),
        prisma.slide.count({ where })
      ])

      return NextResponse.json({
        slides,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1
        }
      })
    }

    // Default: return content overview
    const [
      topicsCount,
      exercisesCount,
      slidesCount,
      contentsCount,
      topicsByLevel,
      exercisesByCategory,
      recentlyUpdated
    ] = await Promise.all([
      prisma.topic.count(),
      prisma.exercise.count(),
      prisma.slide.count(),
      prisma.content.count(),
      
      // Topics by level
      prisma.topic.groupBy({
        by: ['level'],
        _count: true,
        orderBy: { level: 'asc' }
      }),
      
      // Exercises by category
      prisma.exercise.groupBy({
        by: ['category'],
        _count: true
      }),
      
      // Recently updated content
      prisma.topic.findMany({
        select: {
          id: true,
          name: true,
          level: true,
          updatedAt: true
        },
        orderBy: { updatedAt: 'desc' },
        take: 10
      })
    ])

    return NextResponse.json({
      overview: {
        topicsCount,
        exercisesCount,
        slidesCount,
        contentsCount
      },
      distributions: {
        topicsByLevel: topicsByLevel.map(item => ({
          level: item.level,
          count: item._count
        })),
        exercisesByCategory: exercisesByCategory.map(item => ({
          category: item.category,
          count: item._count
        }))
      },
      recentlyUpdated
    })
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}