import { emailService } from './email/emailService';
import { emailWorkflows } from './email/workflows/EmailWorkflows';
import { 
  onUserRegistered, 
  onBookingCreated, 
  onBookingCancelled, 
  onBookingCompleted,
  sendPasswordResetEmail,
  sendCourseCompletionCertificate
} from './email-integration';

// Export the new enhanced email system functions
export {
  emailService,
  emailWorkflows,
  onUserRegistered,
  onBookingCreated,
  onBookingCancelled,
  onBookingCompleted,
  sendPasswordResetEmail,
  sendCourseCompletionCertificate,
};

// Re-export the old EmailNotificationService as deprecated for backward compatibility
export { EmailNotificationService } from './email-notifications';

/**
 * Enhanced Email Notification Service
 * This is the new, comprehensive email system that replaces the basic EmailNotificationService
 */
export class EnhancedEmailNotificationService {
  
  /**
   * Send booking confirmation (enhanced version)
   */
  static async sendBookingConfirmation(bookingId: string): Promise<void> {
    await onBookingCreated(bookingId);
  }

  /**
   * Send booking cancellation (enhanced version)
   */
  static async sendBookingCancellation(
    bookingId: string, 
    cancelledBy: 'student' | 'teacher',
    reason?: string
  ): Promise<void> {
    await onBookingCancelled(bookingId, cancelledBy, reason);
  }

  /**
   * Send class reminder (enhanced version)
   */
  static async sendClassReminder(bookingId: string, reminderType: '24h' | '1h'): Promise<void> {
    // The new system handles reminders automatically through workflows
    // This method is kept for backward compatibility
    console.log(`Class reminder (${reminderType}) will be sent automatically for booking: ${bookingId}`);
  }

  /**
   * Send welcome email (enhanced version)
   */
  static async sendWelcomeEmail(userId: string): Promise<void> {
    await onUserRegistered(userId);
  }

  /**
   * Send progress report (enhanced version)
   */
  static async sendProgressReport(userId: string): Promise<void> {
    await emailWorkflows.triggerProgressReportWorkflow(userId);
  }

  /**
   * Send password reset email (enhanced version)
   */
  static async sendPasswordReset(email: string, resetToken: string): Promise<boolean> {
    return await sendPasswordResetEmail(email, resetToken);
  }

  /**
   * Send course completion certificate (enhanced version)
   */
  static async sendCourseCompletion(
    userId: string,
    courseData: {
      courseName: string;
      level: string;
      certificateUrl: string;
    }
  ): Promise<boolean> {
    return await sendCourseCompletionCertificate(userId, courseData);
  }

  /**
   * Test email configuration
   */
  static async testEmailConfiguration(): Promise<boolean> {
    return await emailService.testEmailConfiguration();
  }

  /**
   * Get email analytics
   */
  static async getEmailAnalytics(startDate: Date, endDate: Date): Promise<any> {
    return await emailService.getEmailAnalytics(startDate, endDate);
  }

  /**
   * Configure email workflows
   */
  static configureWorkflows(config: {
    enabled?: boolean;
    sendWelcomeEmail?: boolean;
    sendBookingConfirmations?: boolean;
    sendReminders?: boolean;
    sendProgressReports?: boolean;
    sendEngagementEmails?: boolean;
  }): void {
    emailWorkflows.setConfig(config);
  }

  /**
   * Enable/disable all email workflows
   */
  static setWorkflowsEnabled(enabled: boolean): void {
    emailWorkflows.setEnabled(enabled);
  }
}

// Default export for convenience
export default EnhancedEmailNotificationService;