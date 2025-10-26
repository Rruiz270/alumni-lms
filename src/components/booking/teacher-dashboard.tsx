'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Video, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, isToday, isTomorrow, addDays } from 'date-fns';
import { AvailabilityManager } from './availability-manager';

interface Booking {
  id: string;
  scheduledAt: string;
  duration: number;
  status: 'SCHEDULED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  googleMeetLink: string | null;
  student: {
    id: string;
    name: string;
    email: string;
  };
  topic: {
    id: string;
    name: string;
    level: string;
    description: string | null;
    recursoGramatical: string | null;
    vocabulario: string | null;
    tema: string | null;
    classroomLink: string | null;
  };
  attendanceLogs: Array<{
    id: string;
    action: string;
    timestamp: string;
  }>;
}

interface TeacherStats {
  todayClasses: number;
  weekClasses: number;
  totalStudents: number;
  attendanceRate: number;
}

export function TeacherDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<TeacherStats>({
    todayClasses: 0,
    weekClasses: 0,
    totalStudents: 0,
    attendanceRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchBookings();
    fetchStats();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings?role=teacher&type=upcoming');
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // This would be a separate API endpoint for teacher stats
      // For now, calculate from bookings
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      
      // Calculate stats from bookings (this would ideally come from a dedicated endpoint)
      const todayClasses = bookings.filter(booking => 
        isToday(new Date(booking.scheduledAt)) && booking.status === 'SCHEDULED'
      ).length;
      
      const weekClasses = bookings.filter(booking => {
        const bookingDate = new Date(booking.scheduledAt);
        return bookingDate >= startOfWeek && bookingDate <= addDays(startOfWeek, 7);
      }).length;

      const uniqueStudents = new Set(bookings.map(b => b.student.id)).size;
      const completedClasses = bookings.filter(b => b.status === 'COMPLETED').length;
      const totalFinishedClasses = bookings.filter(b => 
        b.status === 'COMPLETED' || b.status === 'NO_SHOW'
      ).length;
      
      setStats({
        todayClasses,
        weekClasses,
        totalStudents: uniqueStudents,
        attendanceRate: totalFinishedClasses > 0 ? Math.round((completedClasses / totalFinishedClasses) * 100) : 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleMarkAttendance = async (bookingId: string, attended: boolean) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attended }),
      });

      if (response.ok) {
        await fetchBookings();
        await fetchStats();
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'NO_SHOW':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimeStatus = (scheduledAt: string) => {
    const now = new Date();
    const classTime = new Date(scheduledAt);
    const diffInMinutes = (classTime.getTime() - now.getTime()) / (1000 * 60);

    if (diffInMinutes < -60) {
      return { status: 'past', label: 'Past', color: 'text-gray-500' };
    } else if (diffInMinutes < 0) {
      return { status: 'in-progress', label: 'In Progress', color: 'text-green-600' };
    } else if (diffInMinutes < 15) {
      return { status: 'starting-soon', label: 'Starting Soon', color: 'text-orange-600' };
    } else {
      return { status: 'upcoming', label: 'Upcoming', color: 'text-blue-600' };
    }
  };

  const todayBookings = bookings.filter(booking => 
    isToday(new Date(booking.scheduledAt))
  );

  const upcomingBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.scheduledAt);
    return bookingDate > new Date() && !isToday(bookingDate);
  });

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        <div className="text-sm text-gray-500">
          {format(new Date(), 'EEEE, MMMM do, yyyy')}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.todayClasses}</p>
                <p className="text-sm text-gray-600">Classes Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.weekClasses}</p>
                <p className="text-sm text-gray-600">This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
                <p className="text-sm text-gray-600">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
              <div>
                <p className="text-2xl font-bold">{stats.attendanceRate}%</p>
                <p className="text-sm text-gray-600">Attendance Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Today's Classes</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Classes</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Today's Classes ({todayBookings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayBookings.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No classes scheduled for today</p>
              ) : (
                <div className="space-y-4">
                  {todayBookings.map((booking) => {
                    const timeStatus = getTimeStatus(booking.scheduledAt);
                    return (
                      <div key={booking.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{booking.topic.name}</h3>
                              <Badge variant="outline" className={getStatusColor(booking.status)}>
                                {booking.status}
                              </Badge>
                              <Badge variant="outline" className={timeStatus.color}>
                                {timeStatus.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              Student: {booking.student.name} ({booking.student.email})
                            </p>
                            <p className="text-sm text-gray-600">
                              Time: {format(new Date(booking.scheduledAt), 'HH:mm')} - 
                              {format(new Date(new Date(booking.scheduledAt).getTime() + booking.duration * 60000), 'HH:mm')}
                            </p>
                            <p className="text-sm text-gray-600">
                              Level: {booking.topic.level}
                            </p>
                            {booking.topic.tema && (
                              <p className="text-sm text-gray-600">
                                Theme: {booking.topic.tema}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            {booking.googleMeetLink && (
                              <Button
                                size="sm"
                                onClick={() => window.open(booking.googleMeetLink!, '_blank')}
                                className="flex items-center gap-1"
                              >
                                <Video className="w-4 h-4" />
                                Join Meet
                              </Button>
                            )}
                            {booking.topic.classroomLink && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(booking.topic.classroomLink!, '_blank')}
                              >
                                Open Slides
                              </Button>
                            )}
                          </div>
                        </div>

                        {booking.status === 'SCHEDULED' && timeStatus.status === 'past' && (
                          <div className="flex gap-2 pt-2 border-t">
                            <Button
                              size="sm"
                              onClick={() => handleMarkAttendance(booking.id, true)}
                              className="flex items-center gap-1"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Mark Present
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAttendance(booking.id, false)}
                              className="flex items-center gap-1"
                            >
                              <XCircle className="w-4 h-4" />
                              Mark Absent
                            </Button>
                          </div>
                        )}

                        {booking.topic.description && (
                          <div className="pt-2 border-t">
                            <p className="text-sm text-gray-700">{booking.topic.description}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Upcoming Classes ({upcomingBookings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingBookings.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No upcoming classes scheduled</p>
              ) : (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{booking.topic.name}</h3>
                            <Badge variant="outline" className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            Student: {booking.student.name} ({booking.student.email})
                          </p>
                          <p className="text-sm text-gray-600">
                            Date: {format(new Date(booking.scheduledAt), 'EEEE, MMMM do, yyyy')}
                          </p>
                          <p className="text-sm text-gray-600">
                            Time: {format(new Date(booking.scheduledAt), 'HH:mm')} - 
                            {format(new Date(new Date(booking.scheduledAt).getTime() + booking.duration * 60000), 'HH:mm')}
                          </p>
                          <p className="text-sm text-gray-600">
                            Level: {booking.topic.level}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          {booking.googleMeetLink && (
                            <Button
                              size="sm"
                              onClick={() => window.open(booking.googleMeetLink!, '_blank')}
                              className="flex items-center gap-1"
                            >
                              <Video className="w-4 h-4" />
                              Meet Link
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability">
          <AvailabilityManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}