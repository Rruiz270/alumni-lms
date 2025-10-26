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
  CheckCircle2
} from 'lucide-react'

interface GoogleClassroomViewerProps {
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
  onStartPreClass?: () => void
  onStartPostClass?: () => void
  onMarkAttended?: () => void
}

export default function GoogleClassroomViewer({ 
  topic, 
  onStartPreClass, 
  onStartPostClass, 
  onMarkAttended 
}: GoogleClassroomViewerProps) {
  const [activeTab, setActiveTab] = useState('overview')

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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-l-4 border-l-orange-500">
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
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                {topic.name}
              </CardTitle>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {topic.tema && (
                  <div>
                    <span className="font-medium text-gray-700">Tema:</span>
                    <p className="text-gray-900">{topic.tema}</p>
                  </div>
                )}
                {topic.vocabulario && (
                  <div>
                    <span className="font-medium text-gray-700">Vocabulario:</span>
                    <p className="text-gray-900">{topic.vocabulario}</p>
                  </div>
                )}
                {topic.recursoGramatical && (
                  <div>
                    <span className="font-medium text-gray-700">Gramática:</span>
                    <p className="text-gray-900">{topic.recursoGramatical}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Learning Path */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">PRE-CLASE</h3>
                <p className="text-xs text-blue-700">Preparación</p>
              </div>
            </div>
            <p className="text-sm text-blue-800 mb-3">
              Actividades de preparación antes de la clase en vivo
            </p>
            <Button 
              size="sm" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={onStartPreClass}
            >
              Comenzar Pre-Clase
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Play className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-900">CLASE EN VIVO</h3>
                <p className="text-xs text-orange-700">Google Classroom</p>
              </div>
            </div>
            <p className="text-sm text-orange-800 mb-3">
              Contenido principal de la lección con materiales interactivos
            </p>
            <Button 
              size="sm" 
              className="w-full bg-orange-600 hover:bg-orange-700"
              onClick={openClassroomLink}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir Classroom
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200 hover:shadow-lg transition-all duration-300 cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900">POST-CLASE</h3>
                <p className="text-xs text-green-700">Práctica</p>
              </div>
            </div>
            <p className="text-sm text-green-800 mb-3">
              Ejercicios de refuerzo después de la clase
            </p>
            <Button 
              size="sm" 
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={onStartPostClass}
            >
              Comenzar Post-Clase
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Google Classroom Content Viewer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Presentation className="h-5 w-5 text-orange-600" />
            Contenido de la Clase
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="slides">Slides</TabsTrigger>
              <TabsTrigger value="videos">Vídeos</TabsTrigger>
              <TabsTrigger value="documents">Documentos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-600" />
                  Objetivo de Aprendizaje
                </h3>
                {topic.objetivoImplicito ? (
                  <p className="text-gray-700 mb-4">{topic.objetivoImplicito}</p>
                ) : (
                  <p className="text-gray-700 mb-4">
                    En esta lección aprenderás sobre {topic.tema || topic.name} 
                    con énfasis en {topic.recursoGramatical || 'elementos gramaticales'} 
                    y vocabulario relacionado con {topic.vocabulario || 'el tema principal'}.
                  </p>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">📚 Contenido Principal</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• {topic.recursoGramatical || 'Recursos gramaticales'}</li>
                      <li>• {topic.vocabulario || 'Vocabulario temático'}</li>
                      <li>• Ejercicios prácticos</li>
                      <li>• Actividades interactivas</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">🎯 Objetivos Específicos</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Comprender conceptos clave</li>
                      <li>• Aplicar nuevos conocimientos</li>
                      <li>• Practicar en contexto real</li>
                      <li>• Desarrollar fluidez comunicativa</li>
                    </ul>
                  </div>
                </div>

                {topic.classroomLink && (
                  <div className="mt-6 flex gap-3">
                    <Button 
                      onClick={openClassroomLink}
                      className="bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Acceder a Google Classroom
                    </Button>
                    {onMarkAttended && (
                      <Button 
                        variant="outline"
                        onClick={onMarkAttended}
                        className="border-green-300 text-green-700 hover:bg-green-50"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Marcar como Completado
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="slides" className="space-y-4">
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                {topic.classroomLink && getEmbedUrl(topic.classroomLink) ? (
                  <div className="space-y-4">
                    <iframe
                      src={getEmbedUrl(topic.classroomLink)!}
                      width="100%"
                      height="500"
                      frameBorder="0"
                      allowFullScreen={true}
                      className="rounded-lg shadow-lg"
                    />
                    <Button onClick={openClassroomLink} variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Abrir en Google Slides
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Presentation className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Presentación de la Clase</h3>
                    <p className="text-gray-600 mb-4">
                      Accede a Google Classroom para ver las presentaciones y materiales de la lección.
                    </p>
                    <Button onClick={openClassroomLink}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver Presentación
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="videos" className="space-y-4">
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <Video className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Contenido en Video</h3>
                <p className="text-gray-600 mb-4">
                  Los videos y materiales multimedia están disponibles en Google Classroom.
                </p>
                <Button onClick={openClassroomLink}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver Videos en Classroom
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="documents" className="space-y-4">
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Documentos y Recursos</h3>
                <p className="text-gray-600 mb-4">
                  Documentos adicionales, ejercicios y recursos están disponibles en Google Classroom.
                </p>
                <Button onClick={openClassroomLink}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver Documentos en Classroom
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}