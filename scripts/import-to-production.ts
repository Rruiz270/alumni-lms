import { PrismaClient } from '@prisma/client'
import { google } from 'googleapis'
import * as dotenv from 'dotenv'

dotenv.config()

// Use production database URL
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Zu1zG2LPUovb@ep-snowy-shadow-a4hoyxtl-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
})

// Google Sheets configuration
const SHEET_ID = '1ezRurCziI_hcHg3Shs5Hg3wAU_Cgdia_3p89LXncyKg'

// Define the 4 levels as tabs in the spreadsheet
const LEVEL_TABS = [
  { level: 'A1', sheetName: 'ÍNDICE A1', gid: '0' },
  { level: 'A2', sheetName: 'INDICE A2', gid: '244320901' },
  { level: 'B1', sheetName: 'INDICE B1', gid: '1195930769' },
  { level: 'B2', sheetName: 'INDICE B2', gid: '383437245' }
]

interface SpreadsheetRow {
  topic: string
  grammarResource: string
  vocabulary: string
  theme: string
  implicitObjective: string
  classroomLink: string
}

// Google Sheets API authentication
async function getGoogleSheetsAuth() {
  try {
    let serviceAccountKey;
    
    if (process.env.GOOGLE_PROJECT_ID && process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      // Build service account key from individual environment variables
      const privateKey = process.env.GOOGLE_PRIVATE_KEY
        .replace(/\\n/g, '\n') // Replace escaped newlines
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/-----BEGIN PRIVATE KEY----- /g, '-----BEGIN PRIVATE KEY-----\n') // Fix header
        .replace(/ -----END PRIVATE KEY-----/g, '\n-----END PRIVATE KEY-----') // Fix footer
        .trim()
      
      serviceAccountKey = {
        type: 'service_account',
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: '4f3a1dae249a1421b9ffce8309bd93939ebaefc7',
        private_key: privateKey,
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: '115410300277316663550',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.GOOGLE_CLIENT_EMAIL)}`,
        universe_domain: 'googleapis.com'
      }
    } else {
      throw new Error('Missing Google Sheets API credentials. Please set GOOGLE_PROJECT_ID, GOOGLE_CLIENT_EMAIL, and GOOGLE_PRIVATE_KEY environment variables.')
    }
    
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccountKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    })
    return auth
  } catch (error) {
    console.error('Error setting up Google Sheets authentication:', error)
    throw error
  }
}

async function fetchSheetData(auth: any, level: string, sheetName: string): Promise<SpreadsheetRow[]> {
  try {
    const sheets = google.sheets({ version: 'v4', auth })
    
    // Fetch data from specific tab using sheet name
    const range = `'${sheetName}'!A2:F` // Assuming columns A-F contain the data
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: range,
    })

    const rows = response.data.values || []
    
    return rows.map((row: any[]) => ({
      topic: row[0] || '',
      grammarResource: row[1] || '',
      vocabulary: row[2] || '',
      theme: row[3] || '',
      implicitObjective: row[4] || '',
      classroomLink: row[5] || ''
    })).filter(row => row.topic.trim() !== '') // Filter out empty rows
    
  } catch (error) {
    console.error(`Error fetching data for level ${level}:`, error)
    return []
  }
}

async function importToProduction() {
  try {
    console.log('🚀 Starting PRODUCTION Alumni Spanish curriculum import...')
    console.log('📊 Database URL:', DATABASE_URL.substring(0, 50) + '...')
    
    // Setup Google Sheets authentication
    const auth = await getGoogleSheetsAuth()
    console.log('✅ Google Sheets API authenticated')
    
    // Clear existing demo data
    console.log('🗑️ Clearing existing demo data from PRODUCTION...')
    await prisma.exercise.deleteMany()
    await prisma.topic.deleteMany()
    console.log('✅ Demo data cleared from PRODUCTION')
    
    let totalTopicsImported = 0
    
    // Import each level
    for (const levelTab of LEVEL_TABS) {
      console.log(`📚 Importing ${levelTab.level} level to PRODUCTION...`)
      
      const sheetData = await fetchSheetData(auth, levelTab.level, levelTab.sheetName)
      console.log(`Found ${sheetData.length} topics for level ${levelTab.level}`)
      
      // Import topics for this level
      for (let i = 0; i < sheetData.length; i++) {
        const row = sheetData[i]
        
        try {
          const topic = await prisma.topic.create({
            data: {
              name: row.topic,
              level: levelTab.level as any,
              orderIndex: totalTopicsImported + i + 1,
              description: `${levelTab.level} level Spanish topic: ${row.topic}`,
              recursoGramatical: row.grammarResource,
              vocabulario: row.vocabulary,
              tema: row.theme,
              objetivoImplicito: row.implicitObjective,
              classroomLink: row.classroomLink
            }
          })
          
          console.log(`  ✅ Created topic: ${topic.name}`)
          
        } catch (error) {
          console.error(`  ❌ Error creating topic "${row.topic}":`, error)
        }
      }
      
      totalTopicsImported += sheetData.length
      console.log(`✅ Level ${levelTab.level} imported successfully to PRODUCTION`)
    }
    
    console.log(`🎉 PRODUCTION Import completed! Total topics imported: ${totalTopicsImported}`)
    
  } catch (error) {
    console.error('❌ Error importing curriculum to PRODUCTION:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the import
importToProduction()
  .then(() => {
    console.log('🎉 PRODUCTION curriculum import completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 PRODUCTION Import failed:', error)
    process.exit(1)
  })