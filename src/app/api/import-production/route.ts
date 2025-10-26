import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { google } from 'googleapis'

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
      throw new Error('Missing Google Sheets API credentials')
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
    
    const range = `'${sheetName}'!A2:F`
    
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
    })).filter(row => row.topic.trim() !== '')
    
  } catch (error) {
    console.error(`Error fetching data for level ${level}:`, error)
    return []
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting PRODUCTION curriculum import via API...')
    
    // Simple auth check
    const body = await request.json()
    if (body.secret !== 'import-alumni-curriculum-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Setup Google Sheets authentication
    const auth = await getGoogleSheetsAuth()
    console.log('✅ Google Sheets API authenticated')
    
    // Clear existing data
    console.log('🗑️ Clearing existing data...')
    await prisma.exercise.deleteMany()
    await prisma.topic.deleteMany()
    console.log('✅ Data cleared')
    
    let totalTopicsImported = 0
    const results = []
    
    // Import each level
    for (const levelTab of LEVEL_TABS) {
      console.log(`📚 Importing ${levelTab.level} level...`)
      
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
      results.push({
        level: levelTab.level,
        topicsImported: sheetData.length
      })
    }
    
    console.log(`🎉 Import completed! Total topics: ${totalTopicsImported}`)
    
    return NextResponse.json({
      success: true,
      message: 'Curriculum imported successfully',
      totalTopicsImported,
      results
    })
    
  } catch (error: any) {
    console.error('❌ Error importing curriculum:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.stack
    }, { status: 500 })
  }
}