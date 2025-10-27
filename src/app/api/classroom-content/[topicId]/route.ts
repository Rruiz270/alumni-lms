import { NextRequest, NextResponse } from 'next/server'
import { directPrisma as prisma } from '@/lib/direct-prisma'
import { GoogleClassroomContentExtractor } from '@/lib/google-classroom-content'

export async function GET(
  request: NextRequest,
  { params }: { params: { topicId: string } }
) {
  try {
    const { topicId } = params

    // Get the topic with its classroom link
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      select: {
        id: true,
        name: true,
        level: true,
        classroomLink: true,
        tema: true,
        vocabulario: true,
        recursoGramatical: true
      }
    })

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      )
    }

    if (!topic.classroomLink) {
      return NextResponse.json(
        { error: 'No classroom link available for this topic' },
        { status: 404 }
      )
    }

    // Extract content from the classroom link with topic context
    const extractor = new GoogleClassroomContentExtractor()
    const content = await extractor.extractClassroomContent(
      topic.classroomLink, 
      topic.name, 
      topic.level
    )

    // Enrich content with topic-specific information
    const enrichedContent = {
      ...content,
      topic: {
        id: topic.id,
        name: topic.name,
        level: topic.level,
        tema: topic.tema,
        vocabulario: topic.vocabulario,
        recursoGramatical: topic.recursoGramatical
      },
      metadata: {
        totalSlides: content.slides.length,
        totalVideos: content.videos.length,
        totalDocuments: content.documents.length,
        extractedAt: new Date().toISOString()
      }
    }

    return NextResponse.json(enrichedContent)

  } catch (error) {
    console.error('Error fetching classroom content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch classroom content' },
      { status: 500 }
    )
  }
}