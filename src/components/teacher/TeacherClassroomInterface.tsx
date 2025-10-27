'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ExternalLink,
  Play,
  FileText,
  Presentation,
  Video,
  BookOpen,
  Clock,
  Target,
  CheckCircle2,
  Users,
  Share,
  Monitor,
  Mic,
  Camera,
  Settings
} from 'lucide-react'

interface TeacherClassroomInterfaceProps {
  topic: {
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
  onStartLiveClass?: () => void
  onShareScreen?: () => void
  onOpenSlides?: () => void
}

export default function TeacherClassroomInterface({ 
  topic, 
  onStartLiveClass, 
  onShareScreen, 
  onOpenSlides 
}: TeacherClassroomInterfaceProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [isLiveClassActive, setIsLiveClassActive] = useState(false)

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'A1': return 'bg-green-100 text-green-800 border-green-200'
      case 'A2': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'B1': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'B2': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const openClassroomLink = () => {
    if (topic.classroomLink) {
      window.open(topic.classroomLink, '_blank')
    }
  }

  const extractPresentationId = (link: string) => {
    const match = link.match(/\/presentation\/d\/([a-zA-Z0-9-_]+)/)
    return match ? match[1] : null
  }

  const getEmbedUrl = (link: string) => {
    const presentationId = extractPresentationId(link)
    if (presentationId) {
      return `https://docs.google.com/presentation/d/${presentationId}/embed?start=false&loop=false&delayms=3000`
    }
    return null
  }

  const getPresentUrl = (link: string) => {
    const presentationId = extractPresentationId(link)
    if (presentationId) {
      return `https://docs.google.com/presentation/d/${presentationId}/present?start=false&loop=false&delayms=3000`
    }
    return link
  }

  const handleStartLiveClass = () => {
    setIsLiveClassActive(true)
    if (onStartLiveClass) {
      onStartLiveClass()
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Teacher Header */}
      <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getLevelColor(topic.level)}>
                  Nivel {topic.level}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Lección {topic.orderIndex}
                </Badge>
                {isLiveClassActive && (
                  <Badge className="bg-red-100 text-red-800 animate-pulse">
                    🔴 EN VIVO
                  </Badge>
                )}
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                👩‍🏫 {topic.name}
              </CardTitle>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {topic.tema && (
                  <div>
                    <span className="font-medium text-gray-700">Tema de la Clase:</span>
                    <p className="text-gray-900">{topic.tema}</p>
                  </div>
                )}
                {topic.vocabulario && (
                  <div>
                    <span className="font-medium text-gray-700">Vocabulario a Enseñar:</span>
                    <p className="text-gray-900">{topic.vocabulario}</p>
                  </div>
                )}
                {topic.recursoGramatical && (
                  <div>
                    <span className="font-medium text-gray-700">Punto Gramatical:</span>
                    <p className="text-gray-900">{topic.recursoGramatical}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Live Class Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-red-50 border-red-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Play className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-900">CLASE EN VIVO</h3>
                <p className="text-xs text-red-700">Presenta tu lección</p>
              </div>
            </div>
            <Button 
              size="sm" 
              className="w-full bg-red-600 hover:bg-red-700"
              onClick={handleStartLiveClass}
            >
              {isLiveClassActive ? 'Continuar Clase' : 'Iniciar Clase'}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Presentation className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">PRESENTAR</h3>
                <p className="text-xs text-blue-700">Modo presentación</p>
              </div>
            </div>
            <Button 
              size="sm" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => topic.classroomLink && window.open(getPresentUrl(topic.classroomLink), '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Presentar
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Monitor className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900">COMPARTIR</h3>
                <p className="text-xs text-green-700">Pantalla completa</p>
              </div>
            </div>
            <Button 
              size="sm" 
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={onShareScreen}
            >
              <Share className="h-4 w-4 mr-1" />
              Compartir
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-900">ESTUDIANTES</h3>
                <p className="text-xs text-purple-700">Gestionar clase</p>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <Users className="h-4 w-4 mr-1" />
              Ver Lista
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Teaching Materials */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Materiales de Enseñanza - Google Classroom
            </CardTitle>
            <Button 
              onClick={openClassroomLink}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir en Nueva Ventana
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="slides">Slides (3)</TabsTrigger>
              <TabsTrigger value="videos">Vídeos (1)</TabsTrigger>
              <TabsTrigger value="documents">Documentos (1)</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Plan de Lección
                </h3>
                
                {topic.objetivoImplicito && (
                  <div className="mb-4 p-4 bg-white rounded-lg border border-blue-200">
                    <h4 className="font-medium text-gray-900 mb-2">🎯 Objetivo de la Lección</h4>
                    <p className="text-gray-700">{topic.objetivoImplicito}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      Estructura de la Clase (60 min)
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                        <span>Introducción y repaso</span>
                        <Badge variant="outline">10 min</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                        <span>Presentación del tema</span>
                        <Badge variant="outline">20 min</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                        <span>Práctica guiada</span>
                        <Badge variant="outline">20 min</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                        <span>Consolidación y tarea</span>
                        <Badge variant="outline">10 min</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-gray-900 mb-3">📋 Contenido Principal</h4>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                        <span><strong>Gramática:</strong> {topic.recursoGramatical || 'Punto gramatical principal'}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                        <span><strong>Vocabulario:</strong> {topic.vocabulario || 'Vocabulario temático'}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                        <span><strong>Tema:</strong> {topic.tema || 'Tema de conversación'}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                        <span><strong>Actividades:</strong> Ejercicios interactivos y práctica oral</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button 
                    onClick={() => topic.classroomLink && window.open(getPresentUrl(topic.classroomLink), '_blank')}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Comenzar Presentación
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={openClassroomLink}
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver en Google Classroom
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="slides" className="space-y-4">
              <div className="space-y-4">
                {topic.classroomLink && getEmbedUrl(topic.classroomLink) ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Slides de la Presentación</h3>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => window.open(getPresentUrl(topic.classroomLink!), '_blank')}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Monitor className="h-4 w-4 mr-2" />
                          Modo Presentación
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={openClassroomLink}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Editar Slides
                        </Button>
                      </div>
                    </div>
                    <iframe
                      src={getEmbedUrl(topic.classroomLink)!}
                      width="100%"
                      height="600"
                      frameBorder="0"
                      allowFullScreen={true}
                      className="rounded-lg shadow-lg border border-gray-200"
                    />
                  </div>
                ) : (
                  <div className="text-center p-8 bg-gray-50 rounded-lg">
                    <Presentation className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Slides de la Presentación</h3>
                    <p className="text-gray-600 mb-4">
                      Accede a Google Classroom para ver y editar las presentaciones de la lección.
                    </p>
                    <Button onClick={openClassroomLink}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Abrir Slides en Classroom
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="videos" className="space-y-4">
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <Video className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Videos de Apoyo</h3>
                <p className="text-gray-600 mb-4">
                  Videos y materiales multimedia están disponibles en Google Classroom para usar durante la clase.
                </p>
                <div className="flex justify-center gap-2">
                  <Button onClick={openClassroomLink}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver Videos en Classroom
                  </Button>
                  <Button variant="outline">
                    <Camera className="h-4 w-4 mr-2" />
                    Grabar Nueva Clase
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="documents" className="space-y-4">
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Documentos y Recursos</h3>
                <p className="text-gray-600 mb-4">
                  Documentos adicionales, hojas de ejercicios y recursos de apoyo para la enseñanza.
                </p>
                <div className="flex justify-center gap-2">
                  <Button onClick={openClassroomLink}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver Documentos en Classroom
                  </Button>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Gestionar Recursos
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}