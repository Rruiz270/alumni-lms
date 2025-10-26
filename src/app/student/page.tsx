'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                ¡Bienvenido a Alumni by Better!
              </h1>
              <p className="text-gray-600">
                Tu plataforma de aprendizaje de español
              </p>
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

        {/* Spanish Topics */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="h-8 w-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              Contenido de Español Disponible
            </CardTitle>
            <p className="text-gray-600">
              Explora los {topics.length} temas de español organizados por nivel CEFR
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.slice(0, 9).map((topic) => (
                <Card key={topic.id} className="border-l-4 border-orange-500 hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-orange-700 border-orange-300">
                        {topic.level}
                      </Badge>
                      <span className="text-sm text-gray-500">#{topic.orderIndex}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{topic.name}</h3>
                    {topic.tema && (
                      <p className="text-sm text-gray-600 mb-2">Tema: {topic.tema}</p>
                    )}
                    {topic.vocabulario && (
                      <p className="text-sm text-gray-600 mb-3">Vocabulario: {topic.vocabulario}</p>
                    )}
                    <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-700">
                      Explorar Tema
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {topics.length > 9 && (
              <div className="mt-6 text-center">
                <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                  Ver todos los {topics.length} temas
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}