'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { 
  Calendar, 
  Clock, 
  Users, 
  BookOpen,
  CheckCircle,
  XCircle,
  AlertCircle,
  Video,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  MoreHorizontal,
  User,
  GraduationCap
} from 'lucide-react'

interface Booking {
  id: string
  scheduledAt: string
  duration: number
  status: 'SCHEDULED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
  googleMeetLink?: string
  cancelledAt?: string
  attendedAt?: string
  createdAt: string
  updatedAt: string
  student: {
    id: string
    name: string
    email: string
    studentId?: string
    level?: string
  }
  teacher: {
    id: string
    name: string
    email: string
  }
  topic: {
    id: string
    name: string
    level: string
    description?: string
  }
  attendanceLogs: Array<{
    action: string
    timestamp: string
    source: string
  }>
}

interface BookingStats {
  SCHEDULED: number
  COMPLETED: number
  CANCELLED: number
  NO_SHOW: number
}

export default function ClassManagement() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [stats, setStats] = useState<BookingStats>({
    SCHEDULED: 0,
    COMPLETED: 0,
    CANCELLED: 0,
    NO_SHOW: 0
  })
  const [filters, setFilters] = useState({
    status: 'ALL',
    teacherId: '',
    studentId: '',
    level: '',
    startDate: '',
    endDate: ''
  })
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(filters.status !== 'ALL' && { status: filters.status }),
        ...(filters.teacherId && { teacherId: filters.teacherId }),
        ...(filters.studentId && { studentId: filters.studentId }),
        ...(filters.level && { level: filters.level }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      })

      const response = await fetch(`/api/admin/bookings?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings)
        setTotalPages(data.pagination.totalPages)
        setTotalCount(data.pagination.totalCount)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        fetchBookings()
      } else {
        const error = await response.json()
        alert(error.error || 'Error updating booking')
      }
    } catch (error) {
      console.error('Error updating booking:', error)
      alert('Error updating booking')
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchBookings()
      } else {
        const error = await response.json()
        alert(error.error || 'Error cancelling booking')
      }
    } catch (error) {
      console.error('Error cancelling booking:', error)
      alert('Error cancelling booking')
    }
  }

  const openViewDialog = async (booking: Booking) => {
    try {
      const response = await fetch(`/api/admin/bookings/${booking.id}`)
      if (response.ok) {
        const detailedBooking = await response.json()
        setSelectedBooking(detailedBooking)
        setShowViewDialog(true)
      }
    } catch (error) {
      console.error('Error fetching booking details:', error)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [currentPage, filters])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Scheduled</Badge>
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case 'CANCELLED':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>
      case 'NO_SHOW':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="h-3 w-3 mr-1" />No Show</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Class Management</h1>
          <p className="text-gray-600">Oversee all bookings and class schedules</p>
        </div>
        <Button onClick={fetchBookings} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <Clock className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">{stats.SCHEDULED || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.COMPLETED || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <XCircle className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-gray-900">{stats.CANCELLED || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <AlertCircle className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">No Show</p>
              <p className="text-2xl font-bold text-gray-900">{stats.NO_SHOW || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Select 
              value={filters.status} 
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="NO_SHOW">No Show</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.level} 
              onValueChange={(value) => setFilters({ ...filters, level: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Levels</SelectItem>
                <SelectItem value="A1">A1</SelectItem>
                <SelectItem value="A2">A2</SelectItem>
                <SelectItem value="B1">B1</SelectItem>
                <SelectItem value="B2">B2</SelectItem>
                <SelectItem value="C1">C1</SelectItem>
                <SelectItem value="C2">C2</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="Start Date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />

            <Input
              type="date"
              placeholder="End Date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />

            <Button 
              variant="outline" 
              onClick={() => setFilters({
                status: 'ALL',
                teacherId: '',
                studentId: '',
                level: '',
                startDate: '',
                endDate: ''
              })}
            >
              Clear Filters
            </Button>

            <Button onClick={fetchBookings} disabled={loading}>
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Classes & Bookings ({totalCount})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">
                            {new Date(booking.scheduledAt).toLocaleDateString()}
                          </span>
                          <span className="text-sm text-gray-600">
                            {new Date(booking.scheduledAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-600">{booking.duration}min</span>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium text-gray-700">Student</span>
                          </div>
                          <p className="text-sm text-gray-900">{booking.student.name}</p>
                          <p className="text-xs text-gray-600">
                            {booking.student.email}
                            {booking.student.studentId && ` • ID: ${booking.student.studentId}`}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <GraduationCap className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium text-gray-700">Teacher</span>
                          </div>
                          <p className="text-sm text-gray-900">{booking.teacher.name}</p>
                          <p className="text-xs text-gray-600">{booking.teacher.email}</p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <BookOpen className="h-4 w-4 text-purple-500" />
                            <span className="text-sm font-medium text-gray-700">Topic</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-900">{booking.topic.name}</p>
                            <Badge className={getLevelBadgeColor(booking.topic.level)} variant="secondary">
                              {booking.topic.level}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {booking.attendanceLogs.length > 0 && (
                        <div className="text-xs text-gray-500 mb-2">
                          Last activity: {booking.attendanceLogs[0].action} ({booking.attendanceLogs[0].source})
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {booking.googleMeetLink && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(booking.googleMeetLink, '_blank')}
                        >
                          <Video className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openViewDialog(booking)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {booking.status === 'SCHEDULED' && (
                        <Select onValueChange={(value) => handleUpdateBookingStatus(booking.id, value)}>
                          <SelectTrigger className="w-auto h-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="COMPLETED">Mark Completed</SelectItem>
                            <SelectItem value="NO_SHOW">Mark No Show</SelectItem>
                            <SelectItem value="CANCELLED">Cancel</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                Showing {(currentPage - 1) * 20 + 1} to {Math.min(currentPage * 20, totalCount)} of {totalCount} bookings
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
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
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
        </CardContent>
      </Card>

      {/* View Booking Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Date & Time</Label>
                  <p className="text-gray-900">
                    {new Date(selectedBooking.scheduledAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Duration</Label>
                  <p className="text-gray-900">{selectedBooking.duration} minutes</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Booking ID</Label>
                  <p className="text-gray-900 font-mono text-sm">{selectedBooking.id}</p>
                </div>
              </div>

              {/* Participants */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-500" />
                      Student
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-sm text-gray-600">Name</Label>
                        <p className="font-medium">{selectedBooking.student.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Email</Label>
                        <p className="text-sm">{selectedBooking.student.email}</p>
                      </div>
                      {selectedBooking.student.studentId && (
                        <div>
                          <Label className="text-sm text-gray-600">Student ID</Label>
                          <p className="text-sm">{selectedBooking.student.studentId}</p>
                        </div>
                      )}
                      {selectedBooking.student.level && (
                        <div>
                          <Label className="text-sm text-gray-600">Level</Label>
                          <Badge className={getLevelBadgeColor(selectedBooking.student.level)} variant="secondary">
                            {selectedBooking.student.level}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-green-500" />
                      Teacher
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-sm text-gray-600">Name</Label>
                        <p className="font-medium">{selectedBooking.teacher.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Email</Label>
                        <p className="text-sm">{selectedBooking.teacher.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Topic */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-purple-500" />
                    Topic
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-600">Name</Label>
                      <p className="font-medium">{selectedBooking.topic.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Level</Label>
                      <Badge className={getLevelBadgeColor(selectedBooking.topic.level)} variant="secondary">
                        {selectedBooking.topic.level}
                      </Badge>
                    </div>
                    {selectedBooking.topic.description && (
                      <div className="col-span-2">
                        <Label className="text-sm text-gray-600">Description</Label>
                        <p className="text-sm text-gray-900">{selectedBooking.topic.description}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Attendance Logs */}
              {selectedBooking.attendanceLogs && selectedBooking.attendanceLogs.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Attendance Logs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedBooking.attendanceLogs.map((log, index) => (
                        <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                          <span className="font-medium">{log.action}</span>
                          <div className="text-gray-600">
                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {log.source}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              {selectedBooking.status === 'SCHEDULED' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    onClick={() => handleUpdateBookingStatus(selectedBooking.id, 'COMPLETED')}
                    className="flex-1"
                  >
                    Mark as Completed
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleUpdateBookingStatus(selectedBooking.id, 'NO_SHOW')}
                    className="flex-1"
                  >
                    Mark as No Show
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      handleCancelBooking(selectedBooking.id)
                      setShowViewDialog(false)
                    }}
                    className="flex-1"
                  >
                    Cancel Booking
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}