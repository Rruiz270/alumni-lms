import { google } from 'googleapis'
import * as dotenv from 'dotenv'

dotenv.config()

async function extractRealClassroomContent() {
  try {
    console.log('🔍 Extracting real Google Classroom content...')
    
    // Get Google Sheets auth
    const serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!)
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccountKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    })

    const sheets = google.sheets({ version: 'v4', auth })
    const spreadsheetId = '1ezRurCziI_hcHg3Shs5Hg3wAU_Cgdia_3p89LXncyKg'

    // Get all sheets info first
    const spreadsheetInfo = await sheets.spreadsheets.get({ spreadsheetId })
    console.log('\n📊 Available sheets:')
    spreadsheetInfo.data.sheets?.forEach((sheet, index) => {
      console.log(`${index + 1}. ${sheet.properties?.title}`)
    })

    // Check each level for classroom links in column E
    const levels = ['ÍNDICE A1', 'INDICE A2', 'INDICE B1', 'INDICE B2']
    
    for (const level of levels) {
      console.log(`\n🎯 Checking ${level} for classroom links in column E...`)
      
      try {
        // Get column E data specifically (where classroom links are located)
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `${level}!E:E`, // Column E only
          valueRenderOption: 'UNFORMATTED_VALUE'
        })

        const rows = response.data.values
        if (rows && rows.length > 0) {
          console.log(`\n📋 Found ${rows.length} rows in column E for ${level}`)
          console.log('Header (E1):', rows[0]?.[0] || 'Empty')
          
          // Look for Google Classroom/Drive links in column E
          let linksFound = 0
          for (let i = 1; i < rows.length; i++) {
            const cellValue = rows[i]?.[0]?.toString() || ''
            
            if (cellValue && (
                cellValue.includes('classroom.google.com') ||
                cellValue.includes('drive.google.com') ||
                cellValue.includes('docs.google.com/presentation') ||
                cellValue.includes('docs.google.com/document') ||
                cellValue.includes('youtube.com') ||
                cellValue.includes('youtu.be')
              )) {
              console.log(`\n🔗 Row ${i + 1}: ${cellValue}`)
              linksFound++
            }
          }

          if (linksFound === 0) {
            console.log('❌ No classroom links found in column E')
            // Show first few non-empty cells to understand the content
            console.log('\n📄 First few non-empty cells in column E:')
            for (let i = 0; i < Math.min(10, rows.length); i++) {
              const cellValue = rows[i]?.[0]?.toString() || ''
              if (cellValue.trim()) {
                console.log(`Row ${i + 1}: ${cellValue.substring(0, 100)}${cellValue.length > 100 ? '...' : ''}`)
              }
            }
          } else {
            console.log(`✅ Found ${linksFound} classroom links in column E`)
          }
        }
      } catch (error) {
        console.log(`❌ Could not access column E in ${level}:`, error.message)
      }
    }

  } catch (error) {
    console.error('❌ Error extracting classroom content:', error)
  }
}

extractRealClassroomContent()