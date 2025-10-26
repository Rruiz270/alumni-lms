import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/admin/bookings - Get all bookings with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const teacherId = searchParams.get('teacherId')
    const studentId = searchParams.get('studentId')
    const level = searchParams.get('level')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (status && status !== 'ALL') {
      where.status = status
    }
    
    if (teacherId) {
      where.teacherId = teacherId
    }
    
    if (studentId) {
      where.studentId = studentId
    }
    
    if (level) {
      where.topic = {
        level: level
      }
    }
    
    if (startDate && endDate) {
      where.scheduledAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    } else if (startDate) {
      where.scheduledAt = {
        gte: new Date(startDate)
      }
    } else if (endDate) {
      where.scheduledAt = {
        lte: new Date(endDate)
      }
    }

    // Get bookings with pagination
    const [bookings, totalCount] = await Promise.all([
      prisma.booking.findMany({
        where,
        select: {
          id: true,
          scheduledAt: true,
          duration: true,
          status: true,
          googleMeetLink: true,
          cancelledAt: true,
          attendedAt: true,
          createdAt: true,
          updatedAt: true,
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              studentId: true,
              level: true
            }
          },
          teacher: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          topic: {
            select: {
              id: true,
              name: true,
              level: true,
              description: true
            }
          },
          attendanceLogs: {
            select: {
              action: true,
              timestamp: true,
              source: true
            },
            orderBy: { timestamp: 'desc' },
            take: 5
          }
        },
        skip,
        take: limit,
        orderBy: { scheduledAt: 'desc' }
      }),
      prisma.booking.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    // Get summary statistics for the current filter
    const stats = await prisma.booking.groupBy({
      by: ['status'],
      _count: true,
      where
    })

    const statusStats = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      bookings,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      stats: statusStats
    })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}