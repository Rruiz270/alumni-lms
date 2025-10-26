import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { StudentAnalyticsService } from '@/lib/analytics/student-analytics'
import { AchievementSystemService } from '@/lib/analytics/achievement-system'
import { RecommendationEngineService } from '@/lib/analytics/recommendation-engine'

const studentAnalytics = new StudentAnalyticsService()
const achievementSystem = new AchievementSystemService()
const recommendationEngine = new RecommendationEngineService()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || session.user.id
    
    // Ensure user can only access their own data unless they're an admin
    if (userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get comprehensive dashboard data
    const dashboardData = await studentAnalytics.getStudentDashboardData(userId)
    
    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Error fetching student analytics:', error)
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

    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'updateExerciseCompletion':
        await studentAnalytics.updateExerciseCompletion(
          session.user.id,
          data.exerciseId,
          data.score,
          data.timeSpent,
          data.skillArea
        )
        
        // Check for new achievements
        await achievementSystem.checkAndAwardAchievements(session.user.id)
        
        return NextResponse.json({ success: true })

      case 'updateClassAttendance':
        await studentAnalytics.updateClassAttendance(
          session.user.id,
          data.attended,
          data.classRating
        )
        return NextResponse.json({ success: true })

      case 'updateDailyMetrics':
        await studentAnalytics.updateDailyMetrics(session.user.id)
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error updating student analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}