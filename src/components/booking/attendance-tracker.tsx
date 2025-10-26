'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Users, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface AttendanceLog {
  id: string;
  action: string;
  timestamp: string;
  source: string;
}

interface Booking {
  id: string;
  scheduledAt: string;
  duration: number;
  status: 'SCHEDULED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  student: {
    id: string;
    name: string;
    email: string;
  };
  topic: {
    name: string;
    level: string;
  };
  attendanceLogs: AttendanceLog[];
}

interface AttendanceTrackerProps {
  bookingId: string;
  onAttendanceUpdate?: () => void;
}

export function AttendanceTracker({ bookingId, onAttendanceUpdate }: AttendanceTrackerProps) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`);
      if (response.ok) {
        const data = await response.json();
        setBooking(data.booking);
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (attended: boolean) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attended }),
      });

      if (response.ok) {
        await fetchBooking();
        onAttendanceUpdate?.();
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading attendance data...</div>
        </CardContent>
      </Card>
    );
  }

  if (!booking) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">Booking not found</div>
        </CardContent>
      </Card>
    );
  }

  const classTime = new Date(booking.scheduledAt);
  const classEndTime = new Date(classTime.getTime() + (booking.duration * 60 * 1000));
  const now = new Date();
  const isClassTime = now >= classTime && now <= classEndTime;
  const isClassPast = now > classEndTime;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'NO_SHOW':
        return <Badge className="bg-yellow-100 text-yellow-800">No Show</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getTimeStatus = () => {
    if (now < classTime) {
      const minutesUntil = Math.floor((classTime.getTime() - now.getTime()) / (1000 * 60));
      if (minutesUntil <= 15) {
        return {
          icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
          text: `Starts in ${minutesUntil} minutes`,
          color: 'text-orange-600',
        };
      }
      return {
        icon: <Clock className="w-5 h-5 text-blue-500" />,
        text: `Starts at ${format(classTime, 'HH:mm')}`,
        color: 'text-blue-600',
      };
    } else if (isClassTime) {
      return {
        icon: <Users className="w-5 h-5 text-green-500" />,
        text: 'Class in progress',
        color: 'text-green-600',
      };
    } else {
      return {
        icon: <Clock className="w-5 h-5 text-gray-500" />,
        text: 'Class ended',
        color: 'text-gray-600',
      };
    }
  };

  const timeStatus = getTimeStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Attendance Tracking
          </div>
          {getStatusBadge(booking.status)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Class Information */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <h4 className="font-medium">{booking.topic.name}</h4>
          <p className="text-sm text-gray-600">
            Student: {booking.student.name} ({booking.student.email})
          </p>
          <p className="text-sm text-gray-600">
            Level: {booking.topic.level}
          </p>
          <div className="flex items-center gap-2">
            {timeStatus.icon}
            <span className={`text-sm font-medium ${timeStatus.color}`}>
              {timeStatus.text}
            </span>
          </div>
        </div>

        {/* Attendance Actions */}
        {booking.status === 'SCHEDULED' && isClassPast && (
          <div className="space-y-3">
            <h4 className="font-medium">Mark Attendance</h4>
            <div className="flex gap-3">
              <Button
                onClick={() => markAttendance(true)}
                disabled={updating}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4" />
                {updating ? 'Updating...' : 'Present'}
              </Button>
              <Button
                onClick={() => markAttendance(false)}
                disabled={updating}
                variant="outline"
                className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4" />
                {updating ? 'Updating...' : 'Absent'}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Mark attendance after the class has ended
            </p>
          </div>
        )}

        {/* Current Status */}
        {booking.status !== 'SCHEDULED' && (
          <div className="space-y-2">
            <h4 className="font-medium">Final Status</h4>
            <div className="flex items-center gap-2">
              {booking.status === 'COMPLETED' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : booking.status === 'NO_SHOW' ? (
                <XCircle className="w-5 h-5 text-yellow-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="text-sm font-medium">
                {booking.status === 'COMPLETED' && 'Student attended the class'}
                {booking.status === 'NO_SHOW' && 'Student did not attend the class'}
                {booking.status === 'CANCELLED' && 'Class was cancelled'}
              </span>
            </div>
          </div>
        )}

        {/* Attendance Log */}
        {booking.attendanceLogs.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Attendance History</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {booking.attendanceLogs.map((log) => (
                <div key={log.id} className="text-sm p-2 bg-gray-50 rounded text-gray-700">
                  <div className="flex justify-between">
                    <span className="font-medium">{log.action.replace('_', ' ')}</span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(log.timestamp), 'MMM do, HH:mm')}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Source: {log.source}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        {booking.status === 'SCHEDULED' && !isClassPast && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-medium text-blue-900 text-sm">Instructions:</h4>
            <ul className="text-xs text-blue-800 mt-1 space-y-1">
              <li>• Attendance can only be marked after the class ends</li>
              <li>• The system will automatically track attendance if integrated with Google Meet</li>
              <li>• Manual attendance marking is available as a backup</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}