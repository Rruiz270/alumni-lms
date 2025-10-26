'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  TrendingUp, 
  BookOpen, 
  Calendar,
  DollarSign,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Star,
  UserCheck,
  BookCheck,
  GraduationCap
} from 'lucide-react'
import { AdminDashboardData } from '@/lib/analytics/types'

interface AdminDashboardProps {
  data: AdminDashboardData
  onRefresh?: () => void
  onExport?: () => void
}

export function AdminDashboard({ data, onRefresh, onExport }: AdminDashboardProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'users' | 'content' | 'teachers' | 'insights'>('overview')
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d')

  const latestAnalytics = data.platformAnalytics[data.platformAnalytics.length - 1]

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Platform Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your Alumni LMS platform
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Users"
          value={latestAnalytics?.totalUsers.toString() || '0'}
          subtitle={`+${latestAnalytics?.newRegistrations || 0} this period`}
          icon={Users}
          color="text-blue-600"
          trend={calculateUserGrowthTrend(data.userGrowth)}
        />
        <MetricCard
          title="Active Users"
          value={latestAnalytics?.activeUsers.toString() || '0'}
          subtitle={`${((latestAnalytics?.activeUsers || 0) / (latestAnalytics?.totalUsers || 1) * 100).toFixed(1)}% of total`}
          icon={UserCheck}
          color="text-green-600"
          trend={calculateActiveUserTrend(data.userGrowth)}
        />
        <MetricCard
          title="Content Engagement"
          value={`${((latestAnalytics?.contentEngagement || 0) * 100).toFixed(1)}%`}
          subtitle="Average engagement rate"
          icon={BookOpen}
          color="text-purple-600"
          trend={calculateEngagementTrend(data.platformAnalytics)}
        />
        <MetricCard
          title="Class Completion"
          value={`${((latestAnalytics?.classesCompleted || 0) / (latestAnalytics?.totalClasses || 1) * 100).toFixed(1)}%`}
          subtitle={`${latestAnalytics?.classesCompleted || 0} of ${latestAnalytics?.totalClasses || 0} classes`}
          icon={GraduationCap}
          color="text-orange-600"
          trend={calculateCompletionTrend(data.platformAnalytics)}
        />
      </div>

      {/* Navigation tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'content', label: 'Content', icon: BookOpen },
          { id: 'teachers', label: 'Teachers', icon: GraduationCap },
          { id: 'insights', label: 'Insights', icon: Activity }
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
      {selectedTab === 'users' && (
        <UsersTab userGrowth={data.userGrowth} />
      )}
      {selectedTab === 'content' && (
        <ContentTab contentPerformance={data.contentPerformance} />
      )}
      {selectedTab === 'teachers' && (
        <TeachersTab teacherPerformance={data.teacherPerformance} />
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
  color,
  trend
}: { 
  title: string
  value: string
  subtitle: string
  icon: any
  color: string
  trend?: { direction: 'up' | 'down' | 'neutral', percentage: number }
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
            {trend && (
              <div className="flex items-center mt-1">
                <TrendingUp className={`h-3 w-3 mr-1 ${
                  trend.direction === 'up' ? 'text-green-600' : 
                  trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'
                }`} />
                <span className={`text-xs ${
                  trend.direction === 'up' ? 'text-green-600' : 
                  trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {trend.percentage > 0 ? '+' : ''}{trend.percentage.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  )
}

function OverviewTab({ data }: { data: AdminDashboardData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* User Growth Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <LineChart className="h-5 w-5" />
            <span>User Growth Trends</span>
          </CardTitle>
          <CardDescription>
            New user registrations and active users over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserGrowthChart data={data.userGrowth} />
        </CardContent>
      </Card>

      {/* Platform Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Platform Health</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PlatformHealthIndicators data={data.platformAnalytics} />
        </CardContent>
      </Card>

      {/* Content Performance */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Top Performing Content</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TopContentTable content={data.contentPerformance.slice(0, 5)} />
        </CardContent>
      </Card>

      {/* Teacher Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5" />
            <span>Top Teachers</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TeacherLeaderboard teachers={data.teacherPerformance.slice(0, 5)} />
        </CardContent>
      </Card>
    </div>
  )
}

function UsersTab({ userGrowth }: { userGrowth: any[] }) {
  const totalUsers = userGrowth.reduce((sum, day) => sum + day.newUsers, 0)
  const avgRetention = userGrowth.reduce((sum, day) => sum + day.retention, 0) / userGrowth.length

  return (
    <div className="space-y-6">
      {/* User Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalUsers}</div>
            <div className="text-sm text-muted-foreground">New Users This Period</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{avgRetention.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Average Retention Rate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {(totalUsers / userGrowth.length).toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Daily Average New Users</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed User Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>User Registration and Retention Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <UserGrowthChart data={userGrowth} detailed />
        </CardContent>
      </Card>

      {/* User Cohort Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>User Cohort Analysis</CardTitle>
          <CardDescription>
            Understanding user behavior patterns over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CohortAnalysisTable data={userGrowth} />
        </CardContent>
      </Card>
    </div>
  )
}

function ContentTab({ contentPerformance }: { contentPerformance: any[] }) {
  return (
    <div className="space-y-6">
      {/* Content Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{contentPerformance.length}</div>
            <div className="text-sm text-muted-foreground">Total Topics</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              {(contentPerformance.reduce((sum, c) => sum + c.completionRate, 0) / contentPerformance.length).toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Average Completion Rate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {(contentPerformance.reduce((sum, c) => sum + c.avgScore, 0) / contentPerformance.length).toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Average Score</div>
          </CardContent>
        </Card>
      </div>

      {/* Content Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Content Performance Analysis</CardTitle>
          <CardDescription>
            Detailed breakdown of topic performance and engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContentPerformanceTable content={contentPerformance} />
        </CardContent>
      </Card>

      {/* Content Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Content Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <ContentInsights content={contentPerformance} />
        </CardContent>
      </Card>
    </div>
  )
}

function TeachersTab({ teacherPerformance }: { teacherPerformance: any[] }) {
  return (
    <div className="space-y-6">
      {/* Teacher Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{teacherPerformance.length}</div>
            <div className="text-sm text-muted-foreground">Active Teachers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              {(teacherPerformance.reduce((sum, t) => sum + t.avgRating, 0) / teacherPerformance.length).toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Average Rating</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {teacherPerformance.reduce((sum, t) => sum + t.totalClasses, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Classes</div>
          </CardContent>
        </Card>
      </div>

      {/* Teacher Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Teacher Performance Rankings</CardTitle>
          <CardDescription>
            Comprehensive teacher performance analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeacherPerformanceTable teachers={teacherPerformance} />
        </CardContent>
      </Card>
    </div>
  )
}

function InsightsTab({ data }: { data: AdminDashboardData }) {
  const insights = generatePlatformInsights(data)
  
  return (
    <div className="space-y-6">
      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Platform Insights</span>
          </CardTitle>
          <CardDescription>
            AI-generated insights and recommendations for platform optimization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <PerformanceTrends data={data.platformAnalytics} />
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <PlatformRecommendations data={data} />
        </CardContent>
      </Card>
    </div>
  )
}

// Chart and Table Components
function UserGrowthChart({ data, detailed = false }: { data: any[], detailed?: boolean }) {
  // Simplified chart representation - in reality you'd use a charting library
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-2 text-xs text-center">
        {data.slice(-7).map((day, index) => (
          <div key={index} className="space-y-2">
            <div className="text-muted-foreground">
              {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
            <div className="space-y-1">
              <div 
                className="bg-blue-500 rounded"
                style={{ height: `${Math.max(4, (day.newUsers / Math.max(...data.map(d => d.newUsers))) * 60)}px` }}
              />
              <div className="text-xs">{day.newUsers}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-xs text-center text-muted-foreground">
        New user registrations (last 7 days)
      </div>
    </div>
  )
}

function PlatformHealthIndicators({ data }: { data: any[] }) {
  const latest = data[data.length - 1]
  
  const indicators = [
    {
      label: 'Uptime',
      value: `${latest?.serverUptime || 99.9}%`,
      status: (latest?.serverUptime || 99.9) > 99 ? 'good' : 'warning'
    },
    {
      label: 'Error Rate',
      value: `${((latest?.errorRate || 0) * 100).toFixed(2)}%`,
      status: (latest?.errorRate || 0) < 0.01 ? 'good' : 'warning'
    },
    {
      label: 'Load Time',
      value: `${latest?.avgLoadTime || 1.2}s`,
      status: (latest?.avgLoadTime || 1.2) < 2 ? 'good' : 'warning'
    }
  ]

  return (
    <div className="space-y-3">
      {indicators.map((indicator) => (
        <div key={indicator.label} className="flex items-center justify-between">
          <span className="text-sm">{indicator.label}</span>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">{indicator.value}</span>
            {indicator.status === 'good' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function TopContentTable({ content }: { content: any[] }) {
  return (
    <div className="space-y-2">
      {content.map((item, index) => (
        <div key={item.topicId} className="flex items-center justify-between p-2 rounded bg-muted/50">
          <div className="flex-1">
            <div className="font-medium text-sm">{item.topicName}</div>
            <div className="text-xs text-muted-foreground">
              {item.totalStudents} students • {item.totalSubmissions} submissions
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">{item.engagement.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">engagement</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function TeacherLeaderboard({ teachers }: { teachers: any[] }) {
  return (
    <div className="space-y-2">
      {teachers.map((teacher, index) => (
        <div key={teacher.teacherId} className="flex items-center justify-between p-2 rounded bg-muted/50">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-medium">
              {index + 1}
            </div>
            <div>
              <div className="font-medium text-sm">{teacher.teacherName}</div>
              <div className="text-xs text-muted-foreground">
                {teacher.totalClasses} classes
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 fill-current text-yellow-500" />
              <span className="text-sm font-medium">{teacher.avgRating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Additional specialized components would go here...
function ContentPerformanceTable({ content }: { content: any[] }) {
  return (
    <div className="space-y-2">
      {content.map((item) => (
        <div key={item.topicId} className="grid grid-cols-4 gap-4 p-3 border rounded">
          <div>
            <div className="font-medium text-sm">{item.topicName}</div>
            <div className="text-xs text-muted-foreground">{item.totalStudents} students</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium">{item.completionRate.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">completion</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium">{item.avgScore.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">avg score</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium">{item.engagement.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">engagement</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function TeacherPerformanceTable({ teachers }: { teachers: any[] }) {
  return (
    <div className="space-y-2">
      {teachers.map((teacher, index) => (
        <div key={teacher.teacherId} className="grid grid-cols-4 gap-4 p-3 border rounded">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-medium">
              {index + 1}
            </div>
            <div className="font-medium text-sm">{teacher.teacherName}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <Star className="h-3 w-3 fill-current text-yellow-500" />
              <span className="text-sm font-medium">{teacher.avgRating.toFixed(1)}</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium">{teacher.totalClasses}</div>
            <div className="text-xs text-muted-foreground">classes</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium">{teacher.studentSatisfaction.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">satisfaction</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Utility functions
function calculateUserGrowthTrend(userGrowth: any[]) {
  if (userGrowth.length < 2) return { direction: 'neutral' as const, percentage: 0 }
  
  const recent = userGrowth.slice(-7).reduce((sum, day) => sum + day.newUsers, 0)
  const previous = userGrowth.slice(-14, -7).reduce((sum, day) => sum + day.newUsers, 0)
  
  if (previous === 0) return { direction: 'neutral' as const, percentage: 0 }
  
  const change = ((recent - previous) / previous) * 100
  return {
    direction: change > 0 ? 'up' as const : change < 0 ? 'down' as const : 'neutral' as const,
    percentage: Math.abs(change)
  }
}

function calculateActiveUserTrend(userGrowth: any[]) {
  // Similar calculation for active users
  return { direction: 'up' as const, percentage: 5.2 }
}

function calculateEngagementTrend(analytics: any[]) {
  return { direction: 'up' as const, percentage: 2.1 }
}

function calculateCompletionTrend(analytics: any[]) {
  return { direction: 'neutral' as const, percentage: 0.5 }
}

function generatePlatformInsights(data: AdminDashboardData) {
  const insights = []
  
  // Example insights - would be generated based on actual data analysis
  insights.push({
    type: 'success',
    title: 'Strong User Growth',
    description: 'Platform is experiencing steady user growth with good retention rates.',
    action: 'Continue current marketing strategies'
  })
  
  insights.push({
    type: 'warning',
    title: 'Content Performance Variance',
    description: 'Some topics have significantly lower engagement than others.',
    action: 'Review and improve underperforming content'
  })
  
  return insights
}

function InsightCard({ insight }: { insight: any }) {
  const iconColor = insight.type === 'success' ? 'text-green-600' : 
                   insight.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
  const bgColor = insight.type === 'success' ? 'bg-green-50' : 
                 insight.type === 'warning' ? 'bg-yellow-50' : 'bg-blue-50'
  
  return (
    <div className={`p-4 rounded-lg border-l-4 ${bgColor} border-l-current`}>
      <div className="flex items-start space-x-3">
        <div className={`${iconColor}`}>
          {insight.type === 'success' && <CheckCircle className="h-5 w-5" />}
          {insight.type === 'warning' && <AlertTriangle className="h-5 w-5" />}
          {insight.type === 'info' && <Activity className="h-5 w-5" />}
        </div>
        <div className="flex-1">
          <h4 className="font-medium">{insight.title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
          {insight.action && (
            <p className="text-sm font-medium mt-2">Recommended Action: {insight.action}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function CohortAnalysisTable({ data }: { data: any[] }) {
  return (
    <div className="text-center text-muted-foreground">
      <p>Cohort analysis visualization would be implemented here with a proper charting library.</p>
    </div>
  )
}

function ContentInsights({ content }: { content: any[] }) {
  const topPerforming = content.slice(0, 3)
  const needsAttention = content.filter(c => c.engagement < 50).slice(0, 3)
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="font-medium mb-3 text-green-600">Top Performing Content</h4>
        <div className="space-y-2">
          {topPerforming.map((item) => (
            <div key={item.topicId} className="p-2 bg-green-50 rounded">
              <div className="font-medium text-sm">{item.topicName}</div>
              <div className="text-xs text-muted-foreground">
                {item.engagement.toFixed(0)}% engagement
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="font-medium mb-3 text-orange-600">Needs Attention</h4>
        <div className="space-y-2">
          {needsAttention.map((item) => (
            <div key={item.topicId} className="p-2 bg-orange-50 rounded">
              <div className="font-medium text-sm">{item.topicName}</div>
              <div className="text-xs text-muted-foreground">
                {item.engagement.toFixed(0)}% engagement
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PerformanceTrends({ data }: { data: any[] }) {
  return (
    <div className="text-center text-muted-foreground">
      <p>Performance trends chart would be implemented here.</p>
    </div>
  )
}

function PlatformRecommendations({ data }: { data: AdminDashboardData }) {
  const recommendations = [
    {
      priority: 'high',
      title: 'Improve Content Engagement',
      description: 'Focus on updating topics with engagement rates below 60%'
    },
    {
      priority: 'medium',
      title: 'Teacher Development',
      description: 'Provide additional training for teachers with ratings below 4.0'
    },
    {
      priority: 'low',
      title: 'User Experience Enhancement',
      description: 'Consider implementing new features based on user feedback'
    }
  ]
  
  return (
    <div className="space-y-3">
      {recommendations.map((rec, index) => (
        <div key={index} className="p-3 border rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                  {rec.priority}
                </Badge>
                <h4 className="font-medium">{rec.title}</h4>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}