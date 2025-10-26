import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { RecommendationEngineService } from '@/lib/analytics/recommendation-engine'

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

    // Get active recommendations for the user
    const recommendations = await recommendationEngine.getActiveRecommendations(userId)
    
    return NextResponse.json(recommendations)
  } catch (error) {
    console.error('Error fetching recommendations:', error)
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
      case 'generateRecommendations':
        const recommendations = await recommendationEngine.generateAllRecommendations(session.user.id)
        return NextResponse.json(recommendations)

      case 'markViewed':
        await recommendationEngine.markRecommendationViewed(data.recommendationId)
        return NextResponse.json({ success: true })

      case 'markCompleted':
        await recommendationEngine.markRecommendationCompleted(
          data.recommendationId,
          data.userFeedback
        )
        return NextResponse.json({ success: true })

      case 'evaluateEffectiveness':
        const effectiveness = await recommendationEngine.evaluateRecommendationEffectiveness(
          data.recommendationId
        )
        return NextResponse.json({ effectiveness })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error processing recommendations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}