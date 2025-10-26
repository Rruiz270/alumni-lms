import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email/emailService';

export async function GET(
  request: NextRequest,
  { params }: { params: { trackingId: string } }
) {
  try {
    const { trackingId } = params;
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Track the email click
    await emailService.trackEmailClick(trackingId, url);

    // Decode the URL and redirect
    const decodedUrl = decodeURIComponent(url);
    
    // Validate URL to prevent open redirects
    if (!isValidRedirectUrl(decodedUrl)) {
      return NextResponse.json(
        { error: 'Invalid redirect URL' },
        { status: 400 }
      );
    }

    return NextResponse.redirect(decodedUrl, 302);
  } catch (error) {
    console.error('Error tracking email click:', error);
    
    // Fallback redirect to dashboard if tracking fails
    const fallbackUrl = process.env.NEXTAUTH_URL || 'https://alumni-lms.com';
    return NextResponse.redirect(`${fallbackUrl}/dashboard`, 302);
  }
}

/**
 * Validate redirect URL to prevent open redirect attacks
 */
function isValidRedirectUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    const allowedDomains = [
      'alumni-lms.com',
      'alumni-better.com',
      'localhost',
      '127.0.0.1',
    ];

    // Check if it's a relative URL (starts with /)
    if (url.startsWith('/')) {
      return true;
    }

    // Check if domain is in allowed list
    const hostname = parsedUrl.hostname;
    return allowedDomains.some(domain => 
      hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}