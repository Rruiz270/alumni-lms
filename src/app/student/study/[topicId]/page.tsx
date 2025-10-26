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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/student')}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Área de Estudio
              </h1>
              <p className="text-gray-600">
                Completa todas las actividades para dominar este tema
              </p>
            </div>
          </div>
        </div>

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