# Google Meet Integration Setup Guide

## Overview

This comprehensive Google Meet integration for Alumni LMS provides:
- **Google Calendar API Integration** with automatic Meet link generation
- **Teacher Availability Management** with time slot booking
- **Student Booking System** with real-time availability checking
- **Email Notifications** for bookings, cancellations, and reminders
- **Attendance Tracking** with manual and automated options
- **Real-time Class Status Updates**

## Prerequisites

### 1. Google Cloud Console Setup

1. **Create/Select Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Note your Project ID

2. **Enable Required APIs**
   ```bash
   # Enable Google Calendar API
   gcloud services enable calendar.googleapis.com
   
   # Enable Google Meet API (if available)
   gcloud services enable meet.googleapis.com
   ```

3. **Create Service Account**
   - Go to IAM & Admin > Service Accounts
   - Click "Create Service Account"
   - Name: `alumni-lms-calendar-service`
   - Role: `Editor` (or more restrictive roles)
   - Download JSON key file

4. **Create OAuth 2.0 Credentials**
   - Go to APIs & Credentials > Credentials
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)

### 2. Environment Configuration

Update your `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/alumni_lms?schema=public"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth & Calendar API
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/callback/google"

# Google Service Account (paste entire JSON as single line)
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"your-project",...}'

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Alumni LMS Configuration
ALUMNI_NETWORK_NAME="Alumni LMS Network"
ALUMNI_ADMIN_EMAIL="admin@alumni-lms.com"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes to database
npm run db:push

# Seed database with initial data
npm run db:seed

# Import Spanish content
npm run spanish:import
```

### 4. Install Dependencies

Make sure you have all required dependencies:

```bash
npm install googleapis nodemailer @radix-ui/react-switch
```

## Features Overview

### 🎯 Core Components

#### 1. Google Calendar Service (`/src/lib/google-calendar.ts`)
- **Purpose**: Manages Google Calendar events with Meet links
- **Key Functions**:
  - `createEvent()`: Creates calendar event with Meet link
  - `updateEvent()`: Updates existing events
  - `cancelEvent()`: Cancels and removes events
  - `isTimeSlotAvailable()`: Checks teacher availability
  - `getTeacherBusyTimes()`: Retrieves busy periods

#### 2. Booking Management (`/src/lib/meet-utils.ts`)
- **Purpose**: Handles all booking operations with Meet integration
- **Key Functions**:
  - `createBooking()`: Creates booking with calendar event
  - `cancelBooking()`: Cancels booking and calendar event
  - `rescheduleBooking()`: Updates booking and calendar
  - `markAttendance()`: Tracks student attendance
  - `getAvailableSlots()`: Returns available time slots

#### 3. Email Notifications (`/src/lib/email-notifications.ts`)
- **Purpose**: Sends automated email notifications
- **Key Functions**:
  - `sendBookingConfirmation()`: Welcome and confirmation emails
  - `sendBookingCancellation()`: Cancellation notifications
  - `sendClassReminder()`: 24h and 1h reminders
  - `sendBookingReschedule()`: Schedule change notifications

### 🎨 User Interface Components

#### 1. Teacher Dashboard (`/src/components/booking/teacher-dashboard.tsx`)
- **Features**:
  - Today's classes overview with join links
  - Upcoming classes management
  - Real-time class status tracking
  - Attendance marking interface
  - Quick access to Meet links and presentation slides

#### 2. Availability Manager (`/src/components/booking/availability-manager.tsx`)
- **Features**:
  - Weekly schedule configuration
  - Time slot management (30-minute intervals)
  - Conflict detection and validation
  - Active/inactive slot toggles

#### 3. Student Booking (`/src/components/booking/student-booking.tsx`)
- **Features**:
  - Teacher selection with availability
  - Real-time slot availability checking
  - Topic selection with Spanish content
  - Booking confirmation with package validation
  - My bookings overview with join links

#### 4. Attendance Tracker (`/src/components/booking/attendance-tracker.tsx`)
- **Features**:
  - Real-time class status monitoring
  - Manual attendance marking
  - Attendance history logging
  - Class progress tracking

### 🔌 API Endpoints

#### Booking Management
- `GET /api/bookings` - List user bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/[id]` - Get specific booking
- `PUT /api/bookings/[id]` - Update booking (reschedule, attendance)
- `DELETE /api/bookings/[id]` - Cancel booking

#### Availability Management
- `GET /api/availability` - Get teacher availability
- `POST /api/availability` - Set/update availability
- `DELETE /api/availability` - Clear availability

#### Utility Endpoints
- `GET /api/available-slots` - Get available booking slots
- `GET /api/teachers` - List active teachers
- `GET /api/student/packages` - Get student lesson packages

## Usage Guide

### For Teachers

#### 1. Set Availability
1. Go to `/teacher/classes`
2. Click "Availability" tab
3. Add time slots for each day you're available
4. Save your schedule

#### 2. Manage Classes
1. View today's classes on the dashboard
2. Join classes via Meet links
3. Access presentation slides
4. Mark attendance after classes

#### 3. Track Students
- Monitor student attendance rates
- View class history and notes
- Manage upcoming bookings

### For Students

#### 1. Book a Class
1. Go to `/student/book-class`
2. Select preferred teacher
3. Choose available date and time
4. Pick a topic from Spanish curriculum
5. Confirm booking

#### 2. Attend Classes
1. Receive calendar invite with Meet link
2. Join class 5 minutes early
3. Access class materials and slides

#### 3. Manage Bookings
- View upcoming classes
- Cancel bookings (24h+ notice)
- Track lesson package usage

### For Administrators

#### 1. Monitor System
- Track booking statistics
- Monitor teacher utilization
- Review attendance rates

#### 2. Manage Users
- Create teacher accounts
- Assign lesson packages to students
- Handle booking conflicts

## Email Automation

### Notification Types

1. **Booking Confirmation**
   - Sent immediately after booking
   - Includes class details and Meet link
   - Calendar invite attached

2. **Class Reminders**
   - 24-hour advance reminder
   - 1-hour pre-class reminder
   - Pre-class checklist included

3. **Cancellation Notices**
   - Immediate notification to both parties
   - Lesson credit restoration confirmation
   - Calendar event cancellation

4. **Reschedule Notifications**
   - Old vs new time comparison
   - Updated calendar information
   - Meet link confirmation

### Email Templates

All emails include:
- Professional Alumni LMS branding
- Responsive HTML design
- Clear call-to-action buttons
- Helpful preparation tips
- Contact information

## Testing the Integration

### 1. Environment Testing

```bash
# Test Google Calendar API connection
curl -X GET "http://localhost:3000/api/bookings" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test email configuration
node -e "
const nodemailer = require('nodemailer');
const transport = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
transport.verify().then(console.log).catch(console.error);
"
```

### 2. Integration Testing

#### Teacher Workflow
1. **Setup**: Create teacher account, set availability
2. **Booking**: Student books a class
3. **Calendar**: Verify Google Calendar event creation
4. **Email**: Check confirmation emails sent
5. **Class**: Join Meet link, test functionality
6. **Attendance**: Mark student attendance
7. **Completion**: Verify final status updates

#### Student Workflow
1. **Package**: Ensure student has active lesson package
2. **Booking**: Book class with available teacher
3. **Confirmation**: Receive email and calendar invite
4. **Reminders**: Verify 24h and 1h reminder emails
5. **Attendance**: Join class via Meet link
6. **Completion**: Check final booking status

### 3. Edge Case Testing

- **Conflicts**: Try booking overlapping time slots
- **Cancellations**: Test last-minute cancellations
- **Rescheduling**: Move bookings to different times
- **Package Limits**: Attempt booking without remaining lessons
- **Network Issues**: Test offline/online synchronization

## Troubleshooting

### Common Issues

#### 1. Google Calendar API Errors
```bash
# Check API key validity
curl -X GET "https://www.googleapis.com/calendar/v3/calendars/primary" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Verify service account permissions
# Ensure service account has calendar access
```

#### 2. Email Delivery Issues
```bash
# Test SMTP connection
telnet smtp.gmail.com 587

# Verify app password for Gmail
# Check firewall/network restrictions
```

#### 3. Booking Conflicts
- Check teacher availability settings
- Verify time zone configurations
- Review booking validation logic

#### 4. Database Issues
```bash
# Check database connection
npm run db:push

# Verify schema is up to date
npm run db:generate
```

### Support Resources

- **Google Calendar API**: [Documentation](https://developers.google.com/calendar)
- **Google Meet API**: [Documentation](https://developers.google.com/meet)
- **Prisma**: [Documentation](https://www.prisma.io/docs)
- **NextAuth**: [Documentation](https://next-auth.js.org)

## Security Considerations

### 1. API Keys
- Store service account keys securely
- Use environment variables for sensitive data
- Rotate keys regularly

### 2. Email Security
- Use app passwords for Gmail
- Implement rate limiting for emails
- Validate email addresses

### 3. Calendar Access
- Limit calendar permissions to minimum required
- Implement proper access controls
- Monitor API usage and quotas

### 4. User Privacy
- Encrypt sensitive booking data
- Implement proper session management
- Follow GDPR/privacy regulations

## Performance Optimization

### 1. API Calls
- Cache teacher availability data
- Batch calendar operations
- Implement retry logic for failed requests

### 2. Database Queries
- Index frequently queried fields
- Optimize booking lookup queries
- Use database connection pooling

### 3. Email Delivery
- Queue email sending
- Implement background job processing
- Use email templates caching

This integration provides a complete solution for managing live Spanish classes with Google Meet, ensuring seamless communication between teachers and students while maintaining high reliability and user experience.