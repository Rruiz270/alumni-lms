import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { meetBookingService } from '@/lib/meet-utils';
import { prisma } from '@/lib/prisma';

// GET /api/available-slots - Get available time slots for booking
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const date = searchParams.get('date');
    const duration = parseInt(searchParams.get('duration') || '60');

    if (!teacherId) {
      return NextResponse.json(
        { error: 'teacherId is required' },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: 'date is required (YYYY-MM-DD format)' },
        { status: 400 }
      );
    }

    // Parse and validate date
    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Don't allow booking in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (targetDate < today) {
      return NextResponse.json(
        { error: 'Cannot book classes in the past' },
        { status: 400 }
      );
    }

    // Verify teacher exists and is active
    const teacher = await prisma.user.findUnique({
      where: {
        id: teacherId,
        role: 'TEACHER',
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found or inactive' },
        { status: 404 }
      );
    }

    // Get available slots
    const slots = await meetBookingService.getAvailableSlots(
      teacherId,
      targetDate,
      duration
    );

    return NextResponse.json({ 
      slots,
      teacher,
      date: date,
      duration,
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available slots' },
      { status: 500 }
    );
  }
}