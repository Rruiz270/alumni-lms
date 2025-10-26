import { emailService, UserData, BookingData, ProgressData } from '../emailService';
import { EmailQueue } from '../queue/EmailQueue';
import { db } from '../../prisma';
import { addDays, addHours, addMinutes, format, subDays } from 'date-fns';

export interface WorkflowConfig {
  enabled: boolean;
  sendWelcomeEmail: boolean;
  sendBookingConfirmations: boolean;
  sendReminders: boolean;
  sendProgressReports: boolean;
  sendEngagementEmails: boolean;
  reminderTimes: {
    before24h: boolean;
    before1h: boolean;
  };
  progressReportFrequency: 'weekly' | 'monthly';
  engagementCheckDays: number;
}

export class EmailWorkflows {
  private queue: EmailQueue;
  private config: WorkflowConfig;

  constructor(config: Partial<WorkflowConfig> = {}) {
    this.queue = new EmailQueue();
    this.config = {
      enabled: true,
      sendWelcomeEmail: true,
      sendBookingConfirmations: true,
      sendReminders: true,
      sendProgressReports: true,
      sendEngagementEmails: true,
      reminderTimes: {
        before24h: true,
        before1h: true,
      },
      progressReportFrequency: 'weekly',
      engagementCheckDays: 7,
      ...config,
    };
  }

  /**
   * Trigger welcome email workflow for new user
   */
  async triggerWelcomeWorkflow(userId: string): Promise<void> {
    if (!this.config.enabled || !this.config.sendWelcomeEmail) return;

    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          level: true,
        },
      });

      if (!user) {
        console.error('User not found for welcome workflow:', userId);
        return;
      }

      const userData: UserData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        level: user.level || undefined,
        preferredLanguage: 'es', // Default to Spanish, could be stored in user preferences
      };

      // Send welcome email immediately
      await emailService.sendWelcomeEmail(userData);

      // Schedule follow-up emails
      await this.scheduleOnboardingSequence(userData);

      console.log(`Welcome workflow triggered for user: ${userId}`);
    } catch (error) {
      console.error('Error in welcome workflow:', error);
    }
  }

  /**
   * Trigger booking confirmation workflow
   */
  async triggerBookingWorkflow(bookingId: string): Promise<void> {
    if (!this.config.enabled || !this.config.sendBookingConfirmations) return;

    try {
      const booking = await this.getBookingData(bookingId);
      if (!booking) return;

      // Send immediate confirmation
      await emailService.sendBookingConfirmation(booking);

      // Schedule reminder emails
      if (this.config.sendReminders) {
        await this.scheduleBookingReminders(booking);
      }

      console.log(`Booking workflow triggered for booking: ${bookingId}`);
    } catch (error) {
      console.error('Error in booking workflow:', error);
    }
  }

  /**
   * Trigger booking cancellation workflow
   */
  async triggerCancellationWorkflow(
    bookingId: string,
    cancelledBy: 'student' | 'teacher',
    reason?: string
  ): Promise<void> {
    if (!this.config.enabled) return;

    try {
      const booking = await this.getBookingData(bookingId);
      if (!booking) return;

      // Send cancellation notification
      await emailService.sendCancellationEmail(booking, cancelledBy, reason);

      // Cancel any scheduled reminders for this booking
      await this.cancelBookingReminders(bookingId);

      // Schedule re-engagement email for student if they cancelled
      if (cancelledBy === 'student') {
        await this.scheduleReEngagementEmail(booking.student, 'cancellation');
      }

      console.log(`Cancellation workflow triggered for booking: ${bookingId}`);
    } catch (error) {
      console.error('Error in cancellation workflow:', error);
    }
  }

  /**
   * Trigger progress report workflow
   */
  async triggerProgressReportWorkflow(userId: string): Promise<void> {
    if (!this.config.enabled || !this.config.sendProgressReports) return;

    try {
      const progressData = await this.getProgressData(userId);
      if (!progressData) return;

      await emailService.sendProgressReport(progressData);

      console.log(`Progress report workflow triggered for user: ${userId}`);
    } catch (error) {
      console.error('Error in progress report workflow:', error);
    }
  }

  /**
   * Check and trigger engagement workflows for inactive users
   */
  async triggerEngagementWorkflows(): Promise<void> {
    if (!this.config.enabled || !this.config.sendEngagementEmails) return;

    try {
      const inactiveUsers = await this.getInactiveUsers(this.config.engagementCheckDays);

      for (const user of inactiveUsers) {
        const inactiveDays = this.calculateInactiveDays(user.lastActivity);
        const suggestions = await this.generateEngagementSuggestions(user);

        await emailService.sendEngagementEmail(
          {
            id: user.id,
            name: user.name,
            email: user.email,
            preferredLanguage: 'es',
          },
          inactiveDays,
          suggestions
        );

        // Update last engagement email sent
        await this.updateLastEngagementEmail(user.id);
      }

      console.log(`Engagement workflows triggered for ${inactiveUsers.length} users`);
    } catch (error) {
      console.error('Error in engagement workflows:', error);
    }
  }

  /**
   * Schedule weekly teacher summaries
   */
  async triggerWeeklyTeacherSummaries(): Promise<void> {
    if (!this.config.enabled) return;

    try {
      const teachers = await db.user.findMany({
        where: { role: 'TEACHER', isActive: true },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      for (const teacher of teachers) {
        const weeklyData = await this.getTeacherWeeklyData(teacher.id);
        
        await emailService.sendWeeklySummary(
          {
            id: teacher.id,
            name: teacher.name,
            email: teacher.email,
            preferredLanguage: 'es',
          },
          weeklyData
        );
      }

      console.log(`Weekly teacher summaries sent to ${teachers.length} teachers`);
    } catch (error) {
      console.error('Error in weekly teacher summaries:', error);
    }
  }

  /**
   * Schedule onboarding sequence
   */
  private async scheduleOnboardingSequence(user: UserData): Promise<void> {
    // Day 1: Getting started tips
    await this.queue.add({
      type: 'follow_up',
      data: {
        to: user.email,
        subject: user.preferredLanguage === 'es' 
          ? '🎯 Consejos para comenzar tu aprendizaje' 
          : '🎯 Tips to get started with your learning',
        html: '', // Would be generated by template
        trackingId: `onboarding_day1_${user.id}`,
      },
      priority: 'medium',
      scheduledFor: addDays(new Date(), 1),
    });

    // Day 3: Progress check
    await this.queue.add({
      type: 'follow_up',
      data: {
        to: user.email,
        subject: user.preferredLanguage === 'es' 
          ? '📊 ¿Cómo va tu progreso?' 
          : '📊 How is your progress going?',
        html: '', // Would be generated by template
        trackingId: `onboarding_day3_${user.id}`,
      },
      priority: 'medium',
      scheduledFor: addDays(new Date(), 3),
    });

    // Day 7: Weekly check-in
    await this.queue.add({
      type: 'follow_up',
      data: {
        to: user.email,
        subject: user.preferredLanguage === 'es' 
          ? '🚀 Tu primera semana en Alumni by Better' 
          : '🚀 Your first week at Alumni by Better',
        html: '', // Would be generated by template
        trackingId: `onboarding_week1_${user.id}`,
      },
      priority: 'medium',
      scheduledFor: addDays(new Date(), 7),
    });
  }

  /**
   * Schedule booking reminders
   */
  private async scheduleBookingReminders(booking: BookingData): Promise<void> {
    const bookingTime = booking.scheduledAt;

    // 24-hour reminder
    if (this.config.reminderTimes.before24h) {
      const reminder24h = addHours(bookingTime, -24);
      if (reminder24h > new Date()) {
        await this.queue.add({
          type: 'reminder',
          data: {
            to: booking.student.email,
            subject: booking.student.preferredLanguage === 'es' 
              ? '📅 Recordatorio: Tu clase de español es mañana' 
              : '📅 Reminder: Your Spanish class is tomorrow',
            html: '', // Would be generated by ClassReminderTemplate
            trackingId: `reminder_24h_${booking.id}`,
          },
          priority: 'medium',
          scheduledFor: reminder24h,
        });
      }
    }

    // 1-hour reminder
    if (this.config.reminderTimes.before1h) {
      const reminder1h = addHours(bookingTime, -1);
      if (reminder1h > new Date()) {
        await this.queue.add({
          type: 'reminder',
          data: {
            to: booking.student.email,
            subject: booking.student.preferredLanguage === 'es' 
              ? '⏰ ¡Urgente! Tu clase comienza en 1 hora' 
              : '⏰ Urgent! Your class starts in 1 hour',
            html: '', // Would be generated by ClassReminderTemplate
            trackingId: `reminder_1h_${booking.id}`,
          },
          priority: 'high',
          scheduledFor: reminder1h,
        });

        // Also remind teacher
        await this.queue.add({
          type: 'reminder',
          data: {
            to: booking.teacher.email,
            subject: booking.teacher.preferredLanguage === 'es' 
              ? '👨‍🏫 Recordatorio: Clase en 1 hora con tu estudiante' 
              : '👨‍🏫 Reminder: Class in 1 hour with your student',
            html: '', // Would be generated by ClassReminderTemplate
            trackingId: `teacher_reminder_1h_${booking.id}`,
          },
          priority: 'high',
          scheduledFor: reminder1h,
        });
      }
    }
  }

  /**
   * Cancel booking reminders
   */
  private async cancelBookingReminders(bookingId: string): Promise<void> {
    // In a real implementation, you'd need to track scheduled jobs by booking ID
    // and cancel them from the queue
    console.log(`Cancelled reminders for booking: ${bookingId}`);
  }

  /**
   * Schedule re-engagement email
   */
  private async scheduleReEngagementEmail(
    student: UserData,
    reason: 'cancellation' | 'inactivity'
  ): Promise<void> {
    const delay = reason === 'cancellation' ? 3 : 1; // 3 days for cancellation, 1 day for inactivity
    
    await this.queue.add({
      type: 'follow_up',
      data: {
        to: student.email,
        subject: student.preferredLanguage === 'es' 
          ? '💙 ¡Te extrañamos! Tu viaje de español continúa aquí' 
          : '💙 We miss you! Your Spanish journey continues here',
        html: '', // Would be generated by EngagementTemplate
        trackingId: `reengagement_${reason}_${student.id}`,
      },
      priority: 'medium',
      scheduledFor: addDays(new Date(), delay),
    });
  }

  /**
   * Get booking data for workflows
   */
  private async getBookingData(bookingId: string): Promise<BookingData | null> {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            level: true,
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
            tema: true,
            vocabulario: true,
          },
        },
      },
    });

    if (!booking) return null;

    return {
      id: booking.id,
      scheduledAt: booking.scheduledAt,
      duration: booking.duration,
      googleMeetLink: booking.googleMeetLink,
      student: {
        id: booking.student.id,
        name: booking.student.name,
        email: booking.student.email,
        level: booking.student.level || undefined,
        preferredLanguage: 'es',
      },
      teacher: {
        id: booking.teacher.id,
        name: booking.teacher.name,
        email: booking.teacher.email,
        preferredLanguage: 'es',
      },
      topic: {
        id: booking.topic.id,
        name: booking.topic.name,
        level: booking.topic.level,
        description: booking.topic.description,
        tema: booking.topic.tema,
        vocabulario: booking.topic.vocabulario,
      },
    };
  }

  /**
   * Get progress data for user
   */
  private async getProgressData(userId: string): Promise<ProgressData | null> {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        progress: {
          include: {
            topic: true,
          },
        },
        studentBookings: {
          where: {
            status: 'COMPLETED',
            scheduledAt: {
              gte: subDays(new Date(), 7), // Last week
            },
          },
          include: {
            topic: true,
          },
        },
        submissions: {
          where: {
            submittedAt: {
              gte: subDays(new Date(), 7),
            },
          },
          include: {
            exercise: {
              include: {
                topic: true,
              },
            },
          },
        },
      },
    });

    if (!user) return null;

    const completedTopics = user.progress.filter(p => p.completedAt).length;
    const totalTopics = await db.topic.count();

    return {
      student: {
        id: user.id,
        name: user.name,
        email: user.email,
        level: user.level || undefined,
        preferredLanguage: 'es',
      },
      completedTopics,
      totalTopics,
      currentLevel: user.level || 'A1',
      recentActivities: [
        ...user.studentBookings.map(booking => ({
          type: 'live_class',
          topic: booking.topic.name,
          completedAt: booking.scheduledAt,
        })),
        ...user.submissions.map(submission => ({
          type: 'exercise',
          topic: submission.exercise.topic.name,
          completedAt: submission.submittedAt,
          score: submission.score || undefined,
        })),
      ].sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime()),
      weeklyStats: {
        classesAttended: user.studentBookings.length,
        exercisesCompleted: user.submissions.length,
        studyTime: user.studentBookings.length * 60 + user.submissions.length * 15, // Estimated
      },
    };
  }

  /**
   * Get inactive users for engagement campaigns
   */
  private async getInactiveUsers(daysSinceLastActivity: number): Promise<Array<{
    id: string;
    name: string;
    email: string;
    lastActivity: Date;
  }>> {
    const cutoffDate = subDays(new Date(), daysSinceLastActivity);

    // This is a simplified query. In a real implementation, you'd track last activity more precisely
    const users = await db.user.findMany({
      where: {
        role: 'STUDENT',
        isActive: true,
        updatedAt: {
          lt: cutoffDate,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        updatedAt: true,
      },
      take: 50, // Limit to prevent overwhelming the system
    });

    return users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      lastActivity: user.updatedAt,
    }));
  }

  /**
   * Calculate inactive days
   */
  private calculateInactiveDays(lastActivity: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastActivity.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Generate engagement suggestions
   */
  private async generateEngagementSuggestions(user: {
    id: string;
    name: string;
    email: string;
  }): Promise<string[]> {
    // This would typically be more sophisticated, analyzing user behavior
    return [
      '📚 Retoma donde lo dejaste con lecciones personalizadas',
      '🎯 Reserva una clase de conversación para practicar',
      '🏆 Completa ejercicios cortos para mantener el momentum',
      '📱 Prueba nuestros nuevos ejercicios interactivos',
      '👥 Únete a sesiones grupales de práctica',
    ];
  }

  /**
   * Get teacher weekly data
   */
  private async getTeacherWeeklyData(teacherId: string): Promise<any> {
    const weekStart = subDays(new Date(), 7);
    
    const weeklyClasses = await db.booking.findMany({
      where: {
        teacherId,
        status: 'COMPLETED',
        scheduledAt: {
          gte: weekStart,
        },
      },
      include: {
        student: true,
        topic: true,
      },
    });

    const upcomingClasses = await db.booking.findMany({
      where: {
        teacherId,
        status: 'SCHEDULED',
        scheduledAt: {
          gte: new Date(),
          lte: addDays(new Date(), 7),
        },
      },
      include: {
        student: true,
        topic: true,
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });

    const uniqueStudents = new Set(weeklyClasses.map(c => c.studentId));

    return {
      totalClasses: weeklyClasses.length,
      totalStudents: uniqueStudents.size,
      upcomingClasses: upcomingClasses.map(booking => ({
        id: booking.id,
        scheduledAt: booking.scheduledAt,
        student: {
          name: booking.student.name,
          email: booking.student.email,
        },
        topic: {
          name: booking.topic.name,
          level: booking.topic.level,
        },
      })),
      studentProgress: [], // Would be calculated based on student progress data
    };
  }

  /**
   * Update last engagement email sent timestamp
   */
  private async updateLastEngagementEmail(userId: string): Promise<void> {
    // In a real implementation, you'd store this in a user preferences table
    console.log(`Updated last engagement email timestamp for user: ${userId}`);
  }

  /**
   * Set workflow configuration
   */
  setConfig(config: Partial<WorkflowConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get workflow configuration
   */
  getConfig(): WorkflowConfig {
    return { ...this.config };
  }

  /**
   * Enable/disable all workflows
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }
}

// Singleton instance
export const emailWorkflows = new EmailWorkflows();