'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import GoogleClassroomViewer from '@/components/classroom/GoogleClassroomViewer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BookOpen } from 'lucide-react'

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
}

export default function StudentStudyPage() {
  const params = useParams()
  const router = useRouter()
  const topicId = params.topicId as string
  
  const [topic, setTopic] = useState<SpanishTopic | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const response = await fetch('/api/topics/public')
        
        if (response.ok) {
          const data = await response.json()
          const foundTopic = data.topics.find((t: SpanishTopic) => t.id === topicId)
          setTopic(foundTopic || null)
        }
      } catch (error) {
        console.error('Error fetching topic:', error)
      } finally {
        setLoading(false)
      }
    }

    if (topicId) {
      fetchTopic()
    }
  }, [topicId])

  const handleStartPreClass = () => {
    // Navigate to pre-class exercises
    router.push(`/student/exercise/${topicId}/pre`)
  }

  const handleStartPostClass = () => {
    // Navigate to post-class exercises
    router.push(`/student/exercise/${topicId}/post`)
  }

  const handleMarkAttended = () => {
    // Mark live class as attended
    console.log('Marking live class as attended for topic:', topicId)
    // TODO: API call to mark attendance
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-lg">Cargando contenido de estudio...</div>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-8">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Tema no encontrado
            </h2>
            <p className="text-gray-600 mb-4">
              El tema de estudio que buscas no está disponible.
            </p>
            <Button onClick={() => router.push('/student')}>
              Volver al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/student/study')}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>
          
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center h-16 w-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg mb-4">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Área de Estudio
            </h1>
            <p className="text-gray-600">
              Completa todas las actividades para dominar este tema
            </p>
          </div>
        </div>

        {/* Topic Information Card */}
        <Card className="mb-6">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                topic.level === 'A1' ? 'bg-green-100 text-green-800' :
                topic.level === 'A2' ? 'bg-blue-100 text-blue-800' :
                topic.level === 'B1' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                Nivel {topic.level}
              </span>
              <span className="text-sm text-gray-500">Lección {topic.orderIndex}</span>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {topic.name}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="grid md:grid-cols-3 gap-4 text-center">
            {topic.tema && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-1">Tema:</h3>
                <p className="text-sm text-gray-600">{topic.tema}</p>
              </div>
            )}
            
            {topic.vocabulario && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-1">Vocabulario:</h3>
                <p className="text-sm text-gray-600">{topic.vocabulario}</p>
              </div>
            )}
            
            {topic.recursoGramatical && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-1">Gramática:</h3>
                <p className="text-sm text-gray-600">{topic.recursoGramatical}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Google Classroom Viewer */}
        <GoogleClassroomViewer
          topic={topic}
          onStartPreClass={handleStartPreClass}
          onStartPostClass={handleStartPostClass}
          onMarkAttended={handleMarkAttended}
        />
      </div>
    </div>
  )
}