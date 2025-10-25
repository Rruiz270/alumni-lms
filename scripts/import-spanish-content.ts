import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Spanish curriculum data extracted from the Google Sheets
const spanishTopics = {
  A1: [
    {
      name: "Presentación Personal",
      recursoGramatical: "Presente Indicativo - Verbos Ser/Estar",
      vocabulario: "Información personal",
      tema: "Introducción y presentación",
      objetivoImplicito: "Presentarse y dar información básica personal",
      classroomLink: "https://docs.google.com/presentation/d/..."
    },
    {
      name: "Rutina Diaria",
      recursoGramatical: "Presente Indicativo - Verbos Regulares",
      vocabulario: "Actividades diarias",
      tema: "Descripción de rutinas",
      objetivoImplicito: "Relatar el inicio de las actividades del día a día",
      classroomLink: "https://docs.google.com/presentation/d/..."
    },
    {
      name: "La Familia",
      recursoGramatical: "Adjetivos posesivos",
      vocabulario: "Miembros de la familia",
      tema: "Familia y relaciones",
      objetivoImplicito: "Describir la familia y relaciones familiares",
      classroomLink: "https://docs.google.com/presentation/d/..."
    },
    {
      name: "En el Restaurante",
      recursoGramatical: "Presente Indicativo - Verbos con irregularidades",
      vocabulario: "Comida y bebidas",
      tema: "Situaciones en restaurantes",
      objetivoImplicito: "Ordenar comida y expresar preferencias gastronómicas",
      classroomLink: "https://docs.google.com/presentation/d/..."
    },
    {
      name: "El Tiempo y las Estaciones",
      recursoGramatical: "Verbo Hacer + expresiones de tiempo",
      vocabulario: "Clima y estaciones",
      tema: "Descripción del tiempo atmosférico",
      objetivoImplicito: "Describir el tiempo atmosférico y las estaciones",
      classroomLink: "https://docs.google.com/presentation/d/..."
    }
  ],
  A2: [
    {
      name: "Viajes y Turismo",
      recursoGramatical: "Pretérito Perfecto",
      vocabulario: "Medios de transporte y destinos",
      tema: "Experiencias de viaje",
      objetivoImplicito: "Narrar experiencias de viajes pasados",
      classroomLink: "https://docs.google.com/presentation/d/..."
    },
    {
      name: "Compras y Moda",
      recursoGramatical: "Comparativos y superlativos",
      vocabulario: "Ropa y accesorios",
      tema: "Descripción de preferencias",
      objetivoImplicito: "Comparar productos y expresar preferencias de compra",
      classroomLink: "https://docs.google.com/presentation/d/..."
    },
    {
      name: "Vida Saludable",
      recursoGramatical: "Imperativo afirmativo y negativo",
      vocabulario: "Deportes y alimentación",
      tema: "Consejos de salud",
      objetivoImplicito: "Dar consejos sobre hábitos saludables",
      classroomLink: "https://docs.google.com/presentation/d/..."
    },
    {
      name: "Tecnología y Redes Sociales",
      recursoGramatical: "Futuro simple",
      vocabulario: "Dispositivos y aplicaciones",
      tema: "Predicciones tecnológicas",
      objetivoImplicito: "Hacer predicciones sobre el futuro de la tecnología",
      classroomLink: "https://docs.google.com/presentation/d/..."
    },
    {
      name: "Cultura Hispana",
      recursoGramatical: "Pretérito Indefinido",
      vocabulario: "Tradiciones y festividades",
      tema: "Eventos culturales",
      objetivoImplicito: "Narrar eventos históricos y culturales",
      classroomLink: "https://docs.google.com/presentation/d/..."
    }
  ],
  B1: [
    {
      name: "Mundo Laboral",
      recursoGramatical: "Condicional simple",
      vocabulario: "Profesiones y entrevistas",
      tema: "Búsqueda de empleo",
      objetivoImplicito: "Expresar situaciones hipotéticas en el ámbito laboral",
      classroomLink: "https://docs.google.com/presentation/d/..."
    },
    {
      name: "Medio Ambiente",
      recursoGramatical: "Presente de subjuntivo",
      vocabulario: "Ecología y sostenibilidad",
      tema: "Problemas ambientales",
      objetivoImplicito: "Expresar opiniones y emociones sobre el medio ambiente",
      classroomLink: "https://docs.google.com/presentation/d/..."
    },
    {
      name: "Educación y Formación",
      recursoGramatical: "Pretérito Pluscuamperfecto",
      vocabulario: "Sistema educativo",
      tema: "Experiencias académicas",
      objetivoImplicito: "Narrar experiencias educativas pasadas",
      classroomLink: "https://docs.google.com/presentation/d/..."
    },
    {
      name: "Arte y Literatura",
      recursoGramatical: "Voz pasiva",
      vocabulario: "Expresiones artísticas",
      tema: "Crítica y análisis cultural",
      objetivoImplicito: "Analizar y opinar sobre manifestaciones artísticas",
      classroomLink: "https://docs.google.com/presentation/d/..."
    },
    {
      name: "Relaciones Interpersonales",
      recursoGramatical: "Estilo indirecto",
      vocabulario: "Emociones y sentimientos",
      tema: "Comunicación efectiva",
      objetivoImplicito: "Reportar conversaciones y expresar emociones complejas",
      classroomLink: "https://docs.google.com/presentation/d/..."
    }
  ],
  B2: [
    {
      name: "Globalización y Economía",
      recursoGramatical: "Subjuntivo en cláusulas temporales",
      vocabulario: "Comercio internacional",
      tema: "Impacto de la globalización",
      objetivoImplicito: "Analizar fenómenos económicos globales",
      classroomLink: "https://docs.google.com/presentation/d/..."
    },
    {
      name: "Ciencia y Tecnología",
      recursoGramatical: "Oraciones condicionales complejas",
      vocabulario: "Innovación y descubrimientos",
      tema: "Avances científicos",
      objetivoImplicito: "Presentar hipótesis y teorías científicas",
      classroomLink: "https://docs.google.com/presentation/d/..."
    },
    {
      name: "Política y Sociedad",
      recursoGramatical: "Subjuntivo en cláusulas sustantivas",
      vocabulario: "Sistemas políticos",
      tema: "Participación ciudadana",
      objetivoImplicito: "Expresar posición política y defender argumentos",
      classroomLink: "https://docs.google.com/presentation/d/..."
    },
    {
      name: "Medios de Comunicación",
      recursoGramatical: "Conectores argumentativos",
      vocabulario: "Periodismo y medios digitales",
      tema: "Análisis de noticias",
      objetivoImplicito: "Analizar críticamente información mediática",
      classroomLink: "https://docs.google.com/presentation/d/..."
    },
    {
      name: "Filosofía y Ética",
      recursoGramatical: "Perífrasis verbales complejas",
      vocabulario: "Conceptos filosóficos",
      tema: "Dilemas éticos",
      objetivoImplicito: "Debatir cuestiones éticas y filosóficas complejas",
      classroomLink: "https://docs.google.com/presentation/d/..."
    }
  ]
}

async function importSpanishContent() {
  console.log('🚀 Starting Spanish content import...')

  for (const [level, topics] of Object.entries(spanishTopics)) {
    console.log(`📚 Importing ${level} level topics...`)

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
              "Vocabulary practice"
            ]
          }
        })

        console.log(`✅ Created topic: ${topic.name} (${level})`)

        // Create sample exercises for each topic
        await createSampleExercises(topic.id, level, topicData)

      } catch (error) {
        console.error(`❌ Error creating topic ${topicData.name}:`, error)
      }
    }
  }

  console.log('🎉 Spanish content import completed!')
}

async function createSampleExercises(topicId: string, level: string, topicData: any) {
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
          "Opción A",
          "Opción B", 
          "Opción C",
          "Opción D"
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
      instructions: `Conecta las palabras con sus definiciones`,
      content: {
        pairs: [
          { word: "Palabra 1", definition: "Definición 1" },
          { word: "Palabra 2", definition: "Definición 2" },
          { word: "Palabra 3", definition: "Definición 3" }
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
      instructions: `Escribe un texto sobre ${topicData.tema} usando el vocabulario aprendido`,
      content: {
        prompt: `Desarrolla un texto de 150-200 palabras sobre ${topicData.tema}`,
        minWords: 150,
        maxWords: 200
      },
      points: 25,
      orderIndex: 3
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
importSpanishContent()
  .catch((e) => {
    console.error('❌ Import failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })