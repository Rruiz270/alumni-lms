'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import ExerciseRenderer from '@/components/exercises/ExerciseRenderer'
import { 
  BookOpen, 
  Trophy, 
  Clock,
  ArrowLeft,
  CheckCircle,
  Star
} from 'lucide-react'

interface Exercise {
  id: string
  type: 'multiple_choice' | 'gap_fill' | 'matching' | 'listening' | 'vocabulary'
  title: string
  instructions: string
  content: any
  correctAnswer?: any
  points: number
}

interface Topic {
  id: string
  name: string
  level: string
  recursoGramatical?: string
  vocabulario?: string
  tema?: string
}

export default function ExerciseSession() {
  const params = useParams()
  const router = useRouter()
  const topicId = params.topicId as string
  
  const [topic, setTopic] = useState<Topic | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [completedExercises, setCompletedExercises] = useState<number[]>([])
  const [totalScore, setTotalScore] = useState(0)
  const [isSessionComplete, setIsSessionComplete] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTopicAndExercises()
  }, [topicId])

  const fetchTopicAndExercises = async () => {
    try {
      // Fetch topic data
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://alumni-backend-production-2546.up.railway.app'
      const topicResponse = await fetch(`${apiUrl}/api/topics`)
      const topics = await topicResponse.json()
      const selectedTopic = topics.find((t: Topic) => t.id === topicId)
      
      if (selectedTopic) {
        setTopic(selectedTopic)
        generateExercisesForTopic(selectedTopic)
      }
    } catch (error) {
      console.error('Error fetching topic:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateExercisesForTopic = (topic: Topic) => {
    // Generate exercises based on topic content
    const exercises: Exercise[] = []
    
    // Grammar exercise based on recursoGramatical
    if (topic.recursoGramatical) {
      exercises.push({
        id: `${topic.id}-grammar`,
        type: 'multiple_choice',
        title: `Gramática: ${topic.recursoGramatical}`,
        instructions: 'Selecciona la opción correcta para completar la oración.',
        content: {
          question: getGrammarQuestion(topic.recursoGramatical, topic.level),
          options: getGrammarOptions(topic.recursoGramatical)
        },
        correctAnswer: 0, // First option is always correct for demo
        points: 20
      })
    }
    
    // Vocabulary exercise
    if (topic.vocabulario) {
      exercises.push({
        id: `${topic.id}-vocabulary`,
        type: 'vocabulary',
        title: `Vocabulario: ${topic.vocabulario}`,
        instructions: 'Conecta cada palabra en español con su traducción en inglés.',
        content: getVocabularyContent(topic.vocabulario, topic.level),
        correctAnswer: [0, 0, 0], // Demo answers
        points: 25
      })
    }
    
    // Gap fill exercise based on tema
    if (topic.tema) {
      exercises.push({
        id: `${topic.id}-gap-fill`,
        type: 'gap_fill',
        title: `Completar texto: ${topic.tema}`,
        instructions: 'Completa el texto con las palabras correctas.',
        content: getGapFillContent(topic.tema, topic.level),
        correctAnswer: getGapFillAnswers(topic.tema),
        points: 30
      })
    }
    
    // Listening comprehension exercise
    exercises.push({
      id: `${topic.id}-listening`,
      type: 'listening',
      title: `Comprensión auditiva: ${topic.name}`,
      instructions: 'Escucha el audio y responde la pregunta.',
      content: {
        audioUrl: '/audio/demo.mp3',
        question: `¿Cuál es el tema principal del audio sobre ${topic.name}?`,
        options: [
          `Información personal y ${topic.name}`,
          'Deportes y entretenimiento',
          'Comida y restaurantes',
          'Viajes y turismo'
        ]
      },
      correctAnswer: 0,
      points: 25
    })
    
    setExercises(exercises)
  }

  const getGrammarQuestion = (grammar: string, level: string) => {
    const questions: Record<string, string> = {
      'Ser vs Estar': 'Mi hermana ___ muy inteligente.',
      'Presente Simple': 'Yo ___ español todos los días.',
      'Artículos': '___ casa es muy grande.',
      'Pronombres': '___ nombre es María.',
      'default': `Complete la oración usando ${grammar}:`
    }
    return questions[grammar] || questions.default
  }

  const getGrammarOptions = (grammar: string) => {
    const options: Record<string, string[]> = {
      'Ser vs Estar': ['es', 'está', 'son', 'están'],
      'Presente Simple': ['estudio', 'estudiar', 'estudió', 'estudiando'],
      'Artículos': ['La', 'El', 'Un', 'Una'],
      'Pronombres': ['Mi', 'Tu', 'Su', 'Nuestro'],
      'default': ['Opción A', 'Opción B', 'Opción C', 'Opción D']
    }
    return options[grammar] || options.default
  }

  const getVocabularyContent = (vocabulary: string, level: string) => {
    const vocabularies: Record<string, any> = {
      'Información Personal': {
        words: ['Nombre', 'Edad', 'Trabajo'],
        translations: [
          ['Name', 'Apellido', 'Título', 'Dirección'],
          ['Age', 'Altura', 'Peso', 'Color'],
          ['Job', 'Dinero', 'Casa', 'Carro']
        ]
      },
      'Familia': {
        words: ['Padre', 'Madre', 'Hermano'],
        translations: [
          ['Father', 'Uncle', 'Grandfather', 'Cousin'],
          ['Mother', 'Sister', 'Aunt', 'Grandmother'],
          ['Brother', 'Friend', 'Neighbor', 'Teacher']
        ]
      },
      'default': {
        words: ['Palabra 1', 'Palabra 2', 'Palabra 3'],
        translations: [
          ['Word 1', 'Option A', 'Option B', 'Option C'],
          ['Word 2', 'Option D', 'Option E', 'Option F'],
          ['Word 3', 'Option G', 'Option H', 'Option I']
        ]
      }
    }
    return vocabularies[vocabulary] || vocabularies.default
  }

  const getGapFillContent = (tema: string, level: string) => {
    const contents: Record<string, string> = {
      'Presentación Personal': 'Hola, mi ___ es María. Tengo 25 ___ y trabajo como ___. Vivo en Madrid con mi ___.',
      'Familia': 'Mi familia ___ muy grande. Tengo dos ___ y una ___. Mi padre ___ médico.',
      'default': `Este es un texto sobre ${tema}. Complete los ___ con las palabras ___. Es muy ___ practicar español.`
    }
    return { text: contents[tema] || contents.default, gaps: 4 }
  }

  const getGapFillAnswers = (tema: string) => {
    const answers: Record<string, string[]> = {
      'Presentación Personal': ['nombre', 'años', 'profesora', 'familia'],
      'Familia': ['es', 'hermanos', 'hermana', 'es'],
      'default': ['espacios', 'correctas', 'importante']
    }
    return answers[tema] || answers.default
  }

  const handleExerciseComplete = (score: number, answer: any) => {
    setTotalScore(prev => prev + score)
    setCompletedExercises(prev => [...prev, currentExerciseIndex])
  }

  const handleNext = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1)
    } else {
      setIsSessionComplete(true)
    }
  }

  const getProgressPercentage = () => {
    return Math.round(((currentExerciseIndex + 1) / exercises.length) * 100)
  }

  const getTotalPossibleScore = () => {
    return exercises.reduce((total, exercise) => total + exercise.points, 0)
  }

  const getPerformanceLevel = () => {
    const percentage = (totalScore / getTotalPossibleScore()) * 100
    if (percentage >= 90) return { level: 'Excelente', color: 'text-green-600', bg: 'bg-green-50' }
    if (percentage >= 80) return { level: 'Muy Bueno', color: 'text-blue-600', bg: 'bg-blue-50' }
    if (percentage >= 70) return { level: 'Bueno', color: 'text-yellow-600', bg: 'bg-yellow-50' }
    return { level: 'Necesita Práctica', color: 'text-red-600', bg: 'bg-red-50' }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-lg">Cargando ejercicios...</div>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-lg text-red-600">Tema no encontrado</div>
      </div>
    )
  }

  if (isSessionComplete) {
    const performance = getPerformanceLevel()
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="text-center">
            <CardHeader>
              <div className="h-20 w-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900">
                ¡Sesión Completada!
              </CardTitle>
              <p className="text-gray-600">
                Has terminado todos los ejercicios de: {topic.name}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className={`p-6 rounded-lg ${performance.bg}`}>
                <h3 className={`text-2xl font-bold ${performance.color} mb-2`}>
                  {performance.level}
                </h3>
                <p className="text-4xl font-bold text-gray-900 mb-2">
                  {totalScore}/{getTotalPossibleScore()}
                </p>
                <p className="text-gray-600">puntos obtenidos</p>
                <Progress 
                  value={(totalScore / getTotalPossibleScore()) * 100} 
                  className="mt-4"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-lg border">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">Ejercicios</p>
                  <p className="text-2xl font-bold text-gray-900">{exercises.length}</p>
                  <p className="text-sm text-gray-600">completados</p>
                </div>
                
                <div className="p-4 bg-white rounded-lg border">
                  <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">Puntuación</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round((totalScore / getTotalPossibleScore()) * 100)}%
                  </p>
                  <p className="text-sm text-gray-600">de acierto</p>
                </div>
                
                <div className="p-4 bg-white rounded-lg border">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-medium text-gray-900">Tiempo</p>
                  <p className="text-2xl font-bold text-gray-900">~15</p>
                  <p className="text-sm text-gray-600">minutos</p>
                </div>
              </div>
              
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={() => router.push('/student/study')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Continuar Estudiando
                </Button>
                
                <Button 
                  onClick={() => router.push('/student/progress')}
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Ver Mi Progreso
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const currentExercise = exercises[currentExerciseIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/student/study')}
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Estudio
            </Button>
            
            <Badge className="bg-blue-100 text-blue-800 px-4 py-2">
              Nivel {topic.level}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {topic.name}
              </h1>
              <p className="text-gray-600">
                Ejercicio {currentExerciseIndex + 1} de {exercises.length}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progreso de la sesión</span>
              <span>{getProgressPercentage()}%</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>
        </div>

        {/* Exercise */}
        {currentExercise && (
          <ExerciseRenderer
            exercise={currentExercise}
            onComplete={handleExerciseComplete}
            onNext={handleNext}
            isLast={currentExerciseIndex === exercises.length - 1}
          />
        )}
      </div>
    </div>
  )
}