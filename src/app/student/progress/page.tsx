'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Trophy, 
  Star, 
  Target,
  TrendingUp,
  Calendar,
  BookOpen,
  Award,
  Flame,
  Zap,
  Crown
} from 'lucide-react'

export default function StudentProgress() {
  const [loading, setLoading] = useState(false)

  // Mock progress data - in real app this would come from API
  const progressData = {
    currentLevel: 'A1',
    overallProgress: 15,
    streakDays: 7,
    totalPoints: 1250,
    completedLessons: 12,
    totalLessons: 80,
    achievements: [
      { id: 1, title: 'Primer Paso', description: 'Completaste tu primera lección', icon: '🎯', earned: true },
      { id: 2, title: 'Semana Consistente', description: '7 días consecutivos de estudio', icon: '🔥', earned: true },
      { id: 3, title: 'Explorador A1', description: 'Completaste 10 lecciones nivel A1', icon: '🗺️', earned: true },
      { id: 4, title: 'Conversador', description: 'Participa en 5 clases en vivo', icon: '💬', earned: false },
      { id: 5, title: 'Maestro A1', description: 'Completa todo el nivel A1', icon: '👑', earned: false },
      { id: 6, title: 'Super Estudiante', description: 'Obtén 2000 puntos', icon: '⭐', earned: false }
    ],
    levelProgress: {
      A1: { completed: 12, total: 20, percentage: 60 },
      A2: { completed: 0, total: 20, percentage: 0 },
      B1: { completed: 0, total: 20, percentage: 0 },
      B2: { completed: 0, total: 20, percentage: 0 }
    },
    weeklyActivity: [
      { day: 'Lun', lessons: 2, points: 50 },
      { day: 'Mar', lessons: 1, points: 25 },
      { day: 'Mié', lessons: 3, points: 75 },
      { day: 'Jue', lessons: 1, points: 25 },
      { day: 'Vie', lessons: 2, points: 50 },
      { day: 'Sáb', lessons: 0, points: 0 },
      { day: 'Dom', lessons: 1, points: 25 }
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Mi Progreso
                </h1>
                <p className="text-gray-600">
                  Seguimiento de tu aprendizaje de español
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

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-orange-100 to-red-100 border-orange-200">
            <CardContent className="flex items-center p-6">
              <div className="h-12 w-12 bg-orange-600 rounded-lg flex items-center justify-center mr-4">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-700">Progreso Total</p>
                <p className="text-2xl font-bold text-orange-900">{progressData.overallProgress}%</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-200">
            <CardContent className="flex items-center p-6">
              <div className="h-12 w-12 bg-yellow-600 rounded-lg flex items-center justify-center mr-4">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-700">Racha Diaria</p>
                <p className="text-2xl font-bold text-yellow-900">{progressData.streakDays} días</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-100 to-indigo-100 border-purple-200">
            <CardContent className="flex items-center p-6">
              <div className="h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700">Puntos Totales</p>
                <p className="text-2xl font-bold text-purple-900">{progressData.totalPoints.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-100 to-emerald-100 border-green-200">
            <CardContent className="flex items-center p-6">
              <div className="h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">Lecciones</p>
                <p className="text-2xl font-bold text-green-900">{progressData.completedLessons}/{progressData.totalLessons}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Level Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-orange-600" />
              Progreso por Niveles CEFR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(progressData.levelProgress).map(([level, data]) => (
                <div key={level} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge 
                        className={`${
                          level === 'A1' ? 'bg-green-100 text-green-800' :
                          level === 'A2' ? 'bg-blue-100 text-blue-800' :
                          level === 'B1' ? 'bg-purple-100 text-purple-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        Nivel {level}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {data.completed} de {data.total} lecciones
                      </span>
                      {level === progressData.currentLevel && (
                        <Badge className="bg-orange-100 text-orange-800">
                          <Crown className="h-3 w-3 mr-1" />
                          Actual
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {data.percentage}%
                    </span>
                  </div>
                  <Progress 
                    value={data.percentage} 
                    className={`h-3 ${
                      level === 'A1' ? '[&>div]:bg-green-500' :
                      level === 'A2' ? '[&>div]:bg-blue-500' :
                      level === 'B1' ? '[&>div]:bg-purple-500' :
                      '[&>div]:bg-red-500'
                    }`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Award className="h-6 w-6 text-yellow-600" />
              Logros y Medallas
            </CardTitle>
            <p className="text-gray-600">
              Desbloquea logros completando lecciones y participando en clases
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {progressData.achievements.map((achievement) => (
                <div 
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                    achievement.earned 
                      ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-md' 
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`text-2xl ${achievement.earned ? 'grayscale-0' : 'grayscale'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${achievement.earned ? 'text-gray-900' : 'text-gray-500'}`}>
                        {achievement.title}
                      </h3>
                      <p className={`text-sm ${achievement.earned ? 'text-gray-700' : 'text-gray-400'}`}>
                        {achievement.description}
                      </p>
                      {achievement.earned && (
                        <Badge className="mt-2 bg-green-100 text-green-800">
                          <Zap className="h-3 w-3 mr-1" />
                          ¡Desbloqueado!
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Calendar className="h-6 w-6 text-blue-600" />
              Actividad Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-4">
              {progressData.weeklyActivity.map((day, index) => (
                <div key={index} className="text-center">
                  <div className="text-sm font-medium text-gray-600 mb-2">
                    {day.day}
                  </div>
                  <div 
                    className={`h-20 w-full rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-300 ${
                      day.lessons > 0 
                        ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-300' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className={`text-lg font-bold ${day.lessons > 0 ? 'text-green-800' : 'text-gray-400'}`}>
                      {day.lessons}
                    </div>
                    <div className={`text-xs ${day.lessons > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                      {day.lessons === 1 ? 'lección' : 'lecciones'}
                    </div>
                    {day.points > 0 && (
                      <div className="text-xs text-yellow-600 font-medium">
                        +{day.points} pts
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}