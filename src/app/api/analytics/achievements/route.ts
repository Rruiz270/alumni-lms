import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AchievementSystemService } from '@/lib/analytics/achievement-system'

const achievementSystem = new AchievementSystemService()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || session.user.id
    const type = searchParams.get('type') // 'progress' | 'earned'
    
    // Ensure user can only access their own data unless they're an admin
    if (userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (type === 'progress') {
      // Get badge progress for student
      const badgeProgress = await achievementSystem.getBadgeProgress(userId)
      return NextResponse.json(badgeProgress)
    } else {
      // Get earned achievements
      const achievements = await achievementSystem.getStudentAchievements(userId)
      return NextResponse.json(achievements)
    }
  } catch (error) {
    console.error('Error fetching achievements:', error)
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
      case 'checkAchievements':
        const newAchievements = await achievementSystem.checkAndAwardAchievements(session.user.id)
        return NextResponse.json({ newAchievements })

      case 'initializeBadges':
        // Admin only action
        if (session.user.role !== 'ADMIN') {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
        await achievementSystem.initializeDefaultBadges()
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error processing achievements:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}