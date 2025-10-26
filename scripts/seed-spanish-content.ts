import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const spanishTopics = [
  // A1 Level Topics
  {
    name: "Saludos y Presentaciones",
    level: "A1",
    orderIndex: 1,
    description: "Aprende a saludarte y presentarte en español",
    recursoGramatical: "Presente del verbo SER, pronombres personales",
    vocabulario: "Hola, adiós, nombre, apellido, edad, nacionalidad",
    tema: "Presentaciones personales",
    objetivoImplicito: "Poder presentarse de manera básica en español",
    classroomLink: "https://classroom.google.com/c/spanish-a1-greetings"
  },
  {
    name: "Los Números y la Hora",
    level: "A1", 
    orderIndex: 2,
    description: "Números del 0 al 100 y expresiones de tiempo",
    recursoGramatical: "Números cardinales, expresiones de tiempo",
    vocabulario: "Números, hora, minutos, mañana, tarde, noche",
    tema: "Tiempo y números",
    objetivoImplicito: "Decir la hora y usar números básicos",
    classroomLink: "https://classroom.google.com/c/spanish-a1-numbers"
  },
  {
    name: "La Familia",
    level: "A1",
    orderIndex: 3,
    description: "Vocabulario familiar y relaciones familiares",
    recursoGramatical: "Adjetivos posesivos, artículos definidos",
    vocabulario: "Padre, madre, hermano, hermana, abuelo, abuela",
    tema: "Familia y relaciones",
    objetivoImplicito: "Describir la familia y relaciones familiares",
    classroomLink: "https://classroom.google.com/c/spanish-a1-family"
  },
  {
    name: "Colores y Objetos",
    level: "A1",
    orderIndex: 4,
    description: "Colores básicos y objetos cotidianos",
    recursoGramatical: "Concordancia de género y número",
    vocabulario: "Rojo, azul, verde, mesa, silla, libro, casa",
    tema: "Descripción básica",
    objetivoImplicito: "Describir objetos con colores y formas",
    classroomLink: "https://classroom.google.com/c/spanish-a1-colors"
  },
  {
    name: "Comida y Bebidas",
    level: "A1",
    orderIndex: 5,
    description: "Alimentos básicos y expresar gustos",
    recursoGramatical: "Verbo GUSTAR, artículos indefinidos",
    vocabulario: "Pan, agua, café, fruta, carne, pescado",
    tema: "Alimentación",
    objetivoImplicito: "Pedir comida y expresar preferencias alimentarias",
    classroomLink: "https://classroom.google.com/c/spanish-a1-food"
  },

  // A2 Level Topics
  {
    name: "Rutinas Diarias",
    level: "A2",
    orderIndex: 6,
    description: "Describir actividades cotidianas y horarios",
    recursoGramatical: "Verbos reflexivos, expresiones temporales",
    vocabulario: "Levantarse, ducharse, desayunar, trabajar, dormir",
    tema: "Vida cotidiana",
    objetivoImplicito: "Narrar rutinas y horarios personales",
    classroomLink: "https://classroom.google.com/c/spanish-a2-routines"
  },
  {
    name: "De Compras",
    level: "A2",
    orderIndex: 7,
    description: "Vocabulario de tiendas y transacciones comerciales",
    recursoGramatical: "Pronombres demostrativos, números ordinales",
    vocabulario: "Tienda, precio, caro, barato, pagar, tarjeta",
    tema: "Compras y dinero",
    objetivoImplicito: "Realizar compras y negociar precios",
    classroomLink: "https://classroom.google.com/c/spanish-a2-shopping"
  },
  {
    name: "Transporte y Direcciones",
    level: "A2",
    orderIndex: 8,
    description: "Medios de transporte y dar direcciones",
    recursoGramatical: "Imperativos, preposiciones de lugar",
    vocabulario: "Autobús, metro, calle, derecha, izquierda, recto",
    tema: "Orientación y transporte",
    objetivoImplicito: "Pedir y dar direcciones, usar transporte público",
    classroomLink: "https://classroom.google.com/c/spanish-a2-transport"
  },
  {
    name: "El Tiempo y las Estaciones",
    level: "A2",
    orderIndex: 9,
    description: "Clima, tiempo atmosférico y estaciones del año",
    recursoGramatical: "Verbos impersonales, adverbios de intensidad",
    vocabulario: "Sol, lluvia, nieve, calor, frío, primavera, verano",
    tema: "Meteorología",
    objetivoImplicito: "Describir el tiempo y hacer planes según el clima",
    classroomLink: "https://classroom.google.com/c/spanish-a2-weather"
  },
  {
    name: "Planes y Actividades",
    level: "A2",
    orderIndex: 10,
    description: "Hablar sobre planes futuros y actividades de ocio",
    recursoGramatical: "Futuro inmediato (ir a + infinitivo)",
    vocabulario: "Cine, teatro, deporte, viajar, visitar, quedarse",
    tema: "Ocio y planes",
    objetivoImplicito: "Hacer planes y hablar de actividades futuras",
    classroomLink: "https://classroom.google.com/c/spanish-a2-plans"
  },

  // B1 Level Topics
  {
    name: "Experiencias Pasadas",
    level: "B1",
    orderIndex: 11,
    description: "Narrar experiencias usando tiempos pasados",
    recursoGramatical: "Pretérito perfecto e indefinido",
    vocabulario: "Ya, todavía, nunca, siempre, experiencia, viaje",
    tema: "Experiencias personales",
    objetivoImplicito: "Contar experiencias pasadas con detalle",
    classroomLink: "https://classroom.google.com/c/spanish-b1-experiences"
  },
  {
    name: "Trabajo y Profesiones",
    level: "B1",
    orderIndex: 12,
    description: "Vocabulario laboral y describir trabajos",
    recursoGramatical: "Vocabulario profesional, subjuntivo básico",
    vocabulario: "Ingeniero, médico, profesor, oficina, salario, horario",
    tema: "Mundo laboral",
    objetivoImplicito: "Hablar sobre trabajos y aspiraciones profesionales",
    classroomLink: "https://classroom.google.com/c/spanish-b1-work"
  },
  {
    name: "Salud y Bienestar",
    level: "B1",
    orderIndex: 13,
    description: "Hablar sobre salud, síntomas y remedios",
    recursoGramatical: "Expresar dolor y malestar, consejos",
    vocabulario: "Dolor, cabeza, medicina, médico, hospital, síntoma",
    tema: "Salud",
    objetivoImplicito: "Describir síntomas y buscar atención médica",
    classroomLink: "https://classroom.google.com/c/spanish-b1-health"
  },
  {
    name: "Medio Ambiente",
    level: "B1",
    orderIndex: 14,
    description: "Problemas ambientales y sostenibilidad",
    recursoGramatical: "Expresar opiniones, condicional simple",
    vocabulario: "Naturaleza, contaminación, reciclar, energía, planeta",
    tema: "Ecología",
    objetivoImplicito: "Discutir temas ambientales y proponer soluciones",
    classroomLink: "https://classroom.google.com/c/spanish-b1-environment"
  },
  {
    name: "Cultura y Tradiciones",
    level: "B1",
    orderIndex: 15,
    description: "Festividades y costumbres hispanoamericanas",
    recursoGramatical: "Imperfecto para descripciones, comparaciones",
    vocabulario: "Fiesta, tradición, costumbre, celebrar, cultura",
    tema: "Cultura hispana",
    objetivoImplicito: "Comparar culturas y describir tradiciones",
    classroomLink: "https://classroom.google.com/c/spanish-b1-culture"
  },

  // B2 Level Topics
  {
    name: "Argumentación y Debate",
    level: "B2",
    orderIndex: 16,
    description: "Expresar opiniones y argumentar puntos de vista",
    recursoGramatical: "Subjuntivo en oraciones complejas, conectores",
    vocabulario: "Opinar, argumento, debate, convencer, punto de vista",
    tema: "Expresión de opiniones",
    objetivoImplicito: "Participar en debates y defender opiniones",
    classroomLink: "https://classroom.google.com/c/spanish-b2-debate"
  },
  {
    name: "Tecnología y Sociedad",
    level: "B2",
    orderIndex: 17,
    description: "Impacto de la tecnología en la sociedad moderna",
    recursoGramatical: "Oraciones de relativo, vocabulario abstracto",
    vocabulario: "Internet, redes sociales, innovación, digital, avance",
    tema: "Tecnología",
    objetivoImplicito: "Analizar el impacto tecnológico en la sociedad",
    classroomLink: "https://classroom.google.com/c/spanish-b2-technology"
  },
  {
    name: "Arte y Literatura",
    level: "B2",
    orderIndex: 18,
    description: "Análisis de obras artísticas y literarias",
    recursoGramatical: "Estilo indirecto, expresiones de tiempo",
    vocabulario: "Pintura, escultura, novela, poeta, obra, crítica",
    tema: "Cultura artística",
    objetivoImplicito: "Analizar y criticar obras artísticas",
    classroomLink: "https://classroom.google.com/c/spanish-b2-art"
  },
  {
    name: "Economía y Negocios",
    level: "B2",
    orderIndex: 19,
    description: "Conceptos económicos y mundo empresarial",
    recursoGramatical: "Perífrasis verbales, registro formal",
    vocabulario: "Empresa, mercado, inversión, beneficio, competencia",
    tema: "Mundo empresarial",
    objetivoImplicito: "Discutir temas económicos y empresariales",
    classroomLink: "https://classroom.google.com/c/spanish-b2-business"
  },
  {
    name: "Psicología y Emociones",
    level: "B2",
    orderIndex: 20,
    description: "Estados emocionales y comportamiento humano",
    recursoGramatical: "Subjuntivo imperfecto, expresiones de sentimiento",
    vocabulario: "Emoción, sentimiento, comportamiento, personalidad",
    tema: "Psicología",
    objetivoImplicito: "Describir estados emocionales y psicológicos",
    classroomLink: "https://classroom.google.com/c/spanish-b2-psychology"
  }
]

const exercises = [
  // A1 exercises
  {
    topicName: "Saludos y Presentaciones",
    title: "Completar presentaciones",
    phase: "PRE_CLASS" as const,
    category: "GRAMMAR",
    type: "FILL_BLANKS",
    instructions: "Completa las frases con las palabras correctas",
    content: {
      text: "Hola, me ____ Ana. ____ de España y tengo 25 ____.",
      blanks: ["llamo", "soy", "años"]
    },
    points: 10,
    orderIndex: 1
  },
  {
    topicName: "Saludos y Presentaciones", 
    title: "Elegir saludos apropiados",
    phase: "PRE_CLASS" as const,
    category: "VOCABULARY",
    type: "MULTIPLE_CHOICE",
    instructions: "Selecciona el saludo más apropiado para cada situación",
    content: {
      question: "¿Cómo saludas a tu profesor por la mañana?",
      options: ["¡Hola!", "Buenos días", "¿Qué tal?", "¡Eh!"],
      correct: 1
    },
    points: 5,
    orderIndex: 2
  },

  // Add exercises for other topics...
  {
    topicName: "Los Números y la Hora",
    title: "Decir la hora",
    phase: "PRE_CLASS" as const,
    category: "VOCABULARY", 
    type: "MULTIPLE_CHOICE",
    instructions: "¿Qué hora es?",
    content: {
      question: "Son las 3:30",
      options: ["Son las tres y media", "Son las cuatro menos media", "Son las tres menos treinta", "Es la una y media"],
      correct: 0
    },
    points: 5,
    orderIndex: 1
  },

  {
    topicName: "La Familia",
    title: "Relaciones familiares",
    phase: "PRE_CLASS" as const,
    category: "VOCABULARY",
    type: "MATCHING",
    instructions: "Relaciona cada persona con su definición",
    content: {
      pairs: [
        { left: "Abuelo", right: "Padre de mi padre" },
        { left: "Hermana", right: "Hija de mis padres" },
        { left: "Prima", right: "Hija de mi tío" }
      ]
    },
    points: 15,
    orderIndex: 1
  }
]

async function seedSpanishContent() {
  try {
    console.log('🌱 Starting Spanish content seeding...')

    // Create topics
    console.log('📚 Creating Spanish topics...')
    
    // Check if topics already exist
    const existingTopics = await prisma.topic.findMany()
    if (existingTopics.length === 0) {
      await prisma.topic.createMany({
        data: spanishTopics
      })
      console.log(`✅ Created ${spanishTopics.length} topics`)
    } else {
      console.log(`ℹ️ ${existingTopics.length} topics already exist, skipping creation`)
    }

    // Create exercises
    console.log('✏️ Creating exercises...')
    
    const existingExercises = await prisma.exercise.findMany()
    if (existingExercises.length === 0) {
      for (const exercise of exercises) {
        // Find the topic
        const topic = await prisma.topic.findFirst({
          where: { name: exercise.topicName }
        })

        if (topic) {
          await prisma.exercise.create({
            data: {
              topicId: topic.id,
              title: exercise.title,
              phase: exercise.phase,
              category: exercise.category,
              type: exercise.type,
              instructions: exercise.instructions,
              content: exercise.content,
              points: exercise.points,
              orderIndex: exercise.orderIndex
            }
          })
        }
      }
      console.log(`✅ Created ${exercises.length} exercises`)
    } else {
      console.log(`ℹ️ ${existingExercises.length} exercises already exist, skipping creation`)
    }

    console.log('✅ Spanish content seeded successfully!')
    console.log(`📊 Created ${spanishTopics.length} topics and ${exercises.length} exercises`)

  } catch (error) {
    console.error('❌ Error seeding Spanish content:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seeding function
seedSpanishContent()
  .then(() => {
    console.log('🎉 Seeding completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error)
    process.exit(1)
  })