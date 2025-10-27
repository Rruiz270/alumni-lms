import { prisma } from './prisma'
import { GoogleClassroomContentExtractor } from './google-classroom-content'
import { google } from 'googleapis'
import fs from 'fs/promises'
import path from 'path'
import https from 'https'
import { promisify } from 'util'
import { pipeline } from 'stream'

const streamPipeline = promisify(pipeline)

export interface ImportJobProgress {
  jobId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  totalItems: number
  processedItems: number
  successfulItems: number
  failedItems: number
  currentItem?: string
  estimatedFinish?: Date
  errors: string[]
}

export interface ImportOptions {
  downloadMedia?: boolean
  extractAudio?: boolean
  generateThumbnails?: boolean
  quality?: 'high' | 'medium' | 'low'
  skipExisting?: boolean
}

export class ContentImportService {
  private extractor: GoogleClassroomContentExtractor
  private mediaDir: string

  constructor() {
    this.extractor = new GoogleClassroomContentExtractor()
    this.mediaDir = path.join(process.cwd(), 'public', 'imported-content')
  }

  /**
   * Start a bulk import job for all topics
   */
  async startBulkImport(options: ImportOptions = {}): Promise<string> {
    // Create import job record
    const job = await prisma.contentImportJob.create({
      data: {
        jobType: 'bulk_import',
        status: 'pending',
        source: 'google_classroom',
        importSettings: options as any,
        initiatedBy: 'system' // Or pass user ID
      }
    })

    // Start the import process asynchronously
    this.processBulkImport(job.id, options).catch(error => {
      console.error('Bulk import failed:', error)
      this.updateJobStatus(job.id, 'failed', undefined, [error.message])
    })

    return job.id
  }

  /**
   * Import a single topic by ID
   */
  async importSingleTopic(topicId: string, options: ImportOptions = {}): Promise<string> {
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      select: {
        id: true,
        name: true,
        level: true,
        classroomLink: true
      }
    })

    if (!topic || !topic.classroomLink) {
      throw new Error(`Topic ${topicId} not found or has no classroom link`)
    }

    // Create import job record
    const job = await prisma.contentImportJob.create({
      data: {
        jobType: 'single_topic',
        status: 'pending',
        source: 'google_classroom',
        sourceUrls: [topic.classroomLink],
        targetTopicIds: [topicId],
        importSettings: options as any,
        totalItems: 1,
        initiatedBy: 'system'
      }
    })

    // Start the import process asynchronously
    this.processSingleTopicImport(job.id, topic, options).catch(error => {
      console.error('Single topic import failed:', error)
      this.updateJobStatus(job.id, 'failed', undefined, [error.message])
    })

    return job.id
  }

  /**
   * Get the status of an import job
   */
  async getJobStatus(jobId: string): Promise<ImportJobProgress | null> {
    const job = await prisma.contentImportJob.findUnique({
      where: { id: jobId }
    })

    if (!job) return null

    return {
      jobId: job.id,
      status: job.status as any,
      totalItems: job.totalItems,
      processedItems: job.processedItems,
      successfulItems: job.successfulItems,
      failedItems: job.failedItems,
      estimatedFinish: job.estimatedFinish,
      errors: Array.isArray(job.errorLog) ? job.errorLog as string[] : []
    }
  }

  /**
   * Process bulk import for all topics
   */
  private async processBulkImport(jobId: string, options: ImportOptions) {
    console.log('Starting bulk import...')
    
    // Get all topics with classroom links
    const topics = await prisma.topic.findMany({
      where: {
        classroomLink: {
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        level: true,
        classroomLink: true
      }
    })

    await this.updateJobStatus(jobId, 'running', {
      totalItems: topics.length,
      startedAt: new Date()
    })

    const errors: string[] = []
    let successCount = 0
    let processedCount = 0

    for (const topic of topics) {
      try {
        console.log(`Importing topic: ${topic.name} (${topic.level})`)
        
        await this.importTopicContent(topic, options)
        successCount++
        
        console.log(`✓ Successfully imported: ${topic.name}`)
      } catch (error) {
        const errorMessage = `Failed to import ${topic.name}: ${error}`
        console.error(errorMessage)
        errors.push(errorMessage)
      }

      processedCount++
      
      // Update job progress
      await this.updateJobStatus(jobId, 'running', {
        processedItems: processedCount,
        successfulItems: successCount,
        failedItems: errors.length
      })
    }

    // Complete the job
    const finalStatus = errors.length === topics.length ? 'failed' : 'completed'
    await this.updateJobStatus(jobId, finalStatus, {
      completedAt: new Date(),
      summary: {
        totalTopics: topics.length,
        successful: successCount,
        failed: errors.length,
        importedPresentations: successCount
      }
    }, errors)

    console.log(`Bulk import completed: ${successCount}/${topics.length} topics imported`)
  }

  /**
   * Process single topic import
   */
  private async processSingleTopicImport(
    jobId: string, 
    topic: { id: string; name: string; level: string; classroomLink: string }, 
    options: ImportOptions
  ) {
    await this.updateJobStatus(jobId, 'running', {
      startedAt: new Date()
    })

    try {
      await this.importTopicContent(topic, options)
      
      await this.updateJobStatus(jobId, 'completed', {
        completedAt: new Date(),
        processedItems: 1,
        successfulItems: 1,
        summary: {
          topicName: topic.name,
          level: topic.level,
          imported: true
        }
      })
    } catch (error) {
      await this.updateJobStatus(jobId, 'failed', {
        completedAt: new Date(),
        processedItems: 1,
        failedItems: 1
      }, [error.message])
      throw error
    }
  }

  /**
   * Import content for a single topic
   */
  private async importTopicContent(
    topic: { id: string; name: string; level: string; classroomLink: string },
    options: ImportOptions
  ) {
    // Extract content from Google Classroom
    const content = await this.extractor.extractClassroomContent(
      topic.classroomLink,
      topic.name,
      topic.level
    )

    // Create presentation record
    const presentation = await prisma.presentation.create({
      data: {
        topicId: topic.id,
        title: topic.name,
        description: `Imported from Google Classroom - ${topic.level} level`,
        originalUrl: topic.classroomLink,
        originalGoogleId: this.extractor.extractPresentationId(topic.classroomLink),
        totalSlides: content.slides.length,
        level: topic.level as any,
        status: 'PUBLISHED',
        importSource: 'bulk_import',
        importedAt: new Date()
      }
    })

    // Import slides
    for (let i = 0; i < content.slides.length; i++) {
      const slideData = content.slides[i]
      
      const slide = await prisma.contentSlide.create({
        data: {
          presentationId: presentation.id,
          topicId: topic.id,
          title: slideData.title,
          slideNumber: i + 1,
          content: {
            embedUrl: slideData.embedUrl,
            fullUrl: slideData.fullUrl,
            originalData: slideData
          },
          thumbnailUrl: slideData.thumbnail,
          originalSlideId: slideData.id,
          googleEmbedUrl: slideData.embedUrl
        }
      })

      // Download slide thumbnail if requested
      if (options.downloadMedia && slideData.thumbnail) {
        try {
          const localPath = await this.downloadMedia(
            slideData.thumbnail,
            `slide-${slide.id}-thumb`,
            'IMAGE'
          )
          
          await prisma.contentSlide.update({
            where: { id: slide.id },
            data: { imageUrl: localPath }
          })
        } catch (error) {
          console.warn(`Failed to download thumbnail for slide ${slide.id}:`, error)
        }
      }
    }

    // Import videos
    for (const videoData of content.videos) {
      await prisma.mediaFile.create({
        data: {
          presentationId: presentation.id,
          filename: `${videoData.id}.mp4`,
          originalFilename: videoData.title,
          fileType: 'VIDEO',
          mimeType: 'video/mp4',
          fileSize: 0, // YouTube videos don't have size info
          title: videoData.title,
          originalUrl: videoData.embedUrl,
          youtubeId: videoData.id,
          thumbnailUrl: videoData.thumbnail,
          cloudUrl: videoData.embedUrl,
          isProcessed: true,
          processingStatus: 'completed'
        }
      })
    }

    // Import documents
    for (const docData of content.documents) {
      await prisma.mediaFile.create({
        data: {
          presentationId: presentation.id,
          filename: docData.title,
          originalFilename: docData.title,
          fileType: 'DOCUMENT',
          mimeType: docData.type === 'pdf' ? 'application/pdf' : 'application/vnd.google-apps.document',
          fileSize: 0,
          title: docData.title,
          originalUrl: docData.downloadUrl,
          cloudUrl: docData.previewUrl || docData.downloadUrl,
          isProcessed: true,
          processingStatus: 'completed'
        }
      })
    }

    console.log(`Imported presentation for ${topic.name}: ${content.slides.length} slides, ${content.videos.length} videos, ${content.documents.length} documents`)
  }

  /**
   * Download media file to local storage
   */
  private async downloadMedia(url: string, filename: string, type: 'IMAGE' | 'VIDEO' | 'AUDIO'): Promise<string> {
    // Ensure media directory exists
    await fs.mkdir(this.mediaDir, { recursive: true })

    const ext = type === 'IMAGE' ? '.png' : type === 'VIDEO' ? '.mp4' : '.mp3'
    const localFilename = `${filename}${ext}`
    const localPath = path.join(this.mediaDir, localFilename)
    const publicPath = `/imported-content/${localFilename}`

    return new Promise((resolve, reject) => {
      const file = fs.open(localPath, 'w')
      
      https.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download ${url}: ${response.statusCode}`))
          return
        }
        
        file.then(fileHandle => {
          const writeStream = fileHandle.createWriteStream()
          
          streamPipeline(response, writeStream)
            .then(() => {
              fileHandle.close()
              resolve(publicPath)
            })
            .catch(reject)
        }).catch(reject)
      }).on('error', reject)
    })
  }

  /**
   * Update job status in database
   */
  private async updateJobStatus(
    jobId: string, 
    status: string, 
    updates: Partial<any> = {}, 
    errors: string[] = []
  ) {
    const updateData: any = {
      status,
      updatedAt: new Date()
    }

    if (updates.totalItems !== undefined) updateData.totalItems = updates.totalItems
    if (updates.processedItems !== undefined) updateData.processedItems = updates.processedItems
    if (updates.successfulItems !== undefined) updateData.successfulItems = updates.successfulItems
    if (updates.failedItems !== undefined) updateData.failedItems = updates.failedItems
    if (updates.startedAt) updateData.startedAt = updates.startedAt
    if (updates.completedAt) updateData.completedAt = updates.completedAt
    if (updates.summary) updateData.summary = updates.summary
    if (errors.length > 0) updateData.errorLog = errors

    await prisma.contentImportJob.update({
      where: { id: jobId },
      data: updateData
    })
  }
}

// Singleton instance
export const contentImportService = new ContentImportService()