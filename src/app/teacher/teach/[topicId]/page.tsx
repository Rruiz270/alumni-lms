'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import TeacherClassroomInterface from '@/components/teacher/TeacherClassroomInterface'
import { Card, CardContent } from '@/components/ui/card'
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

export default function TeacherTeachPage() {
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

  const handleStartLiveClass = () => {
    console.log('Starting live class for topic:', topicId)
    // TODO: Integration with Google Meet or video conferencing platform
    alert('Iniciando clase en vivo...\n\nEsto abriría la integración con Google Meet o la plataforma de videoconferencia.')
  }

  const handleShareScreen = () => {
    console.log('Sharing screen for topic:', topicId)
    // TODO: Screen sharing functionality
    alert('Compartiendo pantalla...\n\nEsto activaría la función de compartir pantalla para mostrar los materiales a los estudiantes.')
  }

  const handleOpenSlides = () => {
    if (topic?.classroomLink) {
      // Extract presentation ID and open in present mode
      const match = topic.classroomLink.match(/\/presentation\/d\/([a-zA-Z0-9-_]+)/)
      if (match) {
        const presentationId = match[1]
        const presentUrl = `https://docs.google.com/presentation/d/${presentationId}/present?start=false&loop=false&delayms=3000`
        window.open(presentUrl, '_blank')
      } else {
        window.open(topic.classroomLink, '_blank')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-lg">Cargando interfaz de enseñanza...</div>
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
              El tema que intentas enseñar no está disponible.
            </p>
            <Button onClick={() => router.push('/teacher')}>
              Volver al Panel del Profesor
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/teacher')}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Panel del Profesor
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Interfaz de Enseñanza
              </h1>
              <p className="text-gray-600">
                Gestiona tu clase en vivo con materiales de Google Classroom
              </p>
            </div>
          </div>
        </div>

        {/* Teacher Classroom Interface */}
        <TeacherClassroomInterface
          topic={topic}
          onStartLiveClass={handleStartLiveClass}
          onShareScreen={handleShareScreen}
          onOpenSlides={handleOpenSlides}
        />
      </div>
    </div>
  )
}