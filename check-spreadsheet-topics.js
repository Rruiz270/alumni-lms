const { google } = require('googleapis')
require('dotenv').config()

// Google Sheets configuration
const SHEET_ID = '1ezRurCziI_hcHg3Shs5Hg3wAU_Cgdia_3p89LXncyKg'

// Define the 4 levels as tabs in the spreadsheet
const LEVEL_TABS = [
  { level: 'A1', sheetName: 'ÍNDICE A1', gid: '0' },
  { level: 'A2', sheetName: 'INDICE A2', gid: '244320901' },
  { level: 'B1', sheetName: 'INDICE B1', gid: '1195930769' },
  { level: 'B2', sheetName: 'INDICE B2', gid: '383437245' }
]

async function checkSpreadsheetTopics() {
  try {
    // Parse the Google Service Account Key from environment variable
    let serviceAccountKey;
    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      try {
        serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
      } catch (error) {
        console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY:', error)
        return
      }
    } else {
      console.error('GOOGLE_SERVICE_ACCOUNT_KEY not found in environment')
      return
    }

    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccountKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    })

    const sheets = google.sheets({ version: 'v4', auth })

    console.log('📊 CHECKING SPREADSHEET CONTENT:')
    console.log('================================')
    
    let totalTopics = 0
    let topicsWithClassroomLinks = 0

    for (const levelTab of LEVEL_TABS) {
      console.log(`\n📚 Level ${levelTab.level} (${levelTab.sheetName}):`)
      
      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: SHEET_ID,
          range: `${levelTab.sheetName}!A:F`, // Assuming columns A-F contain the data
        })

        const rows = response.data.values || []
        
        if (rows.length <= 1) {
          console.log('   No data found')
          continue
        }

        // Skip header row
        const dataRows = rows.slice(1)
        let levelTopicsWithLinks = 0
        
        dataRows.forEach((row, index) => {
          const [grammarResource, vocabulary, theme, implicitObjective, classroomLink] = row
          
          if (grammarResource && grammarResource.trim()) {
            totalTopics++
            
            if (classroomLink && classroomLink.trim() && classroomLink.includes('docs.google.com')) {
              topicsWithClassroomLinks++
              levelTopicsWithLinks++
              console.log(`   ✅ ${grammarResource} - ${theme}`)
              console.log(`       Link: ${classroomLink}`)
            } else {
              console.log(`   ❌ ${grammarResource} - ${theme} (no classroom link)`)
            }
          }
        })
        
        console.log(`   Total for ${levelTab.level}: ${dataRows.length} topics, ${levelTopicsWithLinks} with classroom links`)
        
      } catch (error) {
        console.error(`   Error reading ${levelTab.level}:`, error.message)
      }
    }

    console.log('\n📊 SUMMARY:')
    console.log(`Total topics in spreadsheet: ${totalTopics}`)
    console.log(`Topics with classroom links: ${topicsWithClassroomLinks}`)
    console.log(`Topics without classroom links: ${totalTopics - topicsWithClassroomLinks}`)

  } catch (error) {
    console.error('Error:', error)
  }
}

checkSpreadsheetTopics()