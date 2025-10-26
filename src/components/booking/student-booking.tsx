'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Video, Book, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, addDays, startOfWeek, isToday, isTomorrow } from 'date-fns';

interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface Topic {
  id: string;
  name: string;
  level: string;
  description: string | null;
  objectives: string[] | null;
  recursoGramatical: string | null;
  vocabulario: string | null;
  tema: string | null;
}

interface AvailableSlot {
  start: Date;
  end: Date;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
}

interface Booking {
  id: string;
  scheduledAt: string;
  duration: number;
  status: 'SCHEDULED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  googleMeetLink: string | null;
  teacher: {
    id: string;
    name: string;
    email: string;
  };
  topic: {
    id: string;
    name: string;
    level: string;
    description: string | null;
    tema: string | null;
  };
}

interface Package {
  id: string;
  totalLessons: number;
  usedLessons: number;
  remainingLessons: number;
  validUntil: string;
}

export function StudentBooking() {
  const [activeTab, setActiveTab] = useState('book');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    fetchTeachers();
    fetchTopics();
    fetchBookings();
    fetchPackages();
  }, []);

  useEffect(() => {
    if (selectedTeacher && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedTeacher, selectedDate]);

  const fetchTeachers = async () => {
    try {
      // This would be a dedicated API endpoint for teachers
      const response = await fetch('/api/teachers');
      if (response.ok) {
        const data = await response.json();
        setTeachers(data.teachers || []);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchTopics = async () => {
    try {
      const response = await fetch('/api/topics');
      if (response.ok) {
        const data = await response.json();
        setTopics(data.topics || []);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings?role=student&type=upcoming');
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchPackages = async () => {
    try {
      // This would be a dedicated API endpoint for student packages
      const response = await fetch('/api/student/packages');
      if (response.ok) {
        const data = await response.json();
        setPackages(data.packages || []);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const fetchAvailableSlots = async () => {
    setLoading(true);
    try {
      const dateString = selectedDate.toISOString().split('T')[0];
      const response = await fetch(
        `/api/available-slots?teacherId=${selectedTeacher}&date=${dateString}&duration=60`
      );
      if (response.ok) {
        const data = await response.json();
        setAvailableSlots((data.slots || []).map((slot: any) => ({
          ...slot,
          start: new Date(slot.start),
          end: new Date(slot.end),
        })));
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async () => {
    if (!selectedSlot || !selectedTopic) return;

    setBooking(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherId: selectedSlot.teacherId,
          topicId: selectedTopic,
          scheduledAt: selectedSlot.start.toISOString(),
          duration: 60,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert('Class booked successfully!');
        
        // Reset form
        setSelectedSlot(null);
        setSelectedTopic('');
        
        // Refresh data
        await fetchBookings();
        await fetchPackages();
        await fetchAvailableSlots();
        
        // Switch to bookings tab
        setActiveTab('bookings');
      } else {
        const errorData = await response.json();
        alert(`Error booking class: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Error booking class. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Booking cancelled successfully');
        await fetchBookings();
        await fetchPackages();
      } else {
        const errorData = await response.json();
        alert(`Error cancelling booking: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Error cancelling booking. Please try again.');
    }
  };

  const getDateOptions = () => {
    const dates = [];
    for (let i = 0; i < 14; i++) { // Next 2 weeks
      const date = addDays(new Date(), i);
      dates.push(date);
    }
    return dates;
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE, MMM do');
  };

  const activePackage = packages.find(pkg => 
    new Date(pkg.validUntil) > new Date() && pkg.remainingLessons > 0
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Book a Live Class</h1>
        {activePackage && (
          <div className="text-sm">
            <Badge variant="outline" className="bg-green-50 text-green-700">
              {activePackage.remainingLessons} lessons remaining
            </Badge>
          </div>
        )}
      </div>

      {/* Package Warning */}
      {!activePackage && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="w-5 h-5" />
              <p>You don't have an active package or remaining lessons. Please contact support to purchase a lesson package.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="book">Book New Class</TabsTrigger>
          <TabsTrigger value="bookings">My Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="book" className="space-y-6">
          {activePackage ? (
            <>
              {/* Teacher Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Step 1: Choose Teacher
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Date Selection */}
              {selectedTeacher && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Step 2: Choose Date
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select 
                      value={selectedDate.toISOString().split('T')[0]} 
                      onValueChange={(value) => setSelectedDate(new Date(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a date" />
                      </SelectTrigger>
                      <SelectContent>
                        {getDateOptions().map((date) => (
                          <SelectItem key={date.toISOString()} value={date.toISOString().split('T')[0]}>
                            {getDateLabel(date)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              )}

              {/* Time Slot Selection */}
              {selectedTeacher && selectedDate && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Step 3: Choose Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8">Loading available times...</div>
                    ) : availableSlots.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No available time slots for this date. Please choose another date.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {availableSlots.map((slot, index) => (
                          <Button
                            key={index}
                            variant={selectedSlot === slot ? "default" : "outline"}
                            onClick={() => setSelectedSlot(slot)}
                            className="p-3 h-auto"
                          >
                            <div className="text-center">
                              <div className="font-medium">
                                {format(slot.start, 'HH:mm')} - {format(slot.end, 'HH:mm')}
                              </div>
                              <div className="text-xs text-gray-500">
                                {slot.teacherName}
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Topic Selection */}
              {selectedSlot && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Book className="w-5 h-5" />
                      Step 4: Choose Topic
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {topics.map((topic) => (
                          <SelectItem key={topic.id} value={topic.id}>
                            <div>
                              <div className="font-medium">{topic.name}</div>
                              <div className="text-sm text-gray-500">
                                Level: {topic.level}
                                {topic.tema && ` • ${topic.tema}`}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {selectedTopic && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        {(() => {
                          const topic = topics.find(t => t.id === selectedTopic);
                          return topic ? (
                            <div className="space-y-2">
                              <h4 className="font-medium">{topic.name}</h4>
                              <p className="text-sm text-gray-600">Level: {topic.level}</p>
                              {topic.description && (
                                <p className="text-sm text-gray-700">{topic.description}</p>
                              )}
                              {topic.tema && (
                                <p className="text-sm text-gray-600">Theme: {topic.tema}</p>
                              )}
                              {topic.vocabulario && (
                                <p className="text-sm text-gray-600">Vocabulary: {topic.vocabulario}</p>
                              )}
                              {topic.objectives && topic.objectives.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Objectives:</p>
                                  <ul className="text-sm text-gray-600 list-disc list-inside">
                                    {topic.objectives.map((objective, index) => (
                                      <li key={index}>{objective}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Booking Summary */}
              {selectedSlot && selectedTopic && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Step 5: Confirm Booking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">Booking Summary</h4>
                        <div className="text-sm text-blue-800 space-y-1">
                          <p><strong>Teacher:</strong> {selectedSlot.teacherName}</p>
                          <p><strong>Date:</strong> {format(selectedDate, 'EEEE, MMMM do, yyyy')}</p>
                          <p><strong>Time:</strong> {format(selectedSlot.start, 'HH:mm')} - {format(selectedSlot.end, 'HH:mm')}</p>
                          <p><strong>Topic:</strong> {topics.find(t => t.id === selectedTopic)?.name}</p>
                          <p><strong>Level:</strong> {topics.find(t => t.id === selectedTopic)?.level}</p>
                          <p><strong>Duration:</strong> 60 minutes</p>
                        </div>
                      </div>

                      <Button
                        onClick={createBooking}
                        disabled={booking}
                        className="w-full"
                        size="lg"
                      >
                        {booking ? 'Booking...' : 'Confirm Booking'}
                      </Button>

                      <div className="text-xs text-gray-500 text-center">
                        A Google Calendar invite with Meet link will be sent to your email.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-orange-500" />
                <h3 className="text-lg font-semibold mb-2">No Active Package</h3>
                <p className="text-gray-600 mb-4">
                  You need an active lesson package to book classes.
                </p>
                <Button>Contact Support</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Your Upcoming Classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No upcoming classes booked</p>
                  <p className="text-sm">Book your first class to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{booking.topic.name}</h3>
                            <Badge variant="outline">
                              {booking.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            Teacher: {booking.teacher.name}
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
                              Join Class
                            </Button>
                          )}
                          {booking.status === 'SCHEDULED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => cancelBooking(booking.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Cancel
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
      </Tabs>
    </div>
  );
}