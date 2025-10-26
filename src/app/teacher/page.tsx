'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  BookOpen, 
  Users, 
  Clock,
  GraduationCap,
  UserCheck,
  FileText,
  Video,
  Award,
  TrendingUp
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

export default function TeacherDashboard() {
  const [topics, setTopics] = useState<SpanishTopic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch('/api/topics/public')
        
        if (response.ok) {
          const data = await response.json()
          setTopics(data.topics || [])
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-lg">Cargando Panel del Profesor...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Panel del Profesor
                </h1>
                <p className="text-gray-600">
                  Gestiona tus clases y estudiantes de español
                </p>
              </div>
            </div>
            
            {/* Role Navigation */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="border-orange-600 text-orange-600 hover:bg-orange-50"
                onClick={() => window.location.href = '/student'}
              >
                👨‍🎓 Estudiante
              </Button>
              <Button 
                variant="default" 
                className="bg-blue-600 text-white hover:bg-blue-700"
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
          
          {/* Teacher Information */}
          <div className="p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Especialización:</span>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-blue-100 text-blue-800">
                    Español CEFR
                  </Badge>
                  <Award className="h-4 w-4 text-blue-500" />
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Estudiantes Activos:</span>
                <p className="text-gray-900 mt-1">
                  24 estudiantes en todos los niveles
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Clases esta Semana:</span>
                <p className="text-gray-900 mt-1">
                  12 clases programadas
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white hover:shadow-lg transition-all duration-300">
            <CardContent className="flex items-center p-6">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Estudiantes Totales</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white hover:shadow-lg transition-all duration-300">
            <CardContent className="flex items-center p-6">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Clases Hoy</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white hover:shadow-lg transition-all duration-300">
            <CardContent className="flex items-center p-6">
              <BookOpen className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Temas Totales</p>
                <p className="text-2xl font-bold text-gray-900">{topics.length}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white hover:shadow-lg transition-all duration-300">
            <CardContent className="flex items-center p-6">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Progreso Promedio</p>
                <p className="text-2xl font-bold text-gray-900">68%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Teacher Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-900">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Programar Clases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 mb-4">
                Programa y gestiona las clases en vivo para tus estudiantes
              </p>
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                onClick={() => window.location.href = '/teacher/schedule'}
              >
                Abrir Calendario
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center text-green-900">
                <Users className="h-5 w-5 mr-2 text-green-600" />
                Gestionar Estudiantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700 mb-4">
                Revisa el progreso y asigna tareas a tus estudiantes
              </p>
              <Button 
                variant="outline" 
                className="w-full border-green-300 text-green-700 hover:bg-green-50"
                onClick={() => alert('Gestión de estudiantes próximamente')}
              >
                Ver Estudiantes
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-900">
                <FileText className="h-5 w-5 mr-2 text-purple-600" />
                Material Didáctico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-700 mb-4">
                Crea y gestiona contenido educativo para las clases
              </p>
              <Button 
                variant="outline" 
                className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                onClick={() => alert('Gestión de material didáctico próximamente')}
              >
                Gestionar Material
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Classes */}
        <Card className="bg-white mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Video className="h-4 w-4 text-white" />
              </div>
              Próximas Clases
            </CardTitle>
            <p className="text-gray-600">
              Clases programadas para los próximos días
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Nivel A1 - Saludos y Presentaciones</h3>
                    <p className="text-sm text-gray-600">Hoy, 14:00 - 15:00 | 8 estudiantes</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => alert('Ver detalles de la clase')}
                  >
                    Ver Detalles
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-blue-600 text-white"
                    onClick={() => alert('Abriendo Google Meet...')}
                  >
                    Unirse
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Nivel B1 - Verbos en Pasado</h3>
                    <p className="text-sm text-gray-600">Mañana, 10:00 - 11:00 | 6 estudiantes</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => alert('Ver detalles de la clase')}
                  >
                    Ver Detalles
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-green-600 text-white"
                    onClick={() => alert('Preparando materiales de clase...')}
                  >
                    Preparar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teaching Materials - All Topics */}
        <Card className="bg-white mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="h-8 w-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              Contenido para Enseñar - Google Classroom
            </CardTitle>
            <p className="text-gray-600">
              Todos los temas disponibles con materiales de Google Classroom ({topics.length} temas)
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.slice(0, 12).map((topic) => {
                const getLevelColor = (level: string) => {
                  switch (level) {
                    case 'A1': return 'bg-green-100 text-green-800 border-green-200'
                    case 'A2': return 'bg-blue-100 text-blue-800 border-blue-200'
                    case 'B1': return 'bg-orange-100 text-orange-800 border-orange-200'
                    case 'B2': return 'bg-red-100 text-red-800 border-red-200'
                    default: return 'bg-gray-100 text-gray-800 border-gray-200'
                  }
                }

                return (
                  <Card key={topic.id} className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge className={getLevelColor(topic.level)}>
                            {topic.level}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Lección {topic.orderIndex}
                          </Badge>
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm leading-tight">
                        {topic.name}
                      </h3>
                      
                      {topic.tema && (
                        <p className="text-xs text-gray-600 mb-2">
                          <span className="font-medium">Tema:</span> {topic.tema}
                        </p>
                      )}
                      
                      {topic.recursoGramatical && (
                        <p className="text-xs text-gray-600 mb-3">
                          <span className="font-medium">Gramática:</span> {topic.recursoGramatical}
                        </p>
                      )}
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs"
                          onClick={() => window.location.href = `/teacher/teach/${topic.id}`}
                        >
                          <BookOpen className="h-3 w-3 mr-1" />
                          Enseñar
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          className="border-blue-300 text-blue-700 hover:bg-blue-50 text-xs"
                          onClick={() => topic.classroomLink && window.open(topic.classroomLink, '_blank')}
                        >
                          <FileText className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            
            {topics.length > 12 && (
              <div className="text-center mt-6">
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/teacher/all-topics'}
                >
                  Ver Todos los {topics.length} Temas
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}