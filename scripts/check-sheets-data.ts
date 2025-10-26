import { google } from 'googleapis'
import * as dotenv from 'dotenv'

dotenv.config()

async function checkSheetsData() {
  try {
    console.log('Checking Google Sheets data...')
    
    // Reconstruct Google Service Account credentials from individual environment variables
    const serviceAccountKey = {
      type: "service_account",
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs"
    }

    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccountKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    })

    const sheets = google.sheets({ version: 'v4', auth })
    const spreadsheetId = '1ezRurCziI_hcHg3Shs5Hg3wAU_Cgdia_3p89LXncyKg'

    // Check A1 tab (first tab)
    console.log('\nChecking A1 tab for classroom links...')
    const a1Response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'A1!A2:G6', // First 4 rows of data
    })

    const a1Rows = a1Response.data.values
    if (a1Rows && a1Rows.length > 0) {
      console.log(`Found ${a1Rows.length} rows in A1 tab:`)
      a1Rows.forEach((row, index) => {
        console.log(`\nRow ${index + 2}:`)
        console.log(`  Name: ${row[0] || 'N/A'}`)
        console.log(`  Level: ${row[1] || 'N/A'}`)
        console.log(`  Column F (Index 5): ${row[5] || 'N/A'}`)
        console.log(`  Column G (Index 6): ${row[6] || 'N/A'}`)
        console.log(`  Column H (Index 7): ${row[7] || 'N/A'}`)
        console.log(`  Raw row: [${row.join(', ')}]`)
      })
    } else {
      console.log('No data found in A1 tab')
    }

    // Check all tabs to find classroom links
    const tabsResponse = await sheets.spreadsheets.get({
      spreadsheetId
    })

    console.log('\nAll available tabs:')
    tabsResponse.data.sheets?.forEach((sheet, index) => {
      console.log(`${index + 1}. ${sheet.properties?.title} (ID: ${sheet.properties?.sheetId})`)
    })

  } catch (error) {
    console.error('Error:', error)
  }
}

checkSheetsData()