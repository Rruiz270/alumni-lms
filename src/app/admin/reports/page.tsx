'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { 
  FileText, 
  Download, 
  Calendar,
  Users,
  BookOpen,
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  Filter,
  RefreshCw,
  Check,
  AlertCircle,
  User,
  GraduationCap
} from 'lucide-react'

interface ReportConfig {
  type: string
  startDate: string
  endDate: string
  format: 'json' | 'csv'
}

interface ReportData {
  reportType: string
  dateRange: {
    startDate: string | null
    endDate: string | null
  }
  data: any[]
  summary?: any
}

const REPORT_TYPES = [
  {
    id: 'student-progress',
    name: 'Student Progress Report',
    description: 'Detailed progress tracking for all students',
    icon: Users,
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'teacher-utilization',
    name: 'Teacher Utilization Report',
    description: 'Teacher performance and class statistics',
    icon: GraduationCap,
    color: 'bg-green-100 text-green-800'
  },
  {
    id: 'class-completion',
    name: 'Class Completion Report',
    description: 'Analysis of class attendance and completion rates',
    icon: BookOpen,
    color: 'bg-purple-100 text-purple-800'
  },
  {
    id: 'content-usage',
    name: 'Content Usage Report',
    description: 'Popular topics and content engagement metrics',
    icon: BarChart3,
    color: 'bg-orange-100 text-orange-800'
  }
]

export default function Reports() {
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    type: 'student-progress',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    format: 'json'
  })
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null)

  const generateReport = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        type: reportConfig.type,
        startDate: reportConfig.startDate,
        endDate: reportConfig.endDate,
        format: reportConfig.format
      })

      const response = await fetch(`/api/admin/reports?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      } else {
        throw new Error('Failed to generate report')
      }
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Error generating report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = async (format: 'csv' | 'json') => {
    try {
      setDownloadingFormat(format)
      const queryParams = new URLSearchParams({
        type: reportConfig.type,
        startDate: reportConfig.startDate,
        endDate: reportConfig.endDate,
        format
      })

      const response = await fetch(`/api/admin/reports?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        
        if (format === 'csv' && data.type === 'csv') {
          // Convert JSON to CSV for download
          const csvContent = convertToCSV(data.data)
          const blob = new Blob([csvContent], { type: 'text/csv' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = data.filename || `report-${reportConfig.type}-${new Date().toISOString().split('T')[0]}.csv`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          window.URL.revokeObjectURL(url)
        } else {
          // Download JSON
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `report-${reportConfig.type}-${new Date().toISOString().split('T')[0]}.json`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          window.URL.revokeObjectURL(url)
        }
      }
    } catch (error) {
      console.error('Error downloading report:', error)
      alert('Error downloading report. Please try again.')
    } finally {
      setDownloadingFormat(null)
    }
  }

  const convertToCSV = (data: any[]): string => {
    if (!data || data.length === 0) return ''
    
    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          // Escape quotes and wrap in quotes if contains comma
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }).join(',')
      )
    ].join('\n')
    
    return csvContent
  }

  const renderReportSummary = () => {
    if (!reportData || !reportData.summary) return null

    switch (reportData.reportType) {
      case 'student-progress':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Total Students</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{reportData.summary.totalStudents}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Avg Attendance Rate</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {Math.round(reportData.summary.averageAttendanceRate || 0)}%
              </p>
            </div>
          </div>
        )

      case 'teacher-utilization':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Total Teachers</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{reportData.summary.totalTeachers}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Avg Utilization</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {Math.round(reportData.summary.averageUtilization || 0)}%
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-purple-900">Total Hours</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">{reportData.summary.totalHoursTaught}</p>
            </div>
          </div>
        )

      case 'class-completion':
        return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(reportData.summary).map(([key, value]) => (
              <div key={key} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                  <span className="font-medium text-gray-900 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
                <p className="text-2xl font-bold text-purple-600">{value as number}</p>
              </div>
            ))}
          </div>
        )

      case 'content-usage':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Total Topics</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{reportData.summary.totalTopics}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Most Popular</span>
              </div>
              <p className="text-lg font-bold text-green-600">{reportData.summary.mostPopularTopic}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-purple-900">Avg Completion</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round(reportData.summary.averageCompletionRate || 0)}%
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const renderReportData = () => {
    if (!reportData || !reportData.data || reportData.data.length === 0) {
      return (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No data available for the selected criteria</p>
        </div>
      )
    }

    // Show first 10 rows as preview
    const previewData = reportData.data.slice(0, 10)
    const headers = Object.keys(previewData[0])

    return (
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                {headers.map((header) => (
                  <th key={header} className="border border-gray-200 px-4 py-2 text-left font-medium text-gray-900">
                    {header.replace(/([A-Z])/g, ' $1').trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {headers.map((header) => (
                    <td key={header} className="border border-gray-200 px-4 py-2 text-sm text-gray-700">
                      {typeof row[header] === 'object' ? JSON.stringify(row[header]) : String(row[header])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {reportData.data.length > 10 && (
          <p className="text-sm text-gray-600 text-center">
            Showing first 10 of {reportData.data.length} records. Download full report for complete data.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Insights</h1>
          <p className="text-gray-600">Generate detailed reports and export data</p>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {REPORT_TYPES.map((report) => {
          const Icon = report.icon
          return (
            <Card 
              key={report.id} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                reportConfig.type === report.id ? 'ring-2 ring-purple-500 bg-purple-50' : ''
              }`}
              onClick={() => setReportConfig({ ...reportConfig, type: report.id })}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${report.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{report.name}</h3>
                    <p className="text-sm text-gray-600">{report.description}</p>
                  </div>
                  {reportConfig.type === report.id && (
                    <Check className="h-5 w-5 text-purple-600" />
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={reportConfig.startDate}
                onChange={(e) => setReportConfig({ ...reportConfig, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={reportConfig.endDate}
                onChange={(e) => setReportConfig({ ...reportConfig, endDate: e.target.value })}
              />
            </div>
            <div>
              <Label>Output Format</Label>
              <Select 
                value={reportConfig.format} 
                onValueChange={(value: 'json' | 'csv') => setReportConfig({ ...reportConfig, format: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON (Preview + Download)</SelectItem>
                  <SelectItem value="csv">CSV (Download Only)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={generateReport} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Results */}
      {reportData && (
        <>
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Report Summary</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {reportData.data.length} records
                  </Badge>
                  <Badge variant="outline">
                    {reportData.dateRange.startDate} to {reportData.dateRange.endDate}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderReportSummary()}
            </CardContent>
          </Card>

          {/* Data Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Data Preview</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadReport('json')}
                    disabled={downloadingFormat === 'json'}
                  >
                    {downloadingFormat === 'json' ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Download JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadReport('csv')}
                    disabled={downloadingFormat === 'csv'}
                  >
                    {downloadingFormat === 'csv' ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Download CSV
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderReportData()}
            </CardContent>
          </Card>
        </>
      )}

      {/* Quick Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-16 flex flex-col items-center justify-center gap-2"
              onClick={() => {
                setReportConfig({
                  type: 'student-progress',
                  startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  endDate: new Date().toISOString().split('T')[0],
                  format: 'csv'
                })
                setTimeout(generateReport, 100)
              }}
            >
              <Users className="h-5 w-5" />
              <span className="text-sm">Weekly Student Report</span>
            </Button>

            <Button
              variant="outline"
              className="h-16 flex flex-col items-center justify-center gap-2"
              onClick={() => {
                setReportConfig({
                  type: 'class-completion',
                  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  endDate: new Date().toISOString().split('T')[0],
                  format: 'csv'
                })
                setTimeout(generateReport, 100)
              }}
            >
              <Calendar className="h-5 w-5" />
              <span className="text-sm">Monthly Class Report</span>
            </Button>

            <Button
              variant="outline"
              className="h-16 flex flex-col items-center justify-center gap-2"
              onClick={() => {
                setReportConfig({
                  type: 'teacher-utilization',
                  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  endDate: new Date().toISOString().split('T')[0],
                  format: 'csv'
                })
                setTimeout(generateReport, 100)
              }}
            >
              <GraduationCap className="h-5 w-5" />
              <span className="text-sm">Teacher Performance</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}