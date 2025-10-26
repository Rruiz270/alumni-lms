'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import SpanishLevelTabs from '@/components/spanish/SpanishLevelTabs'
import { 
  Calendar, 
  BookOpen, 
  Trophy, 
  Clock,
  GraduationCap,
  Target,
  Users,
  Star
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
}

export default function SimpleStudentDashboard() {
  const [topics, setTopics] = useState<SpanishTopic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://alumni-backend-production-2546.up.railway.app'
        const response = await fetch(`${apiUrl}/api/topics`)
        
        if (response.ok) {
          const data = await response.json()
          setTopics(data || [])
        }
      } catch (error) {
        console.error('Error fetching topics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTopics()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-lg">Cargando Alumni by Better...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  ¡Bienvenido a Alumni by Better!
                </h1>
                <p className="text-gray-600">
                  Tu plataforma de aprendizaje de español - Academia Alumni
                </p>
              </div>
            </div>
            
            {/* Role Navigation */}
            <div className="flex gap-2">
              <Button 
                variant="default" 
                className="bg-orange-600 text-white hover:bg-orange-700"
              >
                👨‍🎓 Estudiante
              </Button>
              <Button 
                variant="outline" 
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
                onClick={() => window.location.href = '/teacher'}
              >
                👩‍🏫 Profesor
              </Button>
              <Button 
                variant="outline" 
                className="border-purple-600 text-purple-600 hover:bg-purple-50"
                onClick={() => window.location.href = '/admin'}
              >
                👑 Admin
              </Button>
            </div>
          </div>
          
          {/* Course Information */}
          <div className="p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-orange-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Nivel Actual:</span>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-orange-100 text-orange-800">
                    Español A1
                  </Badge>
                  <Star className="h-4 w-4 text-orange-500" />
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Progreso del Curso:</span>
                <p className="text-gray-900 mt-1">
                  12 de 80 lecciones completadas
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Temas Disponibles:</span>
                <p className="text-gray-900 mt-1">
                  {topics.length} temas de español
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white hover:shadow-lg transition-all duration-300">
            <CardContent className="flex items-center p-6">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lecciones Restantes</p>
                <p className="text-2xl font-bold text-gray-900">68</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white hover:shadow-lg transition-all duration-300">
            <CardContent className="flex items-center p-6">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Nivel Actual</p>
                <p className="text-2xl font-bold text-gray-900">A1</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white hover:shadow-lg transition-all duration-300">
            <CardContent className="flex items-center p-6">
              <Trophy className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Temas Disponibles</p>
                <p className="text-2xl font-bold text-gray-900">{topics.length}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white hover:shadow-lg transition-all duration-300">
            <CardContent className="flex items-center p-6">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Próxima Clase</p>
                <p className="text-sm font-bold text-gray-900">Por agendar</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-900">
                <Calendar className="h-5 w-5 mr-2 text-orange-600" />
                Agendar Clase
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-orange-700 mb-4">
                Programa tu próxima clase en vivo con nuestros profesores nativos
              </p>
              <Button 
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700"
                onClick={() => window.location.href = '/student/book-class'}
              >
                Agendar Ahora
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-900">
                <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                Estudiar Contenido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 mb-4">
                Accede a actividades pre-clase y post-clase para reforzar tu aprendizaje
              </p>
              <Button 
                variant="outline" 
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                onClick={() => window.location.href = '/student/study'}
              >
                Comenzar a Estudiar
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center text-green-900">
                <Trophy className="h-5 w-5 mr-2 text-green-600" />
                Mi Progreso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700 mb-4">
                Revisa tu progreso y logros en el aprendizaje del español
              </p>
              <Button 
                variant="outline" 
                className="w-full border-green-300 text-green-700 hover:bg-green-50"
                onClick={() => window.location.href = '/student/progress'}
              >
                Ver Progreso
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Spanish Learning Content */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="h-8 w-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              Contenido de Español por Niveles
            </CardTitle>
            <p className="text-gray-600">
              Explora las lecciones organizadas por nivel CEFR y progresa a tu ritmo
            </p>
          </CardHeader>
          <CardContent>
            <SpanishLevelTabs
              topics={topics}
              currentUserLevel="A1"
              onStartLesson={(topicId) => window.location.href = '/student/study'}
              onViewClassroom={(link) => window.open(link, '_blank')}
              onBookClass={(topicId) => window.location.href = '/student/book-class'}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}