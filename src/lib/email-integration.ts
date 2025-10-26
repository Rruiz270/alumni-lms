import { emailService, emailWorkflows } from './email/emailService';
import { db } from './prisma';

/**
 * Integration layer between the existing LMS and the new email system
 * This file provides helper functions to trigger email workflows from existing code
 */

/**
 * Trigger email workflows when a new user registers
 */
export async function onUserRegistered(userId: string): Promise<void> {
  try {
    await emailWorkflows.triggerWelcomeWorkflow(userId);
    console.log(`Welcome workflow triggered for user: ${userId}`);
  } catch (error) {
    console.error('Error triggering welcome workflow:', error);
  }
}

/**
 * Trigger email workflows when a booking is created
 */
export async function onBookingCreated(bookingId: string): Promise<void> {
  try {
    await emailWorkflows.triggerBookingWorkflow(bookingId);
    console.log(`Booking workflow triggered for booking: ${bookingId}`);
  } catch (error) {
    console.error('Error triggering booking workflow:', error);
  }
}

/**
 * Trigger email workflows when a booking is cancelled
 */
export async function onBookingCancelled(
  bookingId: string,
  cancelledBy: 'student' | 'teacher',
  reason?: string
): Promise<void> {
  try {
    await emailWorkflows.triggerCancellationWorkflow(bookingId, cancelledBy, reason);
    console.log(`Cancellation workflow triggered for booking: ${bookingId}`);
  } catch (error) {
    console.error('Error triggering cancellation workflow:', error);
  }
}

/**
 * Trigger email workflows when a booking is completed
 */
export async function onBookingCompleted(bookingId: string): Promise<void> {
  try {
    // Mark booking as completed and potentially trigger follow-up emails
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        student: true,
        teacher: true,
        topic: true,
      },
    });

    if (!booking) return;

    // Check if this completes a level or course
    const studentProgress = await db.progress.findMany({
      where: { userId: booking.studentId },
      include: { topic: true },
    });

    const completedTopicsAtLevel = studentProgress.filter(
      p => p.completedAt && p.topic.level === booking.topic.level
    );

    // If student has completed many topics at this level, consider sending progress report
    if (completedTopicsAtLevel.length % 10 === 0) {
      await emailWorkflows.triggerProgressReportWorkflow(booking.studentId);
    }

    console.log(`Booking completion processed for booking: ${bookingId}`);
  } catch (error) {
    console.error('Error processing booking completion:', error);
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
): Promise<boolean> {
  try {
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      console.error('User not found for password reset:', email);
      return false;
    }

    return await emailService.sendPasswordReset(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        preferredLanguage: 'es',
      },
      resetToken
    );
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}

/**
 * Send course completion certificate
 */
export async function sendCourseCompletionCertificate(
  userId: string,
  courseData: {
    courseName: string;
    level: string;
    certificateUrl: string;
  }
): Promise<boolean> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      console.error('User not found for course completion:', userId);
      return false;
    }

    return await emailService.sendCourseCompletion(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        preferredLanguage: 'es',
      },
      {
        ...courseData,
        completedAt: new Date(),
      }
    );
  } catch (error) {
    console.error('Error sending course completion email:', error);
    return false;
  }
}

/**
 * Schedule daily email tasks (to be run by cron job)
 */
export async function runDailyEmailTasks(): Promise<void> {
  try {
    console.log('Starting daily email tasks...');

    // Trigger engagement workflows for inactive users
    await emailWorkflows.triggerEngagementWorkflows();

    // Send weekly progress reports (on specific day of week)
    const today = new Date();
    if (today.getDay() === 1) { // Monday
      const students = await db.user.findMany({
        where: { role: 'STUDENT', isActive: true },
        select: { id: true },
        take: 50, // Limit to prevent overwhelming
      });

      for (const student of students) {
        await emailWorkflows.triggerProgressReportWorkflow(student.id);
      }
    }

    // Send weekly teacher summaries (on Sunday)
    if (today.getDay() === 0) { // Sunday
      await emailWorkflows.triggerWeeklyTeacherSummaries();
    }

    console.log('Daily email tasks completed');
  } catch (error) {
    console.error('Error running daily email tasks:', error);
  }
}

/**
 * Setup email workflows configuration
 */
export function configureEmailWorkflows(config: {
  enabled?: boolean;
  sendWelcomeEmail?: boolean;
  sendBookingConfirmations?: boolean;
  sendReminders?: boolean;
  sendProgressReports?: boolean;
  sendEngagementEmails?: boolean;
  reminderTimes?: {
    before24h?: boolean;
    before1h?: boolean;
  };
}): void {
  emailWorkflows.setConfig(config);
  console.log('Email workflows configured:', config);
}

/**
 * Test email configuration
 */
export async function testEmailConfiguration(): Promise<boolean> {
  try {
    return await emailService.testEmailConfiguration();
  } catch (error) {
    console.error('Error testing email configuration:', error);
    return false;
  }
}

/**
 * Get email analytics for admin dashboard
 */
export async function getEmailAnalytics(days: number = 30): Promise<any> {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await emailService.getEmailAnalytics(startDate, endDate);
  } catch (error) {
    console.error('Error getting email analytics:', error);
    return null;
  }
}

/**
 * Send bulk email to specific user segment
 */
export async function sendBulkEmailToSegment(
  segment: 'all_students' | 'all_teachers' | 'inactive_users' | 'new_users',
  emailData: {
    subject: string;
    template: string;
    data: any;
  }
): Promise<void> {
  try {
    let users: Array<{ id: string; name: string; email: string }> = [];

    switch (segment) {
      case 'all_students':
        users = await db.user.findMany({
          where: { role: 'STUDENT', isActive: true },
          select: { id: true, name: true, email: true },
        });
        break;

      case 'all_teachers':
        users = await db.user.findMany({
          where: { role: 'TEACHER', isActive: true },
          select: { id: true, name: true, email: true },
        });
        break;

      case 'inactive_users':
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        users = await db.user.findMany({
          where: {
            role: 'STUDENT',
            isActive: true,
            updatedAt: { lt: thirtyDaysAgo },
          },
          select: { id: true, name: true, email: true },
          take: 100, // Limit for safety
        });
        break;

      case 'new_users':
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        users = await db.user.findMany({
          where: {
            role: 'STUDENT',
            isActive: true,
            createdAt: { gte: sevenDaysAgo },
          },
          select: { id: true, name: true, email: true },
        });
        break;
    }

    if (users.length === 0) {
      console.log(`No users found for segment: ${segment}`);
      return;
    }

    // Use the email service's bulk email functionality
    const emailOptions = users.map(user => ({
      to: user.email,
      templateData: {
        ...emailData.data,
        user,
      },
      template: emailData.template as any, // Type assertion for now
      language: 'es' as const,
    }));

    await emailService.sendBulkEmails(emailOptions, 'medium');
    console.log(`Bulk email sent to ${users.length} users in segment: ${segment}`);
  } catch (error) {
    console.error('Error sending bulk email:', error);
  }
}

/**
 * Export email data for analysis
 */
export async function exportEmailData(
  startDate: Date,
  endDate: Date,
  format: 'csv' | 'json' = 'csv'
): Promise<string> {
  try {
    const analytics = await emailService.getEmailAnalytics(startDate, endDate);
    
    if (format === 'json') {
      return JSON.stringify(analytics, null, 2);
    }

    // Convert to CSV format
    const headers = ['Date', 'Sent', 'Opened', 'Clicked', 'Failed'];
    const rows = [headers.join(',')];
    
    // Add daily stats rows
    analytics.dailyStats.forEach((stat: any) => {
      rows.push([
        stat.date,
        stat.sent.toString(),
        stat.opened.toString(),
        stat.clicked.toString(),
        '0', // Failed (would be calculated from analytics)
      ].join(','));
    });

    return rows.join('\n');
  } catch (error) {
    console.error('Error exporting email data:', error);
    return '';
  }
}

/**
 * Migrate from old email system to new system
 */
export async function migrateEmailSystem(): Promise<void> {
  try {
    console.log('Starting email system migration...');

    // Test new email configuration
    const configValid = await testEmailConfiguration();
    if (!configValid) {
      throw new Error('New email system configuration is invalid');
    }

    // Configure workflows with current settings
    configureEmailWorkflows({
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
    });

    console.log('Email system migration completed successfully');
  } catch (error) {
    console.error('Error migrating email system:', error);
    throw error;
  }
}