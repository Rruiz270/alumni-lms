const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkImportedContent() {
  try {
    console.log('📊 CHECKING IMPORTED CONTENT STATUS:')
    console.log('===================================')
    
    // Check presentations (main imported content)
    const presentations = await prisma.presentation.findMany({
      include: {
        topic: {
          select: {
            name: true,
            level: true
          }
        },
        _count: {
          select: {
            slides: true,
            media: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`📚 PRESENTATIONS IMPORTED: ${presentations.length}`)
    console.log('')

    if (presentations.length > 0) {
      console.log('✅ SUCCESSFULLY IMPORTED PRESENTATIONS:')
      presentations.forEach((pres, index) => {
        console.log(`${index + 1}. ${pres.topic.name} (${pres.topic.level})`)
        console.log(`    - ${pres._count.slides} slides`)
        console.log(`    - ${pres._count.media} media files`)
        console.log(`    - Status: ${pres.status}`)
        console.log(`    - Original URL: ${pres.originalUrl}`)
        console.log('')
      })
    }

    // Check content slides
    const totalSlides = await prisma.contentSlide.count()
    console.log(`📄 TOTAL SLIDES IMPORTED: ${totalSlides}`)

    // Check media files  
    const mediaFiles = await prisma.mediaFile.findMany({
      select: {
        fileType: true,
        title: true,
        presentationId: true,
        youtubeId: true,
        isProcessed: true
      }
    })

    console.log(`🎬 TOTAL MEDIA FILES: ${mediaFiles.length}`)
    
    // Group media by type
    const mediaByType = mediaFiles.reduce((acc, file) => {
      acc[file.fileType] = (acc[file.fileType] || 0) + 1
      return acc
    }, {})

    console.log('📊 MEDIA FILES BY TYPE:')
    Object.entries(mediaByType).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} files`)
    })

    // Check import jobs
    const importJobs = await prisma.contentImportJob.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    console.log('')
    console.log('🔄 RECENT IMPORT JOBS:')
    importJobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.jobType} - Status: ${job.status}`)
      console.log(`    - Total: ${job.totalItems}, Processed: ${job.processedItems}`)
      console.log(`    - Successful: ${job.successfulItems}, Failed: ${job.failedItems}`)
      console.log(`    - Started: ${job.startedAt}`)
      if (job.completedAt) {
        console.log(`    - Completed: ${job.completedAt}`)
      }
      if (job.errorLog && job.errorLog.length > 0) {
        console.log(`    - Errors: ${job.errorLog.slice(0, 3).join(', ')}${job.errorLog.length > 3 ? '...' : ''}`)
      }
      console.log('')
    })

    console.log('🎯 SUMMARY:')
    console.log(`✅ ${presentations.length} topics have imported content`)
    console.log(`📄 ${totalSlides} slides stored locally`) 
    console.log(`🎬 ${mediaFiles.length} media files processed`)
    console.log('')
    console.log('📍 WHERE IS THE CONTENT?')
    console.log('- Presentations: Database table "Presentation"')
    console.log('- Slides: Database table "ContentSlide"') 
    console.log('- Media: Database table "MediaFile"')
    console.log('- Local files: /public/imported-content/ (if media download enabled)')

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkImportedContent()