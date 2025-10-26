import { PrismaClient } from '@prisma/client'
import { google } from 'googleapis'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

// Google Sheets configuration
const SHEET_ID = process.env.GOOGLE_SHEETS_ID
const RANGE = 'Sheet1!A2:G' // Columns: Name, Level, Recurso Gramatical, Vocabulario, Tema, Objetivo Implícito, Classroom Link

interface TopicRow {
  name: string
  level: string
  recursoGramatical: string
  vocabulario: string
  tema: string
  objetivoImplicito: string
  classroomLink: string
}

// Google Sheets API authentication
async function getGoogleSheetsAuth() {
  try {
    // For service account authentication
    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      const serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
      const auth = new google.auth.GoogleAuth({
        credentials: serviceAccountKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
      })
      return auth
    }
    
    // For OAuth2 authentication (if using client credentials)
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'http://localhost:3000/api/auth/callback/google'
      )
      
      // You would need to set refresh token here
      if (process.env.GOOGLE_REFRESH_TOKEN) {
        oauth2Client.setCredentials({
          refresh_token: process.env.GOOGLE_REFRESH_TOKEN
        })
      }
      
      return oauth2Client
    }
    
    throw new Error('No Google authentication credentials found')
  } catch (error) {
    console.error('❌ Failed to authenticate with Google Sheets API:', error)
    throw error
  }
}

// Function to fetch data from Google Sheets
async function fetchFromGoogleSheets(): Promise<TopicRow[]> {
  try {
    if (!SHEET_ID) {
      throw new Error('GOOGLE_SHEETS_ID environment variable is not set')
    }

    console.log('🔍 Fetching data from Google Sheets...')
    
    const auth = await getGoogleSheetsAuth()
    const sheets = google.sheets({ version: 'v4', auth })
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE
    })
    
    const rows = response.data.values
    if (!rows || rows.length === 0) {
      throw new Error('No data found in Google Sheets')
    }
    
    console.log(`📊 Found ${rows.length} rows in Google Sheets`)
    
    // Map rows to TopicRow interface
    const topics: TopicRow[] = rows.map((row, index) => {
      if (row.length < 7) {
        console.warn(`⚠️ Row ${index + 2} has incomplete data, skipping...`)
        return null
      }
      
      return {
        name: row[0]?.trim() || '',
        level: row[1]?.trim() || '',
        recursoGramatical: row[2]?.trim() || '',
        vocabulario: row[3]?.trim() || '',
        tema: row[4]?.trim() || '',
        objetivoImplicito: row[5]?.trim() || '',
        classroomLink: row[6]?.trim() || ''
      }
    }).filter(Boolean) as TopicRow[]
    
    // Validate levels
    const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    const validTopics = topics.filter(topic => {
      if (!validLevels.includes(topic.level)) {
        console.warn(`⚠️ Invalid level "${topic.level}" for topic "${topic.name}", skipping...`)
        return false
      }
      if (!topic.name) {
        console.warn(`⚠️ Missing name for topic, skipping...`)
        return false
      }
      return true
    })
    
    console.log(`✅ Successfully processed ${validTopics.length} valid topics from Google Sheets`)
    return validTopics
    
  } catch (error) {
    console.error('❌ Error fetching from Google Sheets:', error)
    throw error
  }
}

// Fallback Spanish curriculum data (if API fails)
const fallbackSpanishTopics = {
  A1: [
    {
      name: "Presentación Personal",
      recursoGramatical: "Presente Indicativo - Verbos Ser/Estar",
      vocabulario: "Información personal",
      tema: "Introducción y presentación",
      objetivoImplicito: "Presentarse y dar información básica personal",
      classroomLink: "https://docs.google.com/presentation/d/1234567890"
    },
    {
      name: "Rutina Diaria",
      recursoGramatical: "Presente Indicativo - Verbos Regulares",
      vocabulario: "Actividades diarias",
      tema: "Descripción de rutinas",
      objetivoImplicito: "Relatar el inicio de las actividades del día a día",
      classroomLink: "https://docs.google.com/presentation/d/1234567891"
    },
    {
      name: "La Familia",
      recursoGramatical: "Adjetivos posesivos",
      vocabulario: "Miembros de la familia",
      tema: "Familia y relaciones",
      objetivoImplicito: "Describir la familia y relaciones familiares",
      classroomLink: "https://docs.google.com/presentation/d/1234567892"
    },
    {
      name: "En el Restaurante",
      recursoGramatical: "Presente Indicativo - Verbos con irregularidades",
      vocabulario: "Comida y bebidas",
      tema: "Situaciones en restaurantes",
      objetivoImplicito: "Ordenar comida y expresar preferencias gastronómicas",
      classroomLink: "https://docs.google.com/presentation/d/1234567893"
    },
    {
      name: "El Tiempo y las Estaciones",
      recursoGramatical: "Verbo Hacer + expresiones de tiempo",
      vocabulario: "Clima y estaciones",
      tema: "Descripción del tiempo atmosférico",
      objetivoImplicito: "Describir el tiempo atmosférico y las estaciones",
      classroomLink: "https://docs.google.com/presentation/d/1234567894"
    }
  ],
  A2: [
    {
      name: "Viajes y Turismo",
      recursoGramatical: "Pretérito Perfecto",
      vocabulario: "Medios de transporte y destinos",
      tema: "Experiencias de viaje",
      objetivoImplicito: "Narrar experiencias de viajes pasados",
      classroomLink: "https://docs.google.com/presentation/d/1234567895"
    },
    {
      name: "Compras y Moda",
      recursoGramatical: "Comparativos y superlativos",
      vocabulario: "Ropa y accesorios",
      tema: "Descripción de preferencias",
      objetivoImplicito: "Comparar productos y expresar preferencias de compra",
      classroomLink: "https://docs.google.com/presentation/d/1234567896"
    },
    {
      name: "Vida Saludable",
      recursoGramatical: "Imperativo afirmativo y negativo",
      vocabulario: "Deportes y alimentación",
      tema: "Consejos de salud",
      objetivoImplicito: "Dar consejos sobre hábitos saludables",
      classroomLink: "https://docs.google.com/presentation/d/1234567897"
    },
    {
      name: "Tecnología y Redes Sociales",
      recursoGramatical: "Futuro simple",
      vocabulario: "Dispositivos y aplicaciones",
      tema: "Predicciones tecnológicas",
      objetivoImplicito: "Hacer predicciones sobre el futuro de la tecnología",
      classroomLink: "https://docs.google.com/presentation/d/1234567898"
    },
    {
      name: "Cultura Hispana",
      recursoGramatical: "Pretérito Indefinido",
      vocabulario: "Tradiciones y festividades",
      tema: "Eventos culturales",
      objetivoImplicito: "Narrar eventos históricos y culturales",
      classroomLink: "https://docs.google.com/presentation/d/1234567899"
    }
  ],
  B1: [
    {
      name: "Mundo Laboral",
      recursoGramatical: "Condicional simple",
      vocabulario: "Profesiones y entrevistas",
      tema: "Búsqueda de empleo",
      objetivoImplicito: "Expresar situaciones hipotéticas en el ámbito laboral",
      classroomLink: "https://docs.google.com/presentation/d/1234567900"
    },
    {
      name: "Medio Ambiente",
      recursoGramatical: "Presente de subjuntivo",
      vocabulario: "Ecología y sostenibilidad",
      tema: "Problemas ambientales",
      objetivoImplicito: "Expresar opiniones y emociones sobre el medio ambiente",
      classroomLink: "https://docs.google.com/presentation/d/1234567901"
    },
    {
      name: "Educación y Formación",
      recursoGramatical: "Pretérito Pluscuamperfecto",
      vocabulario: "Sistema educativo",
      tema: "Experiencias académicas",
      objetivoImplicito: "Narrar experiencias educativas pasadas",
      classroomLink: "https://docs.google.com/presentation/d/1234567902"
    },
    {
      name: "Arte y Literatura",
      recursoGramatical: "Voz pasiva",
      vocabulario: "Expresiones artísticas",
      tema: "Crítica y análisis cultural",
      objetivoImplicito: "Analizar y opinar sobre manifestaciones artísticas",
      classroomLink: "https://docs.google.com/presentation/d/1234567903"
    },
    {
      name: "Relaciones Interpersonales",
      recursoGramatical: "Estilo indirecto",
      vocabulario: "Emociones y sentimientos",
      tema: "Comunicación efectiva",
      objetivoImplicito: "Reportar conversaciones y expresar emociones complejas",
      classroomLink: "https://docs.google.com/presentation/d/1234567904"
    }
  ],
  B2: [
    {
      name: "Globalización y Economía",
      recursoGramatical: "Subjuntivo en cláusulas temporales",
      vocabulario: "Comercio internacional",
      tema: "Impacto de la globalización",
      objetivoImplicito: "Analizar fenómenos económicos globales",
      classroomLink: "https://docs.google.com/presentation/d/1234567905"
    },
    {
      name: "Ciencia y Tecnología",
      recursoGramatical: "Oraciones condicionales complejas",
      vocabulario: "Innovación y descubrimientos",
      tema: "Avances científicos",
      objetivoImplicito: "Presentar hipótesis y teorías científicas",
      classroomLink: "https://docs.google.com/presentation/d/1234567906"
    },
    {
      name: "Política y Sociedad",
      recursoGramatical: "Subjuntivo en cláusulas sustantivas",
      vocabulario: "Sistemas políticos",
      tema: "Participación ciudadana",
      objetivoImplicito: "Expresar posición política y defender argumentos",
      classroomLink: "https://docs.google.com/presentation/d/1234567907"
    },
    {
      name: "Medios de Comunicación",
      recursoGramatical: "Conectores argumentativos",
      vocabulario: "Periodismo y medios digitales",
      tema: "Análisis de noticias",
      objetivoImplicito: "Analizar críticamente información mediática",
      classroomLink: "https://docs.google.com/presentation/d/1234567908"
    },
    {
      name: "Filosofía y Ética",
      recursoGramatical: "Perífrasis verbales complejas",
      vocabulario: "Conceptos filosóficos",
      tema: "Dilemas éticos",
      objetivoImplicito: "Debatir cuestiones éticas y filosóficas complejas",
      classroomLink: "https://docs.google.com/presentation/d/1234567909"
    }
  ]
}

// Function to organize topics by level
function organizeTopicsByLevel(topics: TopicRow[]): Record<string, TopicRow[]> {
  const organized: Record<string, TopicRow[]> = {}
  
  topics.forEach(topic => {
    if (!organized[topic.level]) {
      organized[topic.level] = []
    }
    organized[topic.level].push(topic)
  })
  
  return organized
}

// Function to get topics data (from API or fallback)
async function getTopicsData(): Promise<Record<string, TopicRow[]>> {
  try {
    // Try to fetch from Google Sheets first
    const sheetsTopics = await fetchFromGoogleSheets()
    const organizedTopics = organizeTopicsByLevel(sheetsTopics)
    
    // Validate we have data for each level
    const levels = ['A1', 'A2', 'B1', 'B2']
    const missingLevels = levels.filter(level => !organizedTopics[level] || organizedTopics[level].length === 0)
    
    if (missingLevels.length > 0) {
      console.warn(`⚠️ Missing data for levels: ${missingLevels.join(', ')}. Using fallback data for these levels.`)
      
      // Fill missing levels with fallback data
      missingLevels.forEach(level => {
        if (fallbackSpanishTopics[level as keyof typeof fallbackSpanishTopics]) {
          organizedTopics[level] = fallbackSpanishTopics[level as keyof typeof fallbackSpanishTopics]
        }
      })
    }
    
    return organizedTopics
    
  } catch (error) {
    console.warn('⚠️ Failed to fetch from Google Sheets, using fallback data:', error.message)
    return fallbackSpanishTopics
  }
}

async function importSpanishContent() {
  console.log('🚀 Starting Spanish content import...')

  try {
    // Clear existing topics to avoid duplicates
    console.log('🧹 Clearing existing Spanish topics and related exercises...')
    
    // First, delete exercises related to Spanish topics
    await prisma.exercise.deleteMany({
      where: {
        topic: {
          level: {
            in: ['A1', 'A2', 'B1', 'B2']
          }
        }
      }
    })
    
    // Then delete the topics
    await prisma.topic.deleteMany({
      where: {
        level: {
          in: ['A1', 'A2', 'B1', 'B2']
        }
      }
    })

    const spanishTopics = await getTopicsData()

    let totalImported = 0

    for (const [level, topics] of Object.entries(spanishTopics)) {
      console.log(`📚 Importing ${topics.length} topics for ${level} level...`)

      for (let i = 0; i < topics.length; i++) {
        const topicData = topics[i]
        
        try {
          const topic = await prisma.topic.create({
            data: {
              name: topicData.name,
              level: level as any, // A1, A2, B1, B2
              orderIndex: i + 1,
              description: `${topicData.tema} - ${topicData.vocabulario}`,
              recursoGramatical: topicData.recursoGramatical,
              vocabulario: topicData.vocabulario,
              tema: topicData.tema,
              objetivoImplicito: topicData.objetivoImplicito,
              classroomLink: topicData.classroomLink,
              objectives: [topicData.objetivoImplicito],
              materials: [
                "Google Classroom Presentation",
                "Interactive exercises",
                "Vocabulary practice",
                "Grammar exercises"
              ]
            }
          })

          console.log(`✅ Created topic: ${topic.name} (${level})`)

          // Create sample exercises for each topic
          await createSampleExercises(topic.id, level, topicData)
          totalImported++

        } catch (error) {
          console.error(`❌ Error creating topic ${topicData.name}:`, error)
        }
      }
    }

    console.log(`🎉 Spanish content import completed! Imported ${totalImported} topics total.`)

  } catch (error) {
    console.error('❌ Import process failed:', error)
    throw error
  }
}

async function createSampleExercises(topicId: string, level: string, topicData: TopicRow) {
  const exercises = [
    {
      phase: 'PRE_CLASS',
      category: 'GRAMMAR',
      type: 'MULTIPLE_CHOICE',
      title: `Gramática: ${topicData.recursoGramatical}`,
      instructions: `Completa las oraciones usando ${topicData.recursoGramatical}`,
      content: {
        question: `¿Cuál es la forma correcta de ${topicData.recursoGramatical}?`,
        options: [
          "Opción A - Forma correcta",
          "Opción B - Forma incorrecta", 
          "Opción C - Forma incorrecta",
          "Opción D - Forma incorrecta"
        ]
      },
      correctAnswer: { correct: 0 },
      points: 10,
      orderIndex: 1
    },
    {
      phase: 'PRE_CLASS',
      category: 'VOCABULARY',
      type: 'MATCHING',
      title: `Vocabulario: ${topicData.vocabulario}`,
      instructions: `Conecta las palabras relacionadas con ${topicData.vocabulario} con sus definiciones`,
      content: {
        pairs: [
          { word: "Término 1", definition: "Definición relacionada con " + topicData.vocabulario },
          { word: "Término 2", definition: "Segunda definición del tema" },
          { word: "Término 3", definition: "Tercera definición del vocabulario" }
        ]
      },
      correctAnswer: { matches: [0, 1, 2] },
      points: 15,
      orderIndex: 2
    },
    {
      phase: 'AFTER_CLASS',
      category: 'WRITING',
      type: 'ESSAY',
      title: `Escritura: ${topicData.tema}`,
      instructions: `Escribe un texto sobre ${topicData.tema} aplicando ${topicData.recursoGramatical} y usando vocabulario de ${topicData.vocabulario}`,
      content: {
        prompt: `Desarrolla un texto de 150-250 palabras sobre ${topicData.tema}. Utiliza el vocabulario relacionado con ${topicData.vocabulario} y aplica las estructuras gramaticales de ${topicData.recursoGramatical}`,
        minWords: 150,
        maxWords: 250,
        keyTopics: [topicData.tema, topicData.vocabulario, topicData.recursoGramatical]
      },
      points: 25,
      orderIndex: 3
    },
    {
      phase: 'AFTER_CLASS',
      category: 'SPEAKING',
      type: 'AUDIO_RECORDING',
      title: `Expresión oral: ${topicData.objetivoImplicito}`,
      instructions: `Graba un audio de 2-3 minutos donde demuestres el objetivo: ${topicData.objetivoImplicito}`,
      content: {
        prompt: `${topicData.objetivoImplicito}`,
        duration: 180, // 3 minutes
        topics: [topicData.tema, topicData.vocabulario]
      },
      points: 20,
      orderIndex: 4
    }
  ]

  for (const exerciseData of exercises) {
    try {
      await prisma.exercise.create({
        data: {
          topicId,
          phase: exerciseData.phase as any,
          category: exerciseData.category as any,
          type: exerciseData.type as any,
          title: exerciseData.title,
          instructions: exerciseData.instructions,
          content: exerciseData.content,
          correctAnswer: exerciseData.correctAnswer,
          points: exerciseData.points,
          orderIndex: exerciseData.orderIndex
        }
      })
    } catch (error) {
      console.error(`❌ Error creating exercise for topic ${topicId}:`, error)
    }
  }
}

// Run the import
if (require.main === module) {
  importSpanishContent()
    .catch((e) => {
      console.error('❌ Import failed:', e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}

export { importSpanishContent, fetchFromGoogleSheets }