'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BookOpen, 
  Play, 
  CheckCircle,
  Clock,
  Users,
  PenTool,
  Volume2,
  FileText,
  Video,
  MessageCircle,
  Target,
  Award
} from 'lucide-react'

interface Exercise {
  id: string
  title: string
  type: 'grammar' | 'vocabulary' | 'listening' | 'writing'
  duration: number
  completed: boolean
  points: number
}

interface StudyTopic {
  id: string
  name: string
  level: string
  phase: 'pre-class' | 'live-class' | 'post-class'
  completed: boolean
  exercises: Exercise[]
}

export default function StudyContent() {
  const [selectedTopic, setSelectedTopic] = useState<string>('presentacion-personal')
  const [currentPhase, setCurrentPhase] = useState<'pre-class' | 'live-class' | 'post-class'>('pre-class')
  const [loading, setLoading] = useState(false)

  // Mock study content - in real app this would come from API
  const studyTopics: StudyTopic[] = [
    {
      id: 'presentacion-personal',
      name: 'Presentación Personal',
      level: 'A1',
      phase: 'pre-class',
      completed: false,
      exercises: [
        {
          id: '1',
          title: 'Gramática: Ser vs Estar',
          type: 'grammar',
          duration: 15,
          completed: true,
          points: 50
        },
        {
          id: '2',
          title: 'Vocabulario: Información Personal',
          type: 'vocabulary',
          duration: 10,
          completed: true,
          points: 30
        },
        {
          id: '3',
          title: 'Comprensión Auditiva: Presentaciones',
          type: 'listening',
          duration: 20,
          completed: false,
          points: 40
        }
      ]
    }
  ]

  const currentTopic = studyTopics.find(t => t.id === selectedTopic) || studyTopics[0]

  const phaseConfig = {
    'pre-class': {
      title: 'Preparación Pre-Clase',
      subtitle: 'Actividades de preparación antes de la clase en vivo',
      color: 'blue',
      icon: BookOpen,
      description: 'Completa estas actividades antes de asistir a la clase en vivo para aprovechar al máximo la experiencia.'
    },
    'live-class': {
      title: 'Clase en Vivo',
      subtitle: 'Sesión interactiva con profesor nativo',
      color: 'green',
      icon: Video,
      description: 'Participa en la clase en vivo donde practicarás todo lo aprendido en la preparación.'
    },
    'post-class': {
      title: 'Actividades Post-Clase',
      subtitle: 'Refuerza y consolida el aprendizaje',
      color: 'purple',
      icon: PenTool,
      description: 'Completa estas actividades después de la clase para consolidar tu aprendizaje.'
    }
  }

  const getExerciseIcon = (type: string) => {
    switch (type) {
      case 'grammar': return FileText
      case 'vocabulary': return BookOpen
      case 'listening': return Volume2
      case 'writing': return PenTool
      default: return BookOpen
    }
  }

  const getPhaseProgress = (phase: 'pre-class' | 'live-class' | 'post-class') => {
    if (phase === 'pre-class') {
      const completed = currentTopic.exercises.filter(e => e.completed).length
      return Math.round((completed / currentTopic.exercises.length) * 100)
    }
    if (phase === 'live-class') return 0 // Would be based on attendance
    if (phase === 'post-class') return 0 // Would be based on completion
    return 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Estudiar Contenido
                </h1>
                <p className="text-gray-600">
                  Aprendizaje estructurado en 3 fases
                </p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/student'}
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              ← Volver al Dashboard
            </Button>
          </div>
        </div>

        {/* Learning Path Navigation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">
              {currentTopic.name} - Nivel {currentTopic.level}
            </CardTitle>
            <p className="text-gray-600">
              Sigue el proceso de aprendizaje en 3 fases para maximizar tu progreso
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['pre-class', 'live-class', 'post-class'] as const).map((phase, index) => {
                const config = phaseConfig[phase]
                const Icon = config.icon
                const progress = getPhaseProgress(phase)
                const isActive = currentPhase === phase
                const isCompleted = progress === 100
                
                return (
                  <div 
                    key={phase}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                      isActive 
                        ? `bg-${config.color}-50 border-${config.color}-300 shadow-md` 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setCurrentPhase(phase)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        isActive ? `bg-${config.color}-600` : 'bg-gray-100'
                      }`}>
                        <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${isActive ? `text-${config.color}-900` : 'text-gray-700'}`}>
                          Fase {index + 1}
                        </h3>
                        <p className={`text-sm ${isActive ? `text-${config.color}-700` : 'text-gray-500'}`}>
                          {config.title}
                        </p>
                      </div>
                      {isCompleted && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    <Progress 
                      value={progress} 
                      className={`h-2 ${
                        config.color === 'blue' ? '[&>div]:bg-blue-500' :
                        config.color === 'green' ? '[&>div]:bg-green-500' :
                        '[&>div]:bg-purple-500'
                      }`}
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      {progress}% completado
                    </p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Current Phase Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className={`h-12 w-12 bg-${phaseConfig[currentPhase].color}-600 rounded-lg flex items-center justify-center`}>
                {React.createElement(phaseConfig[currentPhase].icon, { className: "h-6 w-6 text-white" })}
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {phaseConfig[currentPhase].title}
                </CardTitle>
                <p className="text-gray-600">
                  {phaseConfig[currentPhase].subtitle}
                </p>
              </div>
            </div>
            <div className={`p-4 bg-${phaseConfig[currentPhase].color}-50 rounded-lg border border-${phaseConfig[currentPhase].color}-200`}>
              <p className={`text-${phaseConfig[currentPhase].color}-800`}>
                {phaseConfig[currentPhase].description}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {currentPhase === 'pre-class' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Actividades de Preparación
                  </h3>
                  <Badge className="bg-blue-100 text-blue-800">
                    {currentTopic.exercises.filter(e => e.completed).length} de {currentTopic.exercises.length} completadas
                  </Badge>
                </div>
                
                {currentTopic.exercises.map((exercise, index) => {
                  const ExerciseIcon = getExerciseIcon(exercise.type)
                  
                  return (
                    <div 
                      key={exercise.id}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                        exercise.completed 
                          ? 'bg-green-50 border-green-300' 
                          : 'bg-white border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                            exercise.completed ? 'bg-green-600' : 'bg-blue-600'
                          }`}>
                            {exercise.completed ? (
                              <CheckCircle className="h-5 w-5 text-white" />
                            ) : (
                              <ExerciseIcon className="h-5 w-5 text-white" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {exercise.title}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {exercise.duration} min
                              </span>
                              <span className="flex items-center gap-1">
                                <Award className="h-4 w-4" />
                                {exercise.points} puntos
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          className={exercise.completed ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
                          onClick={() => {
                            // Here you would navigate to the exercise
                            console.log('Starting exercise:', exercise.id)
                          }}
                        >
                          {exercise.completed ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Repasar
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Comenzar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {currentPhase === 'live-class' && (
              <div className="text-center py-12">
                <div className="h-20 w-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Video className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Clase en Vivo: Presentación Personal
                </h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Únete a la clase en vivo donde practicarás presentarte en español con un profesor nativo y otros estudiantes.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-green-900">Interacción Real</h4>
                    <p className="text-sm text-green-700">
                      Practica con profesor nativo y compañeros
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <MessageCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-green-900">Práctica Oral</h4>
                    <p className="text-sm text-green-700">
                      Mejora tu pronunciación y fluidez
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-green-900">Feedback Inmediato</h4>
                    <p className="text-sm text-green-700">
                      Correcciones y consejos en tiempo real
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button 
                    size="lg" 
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                    onClick={() => {
                      // Here you would navigate to booking system
                      window.location.href = '/student/book-class'
                    }}
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Agendar Clase en Vivo
                  </Button>
                  
                  <div className="text-sm text-gray-600">
                    <p>Próxima clase disponible: <strong>Hoy 14:00 - 15:00</strong></p>
                    <p>Plazas disponibles: <strong>3 de 8</strong></p>
                  </div>
                </div>
              </div>
            )}

            {currentPhase === 'post-class' && (
              <div className="text-center py-12">
                <div className="h-20 w-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <PenTool className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Actividades Post-Clase
                </h3>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                  Estas actividades estarán disponibles después de completar la clase en vivo. 
                  Te ayudarán a consolidar lo aprendido y seguir practicando.
                </p>
                
                <Badge className="bg-purple-100 text-purple-800 px-4 py-2 text-base">
                  📚 Disponible después de la clase en vivo
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}