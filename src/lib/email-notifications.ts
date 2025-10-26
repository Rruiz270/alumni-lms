import { format } from 'date-fns';

interface BookingDetails {
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
    tema?: string | null;
    vocabulario?: string | null;
  };
}

export class EmailNotificationService {
  private transporter: any;

  constructor() {
    // Lazy load nodemailer to avoid build issues
    this.transporter = null;
  }

  private async initializeTransporter() {
    if (!this.transporter) {
      try {
        const nodemailer = await import('nodemailer');
        const config = {
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: false,
          auth: {
            user: process.env.SMTP_USER || '',
            pass: process.env.SMTP_PASS || '',
          },
        };
        this.transporter = nodemailer.default.createTransporter(config);
      } catch (error) {
        console.error('Failed to initialize email transporter:', error);
        throw new Error('Email service not available');
      }
    }
  }

  /**
   * Send booking confirmation email to student
   */
  async sendBookingConfirmation(booking: BookingDetails): Promise<void> {
    try {
      await this.initializeTransporter();
    } catch (error) {
      console.log('Email service not available, skipping notification');
      return;
    }

    const subject = `Class Confirmed: ${booking.topic.name} - ${format(booking.scheduledAt, 'MMM do, yyyy')}`;
    
    const studentHtml = this.generateBookingConfirmationTemplate(booking, 'student');
    const teacherHtml = this.generateBookingConfirmationTemplate(booking, 'teacher');

    try {
      // Send to student
      await this.transporter.sendMail({
        from: `"Alumni LMS" <${process.env.SMTP_USER}>`,
        to: booking.student.email,
        subject,
        html: studentHtml,
      });

      // Send to teacher
      await this.transporter.sendMail({
        from: `"Alumni LMS" <${process.env.SMTP_USER}>`,
        to: booking.teacher.email,
        subject: `New Student Booking: ${booking.topic.name} - ${format(booking.scheduledAt, 'MMM do, yyyy')}`,
        html: teacherHtml,
      });

      console.log(`Booking confirmation emails sent for booking ${booking.id}`);
    } catch (error) {
      console.error('Error sending booking confirmation emails:', error);
      throw error;
    }
  }

  /**
   * Send booking cancellation email
   */
  async sendBookingCancellation(booking: BookingDetails, cancelledBy: 'student' | 'teacher'): Promise<void> {
    try {
      await this.initializeTransporter();
    } catch (error) {
      console.log('Email service not available, skipping notification');
      return;
    }

    const subject = `Class Cancelled: ${booking.topic.name} - ${format(booking.scheduledAt, 'MMM do, yyyy')}`;
    
    const studentHtml = this.generateCancellationTemplate(booking, 'student', cancelledBy);
    const teacherHtml = this.generateCancellationTemplate(booking, 'teacher', cancelledBy);

    try {
      // Send to student
      await this.transporter.sendMail({
        from: `"Alumni LMS" <${process.env.SMTP_USER}>`,
        to: booking.student.email,
        subject,
        html: studentHtml,
      });

      // Send to teacher
      await this.transporter.sendMail({
        from: `"Alumni LMS" <${process.env.SMTP_USER}>`,
        to: booking.teacher.email,
        subject,
        html: teacherHtml,
      });

      console.log(`Booking cancellation emails sent for booking ${booking.id}`);
    } catch (error) {
      console.error('Error sending booking cancellation emails:', error);
      throw error;
    }
  }

  /**
   * Send class reminder email (sent 24 hours and 1 hour before class)
   */
  async sendClassReminder(booking: BookingDetails, reminderType: '24h' | '1h'): Promise<void> {
    try {
      await this.initializeTransporter();
    } catch (error) {
      console.log('Email service not available, skipping notification');
      return;
    }

    const timeLabel = reminderType === '24h' ? '24 hours' : '1 hour';
    const subject = `Reminder: Your class with ${booking.teacher.name} starts in ${timeLabel}`;
    
    const html = this.generateReminderTemplate(booking, reminderType);

    try {
      // Send to student
      await this.transporter.sendMail({
        from: `"Alumni LMS" <${process.env.SMTP_USER}>`,
        to: booking.student.email,
        subject,
        html,
      });

      // Send to teacher (only for 1h reminder)
      if (reminderType === '1h') {
        await this.transporter.sendMail({
          from: `"Alumni LMS" <${process.env.SMTP_USER}>`,
          to: booking.teacher.email,
          subject: `Reminder: Class with ${booking.student.name} starts in 1 hour`,
          html: this.generateTeacherReminderTemplate(booking),
        });
      }

      console.log(`${timeLabel} reminder emails sent for booking ${booking.id}`);
    } catch (error) {
      console.error(`Error sending ${timeLabel} reminder emails:`, error);
      throw error;
    }
  }

  /**
   * Send booking reschedule notification
   */
  async sendBookingReschedule(
    oldBooking: BookingDetails,
    newBooking: BookingDetails
  ): Promise<void> {
    try {
      await this.initializeTransporter();
    } catch (error) {
      console.log('Email service not available, skipping notification');
      return;
    }

    const subject = `Class Rescheduled: ${newBooking.topic.name}`;
    
    const studentHtml = this.generateRescheduleTemplate(oldBooking, newBooking, 'student');
    const teacherHtml = this.generateRescheduleTemplate(oldBooking, newBooking, 'teacher');

    try {
      // Send to student
      await this.transporter.sendMail({
        from: `"Alumni LMS" <${process.env.SMTP_USER}>`,
        to: newBooking.student.email,
        subject,
        html: studentHtml,
      });

      // Send to teacher
      await this.transporter.sendMail({
        from: `"Alumni LMS" <${process.env.SMTP_USER}>`,
        to: newBooking.teacher.email,
        subject,
        html: teacherHtml,
      });

      console.log(`Booking reschedule emails sent for booking ${newBooking.id}`);
    } catch (error) {
      console.error('Error sending booking reschedule emails:', error);
      throw error;
    }
  }

  /**
   * Generate booking confirmation email template
   */
  private generateBookingConfirmationTemplate(booking: BookingDetails, recipient: 'student' | 'teacher'): string {
    const isStudent = recipient === 'student';
    const recipientName = isStudent ? booking.student.name : booking.teacher.name;
    const otherParty = isStudent ? booking.teacher : booking.student;
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Class Booking Confirmed</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9fafb; padding: 20px; }
            .details { background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .button { display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎓 Class Booking Confirmed!</h1>
            </div>
            
            <div class="content">
                <h2>Hello ${recipientName}!</h2>
                
                <p>${isStudent ? 'Your live Spanish class has been confirmed!' : 'You have a new student booking!'}</p>
                
                <div class="details">
                    <h3>📚 Class Details</h3>
                    <p><strong>Topic:</strong> ${booking.topic.name}</p>
                    <p><strong>Level:</strong> ${booking.topic.level}</p>
                    ${booking.topic.tema ? `<p><strong>Theme:</strong> ${booking.topic.tema}</p>` : ''}
                    ${booking.topic.vocabulario ? `<p><strong>Vocabulary:</strong> ${booking.topic.vocabulario}</p>` : ''}
                    ${booking.topic.description ? `<p><strong>Description:</strong> ${booking.topic.description}</p>` : ''}
                </div>
                
                <div class="details">
                    <h3>🕒 Schedule</h3>
                    <p><strong>Date:</strong> ${format(booking.scheduledAt, 'EEEE, MMMM do, yyyy')}</p>
                    <p><strong>Time:</strong> ${format(booking.scheduledAt, 'HH:mm')} - ${format(new Date(booking.scheduledAt.getTime() + booking.duration * 60000), 'HH:mm')} (${Intl.DateTimeFormat().resolvedOptions().timeZone})</p>
                    <p><strong>Duration:</strong> ${booking.duration} minutes</p>
                </div>
                
                <div class="details">
                    <h3>👥 Participants</h3>
                    <p><strong>${isStudent ? 'Teacher' : 'Student'}:</strong> ${otherParty.name} (${otherParty.email})</p>
                </div>
                
                ${booking.googleMeetLink ? `
                <div class="details">
                    <h3>📹 Join the Class</h3>
                    <p>Click the button below to join your Google Meet class:</p>
                    <a href="${booking.googleMeetLink}" class="button">Join Google Meet</a>
                    <p><small>Link: ${booking.googleMeetLink}</small></p>
                </div>
                ` : ''}
                
                <div class="details">
                    <h3>💡 Important Notes</h3>
                    <ul>
                        <li>Please join the meeting 5 minutes before the scheduled time</li>
                        <li>Make sure you have a stable internet connection</li>
                        <li>Test your camera and microphone beforehand</li>
                        <li>Have your learning materials ready</li>
                        ${isStudent ? '<li>If you need to cancel, please do so at least 24 hours in advance</li>' : '<li>Please prepare the lesson materials for this topic</li>'}
                    </ul>
                </div>
            </div>
            
            <div class="footer">
                <p>This booking has been automatically added to your Google Calendar.</p>
                <p>Alumni LMS - Connecting Alumni Through Learning</p>
                <p>Visit: ${process.env.NEXTAUTH_URL || 'https://alumni-lms.com'}</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Generate cancellation email template
   */
  private generateCancellationTemplate(
    booking: BookingDetails,
    recipient: 'student' | 'teacher',
    cancelledBy: 'student' | 'teacher'
  ): string {
    const isStudent = recipient === 'student';
    const recipientName = isStudent ? booking.student.name : booking.teacher.name;
    const cancelledByText = cancelledBy === 'student' ? 'the student' : 'the teacher';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Class Booking Cancelled</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9fafb; padding: 20px; }
            .details { background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>❌ Class Booking Cancelled</h1>
            </div>
            
            <div class="content">
                <h2>Hello ${recipientName},</h2>
                
                <p>The following class booking has been cancelled by ${cancelledByText}:</p>
                
                <div class="details">
                    <h3>📚 Cancelled Class</h3>
                    <p><strong>Topic:</strong> ${booking.topic.name}</p>
                    <p><strong>Level:</strong> ${booking.topic.level}</p>
                    <p><strong>Date:</strong> ${format(booking.scheduledAt, 'EEEE, MMMM do, yyyy')}</p>
                    <p><strong>Time:</strong> ${format(booking.scheduledAt, 'HH:mm')} - ${format(new Date(booking.scheduledAt.getTime() + booking.duration * 60000), 'HH:mm')}</p>
                </div>
                
                ${isStudent && cancelledBy === 'student' ? `
                <div class="details">
                    <h3>💳 Lesson Credit</h3>
                    <p>Your lesson credit has been restored to your account and can be used to book another class.</p>
                </div>
                ` : ''}
                
                <div class="details">
                    <h3>📅 What's Next?</h3>
                    <p>${isStudent ? 'You can book a new class anytime from your dashboard.' : 'The time slot is now available for other bookings.'}</p>
                </div>
            </div>
            
            <div class="footer">
                <p>The Google Calendar event has been automatically cancelled.</p>
                <p>Alumni LMS - Connecting Alumni Through Learning</p>
                <p>Visit: ${process.env.NEXTAUTH_URL || 'https://alumni-lms.com'}</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Generate reminder email template
   */
  private generateReminderTemplate(booking: BookingDetails, reminderType: '24h' | '1h'): string {
    const timeLabel = reminderType === '24h' ? '24 hours' : '1 hour';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Class Reminder</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #059669; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9fafb; padding: 20px; }
            .details { background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .button { display: inline-block; background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .urgent { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>⏰ Class Reminder</h1>
            </div>
            
            <div class="content">
                <h2>Hello ${booking.student.name}!</h2>
                
                ${reminderType === '1h' ? `
                <div class="urgent">
                    <h3>🚨 Your class starts in 1 hour!</h3>
                    <p>Don't forget about your upcoming Spanish class. Please join a few minutes early to test your connection.</p>
                </div>
                ` : `
                <p>This is a friendly reminder that you have a Spanish class scheduled for tomorrow.</p>
                `}
                
                <div class="details">
                    <h3>📚 Class Details</h3>
                    <p><strong>Topic:</strong> ${booking.topic.name}</p>
                    <p><strong>Level:</strong> ${booking.topic.level}</p>
                    <p><strong>Teacher:</strong> ${booking.teacher.name}</p>
                    <p><strong>Date:</strong> ${format(booking.scheduledAt, 'EEEE, MMMM do, yyyy')}</p>
                    <p><strong>Time:</strong> ${format(booking.scheduledAt, 'HH:mm')} - ${format(new Date(booking.scheduledAt.getTime() + booking.duration * 60000), 'HH:mm')}</p>
                </div>
                
                ${booking.googleMeetLink && reminderType === '1h' ? `
                <div class="details">
                    <h3>📹 Join Your Class</h3>
                    <a href="${booking.googleMeetLink}" class="button">Join Google Meet Now</a>
                </div>
                ` : ''}
                
                <div class="details">
                    <h3>✅ Pre-Class Checklist</h3>
                    <ul>
                        <li>Test your camera and microphone</li>
                        <li>Ensure stable internet connection</li>
                        <li>Prepare notebook and pen</li>
                        <li>Review previous lesson notes (if any)</li>
                        <li>Join 5 minutes early</li>
                    </ul>
                </div>
            </div>
            
            <div class="footer">
                <p>Looking forward to your class!</p>
                <p>Alumni LMS - Connecting Alumni Through Learning</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Generate teacher reminder template
   */
  private generateTeacherReminderTemplate(booking: BookingDetails): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Class Starting Soon</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #7c3aed; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9fafb; padding: 20px; }
            .details { background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .button { display: inline-block; background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>👨‍🏫 Class Starting Soon</h1>
            </div>
            
            <div class="content">
                <h2>Hello ${booking.teacher.name}!</h2>
                
                <p>Your class with ${booking.student.name} starts in 1 hour.</p>
                
                <div class="details">
                    <h3>📚 Class Information</h3>
                    <p><strong>Student:</strong> ${booking.student.name} (${booking.student.email})</p>
                    <p><strong>Topic:</strong> ${booking.topic.name}</p>
                    <p><strong>Level:</strong> ${booking.topic.level}</p>
                    <p><strong>Time:</strong> ${format(booking.scheduledAt, 'HH:mm')} - ${format(new Date(booking.scheduledAt.getTime() + booking.duration * 60000), 'HH:mm')}</p>
                </div>
                
                ${booking.googleMeetLink ? `
                <div class="details">
                    <h3>📹 Join Your Class</h3>
                    <a href="${booking.googleMeetLink}" class="button">Join Google Meet</a>
                </div>
                ` : ''}
                
                <div class="details">
                    <h3>📝 Class Preparation</h3>
                    <ul>
                        <li>Review the lesson plan for ${booking.topic.name}</li>
                        <li>Prepare materials and resources</li>
                        <li>Join the meeting a few minutes early</li>
                        <li>Have backup activities ready</li>
                    </ul>
                </div>
            </div>
            
            <div class="footer">
                <p>Good luck with your class!</p>
                <p>Alumni LMS - Connecting Alumni Through Learning</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Generate reschedule email template
   */
  private generateRescheduleTemplate(
    oldBooking: BookingDetails,
    newBooking: BookingDetails,
    recipient: 'student' | 'teacher'
  ): string {
    const isStudent = recipient === 'student';
    const recipientName = isStudent ? newBooking.student.name : newBooking.teacher.name;
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Class Rescheduled</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #0891b2; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9fafb; padding: 20px; }
            .details { background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .old-time { text-decoration: line-through; color: #666; }
            .new-time { color: #059669; font-weight: bold; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📅 Class Rescheduled</h1>
            </div>
            
            <div class="content">
                <h2>Hello ${recipientName}!</h2>
                
                <p>Your class has been rescheduled to a new time.</p>
                
                <div class="details">
                    <h3>📚 Class Details</h3>
                    <p><strong>Topic:</strong> ${newBooking.topic.name}</p>
                    <p><strong>Level:</strong> ${newBooking.topic.level}</p>
                </div>
                
                <div class="details">
                    <h3>🕒 Schedule Change</h3>
                    <p><strong>Previous Time:</strong></p>
                    <p class="old-time">${format(oldBooking.scheduledAt, 'EEEE, MMMM do, yyyy')} at ${format(oldBooking.scheduledAt, 'HH:mm')}</p>
                    
                    <p><strong>New Time:</strong></p>
                    <p class="new-time">${format(newBooking.scheduledAt, 'EEEE, MMMM do, yyyy')} at ${format(newBooking.scheduledAt, 'HH:mm')} - ${format(new Date(newBooking.scheduledAt.getTime() + newBooking.duration * 60000), 'HH:mm')}</p>
                </div>
                
                ${newBooking.googleMeetLink ? `
                <div class="details">
                    <h3>📹 Meet Link</h3>
                    <p>The Google Meet link remains the same:</p>
                    <p><a href="${newBooking.googleMeetLink}">${newBooking.googleMeetLink}</a></p>
                </div>
                ` : ''}
            </div>
            
            <div class="footer">
                <p>Your Google Calendar has been automatically updated.</p>
                <p>Alumni LMS - Connecting Alumni Through Learning</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }
}

// Singleton instance
export const emailNotificationService = new EmailNotificationService();