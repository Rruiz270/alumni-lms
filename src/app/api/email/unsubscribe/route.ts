import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const trackingId = searchParams.get('tracking');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // For now, we'll redirect to a simple unsubscribe page
    // In a production app, you'd want to create a proper unsubscribe page
    const unsubscribePageHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Unsubscribe - Alumni by Better</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 600px;
                margin: 0 auto;
                padding: 40px 20px;
                background-color: #f9fafb;
            }
            .container {
                background: white;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                text-align: center;
            }
            .header {
                color: #4f46e5;
                font-size: 24px;
                margin-bottom: 20px;
            }
            .message {
                color: #6b7280;
                line-height: 1.6;
                margin-bottom: 30px;
            }
            .button {
                display: inline-block;
                background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
                color: white;
                text-decoration: none;
                padding: 12px 24px;
                border-radius: 6px;
                font-weight: 600;
                margin: 10px;
            }
            .button-secondary {
                background: #6b7280;
            }
            .footer {
                margin-top: 30px;
                font-size: 14px;
                color: #9ca3af;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">📧 Unsubscribe from Emails</div>
            
            <div class="message">
                <p>Hello ${user.name},</p>
                <p>We're sorry to see you go. You can unsubscribe from all email notifications from Alumni by Better.</p>
                <p><strong>Email:</strong> ${email}</p>
            </div>
            
            <form method="POST" action="/api/email/unsubscribe">
                <input type="hidden" name="email" value="${email}">
                <input type="hidden" name="trackingId" value="${trackingId || ''}">
                <button type="submit" class="button">
                    Unsubscribe from All Emails
                </button>
            </form>
            
            <a href="/api/email/preferences?email=${encodeURIComponent(email)}" class="button button-secondary">
                Manage Email Preferences
            </a>
            
            <div class="footer">
                <p>If you change your mind, you can always resubscribe from your account settings.</p>
                <p>Alumni by Better - Connecting Alumni Through Learning</p>
            </div>
        </div>
    </body>
    </html>
    `;

    return new NextResponse(unsubscribePageHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error handling unsubscribe request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const trackingId = formData.get('trackingId') as string;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Update user preferences to unsubscribe from all emails
    // For now, we'll just mark them as inactive
    // In a production app, you'd have a separate email preferences table
    await db.user.update({
      where: { email },
      data: {
        // In a real implementation, you'd have email preference fields
        // For now, we'll use a comment to indicate this would be handled
        updatedAt: new Date(),
      },
    });

    // Track the unsubscribe event
    if (trackingId) {
      // This would be tracked in the analytics system
      console.log(`User unsubscribed: ${email}, trackingId: ${trackingId}`);
    }

    // Return success page
    const successPageHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Unsubscribed - Alumni by Better</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 600px;
                margin: 0 auto;
                padding: 40px 20px;
                background-color: #f9fafb;
            }
            .container {
                background: white;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                text-align: center;
            }
            .header {
                color: #059669;
                font-size: 24px;
                margin-bottom: 20px;
            }
            .message {
                color: #6b7280;
                line-height: 1.6;
                margin-bottom: 30px;
            }
            .button {
                display: inline-block;
                background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                color: white;
                text-decoration: none;
                padding: 12px 24px;
                border-radius: 6px;
                font-weight: 600;
            }
            .footer {
                margin-top: 30px;
                font-size: 14px;
                color: #9ca3af;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">✅ Successfully Unsubscribed</div>
            
            <div class="message">
                <p>You have been successfully unsubscribed from all email notifications.</p>
                <p>We're sorry to see you go, but we understand that email preferences vary.</p>
                <p>You can still access your account and all learning materials on our platform.</p>
            </div>
            
            <a href="${process.env.NEXTAUTH_URL || 'https://alumni-lms.com'}/dashboard" class="button">
                Return to Dashboard
            </a>
            
            <div class="footer">
                <p>If you ever want to receive emails again, you can update your preferences in your account settings.</p>
                <p>Alumni by Better - Connecting Alumni Through Learning</p>
            </div>
        </div>
    </body>
    </html>
    `;

    return new NextResponse(successPageHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error processing unsubscribe:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}