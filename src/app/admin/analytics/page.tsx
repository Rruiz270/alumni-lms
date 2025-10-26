'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen,
  Calendar,
  Activity,
  Target,
  Clock,
  Award,
  RefreshCw,
  Download,
  Filter,
  PieChart,
  LineChart
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalUsers: number
    activeUsers: number
    newUsers: number
    totalBookings: number
    classesThisMonth: number
    completionRate: number
    cancellationRate: number
  }
  distributions: {
    roleDistribution: Array<{ role: string; count: number }>
    levelDistribution: Array<{ level: string; count: number }>
    statusDistribution: Array<{ status: string; count: number }>
  }
  topTopics: Array<{
    id: string
    name: string
    level: string
    bookings: number
  }>
  teacherStats: Array<{
    id: string
    name: string
    classesInPeriod: number
  }>
  chartData: Array<{
    date: string
    bookings: number
  }>
  recentActivity: Array<{
    id: string
    type: string
    description: string
    status: string
    createdAt: string
  }>
  period: number
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/analytics?period=${period}`)
      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load analytics</h3>
        <p className="text-gray-600 mb-4">There was an error loading the analytics data.</p>
        <Button onClick={fetchAnalytics}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-800'
      case 'TEACHER': return 'bg-blue-100 text-blue-800'
      case 'STUDENT': return 'bg-green-100 text-green-800'
      case 'ALUMNI': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'NO_SHOW': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Platform performance and usage insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchAnalytics} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-700">Total Users</p>
              <p className="text-2xl font-bold text-blue-900">{data.overview.totalUsers}</p>
              <p className="text-xs text-blue-600">
                {data.overview.newUsers} new in {period} days
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="flex items-center p-6">
            <Activity className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-green-700">Active Users</p>
              <p className="text-2xl font-bold text-green-900">{data.overview.activeUsers}</p>
              <p className="text-xs text-green-600">
                {Math.round((data.overview.activeUsers / data.overview.totalUsers) * 100)}% of total
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="flex items-center p-6">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-700">Classes This Month</p>
              <p className="text-2xl font-bold text-purple-900">{data.overview.classesThisMonth}</p>
              <p className="text-xs text-purple-600">
                {data.overview.completionRate}% completion rate
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="flex items-center p-6">
            <Target className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-orange-700">Success Rate</p>
              <p className="text-2xl font-bold text-orange-900">{data.overview.completionRate}%</p>
              <p className="text-xs text-orange-600">
                {data.overview.cancellationRate}% cancellation rate
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Booking Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Booking trends visualization</p>
                <p className="text-sm text-gray-400 mt-1">
                  {data.chartData.reduce((sum, day) => sum + day.bookings, 0)} total bookings in {period} days
                </p>
                <div className="mt-3 flex justify-center gap-4 text-xs">
                  {data.chartData.slice(-7).map((day, index) => (
                    <div key={index} className="text-center">
                      <div className={`w-4 h-${Math.max(1, Math.min(12, day.bookings))} bg-purple-500 rounded-t mb-1`}></div>
                      <span className="text-gray-600">{new Date(day.date).getDate()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              User Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.distributions.roleDistribution.map((role) => {
                const percentage = Math.round((role.count / data.overview.totalUsers) * 100)
                return (
                  <div key={role.role} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge className={getRoleBadgeColor(role.role)} variant="secondary">
                        {role.role.toLowerCase()}
                      </Badge>
                      <span className="text-sm font-medium">{role.count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Distribution & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Student Level Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.distributions.levelDistribution.map((level) => (
                <div key={level.level} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <Badge className={getLevelBadgeColor(level.level)} variant="secondary">
                    Level {level.level}
                  </Badge>
                  <div className="text-right">
                    <p className="font-medium">{level.count} students</p>
                    <p className="text-sm text-gray-600">
                      {Math.round((level.count / data.distributions.levelDistribution.reduce((sum, l) => sum + l.count, 0)) * 100)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Booking Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.distributions.statusDistribution.map((status) => (
                <div key={status.status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <Badge className={getStatusBadgeColor(status.status)} variant="secondary">
                    {status.status.toLowerCase().replace('_', ' ')}
                  </Badge>
                  <div className="text-right">
                    <p className="font-medium">{status.count} bookings</p>
                    <p className="text-sm text-gray-600">
                      {Math.round((status.count / data.overview.totalBookings) * 100)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Most Popular Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topTopics.slice(0, 8).map((topic, index) => (
                <div key={topic.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{topic.name}</p>
                      <Badge className={getLevelBadgeColor(topic.level)} variant="secondary">
                        {topic.level}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{topic.bookings}</p>
                    <p className="text-xs text-gray-600">bookings</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Teachers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Most Active Teachers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.teacherStats.slice(0, 8).map((teacher, index) => (
                <div key={teacher.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {teacher.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{teacher.name}</p>
                      <p className="text-sm text-gray-600">Teacher</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{teacher.classesInPeriod}</p>
                    <p className="text-xs text-gray-600">classes</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Platform Activity
            </span>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {data.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-500">
                      {new Date(activity.createdAt).toLocaleDateString()} at{' '}
                      {new Date(activity.createdAt).toLocaleTimeString()}
                    </p>
                    <Badge className={getStatusBadgeColor(activity.status)} variant="secondary">
                      {activity.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <Badge className="bg-green-100 text-green-800">Excellent</Badge>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Class Completion</h3>
            <p className="text-2xl font-bold text-green-600">{data.overview.completionRate}%</p>
            <p className="text-sm text-gray-600 mt-1">
              High completion rate indicates good engagement
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-blue-600" />
              <Badge className="bg-blue-100 text-blue-800">Growing</Badge>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">User Growth</h3>
            <p className="text-2xl font-bold text-blue-600">+{data.overview.newUsers}</p>
            <p className="text-sm text-gray-600 mt-1">
              New users in the last {period} days
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Activity className="h-8 w-8 text-purple-600" />
              <Badge className="bg-purple-100 text-purple-800">Active</Badge>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Platform Activity</h3>
            <p className="text-2xl font-bold text-purple-600">
              {Math.round((data.overview.activeUsers / data.overview.totalUsers) * 100)}%
            </p>
            <p className="text-sm text-gray-600 mt-1">
              User engagement rate
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}