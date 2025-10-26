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
  Target,
  Award
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

export default function PostClassExercisePage() {
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

        // Generate post-class exercises based on topic content
        if (topicId) {
          const postClassExercises = generatePostClassExercises(foundTopic)
          setExercises(postClassExercises)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTopicAndExercises()
  }, [topicId])

  const generatePostClassExercises = (topic: Topic | null): Exercise[] => {
    if (!topic) return []

    const exercises: Exercise[] = []

    // Grammar application exercise
    if (topic.recursoGramatical) {
      exercises.push({
        id: 'grammar-apply',
        type: 'multiple_choice',
        title: 'Aplicación Gramatical',
        instructions: 'Aplica lo aprendido sobre el concepto gramatical',
        content: {
          question: `Elige la oración que usa correctamente ${topic.recursoGramatical}:`,
          options: [
            'Esta es la forma correcta de usar el concepto',
            'Esta oración no es correcta gramaticalmente',
            'Aquí hay un error en la aplicación',
            'Esta opción también es incorrecta'
          ]
        },
        correctAnswer: 0,
        points: 25
      })
    }

    // Vocabulary reinforcement
    if (topic.vocabulario) {
      exercises.push({
        id: 'vocab-practice',
        type: 'gap_fill',
        title: 'Práctica de Vocabulario',
        instructions: 'Completa las oraciones con el vocabulario aprendido',
        content: {
          text: `Después de la clase sobre ${topic.tema}, puedo usar ___ para expresar ___ en contextos reales.`,
          blanks: [
            { position: 0, correctAnswer: 'vocabulario nuevo' },
            { position: 1, correctAnswer: 'mis ideas' }
          ]
        },
        points: 20
      })
    }

    // Comprehension exercise
    exercises.push({
      id: 'comprehension',
      type: 'matching',
      title: 'Comprensión del Tema',
      instructions: 'Relaciona los conceptos con sus aplicaciones',
      content: {
        pairs: [
          { left: topic.recursoGramatical || 'Gramática', right: 'Estructura del idioma' },
          { left: topic.vocabulario || 'Vocabulario', right: 'Palabras y expresiones' },
          { left: topic.tema || 'Tema', right: 'Contenido principal' },
          { left: 'Práctica', right: 'Aplicación real' }
        ]
      },
      points: 30
    })

    // Reflection exercise
    exercises.push({
      id: 'reflection',
      type: 'vocabulary',
      title: 'Reflexión del Aprendizaje',
      instructions: 'Reflexiona sobre lo que aprendiste en la clase',
      content: {
        words: [
          'Lo más importante fue...',
          'Necesito practicar más...',
          'Puedo aplicar esto en...',
          'Mi siguiente objetivo es...'
        ],
        type: 'open_reflection'
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
        } else {
          // Partial credit for incorrect answers
          setScore(prev => prev + Math.floor(exercise.points * 0.5))
        }
      } else {
        // For exercises without specific correct answers, give full credit for completion
        setScore(prev => prev + exercise.points)
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
  const maxScore = exercises.reduce((sum, ex) => sum + ex.points, 0)
  const scorePercentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="text-lg">Cargando ejercicios post-clase...</div>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="mb-6">
                <Award className="h-16 w-16 mx-auto text-green-600 mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  ¡Post-Clase Completada!
                </h1>
                <p className="text-gray-600">
                  Has reforzado exitosamente lo aprendido en "{topic.name}"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-green-50 rounded-lg">
                  <Trophy className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <p className="text-2xl font-bold text-green-900">{score}</p>
                  <p className="text-sm text-green-700">Puntos Totales</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <Target className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <p className="text-2xl font-bold text-blue-900">{completedExercises.size}</p>
                  <p className="text-sm text-blue-700">Ejercicios Completados</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <Star className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                  <p className="text-2xl font-bold text-orange-900">{Math.round(progress)}%</p>
                  <p className="text-sm text-orange-700">Progreso</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <Award className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <p className="text-2xl font-bold text-purple-900">{scorePercentage}%</p>
                  <p className="text-sm text-purple-700">Puntuación</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">¡Felicitaciones!</h3>
                  <p className="text-green-700">
                    Has completado exitosamente todas las actividades del tema "{topic.name}".
                    {scorePercentage >= 80 ? ' ¡Excelente dominio del contenido!' : 
                     scorePercentage >= 60 ? ' Buen trabajo, sigue practicando.' : 
                     ' Te recomendamos repasar el material.'}
                  </p>
                </div>
                
                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={handleFinish}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Completar Tema
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8">
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
            <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Post-Clase: {topic.name}
              </h1>
              <p className="text-gray-600">
                Refuerza lo aprendido en la clase
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-green-100 text-green-800">
              Nivel {topic.level}
            </Badge>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {currentExerciseIndex + 1} de {exercises.length}
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                {score} puntos
              </div>
            </div>
          </div>

          <Progress value={progress} className="mb-6" />
        </div>

        {/* Current Exercise */}
        {currentExercise && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
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
                  <Button onClick={handleNext} className="bg-green-600 hover:bg-green-700">
                    {currentExerciseIndex < exercises.length - 1 ? 'Siguiente Ejercicio' : 'Finalizar Post-Clase'}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exercises.map((exercise, index) => (
                <div 
                  key={exercise.id}
                  className={`p-3 rounded-lg border ${
                    completedExercises.has(exercise.id) ? 'bg-green-50 border-green-200' :
                    index === currentExerciseIndex ? 'bg-blue-50 border-blue-200' :
                    'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
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
                    <span className="text-xs text-gray-600">{exercise.points}pts</span>
                  </div>
                </div>
              ))}
            </div>
            
            {completedExercises.size > 0 && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-700">Puntuación actual:</span>
                  <span className="font-semibold text-green-900">{score} / {maxScore} ({scorePercentage}%)</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}