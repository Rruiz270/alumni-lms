'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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
  progress?: {
    preClassComplete: boolean
    liveClassAttended: boolean
    afterClassComplete: boolean
  }
}

export default function StudentDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [packageInfo, setPackageInfo] = useState<any>(null)
  const [topics, setTopics] = useState<SpanishTopic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (session?.user?.role !== 'STUDENT') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [packageResponse, topicsResponse] = await Promise.all([
          fetch('/api/student/package'),
          fetch('/api/topics')
        ])

        if (packageResponse.ok) {
          const packageData = await packageResponse.json()
          setPackageInfo(packageData.package)
        }

        if (topicsResponse.ok) {
          const topicsData = await topicsResponse.json()
          setTopics(topicsData.topics || [])
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchDashboardData()
    }
  }, [session?.user?.id])

  const handleStartLesson = (topicId: string) => {
    router.push(`/student/learning/${topicId}`)
  }

  const handleViewClassroom = (link: string) => {
    window.open(link, '_blank')
  }

  const handleBookClass = (topicId: string) => {
    router.push(`/student/book?topic=${topicId}`)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando...</div>
      </div>
    )
  }

  if (!session?.user || session.user.role !== 'STUDENT') {
    return null
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
                ¡Bienvenido, {session.user.name}!
              </h1>
              <p className="text-gray-600">
                Continúa tu viaje de aprendizaje del español
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
                    Español {session?.user?.level || 'A1'}
                  </Badge>
                  <Star className="h-4 w-4 text-orange-500" />
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Progreso del Curso:</span>
                <p className="text-gray-900 mt-1">
                  {packageInfo?.usedLessons || 0} de {packageInfo?.totalLessons || 80} lecciones
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Vigencia del Contrato:</span>
                <p className="text-gray-900 mt-1">
                  {packageInfo?.validUntil 
                    ? new Date(packageInfo.validUntil).toLocaleDateString('es-ES') 
                    : 'No disponible'}
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
                <p className="text-2xl font-bold text-gray-900">
                  {packageInfo?.remainingLessons || 0}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white hover:shadow-lg transition-all duration-300">
            <CardContent className="flex items-center p-6">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Nivel Actual</p>
                <p className="text-2xl font-bold text-gray-900">
                  {session?.user?.level || 'A1'}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white hover:shadow-lg transition-all duration-300">
            <CardContent className="flex items-center p-6">
              <Trophy className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Temas Completados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {topics.filter(t => t.progress?.preClassComplete && t.progress?.liveClassAttended && t.progress?.afterClassComplete).length}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white hover:shadow-lg transition-all duration-300">
            <CardContent className="flex items-center p-6">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Próxima Clase</p>
                <p className="text-sm font-bold text-gray-900">
                  Por agendar
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Learning Content */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  onClick={() => router.push('/student/book')}
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
                  onClick={() => router.push('/student/learning')}
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
                  onClick={() => router.push('/student/progress')}
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
                currentUserLevel={session?.user?.level as any}
                onStartLesson={handleStartLesson}
                onViewClassroom={handleViewClassroom}
                onBookClass={handleBookClass}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}