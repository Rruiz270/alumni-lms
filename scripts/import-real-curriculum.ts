import { PrismaClient } from '@prisma/client'
import { google } from 'googleapis'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

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
    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      const serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
      const auth = new google.auth.GoogleAuth({
        credentials: serviceAccountKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
      })
      return auth
    }
    
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY not found in environment variables')
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

async function importRealCurriculum() {
  try {
    console.log('🚀 Starting real Alumni Spanish curriculum import...')
    
    // Setup Google Sheets authentication
    const auth = await getGoogleSheetsAuth()
    console.log('✅ Google Sheets API authenticated')
    
    // Clear existing demo data
    console.log('🗑️ Clearing existing demo data...')
    await prisma.exercise.deleteMany()
    await prisma.topic.deleteMany()
    console.log('✅ Demo data cleared')
    
    let totalTopicsImported = 0
    
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
      console.log(`✅ Level ${levelTab.level} imported successfully`)
    }
    
    console.log(`🎉 Import completed! Total topics imported: ${totalTopicsImported}`)
    
    // Generate basic exercises for each topic
    console.log('📝 Generating basic exercises...')
    await generateBasicExercises()
    
  } catch (error) {
    console.error('❌ Error importing curriculum:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

async function generateBasicExercises() {
  try {
    const topics = await prisma.topic.findMany()
    
    for (const topic of topics) {
      // Create pre-class exercise
      await prisma.exercise.create({
        data: {
          topicId: topic.id,
          title: `Preparación: ${topic.name}`,
          phase: 'PRE_CLASS',
          category: 'VOCABULARY',
          type: 'MULTIPLE_CHOICE',
          instructions: `Estudia el vocabulario y gramática antes de la clase sobre: ${topic.name}`,
          content: {
            question: `¿Cuál es el tema principal de esta lección?`,
            options: [topic.tema || topic.name, "Otro tema", "No sé", "Gramática general"],
            correct: 0
          },
          points: 10,
          orderIndex: 1
        }
      })
      
      // Create post-class exercise
      await prisma.exercise.create({
        data: {
          topicId: topic.id,
          title: `Práctica: ${topic.name}`,
          phase: 'AFTER_CLASS',
          category: 'GRAMMAR',
          type: 'GAP_FILL',
          instructions: `Practica lo aprendido en la clase sobre: ${topic.name}`,
          content: {
            text: `Completa la frase relacionada con ${topic.vocabulario || 'el vocabulario de la clase'}: Hoy aprendí sobre ____`,
            blanks: [topic.tema || "el tema"]
          },
          points: 15,
          orderIndex: 2
        }
      })
    }
    
    console.log('✅ Basic exercises generated for all topics')
    
  } catch (error) {
    console.error('❌ Error generating exercises:', error)
  }
}

// Run the import
importRealCurriculum()
  .then(() => {
    console.log('🎉 Real curriculum import completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Import failed:', error)
    process.exit(1)
  })