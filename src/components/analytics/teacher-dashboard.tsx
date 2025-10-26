'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  Calendar, 
  Star, 
  TrendingUp,
  BookOpen,
  Clock,
  Target,
  Brain,
  BarChart3,
  Award,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  ChevronRight
} from 'lucide-react'
import { TeacherDashboardData } from '@/lib/analytics/types'
import { Level } from '@prisma/client'

interface TeacherDashboardProps {
  data: TeacherDashboardData
  teacherId: string
  onRefresh?: () => void
}

export function TeacherDashboard({ data, teacherId, onRefresh }: TeacherDashboardProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'students' | 'classes' | 'insights'>('overview')

  return (
    <div className="space-y-6">
      {/* Header with key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Students"
          value={data.studentOverview.length.toString()}
          subtitle="Active learners"
          icon={Users}
          color="text-blue-600"
        />
        <MetricCard
          title="Classes This Month"
          value={data.performanceMetrics.totalClasses.toString()}
          subtitle="Live sessions"
          icon={Calendar}
          color="text-green-600"
        />
        <MetricCard
          title="Average Rating"
          value={data.performanceMetrics.avgClassRating.toFixed(1)}
          subtitle="Class satisfaction"
          icon={Star}
          color="text-yellow-600"
        />
        <MetricCard
          title="Engagement Score"
          value={`${data.performanceMetrics.avgStudentEngagement.toFixed(1)}/10`}
          subtitle="Student participation"
          icon={TrendingUp}
          color="text-purple-600"
        />
      </div>

      {/* Navigation tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'students', label: 'Students', icon: Users },
          { id: 'classes', label: 'Classes', icon: Calendar },
          { id: 'insights', label: 'Insights', icon: Brain }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md flex-1 text-sm font-medium transition-colors ${
              selectedTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {selectedTab === 'overview' && (
        <OverviewTab data={data} />
      )}
      {selectedTab === 'students' && (
        <StudentsTab students={data.studentOverview} />
      )}
      {selectedTab === 'classes' && (
        <ClassesTab classes={data.classAnalytics} />
      )}
      {selectedTab === 'insights' && (
        <InsightsTab data={data} />
      )}
    </div>
  )
}

function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color 
}: { 
  title: string
  value: string
  subtitle: string
  icon: any
  color: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  )
}

function OverviewTab({ data }: { data: TeacherDashboardData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Performance Trends */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Performance Overview</span>
          </CardTitle>
          <CardDescription>
            Your teaching performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Class Rating</span>
                  <span>{data.performanceMetrics.avgClassRating.toFixed(1)}/5</span>
                </div>
                <Progress value={data.performanceMetrics.avgClassRating * 20} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Student Engagement</span>
                  <span>{data.performanceMetrics.avgStudentEngagement.toFixed(1)}/10</span>
                </div>
                <Progress value={data.performanceMetrics.avgStudentEngagement * 10} className="h-2" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {data.performanceMetrics.totalClasses}
                </div>
                <div className="text-xs text-muted-foreground">Total Classes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {data.studentOverview.length}
                </div>
                <div className="text-xs text-muted-foreground">Students Taught</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Popular Topics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Popular Topics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.performanceMetrics.popularTopics.slice(0, 5).map((topic, index) => (
              <div key={topic} className="flex items-center justify-between">
                <span className="text-sm truncate">{topic}</span>
                <Badge variant="secondary">#{index + 1}</Badge>
              </div>
            ))}
            {data.performanceMetrics.popularTopics.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No class data available yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Student Progress Overview */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Student Progress Overview</span>
          </CardTitle>
          <CardDescription>
            Quick overview of your students' performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StudentProgressOverview students={data.studentOverview} />
        </CardContent>
      </Card>
    </div>
  )
}

function StudentsTab({ students }: { students: any[] }) {
  return (
    <div className="space-y-4">
      {students.map((student) => (
        <Card key={student.studentId}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{student.name}</h3>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>Level: {student.level || 'Not set'}</span>
                  <span>Attendance: {student.attendance.toFixed(0)}%</span>
                  <span>Avg Score: {student.avgScore.toFixed(0)}%</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <AttendanceBadge attendance={student.attendance} />
                <EngagementBadge engagement={student.engagement} />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Attendance</span>
                  <span>{student.attendance.toFixed(0)}%</span>
                </div>
                <Progress value={student.attendance} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Engagement</span>
                  <span>{student.engagement.toFixed(1)}/10</span>
                </div>
                <Progress value={student.engagement * 10} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Performance</span>
                  <span>{student.avgScore.toFixed(0)}%</span>
                </div>
                <Progress value={student.avgScore} className="h-2" />
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                {student.totalClasses} classes completed
              </div>
              <Button variant="outline" size="sm">
                View Details <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {students.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No Students Yet</h3>
            <p className="text-sm text-muted-foreground">
              Students will appear here once you start teaching classes.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ClassesTab({ classes }: { classes: any[] }) {
  return (
    <div className="space-y-4">
      {classes.slice(0, 10).map((classItem) => (
        <Card key={classItem.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{classItem.booking.topic.name}</h3>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>{classItem.booking.student.name}</span>
                  <span>{formatDate(classItem.booking.scheduledAt)}</span>
                  <span>{classItem.actualDuration} minutes</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {classItem.classRating && (
                  <Badge variant="outline">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    {classItem.classRating}
                  </Badge>
                )}
                <Badge variant={getEngagementVariant(classItem.studentEngagement)}>
                  Engagement: {classItem.studentEngagement}/10
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Preparation</p>
                <p className="font-medium">{classItem.preparationTime} min</p>
              </div>
              <div>
                <p className="text-muted-foreground">Questions</p>
                <p className="font-medium">{classItem.studentQuestions}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Objectives Met</p>
                <div className="flex items-center">
                  {classItem.learningObjectivesMet ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                  )}
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">Follow-up</p>
                <p className="font-medium">
                  {classItem.followUpNeeded ? 'Needed' : 'None'}
                </p>
              </div>
            </div>
            
            {classItem.notes && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm">{classItem.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      
      {classes.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No Classes Yet</h3>
            <p className="text-sm text-muted-foreground">
              Your completed classes will appear here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function InsightsTab({ data }: { data: TeacherDashboardData }) {
  const insights = generateTeachingInsights(data)
  
  return (
    <div className="space-y-6">
      {/* Teaching Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Teaching Insights</span>
          </CardTitle>
          <CardDescription>
            AI-generated insights based on your teaching performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                <div className="text-lg">{insight.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{insight.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {insight.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Level Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Student Level Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LevelDistributionChart students={data.studentOverview} />
        </CardContent>
      </Card>

      {/* Improvement Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Improvement Suggestions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {generateImprovementSuggestions(data).map((suggestion, index) => (
              <div key={index} className="p-3 border-l-4 border-blue-500 bg-blue-50/50">
                <p className="text-sm font-medium">{suggestion.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {suggestion.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StudentProgressOverview({ students }: { students: any[] }) {
  const topPerformers = students
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 3)

  const needsAttention = students
    .filter(s => s.attendance < 70 || s.engagement < 5)
    .slice(0, 3)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="font-medium mb-3 text-green-600">Top Performers</h4>
        <div className="space-y-2">
          {topPerformers.map((student) => (
            <div key={student.studentId} className="flex items-center justify-between p-2 bg-green-50 rounded">
              <span className="text-sm font-medium">{student.name}</span>
              <span className="text-sm text-green-600">{student.avgScore.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="font-medium mb-3 text-orange-600">Needs Attention</h4>
        <div className="space-y-2">
          {needsAttention.map((student) => (
            <div key={student.studentId} className="flex items-center justify-between p-2 bg-orange-50 rounded">
              <span className="text-sm font-medium">{student.name}</span>
              <span className="text-sm text-orange-600">
                {student.attendance < 70 ? `${student.attendance.toFixed(0)}% att.` : `${student.engagement.toFixed(1)} eng.`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function LevelDistributionChart({ students }: { students: any[] }) {
  const levelCounts = students.reduce((acc, student) => {
    const level = student.level || 'Unset'
    acc[level] = (acc[level] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const total = students.length

  return (
    <div className="space-y-3">
      {Object.entries(levelCounts).map(([level, count]) => (
        <div key={level} className="flex items-center justify-between">
          <span className="text-sm font-medium">{level}</span>
          <div className="flex items-center space-x-2 flex-1 ml-4">
            <Progress value={(count / total) * 100} className="h-2 flex-1" />
            <span className="text-xs text-muted-foreground w-12 text-right">
              {count} ({((count / total) * 100).toFixed(0)}%)
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// Utility components and functions
function AttendanceBadge({ attendance }: { attendance: number }) {
  const variant = attendance >= 90 ? 'default' : attendance >= 70 ? 'secondary' : 'destructive'
  return <Badge variant={variant}>Attendance: {attendance.toFixed(0)}%</Badge>
}

function EngagementBadge({ engagement }: { engagement: number }) {
  const variant = engagement >= 8 ? 'default' : engagement >= 6 ? 'secondary' : 'destructive'
  return <Badge variant={variant}>Engagement: {engagement.toFixed(1)}</Badge>
}

function getEngagementVariant(engagement: number): 'default' | 'secondary' | 'destructive' {
  if (engagement >= 8) return 'default'
  if (engagement >= 6) return 'secondary'
  return 'destructive'
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function generateTeachingInsights(data: TeacherDashboardData) {
  const insights = []

  if (data.performanceMetrics.avgClassRating > 4.5) {
    insights.push({
      icon: '⭐',
      title: 'Excellent Student Satisfaction',
      description: 'Your students consistently rate your classes highly. Keep up the great work!'
    })
  }

  if (data.performanceMetrics.avgStudentEngagement > 8) {
    insights.push({
      icon: '🚀',
      title: 'High Student Engagement',
      description: 'Your classes are highly interactive and engaging for students.'
    })
  }

  const lowAttendanceStudents = data.studentOverview.filter(s => s.attendance < 70).length
  if (lowAttendanceStudents > 0) {
    insights.push({
      icon: '📅',
      title: 'Attendance Attention Needed',
      description: `${lowAttendanceStudents} students have attendance below 70%. Consider reaching out.`
    })
  }

  if (data.performanceMetrics.popularTopics.length > 0) {
    insights.push({
      icon: '📚',
      title: 'Popular Teaching Topics',
      description: `"${data.performanceMetrics.popularTopics[0]}" is your most taught topic.`
    })
  }

  return insights
}

function generateImprovementSuggestions(data: TeacherDashboardData) {
  const suggestions = []

  if (data.performanceMetrics.avgStudentEngagement < 7) {
    suggestions.push({
      title: 'Increase Student Interaction',
      description: 'Try incorporating more interactive activities and questions during classes.'
    })
  }

  if (data.performanceMetrics.avgClassRating < 4) {
    suggestions.push({
      title: 'Focus on Class Structure',
      description: 'Consider reviewing your lesson plans and class flow for better student experience.'
    })
  }

  const strugglingStudents = data.studentOverview.filter(s => s.avgScore < 60).length
  if (strugglingStudents > 0) {
    suggestions.push({
      title: 'Support Struggling Students',
      description: 'Provide additional resources or one-on-one attention for students scoring below 60%.'
    })
  }

  if (suggestions.length === 0) {
    suggestions.push({
      title: 'Maintain Excellence',
      description: 'Your teaching performance is excellent. Continue with your current approach!'
    })
  }

  return suggestions
}