import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { contentImportService } from '@/lib/content-import-service'

// POST /api/admin/content/import - Start content import
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { 
      type = 'bulk_import', 
      topicId,
      options = {}
    } = body

    let jobId: string

    if (type === 'bulk_import') {
      // Start bulk import for all topics
      jobId = await contentImportService.startBulkImport({
        downloadMedia: options.downloadMedia ?? true,
        extractAudio: options.extractAudio ?? true,
        generateThumbnails: options.generateThumbnails ?? true,
        quality: options.quality ?? 'medium',
        skipExisting: options.skipExisting ?? true
      })
    } else if (type === 'single_topic' && topicId) {
      // Import single topic
      jobId = await contentImportService.importSingleTopic(topicId, {
        downloadMedia: options.downloadMedia ?? true,
        extractAudio: options.extractAudio ?? true,
        generateThumbnails: options.generateThumbnails ?? true,
        quality: options.quality ?? 'medium',
        skipExisting: options.skipExisting ?? true
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid import type or missing topicId for single import' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      jobId,
      message: `${type} started successfully`
    })

  } catch (error) {
    console.error('Content import error:', error)
    return NextResponse.json(
      { error: 'Failed to start content import' },
      { status: 500 }
    )
  }
}

// GET /api/admin/content/import?jobId=xxx - Get import job status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId parameter required' },
        { status: 400 }
      )
    }

    const status = await contentImportService.getJobStatus(jobId)

    if (!status) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(status)

  } catch (error) {
    console.error('Get import status error:', error)
    return NextResponse.json(
      { error: 'Failed to get import status' },
      { status: 500 }
    )
  }
}