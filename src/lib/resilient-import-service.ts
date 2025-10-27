import { directPrisma as prisma } from './direct-prisma'
import { GoogleClassroomContentExtractor } from './google-classroom-content'

export interface ResilientImportOptions {
  batchSize?: number
  delayBetweenBatches?: number
  maxRetries?: number
  skipExisting?: boolean
}

export class ResilientImportService {
  private extractor: GoogleClassroomContentExtractor

  constructor() {
    this.extractor = new GoogleClassroomContentExtractor()
  }

  /**
   * Resume import for remaining topics with better error handling
   */
  async resumeImport(options: ResilientImportOptions = {}): Promise<string> {
    const {
      batchSize = 5,           // Process 5 topics at a time
      delayBetweenBatches = 3000, // 3 second delay between batches
      maxRetries = 3,
      skipExisting = true
    } = options

    console.log('🔄 Starting resilient import process...')
    
    // Create new import job
    const job = await prisma.contentImportJob.create({
      data: {
        jobType: 'resilient_resume',
        status: 'running',
        source: 'google_classroom',
        importSettings: options as any,
        initiatedBy: 'system',
        startedAt: new Date()
      }
    })

    // Get remaining topics to import
    const remainingTopics = await this.getRemainingTopics()
    
    await prisma.contentImportJob.update({
      where: { id: job.id },
      data: { 
        totalItems: remainingTopics.length,
        processedItems: 0,
        successfulItems: 0,
        failedItems: 0
      }
    })

    console.log(`📋 Found ${remainingTopics.length} topics to import`)
    console.log(`⚙️ Processing in batches of ${batchSize} with ${delayBetweenBatches}ms delays`)

    // Process in batches
    let successCount = 0
    let processedCount = 0
    const errors: string[] = []

    for (let i = 0; i < remainingTopics.length; i += batchSize) {
      const batch = remainingTopics.slice(i, i + batchSize)
      console.log(`\\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(remainingTopics.length / batchSize)}`)
      
      // Process each topic in the batch
      for (const topic of batch) {
        let success = false
        let retryCount = 0

        while (!success && retryCount < maxRetries) {
          try {
            console.log(`  🔄 Importing: ${topic.name} (${topic.level}) - Attempt ${retryCount + 1}`)
            
            await this.importSingleTopicWithRetry(topic)
            console.log(`  ✅ Success: ${topic.name}`)
            
            successCount++
            success = true
            
          } catch (error) {
            retryCount++
            const errorMessage = `Failed to import ${topic.name} (attempt ${retryCount}): ${error}`
            console.error(`  ❌ ${errorMessage}`)
            
            if (retryCount >= maxRetries) {
              errors.push(errorMessage)
            } else {
              // Short delay before retry
              await this.delay(1000)
            }
          }
        }

        processedCount++
        
        // Update job progress
        await prisma.contentImportJob.update({
          where: { id: job.id },
          data: {
            processedItems: processedCount,
            successfulItems: successCount,
            failedItems: errors.length,
            errorLog: errors
          }
        })
      }

      // Delay between batches to avoid overwhelming the database
      if (i + batchSize < remainingTopics.length) {
        console.log(`  ⏳ Waiting ${delayBetweenBatches}ms before next batch...`)
        await this.delay(delayBetweenBatches)
      }
    }

    // Complete the job
    const finalStatus = errors.length === remainingTopics.length ? 'failed' : 'completed'
    await prisma.contentImportJob.update({
      where: { id: job.id },
      data: {
        status: finalStatus,
        completedAt: new Date(),
        summary: {
          totalTopics: remainingTopics.length,
          successful: successCount,
          failed: errors.length,
          batches: Math.ceil(remainingTopics.length / batchSize),
          batchSize: batchSize
        }
      }
    })

    console.log(`\\n🎉 Resilient import completed!`)
    console.log(`✅ Successfully imported: ${successCount}/${remainingTopics.length} topics`)
    console.log(`❌ Failed: ${errors.length} topics`)

    return job.id
  }

  /**
   * Get topics that still need to be imported
   */
  private async getRemainingTopics() {
    // Get all topics with classroom links
    const allTopicsWithLinks = await prisma.topic.findMany({
      where: {
        classroomLink: {
          not: null,
          not: ''
        }
      },
      select: {
        id: true,
        name: true,
        level: true,
        classroomLink: true,
        orderIndex: true
      },
      orderBy: [
        { level: 'asc' },
        { orderIndex: 'asc' }
      ]
    })

    // Get topics that already have presentations
    const importedTopics = await prisma.presentation.findMany({
      select: {
        topicId: true
      }
    })

    const importedTopicIds = new Set(importedTopics.map(p => p.topicId).filter(Boolean))

    // Return only topics that haven't been imported yet
    return allTopicsWithLinks.filter(topic => !importedTopicIds.has(topic.id))
  }

  /**
   * Import a single topic with connection management
   */
  private async importSingleTopicWithRetry(topic: any) {
    // Extract content from Google Classroom
    const content = await this.extractor.extractClassroomContent(
      topic.classroomLink,
      topic.name,
      topic.level
    )

    // Use a transaction for atomic operations
    await prisma.$transaction(async (tx) => {
      // Create presentation record
      const presentation = await tx.presentation.create({
        data: {
          topicId: topic.id,
          title: topic.name,
          description: `Imported from Google Classroom - ${topic.level} level`,
          originalUrl: topic.classroomLink,
          originalGoogleId: this.extractor.extractPresentationId(topic.classroomLink),
          totalSlides: content.slides.length,
          level: topic.level as any,
          status: 'PUBLISHED',
          importSource: 'resilient_import',
          importedAt: new Date()
        }
      })

      // Import slides
      for (let i = 0; i < content.slides.length; i++) {
        const slideData = content.slides[i]
        
        await tx.contentSlide.create({
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
      }

      // Import videos
      for (const videoData of content.videos) {
        await tx.mediaFile.create({
          data: {
            presentationId: presentation.id,
            filename: `${videoData.id}.mp4`,
            originalFilename: videoData.title,
            fileType: 'VIDEO',
            mimeType: 'video/mp4',
            fileSize: 0,
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
        await tx.mediaFile.create({
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
    })

    // Small delay after each topic to be gentle on the database
    await this.delay(500)
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string) {
    const job = await prisma.contentImportJob.findUnique({
      where: { id: jobId }
    })

    if (!job) return null

    return {
      jobId: job.id,
      status: job.status,
      totalItems: job.totalItems,
      processedItems: job.processedItems,
      successfulItems: job.successfulItems,
      failedItems: job.failedItems,
      estimatedFinish: job.estimatedFinish,
      errors: Array.isArray(job.errorLog) ? job.errorLog as string[] : [],
      summary: job.summary
    }
  }
}

// Singleton instance
export const resilientImportService = new ResilientImportService()