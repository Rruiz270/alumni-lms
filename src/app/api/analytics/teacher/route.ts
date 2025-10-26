import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { TeacherAnalyticsService } from '@/lib/analytics/teacher-analytics'

const teacherAnalytics = new TeacherAnalyticsService()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId') || session.user.id
    const type = searchParams.get('type') // 'dashboard' | 'insights' | 'preparation'
    
    // Ensure user can only access their own data unless they're an admin
    if (teacherId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if user is a teacher
    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    switch (type) {
      case 'dashboard':
        const dashboardData = await teacherAnalytics.getTeacherDashboardData(teacherId)
        return NextResponse.json(dashboardData)

      case 'insights':
        const insights = await teacherAnalytics.getTeachingInsights(teacherId)
        return NextResponse.json(insights)

      case 'students':
        const studentProgress = await teacherAnalytics.getStudentProgressOverview(teacherId)
        return NextResponse.json(studentProgress)

      case 'trends':
        const days = parseInt(searchParams.get('days') || '30')
        const trends = await teacherAnalytics.getPerformanceTrends(teacherId, days)
        return NextResponse.json(trends)

      default:
        const defaultData = await teacherAnalytics.getTeacherDashboardData(teacherId)
        return NextResponse.json(defaultData)
    }
  } catch (error) {
    console.error('Error fetching teacher analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a teacher
    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'createClassAnalytics':
        const analytics = await teacherAnalytics.createClassAnalytics({
          ...data,
          teacherId: session.user.id
        })
        return NextResponse.json(analytics)

      case 'getClassPreparation':
        const preparation = await teacherAnalytics.getClassPreparationSuggestions(data.bookingId)
        return NextResponse.json(preparation)

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error processing teacher analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}