import { emailWorkflows } from '../workflows/EmailWorkflows';
import { runDailyEmailTasks } from '../../email-integration';
import { db } from '../../prisma';
import { addHours, addMinutes } from 'date-fns';

/**
 * Email Scheduler Service
 * Handles scheduled email tasks, reminders, and automated workflows
 * Note: This is a simplified version without node-cron dependency
 */
export class EmailScheduler {
  private static instance: EmailScheduler;
  private isRunning: boolean = false;
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {}

  static getInstance(): EmailScheduler {
    if (!EmailScheduler.instance) {
      EmailScheduler.instance = new EmailScheduler();
    }
    return EmailScheduler.instance;
  }

  /**
   * Start all scheduled email tasks
   */
  start(): void {
    if (this.isRunning) {
      console.log('Email scheduler is already running');
      return;
    }

    console.log('Starting email scheduler...');
    this.isRunning = true;

    // Check for reminders every 15 minutes
    this.intervals.set('reminders', setInterval(async () => {
      try {
        await this.checkForReminders();
      } catch (error) {
        console.error('Error checking reminders:', error);
      }
    }, 15 * 60 * 1000)); // 15 minutes

    // Daily tasks check (every hour)
    this.intervals.set('daily-check', setInterval(async () => {
      const now = new Date();
      const hour = now.getHours();
      
      // Run daily tasks at 9 AM
      if (hour === 9) {
        try {
          await this.runDailyTasks();
        } catch (error) {
          console.error('Error in daily tasks:', error);
        }
      }
    }, 60 * 60 * 1000)); // 1 hour

    // Weekly tasks check (every 6 hours)
    this.intervals.set('weekly-check', setInterval(async () => {
      const now = new Date();
      const day = now.getDay();
      const hour = now.getHours();
      
      // Monday (1) at 10 AM - Progress reports
      if (day === 1 && hour === 10) {
        try {
          await this.processWeeklyReports();
        } catch (error) {
          console.error('Error processing weekly reports:', error);
        }
      }
      
      // Sunday (0) at 8 PM - Teacher summaries
      if (day === 0 && hour === 20) {
        try {
          await emailWorkflows.triggerWeeklyTeacherSummaries();
        } catch (error) {
          console.error('Error sending teacher summaries:', error);
        }
      }
      
      // Wednesday (3) at 2 PM - Engagement campaigns
      if (day === 3 && hour === 14) {
        try {
          await emailWorkflows.triggerEngagementWorkflows();
        } catch (error) {
          console.error('Error running engagement campaigns:', error);
        }
      }
    }, 6 * 60 * 60 * 1000)); // 6 hours

    console.log(`Email scheduler started with ${this.intervals.size} tasks`);
  }

  /**
   * Stop all scheduled tasks
   */
  stop(): void {
    if (!this.isRunning) {
      console.log('Email scheduler is not running');
      return;
    }

    console.log('Stopping email scheduler...');
    
    this.intervals.forEach((interval, name) => {
      clearInterval(interval);
      console.log(`Stopped task: ${name}`);
    });

    this.intervals.clear();
    this.isRunning = false;
    console.log('Email scheduler stopped');
  }

  /**
   * Restart the scheduler
   */
  restart(): void {
    this.stop();
    setTimeout(() => this.start(), 1000);
  }

  /**
   * Check if scheduler is running
   */
  isSchedulerRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Check for upcoming bookings that need reminders
   */
  private async checkForReminders(): Promise<void> {
    try {
      await this.processHourlyReminders();
      await this.processDailyReminders();
    } catch (error) {
      console.error('Error checking for reminders:', error);
    }
  }

  /**
   * Run daily email tasks
   */
  private async runDailyTasks(): Promise<void> {
    console.log('Running daily email tasks...');
    try {
      await runDailyEmailTasks();
    } catch (error) {
      console.error('Error in daily email tasks:', error);
    }
  }

  /**
   * Process 1-hour reminders
   */
  private async processHourlyReminders(): Promise<void> {
    const oneHourFromNow = addHours(new Date(), 1);
    const reminderWindow = addMinutes(oneHourFromNow, 30); // 30-minute window

    const upcomingBookings = await db.booking.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: {
          gte: oneHourFromNow,
          lte: reminderWindow,
        },
      },
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

    if (upcomingBookings.length > 0) {
      console.log(`Found ${upcomingBookings.length} bookings for 1-hour reminders`);
    }

    for (const booking of upcomingBookings) {
      try {
        const bookingData = {
          id: booking.id,
          scheduledAt: booking.scheduledAt,
          duration: booking.duration,
          googleMeetLink: booking.googleMeetLink,
          student: {
            id: booking.student.id,
            name: booking.student.name,
            email: booking.student.email,
            level: booking.student.level || undefined,
            preferredLanguage: 'es' as const,
          },
          teacher: {
            id: booking.teacher.id,
            name: booking.teacher.name,
            email: booking.teacher.email,
            preferredLanguage: 'es' as const,
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

        // Import here to avoid circular dependency
        const { emailService } = await import('../emailService');
        await emailService.sendClassReminder(bookingData, '1h');
        
        console.log(`1-hour reminder sent for booking: ${booking.id}`);
      } catch (error) {
        console.error(`Error sending 1-hour reminder for booking ${booking.id}:`, error);
      }
    }
  }

  /**
   * Process 24-hour reminders
   */
  private async processDailyReminders(): Promise<void> {
    const twentyFourHoursFromNow = addHours(new Date(), 24);
    const reminderWindow = addHours(twentyFourHoursFromNow, 2); // 2-hour window

    const upcomingBookings = await db.booking.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: {
          gte: twentyFourHoursFromNow,
          lte: reminderWindow,
        },
      },
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

    if (upcomingBookings.length > 0) {
      console.log(`Found ${upcomingBookings.length} bookings for 24-hour reminders`);
    }

    for (const booking of upcomingBookings) {
      try {
        const bookingData = {
          id: booking.id,
          scheduledAt: booking.scheduledAt,
          duration: booking.duration,
          googleMeetLink: booking.googleMeetLink,
          student: {
            id: booking.student.id,
            name: booking.student.name,
            email: booking.student.email,
            level: booking.student.level || undefined,
            preferredLanguage: 'es' as const,
          },
          teacher: {
            id: booking.teacher.id,
            name: booking.teacher.name,
            email: booking.teacher.email,
            preferredLanguage: 'es' as const,
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

        // Import here to avoid circular dependency
        const { emailService } = await import('../emailService');
        await emailService.sendClassReminder(bookingData, '24h');
        
        console.log(`24-hour reminder sent for booking: ${booking.id}`);
      } catch (error) {
        console.error(`Error sending 24-hour reminder for booking ${booking.id}:`, error);
      }
    }
  }

  /**
   * Process weekly progress reports
   */
  private async processWeeklyReports(): Promise<void> {
    const activeStudents = await db.user.findMany({
      where: {
        role: 'STUDENT',
        isActive: true,
      },
      select: {
        id: true,
      },
      take: 100, // Limit to prevent overwhelming the system
    });

    console.log(`Sending weekly progress reports to ${activeStudents.length} students`);

    for (const student of activeStudents) {
      try {
        await emailWorkflows.triggerProgressReportWorkflow(student.id);
        console.log(`Progress report sent to student: ${student.id}`);
      } catch (error) {
        console.error(`Error sending progress report to student ${student.id}:`, error);
      }

      // Small delay to prevent overwhelming the email service
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * Get scheduler status
   */
  getStatus(): {
    running: boolean;
    tasks: string[];
    uptime: string;
  } {
    return {
      running: this.isRunning,
      tasks: Array.from(this.intervals.keys()),
      uptime: this.isRunning ? 'Running' : 'Stopped',
    };
  }

  /**
   * Manually trigger reminder check
   */
  async triggerReminderCheck(): Promise<void> {
    console.log('Manually triggering reminder check...');
    await this.checkForReminders();
  }

  /**
   * Manually trigger daily tasks
   */
  async triggerDailyTasks(): Promise<void> {
    console.log('Manually triggering daily tasks...');
    await this.runDailyTasks();
  }

  /**
   * Manually trigger weekly reports
   */
  async triggerWeeklyReports(): Promise<void> {
    console.log('Manually triggering weekly reports...');
    await this.processWeeklyReports();
  }
}

// Singleton instance
export const emailScheduler = EmailScheduler.getInstance();