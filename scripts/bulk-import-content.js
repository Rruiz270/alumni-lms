// Import with proper ES module syntax
import { contentImportService } from '../src/lib/content-import-service.js'

async function runBulkImport() {
  console.log('🚀 Starting bulk content import from Google Classroom...')
  console.log('This will import all 20 topics with their slides, videos, and audio files.')
  
  try {
    // Start the bulk import
    const jobId = await contentImportService.startBulkImport({
      downloadMedia: true,
      extractAudio: true,
      generateThumbnails: true,
      quality: 'medium',
      skipExisting: false
    })

    console.log(`✅ Bulk import job started with ID: ${jobId}`)
    console.log('📊 Monitoring progress...')

    // Poll for status updates
    let completed = false
    while (!completed) {
      await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds
      
      const status = await contentImportService.getJobStatus(jobId)
      
      if (!status) {
        console.error('❌ Job not found')
        break
      }

      const progress = status.totalItems > 0 
        ? Math.round((status.processedItems / status.totalItems) * 100)
        : 0

      console.log(`📈 Progress: ${progress}% (${status.processedItems}/${status.totalItems}) - ${status.status}`)
      
      if (status.successfulItems > 0) {
        console.log(`   ✅ Successful: ${status.successfulItems}`)
      }
      
      if (status.failedItems > 0) {
        console.log(`   ❌ Failed: ${status.failedItems}`)
      }

      if (status.status === 'completed' || status.status === 'failed') {
        completed = true
        
        if (status.status === 'completed') {
          console.log('')
          console.log('🎉 Bulk import completed successfully!')
          console.log(`📊 Final stats:`)
          console.log(`   • Total items: ${status.totalItems}`)
          console.log(`   • Successful: ${status.successfulItems}`)
          console.log(`   • Failed: ${status.failedItems}`)
        } else {
          console.log('')
          console.log('❌ Bulk import failed')
          if (status.errors.length > 0) {
            console.log('Errors:')
            status.errors.forEach(error => console.log(`   • ${error}`))
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ Failed to start bulk import:', error)
    process.exit(1)
  }
}

// Run the import
runBulkImport()
  .then(() => {
    console.log('🏁 Import process finished')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Import process failed:', error)
    process.exit(1)
  })