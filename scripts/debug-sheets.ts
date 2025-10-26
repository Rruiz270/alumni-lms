import { google } from 'googleapis'
import * as dotenv from 'dotenv'

dotenv.config()

const SHEET_ID = '1ezRurCziI_hcHg3Shs5Hg3wAU_Cgdia_3p89LXncyKg'

async function debugSheets() {
  try {
    const serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!)
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccountKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    })

    const sheets = google.sheets({ version: 'v4', auth })
    
    // Get spreadsheet metadata to see all sheet names
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
    })

    console.log('📋 Spreadsheet Title:', response.data.properties?.title)
    console.log('📄 Sheet Names:')
    
    response.data.sheets?.forEach((sheet, index) => {
      console.log(`  ${index + 1}. "${sheet.properties?.title}" (ID: ${sheet.properties?.sheetId})`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

debugSheets()