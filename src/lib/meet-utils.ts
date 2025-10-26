import { prisma } from './prisma';
import { googleCalendarService } from './google-calendar';
import { emailNotificationService } from './email-notifications';
import { BookingStatus } from '@prisma/client';

export interface BookingWithRelations {
  id: string;
  studentId: string;
  teacherId: string;
  topicId: string;
  scheduledAt: Date;
  duration: number;
  status: BookingStatus;
  googleMeetLink: string | null;
  googleEventId: string | null;
  student: {
    id: string;
    name: string;
    email: string;
  };
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
    objectives: any;
    recursoGramatical: string | null;
    vocabulario: string | null;
    tema: string | null;
    classroomLink: string | null;
  };
}

export interface CreateBookingParams {
  studentId: string;
  teacherId: string;
  topicId: string;
  scheduledAt: Date;
  duration?: number;
}

export interface AvailableSlot {
  start: Date;
  end: Date;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
}

export class MeetBookingService {
  /**
   * Create a new booking with Google Calendar event and Meet link
   */
  async createBooking({
    studentId,
    teacherId,
    topicId,
    scheduledAt,
    duration = 60,
  }: CreateBookingParams): Promise<BookingWithRelations> {
    try {
      // First create the booking record
      const booking = await prisma.booking.create({
        data: {
          studentId,
          teacherId,
          topicId,
          scheduledAt,
          duration,
          status: 'SCHEDULED',
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          teacher: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          topic: {
            select: {
              id: true,
              name: true,
              level: true,
              description: true,
              objectives: true,
              recursoGramatical: true,
              vocabulario: true,
              tema: true,
              classroomLink: true,
            },
          },
        },
      });

      // Create Google Calendar event with Meet link
      const { eventId, meetLink } = await googleCalendarService.createEvent({
        booking: booking as any, // Type assertion for compatibility
      });

      // Update booking with Google event details
      const updatedBooking = await prisma.booking.update({
        where: { id: booking.id },
        data: {
          googleEventId: eventId,
          googleMeetLink: meetLink,
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          teacher: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          topic: {
            select: {
              id: true,
              name: true,
              level: true,
              description: true,
              objectives: true,
              recursoGramatical: true,
              vocabulario: true,
              tema: true,
              classroomLink: true,
            },
          },
        },
      });

      // Update student package usage
      await this.updatePackageUsage(studentId);

      // Send email notifications
      try {
        await emailNotificationService.sendBookingConfirmation({
          id: updatedBooking.id,
          scheduledAt: updatedBooking.scheduledAt,
          duration: updatedBooking.duration,
          googleMeetLink: updatedBooking.googleMeetLink,
          student: {
            name: updatedBooking.student.name,
            email: updatedBooking.student.email,
          },
          teacher: {
            name: updatedBooking.teacher.name,
            email: updatedBooking.teacher.email,
          },
          topic: {
            name: updatedBooking.topic.name,
            level: updatedBooking.topic.level,
            description: updatedBooking.topic.description,
            tema: updatedBooking.topic.tema,
            vocabulario: updatedBooking.topic.vocabulario,
          },
        });
      } catch (emailError) {
        console.error('Error sending booking confirmation emails:', emailError);
        // Don't fail the booking if email fails
      }

      return updatedBooking;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw new Error(`Failed to create booking: ${error}`);
    }
  }

  /**
   * Cancel a booking and remove the calendar event
   */
  async cancelBooking(bookingId: string, reason?: string): Promise<void> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Cancel Google Calendar event if it exists
      if (booking.googleEventId) {
        try {
          await googleCalendarService.cancelEvent(booking.googleEventId);
        } catch (error) {
          console.error('Error cancelling calendar event:', error);
          // Continue with booking cancellation even if calendar event fails
        }
      }

      // Update booking status
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
      });

      // Restore student package usage
      await this.restorePackageUsage(booking.studentId);

      // Send cancellation email notifications
      try {
        const bookingWithDetails = await prisma.booking.findUnique({
          where: { id: bookingId },
          include: {
            student: { select: { name: true, email: true } },
            teacher: { select: { name: true, email: true } },
            topic: { select: { name: true, level: true, description: true, tema: true, vocabulario: true } },
          },
        });

        if (bookingWithDetails) {
          await emailNotificationService.sendBookingCancellation({
            id: bookingWithDetails.id,
            scheduledAt: bookingWithDetails.scheduledAt,
            duration: bookingWithDetails.duration,
            googleMeetLink: bookingWithDetails.googleMeetLink,
            student: {
              name: bookingWithDetails.student.name,
              email: bookingWithDetails.student.email,
            },
            teacher: {
              name: bookingWithDetails.teacher.name,
              email: bookingWithDetails.teacher.email,
            },
            topic: {
              name: bookingWithDetails.topic.name,
              level: bookingWithDetails.topic.level,
              description: bookingWithDetails.topic.description,
              tema: bookingWithDetails.topic.tema,
              vocabulario: bookingWithDetails.topic.vocabulario,
            },
          }, 'student'); // Assuming cancelled by student for now
        }
      } catch (emailError) {
        console.error('Error sending cancellation emails:', emailError);
        // Don't fail the cancellation if email fails
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw new Error(`Failed to cancel booking: ${error}`);
    }
  }

  /**
   * Reschedule a booking
   */
  async rescheduleBooking(
    bookingId: string,
    newScheduledAt: Date
  ): Promise<BookingWithRelations> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          student: true,
          teacher: true,
          topic: true,
        },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Check if new time slot is available
      const endTime = new Date(newScheduledAt.getTime() + (booking.duration * 60 * 1000));
      const isAvailable = await googleCalendarService.isTimeSlotAvailable(
        booking.teacher.email,
        newScheduledAt,
        endTime
      );

      if (!isAvailable) {
        throw new Error('Time slot is not available');
      }

      // Update booking
      const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          scheduledAt: newScheduledAt,
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          teacher: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          topic: {
            select: {
              id: true,
              name: true,
              level: true,
              description: true,
              objectives: true,
              recursoGramatical: true,
              vocabulario: true,
              tema: true,
              classroomLink: true,
            },
          },
        },
      });

      // Update Google Calendar event
      if (booking.googleEventId) {
        try {
          await googleCalendarService.updateEvent({
            eventId: booking.googleEventId,
            booking: updatedBooking as any,
          });
        } catch (error) {
          console.error('Error updating calendar event:', error);
          // The booking is still updated, but calendar sync failed
        }
      }

      // Send reschedule email notifications
      try {
        const oldBookingData = {
          id: booking.id,
          scheduledAt: booking.scheduledAt,
          duration: booking.duration,
          googleMeetLink: booking.googleMeetLink,
          student: {
            name: booking.student.name,
            email: booking.student.email,
          },
          teacher: {
            name: booking.teacher.name,
            email: booking.teacher.email,
          },
          topic: {
            name: booking.topic.name,
            level: booking.topic.level,
            description: booking.topic.description,
            tema: booking.topic.tema,
            vocabulario: booking.topic.vocabulario,
          },
        };

        const newBookingData = {
          id: updatedBooking.id,
          scheduledAt: updatedBooking.scheduledAt,
          duration: updatedBooking.duration,
          googleMeetLink: updatedBooking.googleMeetLink,
          student: {
            name: updatedBooking.student.name,
            email: updatedBooking.student.email,
          },
          teacher: {
            name: updatedBooking.teacher.name,
            email: updatedBooking.teacher.email,
          },
          topic: {
            name: updatedBooking.topic.name,
            level: updatedBooking.topic.level,
            description: updatedBooking.topic.description,
            tema: updatedBooking.topic.tema,
            vocabulario: updatedBooking.topic.vocabulario,
          },
        };

        await emailNotificationService.sendBookingReschedule(oldBookingData, newBookingData);
      } catch (emailError) {
        console.error('Error sending reschedule emails:', emailError);
        // Don't fail the reschedule if email fails
      }

      return updatedBooking;
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      throw new Error(`Failed to reschedule booking: ${error}`);
    }
  }

  /**
   * Mark a student as present and update attendance
   */
  async markAttendance(bookingId: string, attended: boolean): Promise<void> {
    try {
      const updateData: any = {
        status: attended ? 'COMPLETED' : 'NO_SHOW',
      };

      if (attended) {
        updateData.attendedAt = new Date();
      }

      await prisma.booking.update({
        where: { id: bookingId },
        data: updateData,
      });

      // Log attendance
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: { studentId: true },
      });

      if (booking) {
        await prisma.attendanceLog.create({
          data: {
            bookingId,
            studentId: booking.studentId,
            action: attended ? 'marked_present' : 'marked_absent',
            timestamp: new Date(),
            source: 'manual',
          },
        });

        // Update student stats
        await this.updateStudentStats(booking.studentId);
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw new Error(`Failed to mark attendance: ${error}`);
    }
  }

  /**
   * Get available time slots for a teacher on a specific date
   */
  async getAvailableSlots(
    teacherId: string,
    date: Date,
    duration: number = 60
  ): Promise<AvailableSlot[]> {
    try {
      // Get teacher availability for the day
      const dayOfWeek = date.getDay();
      const availability = await prisma.availability.findMany({
        where: {
          teacherId,
          dayOfWeek,
          isActive: true,
        },
        include: {
          teacher: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      if (availability.length === 0) {
        return [];
      }

      const slots: AvailableSlot[] = [];
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Get teacher's busy times for the day
      const teacher = availability[0].teacher;
      const busyTimes = await googleCalendarService.getTeacherBusyTimes(
        teacher.email,
        startOfDay,
        endOfDay
      );

      // Get existing bookings for the day
      const existingBookings = await prisma.booking.findMany({
        where: {
          teacherId,
          scheduledAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: {
            not: 'CANCELLED',
          },
        },
      });

      // Convert busy times and bookings to time slots
      const busySlots = [
        ...busyTimes.map((busy) => ({
          start: new Date(busy.start),
          end: new Date(busy.end),
        })),
        ...existingBookings.map((booking) => ({
          start: booking.scheduledAt,
          end: new Date(booking.scheduledAt.getTime() + (booking.duration * 60 * 1000)),
        })),
      ].sort((a, b) => a.start.getTime() - b.start.getTime());

      // Generate available slots based on teacher availability
      for (const avail of availability) {
        const [startHour, startMinute] = avail.startTime.split(':').map(Number);
        const [endHour, endMinute] = avail.endTime.split(':').map(Number);

        const availStart = new Date(date);
        availStart.setHours(startHour, startMinute, 0, 0);
        const availEnd = new Date(date);
        availEnd.setHours(endHour, endMinute, 0, 0);

        // Make sure the start time is not in the past
        const now = new Date();
        if (availStart < now) {
          availStart.setTime(Math.max(availStart.getTime(), now.getTime() + (30 * 60 * 1000))); // 30 min buffer
        }

        let currentTime = new Date(availStart);

        while (currentTime.getTime() + (duration * 60 * 1000) <= availEnd.getTime()) {
          const slotEnd = new Date(currentTime.getTime() + (duration * 60 * 1000));
          
          // Check if this slot conflicts with any busy time
          const hasConflict = busySlots.some((busy) =>
            (currentTime < busy.end && slotEnd > busy.start)
          );

          if (!hasConflict) {
            slots.push({
              start: new Date(currentTime),
              end: slotEnd,
              teacherId,
              teacherName: teacher.name,
              teacherEmail: teacher.email,
            });
          }

          // Move to next 30-minute slot
          currentTime.setMinutes(currentTime.getMinutes() + 30);
        }
      }

      return slots;
    } catch (error) {
      console.error('Error getting available slots:', error);
      return [];
    }
  }

  /**
   * Get upcoming bookings for a user (student or teacher)
   */
  async getUpcomingBookings(
    userId: string,
    role: 'student' | 'teacher'
  ): Promise<BookingWithRelations[]> {
    try {
      const where = {
        [role === 'student' ? 'studentId' : 'teacherId']: userId,
        scheduledAt: {
          gte: new Date(),
        },
        status: {
          in: ['SCHEDULED'],
        },
      };

      const bookings = await prisma.booking.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          teacher: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          topic: {
            select: {
              id: true,
              name: true,
              level: true,
              description: true,
              objectives: true,
              recursoGramatical: true,
              vocabulario: true,
              tema: true,
              classroomLink: true,
            },
          },
        },
        orderBy: {
          scheduledAt: 'asc',
        },
      });

      return bookings;
    } catch (error) {
      console.error('Error getting upcoming bookings:', error);
      return [];
    }
  }

  /**
   * Update student package usage
   */
  private async updatePackageUsage(studentId: string): Promise<void> {
    try {
      const activePackage = await prisma.package.findFirst({
        where: {
          userId: studentId,
          validUntil: {
            gte: new Date(),
          },
          remainingLessons: {
            gt: 0,
          },
        },
        orderBy: {
          validUntil: 'asc',
        },
      });

      if (activePackage) {
        await prisma.package.update({
          where: { id: activePackage.id },
          data: {
            usedLessons: {
              increment: 1,
            },
            remainingLessons: {
              decrement: 1,
            },
          },
        });
      }
    } catch (error) {
      console.error('Error updating package usage:', error);
    }
  }

  /**
   * Restore student package usage (when booking is cancelled)
   */
  private async restorePackageUsage(studentId: string): Promise<void> {
    try {
      const activePackage = await prisma.package.findFirst({
        where: {
          userId: studentId,
          validUntil: {
            gte: new Date(),
          },
        },
        orderBy: {
          validUntil: 'desc',
        },
      });

      if (activePackage && activePackage.usedLessons > 0) {
        await prisma.package.update({
          where: { id: activePackage.id },
          data: {
            usedLessons: {
              decrement: 1,
            },
            remainingLessons: {
              increment: 1,
            },
          },
        });
      }
    } catch (error) {
      console.error('Error restoring package usage:', error);
    }
  }

  /**
   * Update student attendance statistics
   */
  private async updateStudentStats(studentId: string): Promise<void> {
    try {
      const totalClasses = await prisma.booking.count({
        where: {
          studentId,
          status: {
            in: ['COMPLETED', 'NO_SHOW'],
          },
        },
      });

      const attendedClasses = await prisma.booking.count({
        where: {
          studentId,
          status: 'COMPLETED',
        },
      });

      const attendanceRate = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;

      await prisma.studentStats.upsert({
        where: { studentId },
        update: {
          totalClasses,
          attendedClasses,
          attendanceRate,
          lastUpdated: new Date(),
        },
        create: {
          studentId,
          totalClasses,
          attendedClasses,
          attendanceRate,
        },
      });
    } catch (error) {
      console.error('Error updating student stats:', error);
    }
  }
}

// Singleton instance
export const meetBookingService = new MeetBookingService();