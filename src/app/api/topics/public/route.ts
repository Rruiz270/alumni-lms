import { NextRequest, NextResponse } from 'next/server'
import { directPrisma as prisma } from '@/lib/direct-prisma'

// Public endpoint for displaying topics without authentication
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level')

    // Build where clause
    const where: any = {}
    if (level) {
      where.level = level
    }

    // Get all topics (public data only)
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

    return NextResponse.json({
      success: true,
      topics: topics,
      count: topics.length
    })

  } catch (error: any) {
    console.error('Error fetching public topics:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch topics',
      details: error.message
    }, { status: 500 })
  }
}