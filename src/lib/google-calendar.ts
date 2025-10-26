import { google } from 'googleapis';
import { prisma } from './prisma';
import { User, Booking, Topic } from '@prisma/client';

export interface CalendarEvent {
  id: string;
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees: Array<{
    email: string;
    displayName?: string;
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  }>;
  conferenceData?: {
    createRequest: {
      requestId: string;
      conferenceSolutionKey: {
        type: 'hangoutsMeet';
      };
    };
  };
  reminders: {
    useDefault: false;
    overrides: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
  visibility: 'default' | 'public' | 'private';
  guestsCanModify: boolean;
  guestsCanInviteOthers: boolean;
  guestsCanSeeOtherGuests: boolean;
}

export interface CreateEventParams {
  booking: Booking & {
    student: User;
    teacher: User;
    topic: Topic;
  };
  timeZone?: string;
}

export interface UpdateEventParams {
  eventId: string;
  booking: Booking & {
    student: User;
    teacher: User;
    topic: Topic;
  };
  timeZone?: string;
}

export class GoogleCalendarService {
  private calendar;
  private auth;

  constructor() {
    this.auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}'),
      scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
      ],
    });
    this.calendar = google.calendar({ version: 'v3', auth: this.auth });
  }

  /**
   * Create a new calendar event with Google Meet link
   */
  async createEvent({ booking, timeZone = 'America/Sao_Paulo' }: CreateEventParams): Promise<{
    eventId: string;
    meetLink: string;
    htmlLink: string;
  }> {
    try {
      const startTime = new Date(booking.scheduledAt);
      const endTime = new Date(startTime.getTime() + (booking.duration * 60 * 1000));

      const event: CalendarEvent = {
        id: `alumni-lms-${booking.id}`,
        summary: `Live Class: ${booking.topic.name} (${booking.topic.level})`,
        description: this.buildEventDescription(booking),
        start: {
          dateTime: startTime.toISOString(),
          timeZone,
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone,
        },
        attendees: [
          {
            email: booking.student.email,
            displayName: booking.student.name,
            responseStatus: 'needsAction',
          },
          {
            email: booking.teacher.email,
            displayName: booking.teacher.name,
            responseStatus: 'accepted',
          },
        ],
        conferenceData: {
          createRequest: {
            requestId: `alumni-lms-${booking.id}-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 60 },
            { method: 'email', minutes: 15 },
            { method: 'popup', minutes: 10 },
          ],
        },
        visibility: 'private',
        guestsCanModify: false,
        guestsCanInviteOthers: false,
        guestsCanSeeOtherGuests: true,
      };

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
        conferenceDataVersion: 1,
        sendUpdates: 'all',
      });

      const createdEvent = response.data;
      const meetLink = createdEvent.conferenceData?.entryPoints?.find(
        (entry) => entry.entryPointType === 'video'
      )?.uri || '';

      // Update booking with event details
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          googleEventId: createdEvent.id!,
          googleMeetLink: meetLink,
        },
      });

      return {
        eventId: createdEvent.id!,
        meetLink,
        htmlLink: createdEvent.htmlLink || '',
      };
    } catch (error) {
      console.error('Error creating Google Calendar event:', error);
      throw new Error(`Failed to create calendar event: ${error}`);
    }
  }

  /**
   * Update an existing calendar event
   */
  async updateEvent({ eventId, booking, timeZone = 'America/Sao_Paulo' }: UpdateEventParams): Promise<{
    eventId: string;
    meetLink: string;
    htmlLink: string;
  }> {
    try {
      const startTime = new Date(booking.scheduledAt);
      const endTime = new Date(startTime.getTime() + (booking.duration * 60 * 1000));

      const event: Partial<CalendarEvent> = {
        summary: `Live Class: ${booking.topic.name} (${booking.topic.level})`,
        description: this.buildEventDescription(booking),
        start: {
          dateTime: startTime.toISOString(),
          timeZone,
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone,
        },
        attendees: [
          {
            email: booking.student.email,
            displayName: booking.student.name,
            responseStatus: 'needsAction',
          },
          {
            email: booking.teacher.email,
            displayName: booking.teacher.name,
            responseStatus: 'accepted',
          },
        ],
      };

      const response = await this.calendar.events.update({
        calendarId: 'primary',
        eventId,
        requestBody: event,
        sendUpdates: 'all',
      });

      const updatedEvent = response.data;
      const meetLink = updatedEvent.conferenceData?.entryPoints?.find(
        (entry) => entry.entryPointType === 'video'
      )?.uri || booking.googleMeetLink || '';

      return {
        eventId: updatedEvent.id!,
        meetLink,
        htmlLink: updatedEvent.htmlLink || '',
      };
    } catch (error) {
      console.error('Error updating Google Calendar event:', error);
      throw new Error(`Failed to update calendar event: ${error}`);
    }
  }

  /**
   * Cancel a calendar event
   */
  async cancelEvent(eventId: string): Promise<void> {
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId,
        sendUpdates: 'all',
      });
    } catch (error) {
      console.error('Error cancelling Google Calendar event:', error);
      throw new Error(`Failed to cancel calendar event: ${error}`);
    }
  }

  /**
   * Get calendar event details
   */
  async getEvent(eventId: string) {
    try {
      const response = await this.calendar.events.get({
        calendarId: 'primary',
        eventId,
      });
      return response.data;
    } catch (error) {
      console.error('Error getting Google Calendar event:', error);
      throw new Error(`Failed to get calendar event: ${error}`);
    }
  }

  /**
   * Check if a time slot is available for a teacher
   */
  async isTimeSlotAvailable(
    teacherEmail: string,
    startTime: Date,
    endTime: Date
  ): Promise<boolean> {
    try {
      const response = await this.calendar.freebusy.query({
        requestBody: {
          timeMin: startTime.toISOString(),
          timeMax: endTime.toISOString(),
          items: [{ id: teacherEmail }],
        },
      });

      const busyTimes = response.data.calendars?.[teacherEmail]?.busy || [];
      return busyTimes.length === 0;
    } catch (error) {
      console.error('Error checking time slot availability:', error);
      return false; // Assume not available if we can't check
    }
  }

  /**
   * Get teacher's busy times for a specific date range
   */
  async getTeacherBusyTimes(
    teacherEmail: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ start: string; end: string }>> {
    try {
      const response = await this.calendar.freebusy.query({
        requestBody: {
          timeMin: startDate.toISOString(),
          timeMax: endDate.toISOString(),
          items: [{ id: teacherEmail }],
        },
      });

      const busyTimes = response.data.calendars?.[teacherEmail]?.busy || [];
      return busyTimes.map((busy) => ({
        start: busy.start!,
        end: busy.end!,
      }));
    } catch (error) {
      console.error('Error getting teacher busy times:', error);
      return [];
    }
  }

  /**
   * Build event description with class details
   */
  private buildEventDescription(booking: Booking & {
    student: User;
    teacher: User;
    topic: Topic;
  }): string {
    const description = [
      `🎓 Alumni LMS Live Class`,
      ``,
      `📚 Topic: ${booking.topic.name}`,
      `📊 Level: ${booking.topic.level}`,
      `👨‍🎓 Student: ${booking.student.name} (${booking.student.email})`,
      `👨‍🏫 Teacher: ${booking.teacher.name} (${booking.teacher.email})`,
      `⏱️ Duration: ${booking.duration} minutes`,
      ``,
      `📋 Class Objectives:`,
    ];

    // Add topic objectives if available
    if (booking.topic.objectives && Array.isArray(booking.topic.objectives)) {
      booking.topic.objectives.forEach((objective: string, index: number) => {
        description.push(`${index + 1}. ${objective}`);
      });
    }

    // Add topic description if available
    if (booking.topic.description) {
      description.push(``, `📖 Description:`, booking.topic.description);
    }

    // Add Spanish-specific content if available
    if (booking.topic.recursoGramatical) {
      description.push(``, `📝 Grammar Resource: ${booking.topic.recursoGramatical}`);
    }

    if (booking.topic.vocabulario) {
      description.push(`🔤 Vocabulary Theme: ${booking.topic.vocabulario}`);
    }

    if (booking.topic.tema) {
      description.push(`🎯 Theme: ${booking.topic.tema}`);
    }

    if (booking.topic.classroomLink) {
      description.push(``, `📊 Presentation: ${booking.topic.classroomLink}`);
    }

    description.push(
      ``,
      `💡 Instructions:`,
      `1. Join the Google Meet link 5 minutes before the scheduled time`,
      `2. Make sure you have a stable internet connection`,
      `3. Have your materials ready (notebook, pen, etc.)`,
      `4. Test your camera and microphone beforehand`,
      ``,
      `📱 Platform: Alumni LMS`,
      `🌐 Visit: ${process.env.NEXTAUTH_URL || 'https://alumni-lms.com'}`
    );

    return description.join('\n');
  }
}

// Singleton instance
export const googleCalendarService = new GoogleCalendarService();