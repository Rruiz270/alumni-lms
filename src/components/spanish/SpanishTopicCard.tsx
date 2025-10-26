'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, 
  Video, 
  FileText, 
  Clock,
  ExternalLink,
  Play,
  CheckCircle2
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

interface SpanishTopicCardProps {
  topic: SpanishTopic
  onStartLesson?: (topicId: string) => void
  onViewClassroom?: (link: string) => void
  onBookClass?: (topicId: string) => void
}

export default function SpanishTopicCard({ 
  topic, 
  onStartLesson, 
  onViewClassroom, 
  onBookClass 
}: SpanishTopicCardProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'A1': return 'bg-green-100 text-green-800 border-green-200'
      case 'A2': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'B1': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'B2': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getProgressPercentage = () => {
    if (!topic.progress) return 0
    const completed = [
      topic.progress.preClassComplete,
      topic.progress.liveClassAttended, 
      topic.progress.afterClassComplete
    ].filter(Boolean).length
    return (completed / 3) * 100
  }

  const progressPercentage = getProgressPercentage()

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getLevelColor(topic.level)}>
                Nivel {topic.level}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Lección {topic.orderIndex}
              </Badge>
            </div>
            <CardTitle className="text-lg font-bold text-gray-900 mb-2">
              {topic.name}
            </CardTitle>
            {topic.tema && (
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Tema:</span> {topic.tema}
              </p>
            )}
            {topic.vocabulario && (
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Vocabulario:</span> {topic.vocabulario}
              </p>
            )}
            {topic.recursoGramatical && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Gramática:</span> {topic.recursoGramatical}
              </p>
            )}
          </div>
          {progressPercentage > 0 && (
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-xs text-gray-500">Progreso</div>
                <div className="text-sm font-medium text-green-600">
                  {Math.round(progressPercentage)}%
                </div>
              </div>
              {progressPercentage === 100 && (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              )}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {progressPercentage > 0 && (
          <div className="w-full h-2 bg-gray-200 rounded-full mt-3">
            <div 
              className="h-2 bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Learning Objective */}
        {topic.objetivoImplicito && (
          <div className="p-3 bg-blue-50 rounded-lg border-l-3 border-l-blue-400">
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Objetivo de Aprendizaje
            </h4>
            <p className="text-sm text-blue-800">
              {topic.objetivoImplicito}
            </p>
          </div>
        )}

        {/* Progress Indicators */}
        {topic.progress && (
          <div className="grid grid-cols-3 gap-2">
            <div className={`text-center p-2 rounded-lg border ${
              topic.progress.preClassComplete 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}>
              <div className="text-xs font-medium">Pre-Clase</div>
              {topic.progress.preClassComplete && (
                <CheckCircle2 className="h-4 w-4 mx-auto mt-1 text-green-600" />
              )}
            </div>
            
            <div className={`text-center p-2 rounded-lg border ${
              topic.progress.liveClassAttended 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}>
              <div className="text-xs font-medium">Clase en Vivo</div>
              {topic.progress.liveClassAttended && (
                <CheckCircle2 className="h-4 w-4 mx-auto mt-1 text-green-600" />
              )}
            </div>
            
            <div className={`text-center p-2 rounded-lg border ${
              topic.progress.afterClassComplete 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}>
              <div className="text-xs font-medium">Post-Clase</div>
              {topic.progress.afterClassComplete && (
                <CheckCircle2 className="h-4 w-4 mx-auto mt-1 text-green-600" />
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={() => window.location.href = `/student/study/${topic.id}`}
            className="bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Estudiar
          </Button>

          <Button 
            variant="outline"
            onClick={() => onBookClass?.(topic.id)}
            className="border-orange-300 text-orange-700 hover:bg-orange-50"
          >
            <Video className="h-4 w-4 mr-2" />
            Agendar Clase
          </Button>
        </div>

        {/* Google Classroom Link */}
        {topic.classroomLink && (
          <Button 
            variant="ghost"
            onClick={() => onViewClassroom?.(topic.classroomLink!)}
            className="w-full text-blue-600 hover:text-blue-800 hover:bg-blue-50"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver Presentación en Classroom
          </Button>
        )}
      </CardContent>
    </Card>
  )
}