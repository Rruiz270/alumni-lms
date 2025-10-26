# Alumni LMS - Comprehensive Email Notification System

## Overview

The Alumni LMS includes a sophisticated, production-ready email notification system that provides:

- **Beautiful, mobile-responsive email templates** with Alumni by Better branding
- **Automated email workflows** for all user interactions
- **Multi-language support** (Spanish and English)
- **Email analytics and tracking** with open/click rates
- **Queue system** for high-volume email processing
- **Calendar integration** with ICS attachments
- **Unsubscribe management** and preference handling
- **Admin dashboard** for email management and monitoring

## Features

### 📧 Email Templates

The system includes 8 professionally designed email templates:

1. **Welcome Email** - Onboards new users with getting started tips
2. **Booking Confirmation** - Confirms class bookings with calendar attachments
3. **Class Reminders** - 24-hour and 1-hour before class notifications
4. **Cancellation Notifications** - Informs about cancelled classes
5. **Progress Reports** - Weekly student progress summaries
6. **Teacher Summaries** - Weekly reports for teachers
7. **Password Reset** - Secure password reset emails
8. **Course Completion** - Celebration emails with certificates
9. **Engagement Emails** - Re-engagement for inactive users

### 🔄 Automated Workflows

- **Welcome Sequence**: Multi-step onboarding for new users
- **Booking Lifecycle**: Confirmations, reminders, and follow-ups
- **Progress Tracking**: Automated weekly reports
- **Engagement Campaigns**: Win back inactive learners
- **Teacher Management**: Weekly summaries and updates

### 📊 Analytics & Tracking

- Email open and click rate tracking
- Template performance analytics
- Language preference insights
- Engagement metrics
- Deliverability monitoring

### 🚀 Performance Features

- **Email Queue**: Handles high volumes with rate limiting
- **Batch Processing**: Efficient bulk email sending
- **Retry Logic**: Automatic retry for failed sends
- **Rate Limiting**: Respects provider limits
- **Calendar Integration**: ICS attachments for bookings

## Quick Start

### 1. Environment Setup

Add these variables to your `.env` file:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-app-password
SUPPORT_EMAIL=support@alumni-better.com
```

### 2. Initialize the Email System

```typescript
import { emailScheduler } from '@/lib/email/scheduler/EmailScheduler';
import { configureEmailWorkflows } from '@/lib/email-integration';

// Configure workflows
configureEmailWorkflows({
  enabled: true,
  sendWelcomeEmail: true,
  sendBookingConfirmations: true,
  sendReminders: true,
  sendProgressReports: true,
  sendEngagementEmails: true,
});

// Start the scheduler
emailScheduler.start();
```

### 3. Trigger Email Workflows

```typescript
import { 
  onUserRegistered, 
  onBookingCreated, 
  onBookingCancelled 
} from '@/lib/email-integration';

// When a user registers
await onUserRegistered(userId);

// When a booking is created
await onBookingCreated(bookingId);

// When a booking is cancelled
await onBookingCancelled(bookingId, 'student', 'Schedule conflict');
```

## Email Templates

### Template Structure

All templates extend the `BaseTemplate` class and follow this structure:

```typescript
export class WelcomeTemplate extends BaseTemplate implements EmailTemplate {
  render(data: WelcomeTemplateProps): string {
    // Template rendering logic
  }
  
  getSubject(language: 'en' | 'es'): string {
    // Subject line generation
  }
}
```

### Template Features

- **Responsive Design**: Mobile-optimized layouts
- **Alumni Branding**: Consistent brand colors and styling
- **Multi-language**: Spanish and English support
- **Rich Content**: Cards, buttons, progress bars, statistics
- **Dark Mode**: Automatic dark mode support
- **Accessibility**: Proper contrast and semantic HTML

### Customizing Templates

To customize an email template:

1. Edit the template file in `/src/lib/email/templates/`
2. Update the styles in the `BaseTemplate.ts` file
3. Test changes using the email dashboard preview

## Automated Workflows

### Workflow Configuration

```typescript
import { emailWorkflows } from '@/lib/email/workflows/EmailWorkflows';

// Configure workflow settings
emailWorkflows.setConfig({
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
});
```

### Available Workflows

#### Welcome Sequence
- **Day 0**: Welcome email with getting started guide
- **Day 1**: Tips for effective learning
- **Day 3**: Progress check and encouragement
- **Day 7**: First week summary

#### Booking Workflow
- **Immediate**: Booking confirmation with calendar attachment
- **24 hours before**: Class reminder for preparation
- **1 hour before**: Final reminder with join link

#### Engagement Campaign
- **7 days inactive**: Gentle reminder
- **14 days inactive**: Re-engagement with suggestions
- **30 days inactive**: Special offers and motivation

## Email Queue System

The queue system ensures reliable email delivery:

### Features
- **Priority Handling**: High, medium, low priority queues
- **Rate Limiting**: Respects SMTP provider limits
- **Retry Logic**: Automatic retry with exponential backoff
- **Batch Processing**: Efficient bulk email handling
- **Monitoring**: Real-time queue statistics

### Queue Configuration

```typescript
import { EmailQueue } from '@/lib/email/queue/EmailQueue';

const queue = new EmailQueue({
  maxConcurrent: 5,
  retryDelay: 5000,
  maxRetries: 3,
  batchSize: 50,
  rateLimitPerMinute: 100,
});
```

## Analytics & Tracking

### Email Tracking

The system automatically tracks:
- **Email Opens**: Via tracking pixels
- **Link Clicks**: Via redirect tracking
- **Unsubscribes**: Via preference management
- **Bounces**: Via SMTP feedback
- **Deliverability**: Success/failure rates

### Analytics Dashboard

Access analytics through the admin panel:

```typescript
import { getEmailAnalytics } from '@/lib/email-integration';

const analytics = await getEmailAnalytics(30); // Last 30 days
console.log({
  totalSent: analytics.totalSent,
  openRate: analytics.openRate,
  clickRate: analytics.clickRate,
  templateStats: analytics.templateStats,
});
```

## Admin Dashboard

The email management dashboard provides:

### Overview Tab
- Email statistics and performance metrics
- Recent email activity
- Quick actions (test email, export data)

### Queue Tab
- Real-time queue status
- Processing statistics
- Failed job management

### Templates Tab
- Template management and preview
- Usage statistics
- Edit and customize templates

### Workflows Tab
- Workflow configuration
- Enable/disable specific workflows
- Schedule management

### Analytics Tab
- Detailed performance metrics
- Template comparison
- Language preference insights

## Calendar Integration

### ICS Attachments

Booking emails automatically include calendar attachments:

```typescript
import { CalendarAttachment } from '@/lib/email/utils/calendarUtils';

const calendar = new CalendarAttachment();
const icsContent = calendar.createBookingEvent(booking);

// Attachment is automatically added to booking emails
```

### Features
- **Timezone Support**: Proper timezone handling
- **Reminders**: Built-in calendar reminders
- **Meeting Links**: Google Meet integration
- **Cancellations**: Automatic calendar updates

## Unsubscribe Management

### Preference System

Users can manage their email preferences:

- **Unsubscribe from all emails**
- **Manage specific email types**
- **Update frequency preferences**
- **Language preferences**

### Implementation

The system provides unsubscribe links in all emails:

```html
<!-- Automatically added to all emails -->
<a href="/api/email/unsubscribe?email=user@example.com&tracking=123">
  Unsubscribe
</a>
```

## Scheduler

### Automated Tasks

The email scheduler runs these tasks:

- **Every 15 minutes**: Check for reminders
- **Daily at 9 AM**: Daily email tasks and engagement
- **Monday 10 AM**: Weekly progress reports
- **Sunday 8 PM**: Teacher weekly summaries
- **Wednesday 2 PM**: Engagement campaigns

### Manual Control

```typescript
import { emailScheduler } from '@/lib/email/scheduler/EmailScheduler';

// Start/stop scheduler
emailScheduler.start();
emailScheduler.stop();

// Manual triggers
await emailScheduler.triggerReminderCheck();
await emailScheduler.triggerDailyTasks();
await emailScheduler.triggerWeeklyReports();
```

## Testing

### Test Script

Run the comprehensive test suite:

```bash
npm run test:email-system
```

This tests:
- Email configuration
- Template rendering
- Queue functionality
- Analytics system
- Scheduler operations
- Workflow integration
- Calendar utilities

### Manual Testing

Use the admin dashboard to:
- Send test emails
- Preview templates
- Monitor queue status
- View analytics

## Production Deployment

### Environment Variables

Required environment variables:

```env
# Email Service
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-password

# Application
NEXTAUTH_URL=https://your-domain.com
SUPPORT_EMAIL=support@your-domain.com

# Optional
DATABASE_URL=your-database-url
```

### Monitoring

Set up monitoring for:
- **Email delivery rates**
- **Queue processing**
- **Error rates**
- **Performance metrics**

### Scaling

For high volume:
- Use dedicated SMTP services (SendGrid, Mailgun, SES)
- Implement Redis for queue persistence
- Add multiple worker processes
- Monitor rate limits and reputation

## Troubleshooting

### Common Issues

#### Emails not sending
1. Check SMTP credentials
2. Verify rate limits
3. Check queue status
4. Review error logs

#### Poor deliverability
1. Set up SPF/DKIM records
2. Monitor sender reputation
3. Implement bounce handling
4. Use dedicated IP if needed

#### Template issues
1. Test templates in email dashboard
2. Check for broken HTML
3. Verify responsive design
4. Test across email clients

### Debug Mode

Enable debug logging:

```typescript
// In development
process.env.EMAIL_DEBUG = 'true';
```

## Support

For issues or questions about the email system:

1. Check the troubleshooting section
2. Review error logs
3. Test with the provided test script
4. Contact the development team

## License

This email system is part of the Alumni LMS and follows the same licensing terms.