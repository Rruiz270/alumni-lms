import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get student's active package
    const packageInfo = await prisma.package.findFirst({
      where: {
        userId: session.user.id,
        validUntil: { gte: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get student's stats
    const studentStats = await prisma.studentStats.findUnique({
      where: { studentId: session.user.id }
    })

    // Get upcoming bookings
    const upcomingBookings = await prisma.booking.findMany({
      where: {
        studentId: session.user.id,
        scheduledAt: { gte: new Date() },
        status: 'SCHEDULED'
      },
      include: {
        teacher: {
          select: { id: true, name: true, email: true }
        },
        topic: {
          select: { id: true, name: true, level: true }
        }
      },
      orderBy: { scheduledAt: 'asc' },
      take: 5
    })

    // Calculate progress stats
    const totalProgress = await prisma.progress.count({
      where: { userId: session.user.id }
    })

    const completedProgress = await prisma.progress.count({
      where: {
        userId: session.user.id,
        preClassComplete: true,
        liveClassAttended: true,
        afterClassComplete: true
      }
    })

    return NextResponse.json({
      success: true,
      package: packageInfo ? {
        id: packageInfo.id,
        totalLessons: packageInfo.totalLessons,
        usedLessons: packageInfo.usedLessons,
        remainingLessons: packageInfo.remainingLessons,
        validFrom: packageInfo.validFrom.toISOString(),
        validUntil: packageInfo.validUntil.toISOString()
      } : null,
      stats: studentStats ? {
        totalClasses: studentStats.totalClasses,
        attendedClasses: studentStats.attendedClasses,
        attendanceRate: studentStats.attendanceRate,
        lastUpdated: studentStats.lastUpdated.toISOString()
      } : {
        totalClasses: 0,
        attendedClasses: 0,
        attendanceRate: 0,
        lastUpdated: new Date().toISOString()
      },
      progress: {
        totalTopics: totalProgress,
        completedTopics: completedProgress,
        completionRate: totalProgress > 0 ? Math.round((completedProgress / totalProgress) * 100) : 0
      },
      upcomingBookings: upcomingBookings.map(booking => ({
        id: booking.id,
        scheduledAt: booking.scheduledAt.toISOString(),
        teacher: booking.teacher,
        topic: booking.topic,
        googleMeetLink: booking.googleMeetLink,
        status: booking.status
      }))
    })

  } catch (error: any) {
    console.error('Error fetching student package data:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch package data',
      details: error.message
    }, { status: 500 })
  }
}