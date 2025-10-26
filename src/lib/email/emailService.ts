import nodemailer from 'nodemailer';
import { db } from '../prisma';
import { EmailTemplate } from './templates/types';
import { WelcomeTemplate } from './templates/WelcomeTemplate';
import { BookingConfirmationTemplate } from './templates/BookingConfirmationTemplate';
import { ClassReminderTemplate } from './templates/ClassReminderTemplate';
import { CancellationTemplate } from './templates/CancellationTemplate';
import { ProgressReportTemplate } from './templates/ProgressReportTemplate';
import { WeeklySummaryTemplate } from './templates/WeeklySummaryTemplate';
import { PasswordResetTemplate } from './templates/PasswordResetTemplate';
import { CourseCompletionTemplate } from './templates/CourseCompletionTemplate';
import { EngagementTemplate } from './templates/EngagementTemplate';
import { CalendarAttachment } from './utils/calendarUtils';
import { EmailAnalytics } from './analytics/EmailAnalytics';
import { EmailQueue } from './queue/EmailQueue';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EmailOptions {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
  trackingId?: string;
  language?: 'en' | 'es';
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  role?: string;
  level?: string;
  preferredLanguage?: 'en' | 'es';
}

export interface BookingData {
  id: string;
  scheduledAt: Date;
  duration: number;
  googleMeetLink: string | null;
  student: UserData;
  teacher: UserData;
  topic: {
    id: string;
    name: string;
    level: string;
    description?: string | null;
    tema?: string | null;
    vocabulario?: string | null;
  };
}

export interface ProgressData {
  student: UserData;
  completedTopics: number;
  totalTopics: number;
  currentLevel: string;
  recentActivities: Array<{
    type: string;
    topic: string;
    completedAt: Date;
    score?: number;
  }>;
  weeklyStats: {
    classesAttended: number;
    exercisesCompleted: number;
    studyTime: number; // in minutes
  };
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private analytics: EmailAnalytics;
  private queue: EmailQueue;
  private defaultLanguage: 'en' | 'es' = 'es';

  constructor() {
    this.initializeTransporter();
    this.analytics = new EmailAnalytics();
    this.queue = new EmailQueue();
  }

  private initializeTransporter() {
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    };

    this.transporter = nodemailer.createTransporter(config);
  }

  /**
   * Send email with tracking and analytics
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const trackingId = options.trackingId || this.generateTrackingId();
      
      // Add tracking pixel and unsubscribe link to HTML
      const enhancedHtml = this.addTrackingElements(options.html, trackingId, options.to as string);

      const mailOptions = {
        from: `"Alumni by Better" <${process.env.SMTP_USER}>`,
        to: options.to,
        cc: options.cc,
        bcc: options.bcc,
        subject: options.subject,
        html: enhancedHtml,
        text: options.text,
        attachments: options.attachments,
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      // Track email send
      await this.analytics.trackEmailSent({
        trackingId,
        recipient: Array.isArray(options.to) ? options.to[0] : options.to,
        subject: options.subject,
        template: this.extractTemplateFromSubject(options.subject),
        language: options.language || this.defaultLanguage,
      });

      console.log(`Email sent successfully: ${result.messageId}`);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      
      // Track email failure
      await this.analytics.trackEmailFailed({
        recipient: Array.isArray(options.to) ? options.to[0] : options.to,
        subject: options.subject,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      return false;
    }
  }

  /**
   * Queue email for bulk sending
   */
  async queueEmail(options: EmailOptions, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<void> {
    await this.queue.add({
      type: 'send_email',
      data: options,
      priority,
    });
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(user: UserData): Promise<boolean> {
    const template = new WelcomeTemplate();
    const language = user.preferredLanguage || this.defaultLanguage;
    
    const html = template.render({
      user,
      language,
      dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard`,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@alumni-better.com',
    });

    return this.sendEmail({
      to: user.email,
      subject: template.getSubject(language),
      html,
      trackingId: this.generateTrackingId(),
      language,
    });
  }

  /**
   * Send booking confirmation email
   */
  async sendBookingConfirmation(booking: BookingData): Promise<boolean> {
    const template = new BookingConfirmationTemplate();
    const language = booking.student.preferredLanguage || this.defaultLanguage;
    
    // Create calendar attachment
    const calendarAttachment = new CalendarAttachment();
    const icsContent = calendarAttachment.createBookingEvent(booking);
    
    const studentHtml = template.render({
      booking,
      recipient: 'student',
      language,
    });
    
    const teacherHtml = template.render({
      booking,
      recipient: 'teacher',
      language,
    });

    // Send to student
    const studentResult = await this.sendEmail({
      to: booking.student.email,
      subject: template.getSubject(language, 'student'),
      html: studentHtml,
      attachments: [{
        filename: 'class-booking.ics',
        content: icsContent,
        contentType: 'text/calendar',
      }],
      trackingId: this.generateTrackingId(),
      language,
    });

    // Send to teacher
    const teacherResult = await this.sendEmail({
      to: booking.teacher.email,
      subject: template.getSubject(language, 'teacher'),
      html: teacherHtml,
      attachments: [{
        filename: 'class-booking.ics',
        content: icsContent,
        contentType: 'text/calendar',
      }],
      trackingId: this.generateTrackingId(),
      language,
    });

    return studentResult && teacherResult;
  }

  /**
   * Send class reminder email
   */
  async sendClassReminder(booking: BookingData, reminderType: '24h' | '1h'): Promise<boolean> {
    const template = new ClassReminderTemplate();
    const language = booking.student.preferredLanguage || this.defaultLanguage;
    
    const studentHtml = template.render({
      booking,
      reminderType,
      recipient: 'student',
      language,
    });

    const studentResult = await this.sendEmail({
      to: booking.student.email,
      subject: template.getSubject(language, reminderType),
      html: studentHtml,
      trackingId: this.generateTrackingId(),
      language,
    });

    // Send to teacher only for 1h reminder
    if (reminderType === '1h') {
      const teacherHtml = template.render({
        booking,
        reminderType,
        recipient: 'teacher',
        language,
      });

      const teacherResult = await this.sendEmail({
        to: booking.teacher.email,
        subject: template.getTeacherSubject(language),
        html: teacherHtml,
        trackingId: this.generateTrackingId(),
        language,
      });

      return studentResult && teacherResult;
    }

    return studentResult;
  }

  /**
   * Send cancellation email
   */
  async sendCancellationEmail(
    booking: BookingData,
    cancelledBy: 'student' | 'teacher',
    reason?: string
  ): Promise<boolean> {
    const template = new CancellationTemplate();
    const language = booking.student.preferredLanguage || this.defaultLanguage;
    
    const studentHtml = template.render({
      booking,
      cancelledBy,
      reason,
      recipient: 'student',
      language,
    });
    
    const teacherHtml = template.render({
      booking,
      cancelledBy,
      reason,
      recipient: 'teacher',
      language,
    });

    const studentResult = await this.sendEmail({
      to: booking.student.email,
      subject: template.getSubject(language),
      html: studentHtml,
      trackingId: this.generateTrackingId(),
      language,
    });

    const teacherResult = await this.sendEmail({
      to: booking.teacher.email,
      subject: template.getSubject(language),
      html: teacherHtml,
      trackingId: this.generateTrackingId(),
      language,
    });

    return studentResult && teacherResult;
  }

  /**
   * Send progress report email
   */
  async sendProgressReport(progressData: ProgressData): Promise<boolean> {
    const template = new ProgressReportTemplate();
    const language = progressData.student.preferredLanguage || this.defaultLanguage;
    
    const html = template.render({
      progressData,
      language,
      dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard/progress`,
    });

    return this.sendEmail({
      to: progressData.student.email,
      subject: template.getSubject(language),
      html,
      trackingId: this.generateTrackingId(),
      language,
    });
  }

  /**
   * Send weekly summary to teacher
   */
  async sendWeeklySummary(
    teacher: UserData,
    weeklyData: {
      totalClasses: number;
      totalStudents: number;
      upcomingClasses: BookingData[];
      studentProgress: Array<{
        student: UserData;
        progress: number;
        lastActivity: Date;
      }>;
    }
  ): Promise<boolean> {
    const template = new WeeklySummaryTemplate();
    const language = teacher.preferredLanguage || this.defaultLanguage;
    
    const html = template.render({
      teacher,
      weeklyData,
      language,
      dashboardUrl: `${process.env.NEXTAUTH_URL}/teacher/dashboard`,
    });

    return this.sendEmail({
      to: teacher.email,
      subject: template.getSubject(language),
      html,
      trackingId: this.generateTrackingId(),
      language,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(user: UserData, resetToken: string): Promise<boolean> {
    const template = new PasswordResetTemplate();
    const language = user.preferredLanguage || this.defaultLanguage;
    
    const html = template.render({
      user,
      resetUrl: `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`,
      language,
      expiryTime: '1 hora', // 1 hour
    });

    return this.sendEmail({
      to: user.email,
      subject: template.getSubject(language),
      html,
      trackingId: this.generateTrackingId(),
      language,
    });
  }

  /**
   * Send course completion certificate
   */
  async sendCourseCompletion(
    user: UserData,
    courseData: {
      courseName: string;
      level: string;
      completedAt: Date;
      certificateUrl: string;
    }
  ): Promise<boolean> {
    const template = new CourseCompletionTemplate();
    const language = user.preferredLanguage || this.defaultLanguage;
    
    const html = template.render({
      user,
      courseData,
      language,
      dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard/certificates`,
    });

    return this.sendEmail({
      to: user.email,
      subject: template.getSubject(language),
      html,
      trackingId: this.generateTrackingId(),
      language,
    });
  }

  /**
   * Send engagement email for inactive users
   */
  async sendEngagementEmail(
    user: UserData,
    inactiveDays: number,
    suggestions: string[]
  ): Promise<boolean> {
    const template = new EngagementTemplate();
    const language = user.preferredLanguage || this.defaultLanguage;
    
    const html = template.render({
      user,
      inactiveDays,
      suggestions,
      language,
      dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard`,
      scheduleUrl: `${process.env.NEXTAUTH_URL}/schedule`,
    });

    return this.sendEmail({
      to: user.email,
      subject: template.getSubject(language),
      html,
      trackingId: this.generateTrackingId(),
      language,
    });
  }

  /**
   * Send bulk emails with queue
   */
  async sendBulkEmails(
    emails: Array<{
      to: string;
      templateData: any;
      template: EmailTemplate;
      language?: 'en' | 'es';
    }>,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<void> {
    for (const email of emails) {
      const language = email.language || this.defaultLanguage;
      const html = email.template.render({
        ...email.templateData,
        language,
      });

      await this.queueEmail({
        to: email.to,
        subject: email.template.getSubject(language),
        html,
        trackingId: this.generateTrackingId(),
        language,
      }, priority);
    }
  }

  /**
   * Track email open
   */
  async trackEmailOpen(trackingId: string): Promise<void> {
    await this.analytics.trackEmailOpened(trackingId);
  }

  /**
   * Track email click
   */
  async trackEmailClick(trackingId: string, url: string): Promise<void> {
    await this.analytics.trackEmailClicked(trackingId, url);
  }

  /**
   * Get email analytics
   */
  async getEmailAnalytics(startDate: Date, endDate: Date): Promise<any> {
    return this.analytics.getAnalytics(startDate, endDate);
  }

  /**
   * Generate unique tracking ID
   */
  private generateTrackingId(): string {
    return `email_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Add tracking elements to HTML
   */
  private addTrackingElements(html: string, trackingId: string, recipient: string): string {
    const trackingPixel = `<img src="${process.env.NEXTAUTH_URL}/api/email/track/open/${trackingId}" width="1" height="1" style="display: none;" alt="" />`;
    const unsubscribeLink = `<p style="text-align: center; margin-top: 30px; font-size: 12px; color: #666;">
      <a href="${process.env.NEXTAUTH_URL}/api/email/unsubscribe?email=${encodeURIComponent(recipient)}&tracking=${trackingId}" style="color: #666; text-decoration: underline;">
        Cancelar suscripción
      </a> | 
      <a href="${process.env.NEXTAUTH_URL}/api/email/preferences?email=${encodeURIComponent(recipient)}" style="color: #666; text-decoration: underline;">
        Preferencias de email
      </a>
    </p>`;

    // Add tracking pixel before closing body tag
    let enhancedHtml = html.replace('</body>', `${trackingPixel}</body>`);
    
    // Add unsubscribe link before closing body tag
    enhancedHtml = enhancedHtml.replace('</body>', `${unsubscribeLink}</body>`);
    
    // Convert all links to tracked links
    enhancedHtml = enhancedHtml.replace(
      /href="([^"]+)"/g,
      `href="${process.env.NEXTAUTH_URL}/api/email/track/click/${trackingId}?url=$1"`
    );

    return enhancedHtml;
  }

  /**
   * Extract template name from subject for analytics
   */
  private extractTemplateFromSubject(subject: string): string {
    if (subject.includes('Bienvenido') || subject.includes('Welcome')) return 'welcome';
    if (subject.includes('Confirmación') || subject.includes('Confirmed')) return 'booking_confirmation';
    if (subject.includes('Recordatorio') || subject.includes('Reminder')) return 'class_reminder';
    if (subject.includes('Cancelada') || subject.includes('Cancelled')) return 'cancellation';
    if (subject.includes('Progreso') || subject.includes('Progress')) return 'progress_report';
    if (subject.includes('Resumen') || subject.includes('Summary')) return 'weekly_summary';
    if (subject.includes('Restablecer') || subject.includes('Reset')) return 'password_reset';
    if (subject.includes('Certificado') || subject.includes('Certificate')) return 'course_completion';
    if (subject.includes('¡Te extrañamos!') || subject.includes('We miss you')) return 'engagement';
    return 'unknown';
  }

  /**
   * Test email configuration
   */
  async testEmailConfiguration(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('Email configuration is valid');
      return true;
    } catch (error) {
      console.error('Email configuration test failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const emailService = new EmailService();