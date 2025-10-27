// Simple script to trigger the bulk import via API
const fetch = require('node-fetch')

async function triggerBulkImport() {
  console.log('🚀 Triggering bulk content import...')
  
  try {
    // Start the import
    const response = await fetch('http://localhost:3000/api/admin/content/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // You'll need to add authentication headers if required
      },
      body: JSON.stringify({
        type: 'bulk_import',
        options: {
          downloadMedia: true,
          extractAudio: true,
          generateThumbnails: true,
          quality: 'medium'
        }
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log('✅ Import started:', result)
    
    const jobId = result.jobId
    
    // Poll for status
    console.log('📊 Monitoring progress...')
    let completed = false
    
    while (!completed) {
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      const statusResponse = await fetch(`http://localhost:3000/api/admin/content/import?jobId=${jobId}`)
      const status = await statusResponse.json()
      
      const progress = status.totalItems > 0 
        ? Math.round((status.processedItems / status.totalItems) * 100)
        : 0

      console.log(`📈 Progress: ${progress}% (${status.processedItems}/${status.totalItems}) - ${status.status}`)
      
      if (status.status === 'completed' || status.status === 'failed') {
        completed = true
        console.log('🎉 Import finished!')
        console.log('Final status:', status)
      }
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error)
  }
}

triggerBulkImport()