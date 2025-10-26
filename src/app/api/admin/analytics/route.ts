import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/admin/analytics - Get platform analytics
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
    const period = searchParams.get('period') || '30' // days

    const now = new Date()
    const periodStart = new Date(now.getTime() - parseInt(period) * 24 * 60 * 60 * 1000)

    // Get user statistics
    const [
      totalUsers,
      activeUsers,
      newUsers,
      usersByRole,
      usersByLevel,
      totalBookings,
      completedBookings,
      cancelledBookings,
      bookingsByStatus,
      classesThisMonth,
      topTopics,
      teacherStats,
      recentActivity
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Active users (users with bookings in the period)
      prisma.user.count({
        where: {
          OR: [
            {
              studentBookings: {
                some: {
                  scheduledAt: { gte: periodStart }
                }
              }
            },
            {
              teacherClasses: {
                some: {
                  scheduledAt: { gte: periodStart }
                }
              }
            }
          ]
        }
      }),
      
      // New users in period
      prisma.user.count({
        where: {
          createdAt: { gte: periodStart }
        }
      }),
      
      // Users by role
      prisma.user.groupBy({
        by: ['role'],
        _count: true
      }),
      
      // Students by level
      prisma.user.groupBy({
        by: ['level'],
        _count: true,
        where: {
          role: 'STUDENT',
          level: { not: null }
        }
      }),
      
      // Total bookings
      prisma.booking.count(),
      
      // Completed bookings
      prisma.booking.count({
        where: { status: 'COMPLETED' }
      }),
      
      // Cancelled bookings
      prisma.booking.count({
        where: { status: 'CANCELLED' }
      }),
      
      // Bookings by status
      prisma.booking.groupBy({
        by: ['status'],
        _count: true
      }),
      
      // Classes this month
      prisma.booking.count({
        where: {
          scheduledAt: {
            gte: new Date(now.getFullYear(), now.getMonth(), 1),
            lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
          }
        }
      }),
      
      // Top topics by bookings
      prisma.topic.findMany({
        select: {
          id: true,
          name: true,
          level: true,
          _count: {
            select: { bookings: true }
          }
        },
        orderBy: {
          bookings: { _count: 'desc' }
        },
        take: 10
      }),
      
      // Teacher statistics
      prisma.user.findMany({
        where: { role: 'TEACHER' },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              teacherClasses: {
                where: {
                  scheduledAt: { gte: periodStart }
                }
              }
            }
          }
        },
        orderBy: {
          teacherClasses: { _count: 'desc' }
        },
        take: 10
      }),
      
      // Recent activity (last 10 bookings)
      prisma.booking.findMany({
        select: {
          id: true,
          scheduledAt: true,
          status: true,
          student: {
            select: { name: true, studentId: true }
          },
          teacher: {
            select: { name: true }
          },
          topic: {
            select: { name: true, level: true }
          },
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ])

    // Calculate completion rate
    const completionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0
    const cancellationRate = totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0

    // Format user level data
    const levelDistribution = usersByLevel.map(item => ({
      level: item.level,
      count: item._count
    }))

    // Format role distribution
    const roleDistribution = usersByRole.map(item => ({
      role: item.role,
      count: item._count
    }))

    // Format status distribution
    const statusDistribution = bookingsByStatus.map(item => ({
      status: item.status,
      count: item._count
    }))

    // Get daily bookings for the period (for chart)
    const dailyBookings = await prisma.booking.groupBy({
      by: ['scheduledAt'],
      _count: true,
      where: {
        scheduledAt: { gte: periodStart }
      }
    })

    // Process daily bookings into chart data
    const chartData = []
    for (let i = parseInt(period) - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayBookings = dailyBookings.filter(booking => {
        const bookingDate = new Date(booking.scheduledAt).toISOString().split('T')[0]
        return bookingDate === dateStr
      })
      
      chartData.push({
        date: dateStr,
        bookings: dayBookings.reduce((sum, item) => sum + item._count, 0)
      })
    }

    const analytics = {
      overview: {
        totalUsers,
        activeUsers,
        newUsers,
        totalBookings,
        classesThisMonth,
        completionRate: Math.round(completionRate),
        cancellationRate: Math.round(cancellationRate)
      },
      distributions: {
        roleDistribution,
        levelDistribution,
        statusDistribution
      },
      topTopics: topTopics.map(topic => ({
        id: topic.id,
        name: topic.name,
        level: topic.level,
        bookings: topic._count.bookings
      })),
      teacherStats: teacherStats.map(teacher => ({
        id: teacher.id,
        name: teacher.name,
        classesInPeriod: teacher._count.teacherClasses
      })),
      chartData,
      recentActivity: recentActivity.map(booking => ({
        id: booking.id,
        type: 'booking',
        description: `${booking.student.name} booked ${booking.topic.name} (${booking.topic.level}) with ${booking.teacher.name}`,
        status: booking.status,
        scheduledAt: booking.scheduledAt,
        createdAt: booking.createdAt
      })),
      period: parseInt(period)
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}