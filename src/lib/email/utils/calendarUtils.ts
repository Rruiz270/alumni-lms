import { format } from 'date-fns';

export interface BookingForCalendar {
  id: string;
  scheduledAt: Date;
  duration: number;
  googleMeetLink: string | null;
  student: {
    name: string;
    email: string;
  };
  teacher: {
    name: string;
    email: string;
  };
  topic: {
    name: string;
    level: string;
    description?: string | null;
  };
}

export class CalendarAttachment {
  /**
   * Create ICS calendar event for booking
   */
  createBookingEvent(booking: BookingForCalendar): string {
    const startDate = booking.scheduledAt;
    const endDate = new Date(startDate.getTime() + booking.duration * 60000);
    
    // Format dates for ICS (YYYYMMDDTHHMMSSZ)
    const formatICSDate = (date: Date): string => {
      return format(date, 'yyyyMMdd\'T\'HHmmss\'Z\'');
    };

    const startICS = formatICSDate(startDate);
    const endICS = formatICSDate(endDate);
    const nowICS = formatICSDate(new Date());

    // Create unique identifier
    const uid = `booking-${booking.id}@alumni-better.com`;

    // Prepare event details
    const summary = `Spanish Class: ${booking.topic.name} (${booking.topic.level})`;
    const description = this.createEventDescription(booking);
    const location = booking.googleMeetLink || 'Online via Google Meet';

    // Create attendees list
    const attendees = [
      `ATTENDEE;CN=${booking.student.name};RSVP=TRUE:mailto:${booking.student.email}`,
      `ATTENDEE;CN=${booking.teacher.name};RSVP=TRUE:mailto:${booking.teacher.email}`
    ].join('\n');

    // Generate ICS content
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Alumni by Better//Spanish Classes//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${nowICS}`,
      `DTSTART:${startICS}`,
      `DTEND:${endICS}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${this.escapeICSText(description)}`,
      `LOCATION:${this.escapeICSText(location)}`,
      `ORGANIZER;CN=Alumni by Better:mailto:${process.env.SMTP_USER}`,
      attendees,
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'PRIORITY:5',
      'CLASS:PUBLIC',
      'TRANSP:OPAQUE',
      'BEGIN:VALARM',
      'TRIGGER:-PT15M',
      'ACTION:DISPLAY',
      'DESCRIPTION:Class reminder: Your Spanish class starts in 15 minutes',
      'END:VALARM',
      'BEGIN:VALARM',
      'TRIGGER:-PT1H',
      'ACTION:EMAIL',
      `ATTENDEE:mailto:${booking.student.email}`,
      'SUMMARY:Spanish Class Reminder',
      'DESCRIPTION:Your Spanish class starts in 1 hour. Don\'t forget to join!',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    return icsContent;
  }

  /**
   * Create cancellation event
   */
  createCancellationEvent(booking: BookingForCalendar): string {
    const startDate = booking.scheduledAt;
    const endDate = new Date(startDate.getTime() + booking.duration * 60000);
    
    const formatICSDate = (date: Date): string => {
      return format(date, 'yyyyMMdd\'T\'HHmmss\'Z\'');
    };

    const startICS = formatICSDate(startDate);
    const endICS = formatICSDate(endDate);
    const nowICS = formatICSDate(new Date());

    const uid = `booking-${booking.id}@alumni-better.com`;
    const summary = `CANCELLED: Spanish Class: ${booking.topic.name} (${booking.topic.level})`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Alumni by Better//Spanish Classes//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:CANCEL',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${nowICS}`,
      `DTSTART:${startICS}`,
      `DTEND:${endICS}`,
      `SUMMARY:${summary}`,
      'STATUS:CANCELLED',
      'SEQUENCE:1',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    return icsContent;
  }

  /**
   * Create reschedule event
   */
  createRescheduleEvent(oldBooking: BookingForCalendar, newBooking: BookingForCalendar): string {
    // First cancel the old event
    const cancellation = this.createCancellationEvent(oldBooking);
    
    // Then create the new event
    const newEvent = this.createBookingEvent(newBooking);

    // Combine both in a single ICS file
    return [cancellation, newEvent].join('\n');
  }

  /**
   * Create event description with all booking details
   */
  private createEventDescription(booking: BookingForCalendar): string {
    const lines = [
      'Spanish Learning Session - Alumni by Better',
      '',
      `Topic: ${booking.topic.name}`,
      `Level: ${booking.topic.level}`,
      '',
      `Student: ${booking.student.name} (${booking.student.email})`,
      `Teacher: ${booking.teacher.name} (${booking.teacher.email})`,
      '',
      `Duration: ${booking.duration} minutes`,
    ];

    if (booking.topic.description) {
      lines.push('', `Description: ${booking.topic.description}`);
    }

    if (booking.googleMeetLink) {
      lines.push(
        '',
        'Join the meeting:',
        booking.googleMeetLink,
        '',
        'Meeting Instructions:',
        '• Join 5 minutes early to test your connection',
        '• Ensure your camera and microphone are working',
        '• Have your learning materials ready',
        '• Use headphones for better audio quality'
      );
    }

    lines.push(
      '',
      'Need help? Contact support:',
      process.env.SUPPORT_EMAIL || 'support@alumni-better.com',
      '',
      'Alumni by Better - Connecting Alumni Through Learning',
      process.env.NEXTAUTH_URL || 'https://alumni-lms.com'
    );

    return lines.join('\\n');
  }

  /**
   * Escape special characters for ICS format
   */
  private escapeICSText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '');
  }

  /**
   * Create recurring availability event for teachers
   */
  createAvailabilityEvent(
    teacherId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    timezone: string = 'UTC'
  ): string {
    const now = new Date();
    const formatICSDate = (date: Date): string => {
      return format(date, 'yyyyMMdd\'T\'HHmmss\'Z\'');
    };

    const nowICS = formatICSDate(now);
    const uid = `availability-${teacherId}-${dayOfWeek}-${startTime}@alumni-better.com`;

    // Convert day of week to ICS format (SU, MO, TU, WE, TH, FR, SA)
    const dayNames = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    const icsDay = dayNames[dayOfWeek];

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Alumni by Better//Teacher Availability//EN',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${nowICS}`,
      `DTSTART;TZID=${timezone}:${format(now, 'yyyyMMdd')}T${startTime.replace(':', '')}00`,
      `DTEND;TZID=${timezone}:${format(now, 'yyyyMMdd')}T${endTime.replace(':', '')}00`,
      'SUMMARY:Available for Spanish Classes',
      'DESCRIPTION:Available time slot for teaching Spanish classes on Alumni by Better platform.',
      `RRULE:FREQ=WEEKLY;BYDAY=${icsDay}`,
      'STATUS:CONFIRMED',
      'TRANSP:TRANSPARENT',
      'CLASS:PUBLIC',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    return icsContent;
  }

  /**
   * Create timezone definition for ICS
   */
  createTimezoneDefinition(timezone: string): string {
    // For simplicity, we'll use UTC. In a production app, you'd want to handle various timezones
    return [
      'BEGIN:VTIMEZONE',
      'TZID:UTC',
      'BEGIN:STANDARD',
      'DTSTART:20070101T000000',
      'TZOFFSETFROM:+0000',
      'TZOFFSETTO:+0000',
      'TZNAME:UTC',
      'END:STANDARD',
      'END:VTIMEZONE'
    ].join('\n');
  }
}