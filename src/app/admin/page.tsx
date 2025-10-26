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
  Settings,
  BarChart3,
  Shield,
  Database,
  Globe,
  TrendingUp,
  DollarSign,
  Activity
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

export default function AdminDashboard() {
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="text-lg">Cargando Panel de Administración...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Panel de Administración
                </h1>
                <p className="text-gray-600">
                  Gestiona toda la plataforma Alumni by Better
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
                variant="outline" 
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
                onClick={() => window.location.href = '/teacher'}
              >
                👩‍🏫 Profesor
              </Button>
              <Button 
                variant="default" 
                className="bg-purple-600 text-white hover:bg-purple-700"
              >
                👑 Admin
              </Button>
            </div>
          </div>
          
          {/* Admin Information */}
          <div className="p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-purple-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Rol:</span>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-purple-100 text-purple-800">
                    Super Administrador
                  </Badge>
                  <Shield className="h-4 w-4 text-purple-500" />
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Usuarios Totales:</span>
                <p className="text-gray-900 mt-1">
                  156 usuarios (124 estudiantes, 32 profesores)
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Estado del Sistema:</span>
                <p className="text-gray-900 mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Operativo
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white hover:shadow-lg transition-all duration-300">
            <CardContent className="flex items-center p-6">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
                <p className="text-2xl font-bold text-gray-900">156</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white hover:shadow-lg transition-all duration-300">
            <CardContent className="flex items-center p-6">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Contenido Total</p>
                <p className="text-2xl font-bold text-gray-900">{topics.length}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white hover:shadow-lg transition-all duration-300">
            <CardContent className="flex items-center p-6">
              <Activity className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Clases este Mes</p>
                <p className="text-2xl font-bold text-gray-900">287</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white hover:shadow-lg transition-all duration-300">
            <CardContent className="flex items-center p-6">
              <DollarSign className="h-8 w-8 text-emerald-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ingresos Mes</p>
                <p className="text-2xl font-bold text-gray-900">$12.4k</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-900">
                <Users className="h-5 w-5 mr-2 text-purple-600" />
                Gestión de Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-700 mb-4">
                Administra estudiantes, profesores y permisos del sistema
              </p>
              <Button 
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
                onClick={() => alert('Gestión de usuarios próximamente')}
              >
                Gestionar Usuarios
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-900">
                <Database className="h-5 w-5 mr-2 text-blue-600" />
                Contenido y Currículo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 mb-4">
                Administra el contenido educativo y estructura de cursos
              </p>
              <Button 
                variant="outline" 
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                onClick={() => alert('Gestión de contenido próximamente')}
              >
                Gestionar Contenido
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center text-emerald-900">
                <BarChart3 className="h-5 w-5 mr-2 text-emerald-600" />
                Reportes y Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-emerald-700 mb-4">
                Analiza métricas de uso, progreso y rendimiento
              </p>
              <Button 
                variant="outline" 
                className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                onClick={() => alert('Reportes y analytics próximamente')}
              >
                Ver Reportes
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="h-6 w-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-3 w-3 text-white" />
                </div>
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Nuevo estudiante registrado</p>
                    <p className="text-xs text-gray-600">María González se unió al nivel A1 - hace 2 horas</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Clase completada</p>
                    <p className="text-xs text-gray-600">Prof. García finalizó clase B2 - hace 3 horas</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Contenido actualizado</p>
                    <p className="text-xs text-gray-600">Se agregaron 5 nuevos ejercicios A2 - hace 5 horas</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <div className="h-6 w-6 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Globe className="h-3 w-3 text-white" />
                </div>
                Estado del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Base de Datos</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-sm font-medium text-green-600">Operativo</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Backend</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-sm font-medium text-green-600">Operativo</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Google Classroom</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-sm font-medium text-green-600">Conectado</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Servidor de Archivos</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    <span className="text-sm font-medium text-yellow-600">Mantenimiento</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Settings */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Settings className="h-4 w-4 text-white" />
              </div>
              Configuración Rápida
            </CardTitle>
            <p className="text-gray-600">
              Accesos directos a configuraciones importantes del sistema
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-12 flex items-center gap-3 border-gray-300"
                onClick={() => alert('Configuración de roles próximamente')}
              >
                <Users className="h-4 w-4" />
                Configurar Roles
              </Button>
              <Button 
                variant="outline" 
                className="h-12 flex items-center gap-3 border-gray-300"
                onClick={() => alert('Configuración de API próximamente')}
              >
                <Globe className="h-4 w-4" />
                Configurar API
              </Button>
              <Button 
                variant="outline" 
                className="h-12 flex items-center gap-3 border-gray-300"
                onClick={() => alert('Backup de datos próximamente')}
              >
                <Database className="h-4 w-4" />
                Backup de Datos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}