'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import SpanishTopicCard from './SpanishTopicCard'
import { 
  GraduationCap, 
  Trophy, 
  BookOpen, 
  Target,
  Clock,
  Users
} from 'lucide-react'

interface SpanishTopic {
  id: string
  name: string
  level: 'A1' | 'A2' | 'B1' | 'B2'
  recursoGramatical?: string
  vocabulario?: string
  tema?: string
  objetivoImplicito?: string
  classroomLink?: string
  orderIndex: number
  progress?: {
    preClassComplete: boolean
    liveClassAttended: boolean
    afterClassComplete: boolean
  }
}

interface SpanishLevelTabsProps {
  topics: SpanishTopic[]
  currentUserLevel?: 'A1' | 'A2' | 'B1' | 'B2'
  onStartLesson?: (topicId: string) => void
  onViewClassroom?: (link: string) => void
  onBookClass?: (topicId: string) => void
}

const levelInfo = {
  A1: {
    title: 'Principiante',
    description: 'Fundamentos del español - Presentaciones, familia, rutinas diarias',
    icon: BookOpen,
    color: 'green',
    objectives: [
      'Presentarse y dar información personal básica',
      'Describir rutinas diarias y actividades',
      'Hablar sobre la familia y relaciones',
      'Pedir comida en restaurantes',
      'Describir el tiempo y las estaciones'
    ]
  },
  A2: {
    title: 'Elemental',
    description: 'Comunicación básica - Viajes, compras, vida saludable',
    icon: Target,
    color: 'blue',
    objectives: [
      'Narrar experiencias de viajes pasados',
      'Comparar productos y expresar preferencias',
      'Dar consejos sobre hábitos saludables',
      'Hacer predicciones sobre tecnología',
      'Hablar sobre cultura hispana'
    ]
  },
  B1: {
    title: 'Intermedio',
    description: 'Conversación fluida - Trabajo, medio ambiente, educación',
    icon: Users,
    color: 'orange',
    objectives: [
      'Expresar situaciones hipotéticas laborales',
      'Opinar sobre problemas ambientales',
      'Narrar experiencias educativas',
      'Analizar manifestaciones artísticas',
      'Expresar emociones complejas'
    ]
  },
  B2: {
    title: 'Intermedio Alto',
    description: 'Dominio avanzado - Política, ciencia, filosofía',
    icon: GraduationCap,
    color: 'red',
    objectives: [
      'Analizar fenómenos económicos globales',
      'Presentar hipótesis científicas',
      'Defender argumentos políticos',
      'Analizar información mediática',
      'Debatir cuestiones éticas complejas'
    ]
  }
}

export default function SpanishLevelTabs({ 
  topics, 
  currentUserLevel = 'A1',
  onStartLesson,
  onViewClassroom,
  onBookClass 
}: SpanishLevelTabsProps) {
  const [activeTab, setActiveTab] = useState(currentUserLevel)

  const getTopicsByLevel = (level: string) => {
    return topics.filter(topic => topic.level === level)
  }

  const getLevelProgress = (level: string) => {
    const levelTopics = getTopicsByLevel(level)
    if (levelTopics.length === 0) return 0
    
    const completedTopics = levelTopics.filter(topic => 
      topic.progress?.preClassComplete && 
      topic.progress?.liveClassAttended && 
      topic.progress?.afterClassComplete
    ).length
    
    return (completedTopics / levelTopics.length) * 100
  }

  const getColorClass = (color: string, type: 'bg' | 'text' | 'border') => {
    const colors = {
      green: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
      red: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' }
    }
    return colors[color as keyof typeof colors]?.[type] || ''
  }

  return (
    <div className="w-full space-y-6">
      {/* Level Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(levelInfo).map(([level, info]) => {
          const progress = getLevelProgress(level)
          const topicCount = getTopicsByLevel(level).length
          const isCurrentLevel = level === currentUserLevel
          const IconComponent = info.icon
          
          return (
            <Card 
              key={level}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                isCurrentLevel ? 'ring-2 ring-orange-500 border-orange-200' : ''
              }`}
              onClick={() => setActiveTab(level as any)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${getColorClass(info.color, 'bg')}`}>
                      <IconComponent className={`h-5 w-5 ${getColorClass(info.color, 'text')}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{level}</span>
                        {isCurrentLevel && (
                          <Badge className="bg-orange-100 text-orange-800 text-xs">
                            Actual
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-gray-600">{info.title}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{topicCount} lecciones</span>
                    <span className="font-medium text-gray-900">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detailed Level Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          {Object.keys(levelInfo).map((level) => (
            <TabsTrigger key={level} value={level} className="text-sm">
              Nivel {level}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(levelInfo).map(([level, info]) => (
          <TabsContent key={level} value={level} className="space-y-6">
            {/* Level Description */}
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${getColorClass(info.color, 'bg')}`}>
                    <info.icon className={`h-6 w-6 ${getColorClass(info.color, 'text')}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">
                      Nivel {level} - {info.title}
                    </CardTitle>
                    <CardDescription className="text-base mb-4">
                      {info.description}
                    </CardDescription>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Objetivos del nivel:</h4>
                      <ul className="space-y-1">
                        {info.objectives.map((objective, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-orange-500 mt-1">•</span>
                            {objective}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round(getLevelProgress(level))}%
                    </div>
                    <div className="text-sm text-gray-600">Completado</div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Topics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getTopicsByLevel(level).map((topic) => (
                <SpanishTopicCard
                  key={topic.id}
                  topic={topic}
                  onStartLesson={onStartLesson}
                  onViewClassroom={onViewClassroom}
                  onBookClass={onBookClass}
                />
              ))}
            </div>

            {getTopicsByLevel(level).length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Contenido en preparación
                  </h3>
                  <p className="text-gray-600">
                    Las lecciones del nivel {level} estarán disponibles pronto.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}