'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock,
  Users,
  Video,
  MapPin,
  User,
  Star,
  CheckCircle,
  Globe
} from 'lucide-react'

interface ClassSlot {
  id: string
  date: string
  time: string
  teacher: {
    name: string
    nationality: string
    rating: number
    avatar: string
  }
  topic: string
  level: string
  availableSpots: number
  totalSpots: number
  price: number
}

export default function BookClass() {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Mock class slots - in real app this would come from API
  const availableClasses: ClassSlot[] = [
    {
      id: '1',
      date: '2025-10-26',
      time: '14:00 - 15:00',
      teacher: {
        name: 'Ana García',
        nationality: 'España',
        rating: 4.9,
        avatar: '👩‍🏫'
      },
      topic: 'Presentación Personal',
      level: 'A1',
      availableSpots: 3,
      totalSpots: 8,
      price: 25
    },
    {
      id: '2',
      date: '2025-10-26',
      time: '16:00 - 17:00',
      teacher: {
        name: 'Carlos Mendoza',
        nationality: 'México',
        rating: 4.8,
        avatar: '👨‍🏫'
      },
      topic: 'Rutina Diaria',
      level: 'A1',
      availableSpots: 5,
      totalSpots: 8,
      price: 25
    },
    {
      id: '3',
      date: '2025-10-27',
      time: '10:00 - 11:00',
      teacher: {
        name: 'María Rodriguez',
        nationality: 'Argentina',
        rating: 5.0,
        avatar: '👩‍🏫'
      },
      topic: 'La Familia',
      level: 'A1',
      availableSpots: 2,
      totalSpots: 8,
      price: 25
    },
    {
      id: '4',
      date: '2025-10-27',
      time: '15:00 - 16:00',
      teacher: {
        name: 'Pedro Silva',
        nationality: 'Colombia',
        rating: 4.7,
        avatar: '👨‍🏫'
      },
      topic: 'En el Restaurante',
      level: 'A1',
      availableSpots: 6,
      totalSpots: 8,
      price: 25
    }
  ]

  const handleBookClass = async (classId: string) => {
    setLoading(true)
    // Simulate booking API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    alert(`¡Clase reservada exitosamente! Recibirás un email de confirmación con el enlace de Google Meet.`)
    setLoading(false)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const isToday = (dateStr: string) => {
    const today = new Date().toDateString()
    const classDate = new Date(dateStr).toDateString()
    return today === classDate
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Agendar Clase en Vivo
                </h1>
                <p className="text-gray-600">
                  Reserva tu lugar en una clase con profesor nativo
                </p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/student'}
              className="border-orange-600 text-orange-600 hover:bg-orange-50"
            >
              ← Volver al Dashboard
            </Button>
          </div>
        </div>

        {/* Benefits */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">
              ¿Por qué tomar clases en vivo?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Interacción Real</h3>
                  <p className="text-sm text-gray-600">Practica con profesores nativos y otros estudiantes</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Video className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Feedback Inmediato</h3>
                  <p className="text-sm text-gray-600">Correcciones y consejos en tiempo real</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Globe className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Cultura Auténtica</h3>
                  <p className="text-sm text-gray-600">Aprende sobre la cultura hispanohablante</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">
              Clases Disponibles - Nivel A1
            </CardTitle>
            <p className="text-gray-600">
              Selecciona la clase que mejor se adapte a tu horario
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availableClasses.map((classSlot) => (
                <div 
                  key={classSlot.id}
                  className={`p-6 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                    selectedSlot === classSlot.id 
                      ? 'border-orange-300 bg-orange-50 shadow-md' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedSlot(classSlot.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {/* Date and Time */}
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-gray-500" />
                          <span className="font-medium text-gray-900">
                            {formatDate(classSlot.date)}
                          </span>
                          {isToday(classSlot.date) && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              HOY
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-gray-500" />
                          <span className="text-gray-700">{classSlot.time}</span>
                        </div>
                      </div>

                      {/* Topic and Level */}
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {classSlot.topic}
                        </h3>
                        <Badge className="bg-blue-100 text-blue-800">
                          Nivel {classSlot.level}
                        </Badge>
                      </div>

                      {/* Teacher Info */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-2xl">{classSlot.teacher.avatar}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {classSlot.teacher.name}
                            </span>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm text-gray-600">
                                {classSlot.teacher.rating}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>Profesor nativo de {classSlot.teacher.nationality}</span>
                          </div>
                        </div>
                      </div>

                      {/* Availability */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {classSlot.availableSpots} plazas disponibles de {classSlot.totalSpots}
                          </span>
                        </div>
                        <div className="text-lg font-bold text-green-600">
                          ${classSlot.price}
                        </div>
                      </div>
                    </div>

                    {/* Book Button */}
                    <div className="ml-6">
                      <Button 
                        className={`px-6 py-3 ${
                          selectedSlot === classSlot.id 
                            ? 'bg-orange-600 hover:bg-orange-700' 
                            : 'bg-gray-600 hover:bg-gray-700'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleBookClass(classSlot.id)
                        }}
                        disabled={loading || classSlot.availableSpots === 0}
                      >
                        {loading && selectedSlot === classSlot.id ? (
                          'Reservando...'
                        ) : classSlot.availableSpots === 0 ? (
                          'Agotado'
                        ) : selectedSlot === classSlot.id ? (
                          <>
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Reservar Clase
                          </>
                        ) : (
                          'Seleccionar'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info Box */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Video className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Información importante sobre las clases:
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Las clases se realizan por Google Meet</li>
                  <li>• Recibirás el enlace por email 30 minutos antes de la clase</li>
                  <li>• Puedes cancelar hasta 4 horas antes sin costo</li>
                  <li>• Se recomienda completar las actividades pre-clase</li>
                  <li>• Las clases son grupales (máximo 8 estudiantes)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}