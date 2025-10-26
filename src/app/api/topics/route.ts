import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { directPrisma as prisma } from '@/lib/direct-prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level')

    // Build where clause
    const where: any = {}
    if (level) {
      where.level = level
    }

    // Get all topics
    const topics = await prisma.topic.findMany({
      where,
      orderBy: [
        { level: 'asc' },
        { orderIndex: 'asc' }
      ],
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
        objectives: true,
        materials: true,
        createdAt: true
      }
    })

    // If user is a student, get their progress for each topic
    let topicsWithProgress = topics
    if (session.user.role === 'STUDENT') {
      const progressData = await prisma.progress.findMany({
        where: {
          userId: session.user.id,
          topicId: { in: topics.map(t => t.id) }
        },
        select: {
          topicId: true,
          preClassComplete: true,
          liveClassAttended: true,
          afterClassComplete: true,
          completedAt: true
        }
      })

      // Create progress map for efficient lookup
      const progressMap = new Map(
        progressData.map(p => [p.topicId, p])
      )

      // Add progress to topics
      topicsWithProgress = topics.map(topic => ({
        ...topic,
        progress: progressMap.get(topic.id) || {
          preClassComplete: false,
          liveClassAttended: false,
          afterClassComplete: false,
          completedAt: null
        }
      }))
    }

    return NextResponse.json({
      success: true,
      topics: topicsWithProgress,
      count: topics.length
    })

  } catch (error: any) {
    console.error('Error fetching topics:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch topics',
      details: error.message
    }, { status: 500 })
  }
}