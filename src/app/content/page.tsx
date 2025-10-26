'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BookOpen, Play, Users } from 'lucide-react'

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

export default function AllContentPage() {
  const router = useRouter()
  const [topics, setTopics] = useState<SpanishTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL')

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

  const filteredTopics = selectedLevel === 'ALL' 
    ? topics 
    : topics.filter(topic => topic.level === selectedLevel)

  const levels = ['ALL', 'A1', 'A2', 'B1', 'B2']

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-lg">Cargando contenido...</div>
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
            onClick={() => router.back()}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Todo el Contenido
              </h1>
              <p className="text-gray-600">
                Todos los temas disponibles con materiales de Google Classroom ({topics.length} temas)
              </p>
            </div>
          </div>
        </div>

        {/* Level Filter */}
        <div className="mb-6">
          <div className="flex gap-2">
            {levels.map((level) => (
              <Button
                key={level}
                variant={selectedLevel === level ? "default" : "outline"}
                onClick={() => setSelectedLevel(level)}
                className="min-w-16"
              >
                {level === 'ALL' ? 'Todos' : level}
              </Button>
            ))}
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topic, index) => (
            <Card key={topic.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    topic.level === 'A1' ? 'bg-green-100 text-green-800' :
                    topic.level === 'A2' ? 'bg-blue-100 text-blue-800' :
                    topic.level === 'B1' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    Nivel {topic.level}
                  </span>
                  <span className="text-sm text-gray-500">Lección {topic.orderIndex}</span>
                </div>
                <CardTitle className="text-lg line-clamp-2">
                  {topic.name}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {topic.tema && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Tema:</span>
                    <p className="text-sm text-gray-600 line-clamp-2">{topic.tema}</p>
                  </div>
                )}
                
                {topic.vocabulario && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Vocabulario:</span>
                    <p className="text-sm text-gray-600 line-clamp-1">{topic.vocabulario}</p>
                  </div>
                )}
                
                {topic.recursoGramatical && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Gramática:</span>
                    <p className="text-sm text-gray-600 line-clamp-1">{topic.recursoGramatical}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => router.push(`/student/study/${topic.id}`)}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Estudiar
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => router.push(`/teacher/teach/${topic.id}`)}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Enseñar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTopics.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay contenido disponible</h3>
            <p className="text-gray-600">No se encontraron temas para el nivel seleccionado.</p>
          </div>
        )}
      </div>
    </div>
  )
}