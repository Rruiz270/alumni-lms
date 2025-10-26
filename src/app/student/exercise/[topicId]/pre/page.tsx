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
  Star,
  Play,
  Target
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
  level: 'A1' | 'A2' | 'B1' | 'B2'
  recursoGramatical?: string
  vocabulario?: string
  tema?: string
}

export default function PreClassExercisePage() {
  const params = useParams()
  const router = useRouter()
  const topicId = params.topicId as string

  const [topic, setTopic] = useState<Topic | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({})
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set())
  const [score, setScore] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTopicAndExercises = async () => {
      try {
        // Fetch topic information
        const topicResponse = await fetch('/api/topics/public')
        if (topicResponse.ok) {
          const topicData = await topicResponse.json()
          const foundTopic = topicData.topics.find((t: Topic) => t.id === topicId)
          setTopic(foundTopic || null)
        }

        // Generate pre-class exercises based on topic content
        if (topicId) {
          const preClassExercises = generatePreClassExercises(foundTopic)
          setExercises(preClassExercises)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTopicAndExercises()
  }, [topicId])

  const generatePreClassExercises = (topic: Topic | null): Exercise[] => {
    if (!topic) return []

    const exercises: Exercise[] = []

    // Vocabulary exercise
    if (topic.vocabulario) {
      exercises.push({
        id: 'vocab-1',
        type: 'vocabulary',
        title: 'Vocabulario Clave',
        instructions: 'Familiarízate con el vocabulario principal del tema',
        content: {
          words: topic.vocabulario.split(',').map(word => word.trim()).slice(0, 5),
          type: 'definition_matching'
        },
        points: 20
      })
    }

    // Grammar introduction
    if (topic.recursoGramatical) {
      exercises.push({
        id: 'grammar-1',
        type: 'multiple_choice',
        title: 'Conceptos Gramaticales',
        instructions: 'Selecciona la respuesta correcta sobre el concepto gramatical',
        content: {
          question: `¿Qué sabes sobre ${topic.recursoGramatical}?`,
          options: [
            `Es fundamental para ${topic.tema || 'la comunicación'}`,
            'No tiene importancia en español',
            'Solo se usa en contextos formales',
            'Es opcional en la gramática española'
          ]
        },
        correctAnswer: 0,
        points: 15
      })
    }

    // Topic preparation
    exercises.push({
      id: 'topic-prep',
      type: 'gap_fill',
      title: 'Preparación del Tema',
      instructions: 'Completa las frases sobre el tema principal',
      content: {
        text: `En esta lección sobre "${topic.tema || topic.name}", vamos a explorar ___ y practicar ___ en diferentes contextos.`,
        blanks: [
          { position: 0, correctAnswer: topic.vocabulario || 'vocabulario' },
          { position: 1, correctAnswer: topic.recursoGramatical || 'gramática' }
        ]
      },
      points: 25
    })

    return exercises
  }

  const handleAnswerSubmit = (exerciseId: string, answer: any) => {
    setUserAnswers(prev => ({ ...prev, [exerciseId]: answer }))
    
    const exercise = exercises.find(ex => ex.id === exerciseId)
    if (exercise) {
      setCompletedExercises(prev => new Set([...prev, exerciseId]))
      
      // Calculate score (simplified)
      if (exercise.correctAnswer !== undefined) {
        const isCorrect = JSON.stringify(answer) === JSON.stringify(exercise.correctAnswer)
        if (isCorrect) {
          setScore(prev => prev + exercise.points)
        }
      } else {
        // For exercises without specific correct answers, give partial credit
        setScore(prev => prev + Math.floor(exercise.points * 0.8))
      }
    }
  }

  const handleNext = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1)
    } else {
      setIsCompleted(true)
    }
  }

  const handleFinish = () => {
    // Navigate back to topic study page
    router.push(`/student/study/${topicId}`)
  }

  const progress = exercises.length > 0 ? (completedExercises.size / exercises.length) * 100 : 0
  const currentExercise = exercises[currentExerciseIndex]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-lg">Cargando ejercicios pre-clase...</div>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-8">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Tema no encontrado
            </h2>
            <p className="text-gray-600 mb-4">
              No se pudo cargar la información del tema.
            </p>
            <Button onClick={() => router.push('/student/study')}>
              Volver a Estudio
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="mb-6">
                <CheckCircle className="h-16 w-16 mx-auto text-green-600 mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  ¡Pre-Clase Completada!
                </h1>
                <p className="text-gray-600">
                  Has terminado la preparación para "{topic.name}"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <Trophy className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <p className="text-2xl font-bold text-blue-900">{score}</p>
                  <p className="text-sm text-blue-700">Puntos Obtenidos</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <Target className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <p className="text-2xl font-bold text-green-900">{completedExercises.size}</p>
                  <p className="text-sm text-green-700">Ejercicios Completados</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <Star className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                  <p className="text-2xl font-bold text-orange-900">{Math.round(progress)}%</p>
                  <p className="text-sm text-orange-700">Progreso Total</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-gray-700">
                  ¡Excelente trabajo! Ahora estás listo para la clase en vivo.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={handleFinish}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Ir a Clase en Vivo
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/student/study')}
                  >
                    Volver a Estudio
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push(`/student/study/${topicId}`)}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Tema
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Pre-Clase: {topic.name}
              </h1>
              <p className="text-gray-600">
                Preparación antes de la clase en vivo
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-blue-100 text-blue-800">
              Nivel {topic.level}
            </Badge>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              {currentExerciseIndex + 1} de {exercises.length}
            </div>
          </div>

          <Progress value={progress} className="mb-6" />
        </div>

        {/* Current Exercise */}
        {currentExercise && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                {currentExercise.title}
              </CardTitle>
              <p className="text-gray-600">{currentExercise.instructions}</p>
            </CardHeader>
            <CardContent>
              <ExerciseRenderer
                exercise={currentExercise}
                onAnswerSubmit={(answer) => handleAnswerSubmit(currentExercise.id, answer)}
                userAnswer={userAnswers[currentExercise.id]}
              />
              
              {completedExercises.has(currentExercise.id) && (
                <div className="mt-6 flex justify-end">
                  <Button onClick={handleNext}>
                    {currentExerciseIndex < exercises.length - 1 ? 'Siguiente Ejercicio' : 'Finalizar Pre-Clase'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Exercise Summary */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Progreso de Ejercicios</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {exercises.map((exercise, index) => (
                <div 
                  key={exercise.id}
                  className={`p-3 rounded-lg border ${
                    completedExercises.has(exercise.id) ? 'bg-green-50 border-green-200' :
                    index === currentExerciseIndex ? 'bg-blue-50 border-blue-200' :
                    'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {completedExercises.has(exercise.id) ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : index === currentExerciseIndex ? (
                      <Clock className="h-4 w-4 text-blue-600" />
                    ) : (
                      <div className="h-4 w-4 border rounded-full border-gray-400" />
                    )}
                    <span className="text-sm font-medium">{exercise.title}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{exercise.points} puntos</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}