'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  BookOpen, 
  FileText, 
  Presentation,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  BarChart3,
  Users,
  Calendar,
  Link,
  Hash,
  Type,
  Globe
} from 'lucide-react'

interface Topic {
  id: string
  name: string
  level: string
  orderIndex: number
  description?: string
  recursoGramatical?: string
  vocabulario?: string
  tema?: string
  objetivoImplicito?: string
  classroomLink?: string
  createdAt: string
  updatedAt: string
  _count: {
    exercises: number
    liveClassSlides: number
    bookings: number
    contents: number
  }
}

interface Exercise {
  id: string
  title: string
  phase: 'PRE_CLASS' | 'AFTER_CLASS'
  category: string
  type: string
  instructions: string
  points: number
  orderIndex: number
  createdAt: string
  topic: {
    id: string
    name: string
    level: string
  }
  _count: {
    submissions: number
  }
}

interface Slide {
  id: string
  slideNumber: number
  title: string
  type: string
  notes?: string
  order: number
  createdAt: string
  topic: {
    id: string
    name: string
    level: string
  }
  _count: {
    exercises: number
  }
}

interface ContentOverview {
  overview: {
    topicsCount: number
    exercisesCount: number
    slidesCount: number
    contentsCount: number
  }
  distributions: {
    topicsByLevel: Array<{ level: string; count: number }>
    exercisesByCategory: Array<{ category: string; count: number }>
  }
  recentlyUpdated: Topic[]
}

export default function ContentManagement() {
  const [activeTab, setActiveTab] = useState('overview')
  const [overview, setOverview] = useState<ContentOverview | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    level: 'ALL',
    search: ''
  })

  const fetchOverview = async () => {
    try {
      const response = await fetch('/api/admin/content')
      if (response.ok) {
        const data = await response.json()
        setOverview(data)
      }
    } catch (error) {
      console.error('Error fetching content overview:', error)
    }
  }

  const fetchContent = async (type: string) => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        type,
        page: currentPage.toString(),
        limit: '20',
        ...(filters.level !== 'ALL' && { level: filters.level })
      })

      const response = await fetch(`/api/admin/content?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        
        if (type === 'topics') {
          setTopics(data.topics)
          setTotalPages(data.pagination.totalPages)
        } else if (type === 'exercises') {
          setExercises(data.exercises)
          setTotalPages(data.pagination.totalPages)
        } else if (type === 'slides') {
          setSlides(data.slides)
          setTotalPages(data.pagination.totalPages)
        }
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOverview()
  }, [])

  useEffect(() => {
    if (activeTab !== 'overview') {
      fetchContent(activeTab)
    }
  }, [activeTab, currentPage, filters])

  const getLevelBadgeColor = (level: string) => {
    const colors = {
      'A1': 'bg-green-100 text-green-800',
      'A2': 'bg-blue-100 text-blue-800',
      'B1': 'bg-purple-100 text-purple-800',
      'B2': 'bg-orange-100 text-orange-800',
      'C1': 'bg-red-100 text-red-800',
      'C2': 'bg-gray-100 text-gray-800'
    }
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getPhaseBadgeColor = (phase: string) => {
    return phase === 'PRE_CLASS' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-green-100 text-green-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600">Manage Spanish learning content and curriculum</p>
        </div>
        <Button onClick={fetchOverview}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
          <TabsTrigger value="slides">Slides</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {overview && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="flex items-center p-4">
                    <BookOpen className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Topics</p>
                      <p className="text-2xl font-bold text-gray-900">{overview.overview.topicsCount}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center p-4">
                    <FileText className="h-8 w-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Exercises</p>
                      <p className="text-2xl font-bold text-gray-900">{overview.overview.exercisesCount}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center p-4">
                    <Presentation className="h-8 w-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Slides</p>
                      <p className="text-2xl font-bold text-gray-900">{overview.overview.slidesCount}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center p-4">
                    <BarChart3 className="h-8 w-8 text-orange-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Contents</p>
                      <p className="text-2xl font-bold text-gray-900">{overview.overview.contentsCount}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Topics by Level */}
                <Card>
                  <CardHeader>
                    <CardTitle>Topics by Level</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {overview.distributions.topicsByLevel.map((item) => (
                        <div key={item.level} className="flex items-center justify-between">
                          <Badge className={getLevelBadgeColor(item.level)} variant="secondary">
                            Level {item.level}
                          </Badge>
                          <span className="font-medium">{item.count} topics</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Exercises by Category */}
                <Card>
                  <CardHeader>
                    <CardTitle>Exercises by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {overview.distributions.exercisesByCategory.map((item) => (
                        <div key={item.category} className="flex items-center justify-between">
                          <Badge variant="outline" className="capitalize">
                            {item.category.toLowerCase().replace('_', ' ')}
                          </Badge>
                          <span className="font-medium">{item.count} exercises</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recently Updated */}
              <Card>
                <CardHeader>
                  <CardTitle>Recently Updated Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {overview.recentlyUpdated.map((topic) => (
                      <div key={topic.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">{topic.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getLevelBadgeColor(topic.level)} variant="secondary">
                              {topic.level}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              Updated {new Date(topic.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Topics Tab */}
        <TabsContent value="topics" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search topics..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select 
                  value={filters.level} 
                  onValueChange={(value) => setFilters({ ...filters, level: value })}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Levels</SelectItem>
                    <SelectItem value="A1">A1</SelectItem>
                    <SelectItem value="A2">A2</SelectItem>
                    <SelectItem value="B1">B1</SelectItem>
                    <SelectItem value="B2">B2</SelectItem>
                    <SelectItem value="C1">C1</SelectItem>
                    <SelectItem value="C2">C2</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Topic
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Topics List */}
          <Card>
            <CardHeader>
              <CardTitle>Spanish Topics</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {topics.map((topic) => (
                    <div key={topic.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-gray-900">{topic.name}</h3>
                            <Badge className={getLevelBadgeColor(topic.level)} variant="secondary">
                              {topic.level}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Order: {topic.orderIndex}
                            </Badge>
                          </div>
                          
                          {topic.description && (
                            <p className="text-sm text-gray-600 mb-2">{topic.description}</p>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                            {topic.recursoGramatical && (
                              <div>
                                <span className="font-medium">Grammar:</span> {topic.recursoGramatical}
                              </div>
                            )}
                            {topic.vocabulario && (
                              <div>
                                <span className="font-medium">Vocabulary:</span> {topic.vocabulario}
                              </div>
                            )}
                            {topic.tema && (
                              <div>
                                <span className="font-medium">Theme:</span> {topic.tema}
                              </div>
                            )}
                            {topic.objetivoImplicito && (
                              <div>
                                <span className="font-medium">Objective:</span> {topic.objetivoImplicito}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <FileText className="h-4 w-4" />
                              {topic._count.exercises} exercises
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Presentation className="h-4 w-4" />
                              {topic._count.liveClassSlides} slides
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Users className="h-4 w-4" />
                              {topic._count.bookings} bookings
                            </div>
                            {topic.classroomLink && (
                              <div className="flex items-center gap-1 text-sm text-blue-600">
                                <Link className="h-4 w-4" />
                                Classroom Link
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exercises Tab */}
        <TabsContent value="exercises" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Exercises</span>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Exercise
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {exercises.map((exercise) => (
                    <div key={exercise.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-gray-900">{exercise.title}</h3>
                            <Badge className={getPhaseBadgeColor(exercise.phase)} variant="secondary">
                              {exercise.phase.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {exercise.category.toLowerCase()}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {exercise.type.toLowerCase().replace('_', ' ')}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">{exercise.instructions}</p>

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Topic: {exercise.topic.name} ({exercise.topic.level})</span>
                            <span>Points: {exercise.points}</span>
                            <span>Order: {exercise.orderIndex}</span>
                            <span>{exercise._count.submissions} submissions</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Slides Tab */}
        <TabsContent value="slides" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Live Class Slides</span>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Slide
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {slides.map((slide) => (
                    <div key={slide.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-gray-900">{slide.title}</h3>
                            <Badge variant="outline">
                              Slide {slide.slideNumber}
                            </Badge>
                            <Badge variant="secondary" className="capitalize">
                              {slide.type}
                            </Badge>
                          </div>
                          
                          {slide.notes && (
                            <p className="text-sm text-gray-600 mb-2">{slide.notes}</p>
                          )}

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Topic: {slide.topic.name} ({slide.topic.level})</span>
                            <span>Order: {slide.order}</span>
                            <span>{slide._count.exercises} interactive exercises</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {activeTab !== 'overview' && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}