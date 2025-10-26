'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock,
  Plus,
  Edit,
  Users,
  Video,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface ClassSchedule {
  id: string
  date: string
  time: string
  topic: string
  level: string
  students: number
  maxStudents: number
  status: 'scheduled' | 'completed' | 'cancelled'
}

export default function TeacherSchedule() {
  const [selectedWeek, setSelectedWeek] = useState(0)

  // Mock schedule data
  const schedule: ClassSchedule[] = [
    {
      id: '1',
      date: '2025-10-26',
      time: '14:00 - 15:00',
      topic: 'Presentación Personal',
      level: 'A1',
      students: 5,
      maxStudents: 8,
      status: 'scheduled'
    },
    {
      id: '2',
      date: '2025-10-26',
      time: '16:00 - 17:00',
      topic: 'Rutina Diaria',
      level: 'A1',
      students: 3,
      maxStudents: 8,
      status: 'scheduled'
    },
    {
      id: '3',
      date: '2025-10-27',
      time: '10:00 - 11:00',
      topic: 'Viajes y Turismo',
      level: 'A2',
      students: 8,
      maxStudents: 8,
      status: 'completed'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return Clock
      case 'completed': return CheckCircle
      case 'cancelled': return AlertCircle
      default: return Clock
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Programar Clases
                </h1>
                <p className="text-gray-600">
                  Gestiona tu calendario de clases
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => alert('Función de agregar clase próximamente')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Clase
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/teacher'}
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                ← Volver
              </Button>
            </div>
          </div>
        </div>

        {/* Schedule Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">
              Clases Programadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {schedule.map((classItem) => {
                const StatusIcon = getStatusIcon(classItem.status)
                
                return (
                  <div 
                    key={classItem.id}
                    className="p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {classItem.topic}
                          </h3>
                          <Badge className="bg-blue-100 text-blue-800">
                            Nivel {classItem.level}
                          </Badge>
                          <Badge className={getStatusColor(classItem.status)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {classItem.status === 'scheduled' ? 'Programada' : 
                             classItem.status === 'completed' ? 'Completada' : 'Cancelada'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(classItem.date).toLocaleDateString('es-ES')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{classItem.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{classItem.students}/{classItem.maxStudents} estudiantes</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {classItem.status === 'scheduled' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => alert('Ver lista de estudiantes')}
                            >
                              <Users className="h-4 w-4 mr-1" />
                              Estudiantes
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => alert('Iniciar clase en Google Meet')}
                            >
                              <Video className="h-4 w-4 mr-1" />
                              Iniciar Clase
                            </Button>
                          </>
                        )}
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => alert('Editar clase')}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}