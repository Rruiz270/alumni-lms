import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { meetBookingService } from '@/lib/meet-utils';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createBookingSchema = z.object({
  teacherId: z.string(),
  topicId: z.string(),
  scheduledAt: z.string().transform((str) => new Date(str)),
  duration: z.number().optional().default(60),
});

// GET /api/bookings - Get user's bookings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'upcoming'; // upcoming, past, all
    const role = searchParams.get('role') || 'student'; // student, teacher

    let bookings;

    if (type === 'upcoming') {
      bookings = await meetBookingService.getUpcomingBookings(
        session.user.id,
        role as 'student' | 'teacher'
      );
    } else {
      // Get all bookings for the user
      const where = {
        [role === 'student' ? 'studentId' : 'teacherId']: session.user.id,
        ...(type === 'past' && {
          scheduledAt: {
            lt: new Date(),
          },
        }),
      };

      bookings = await prisma.booking.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
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
              objectives: true,
              recursoGramatical: true,
              vocabulario: true,
              tema: true,
              classroomLink: true,
            },
          },
        },
        orderBy: {
          scheduledAt: type === 'past' ? 'desc' : 'asc',
        },
      });
    }

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create new booking
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { teacherId, topicId, scheduledAt, duration } = createBookingSchema.parse(body);

    // Verify user is a student
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Only students can create bookings' },
        { status: 403 }
      );
    }

    // Check if student has remaining lessons
    const activePackage = await prisma.package.findFirst({
      where: {
        userId: session.user.id,
        validUntil: {
          gte: new Date(),
        },
        remainingLessons: {
          gt: 0,
        },
      },
    });

    if (!activePackage) {
      return NextResponse.json(
        { error: 'No active package with remaining lessons' },
        { status: 400 }
      );
    }

    // Check if time slot is available
    const endTime = new Date(scheduledAt.getTime() + (duration * 60 * 1000));
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
      select: { email: true },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Check for conflicts with existing bookings
    const existingBooking = await prisma.booking.findFirst({
      where: {
        teacherId,
        status: {
          not: 'CANCELLED',
        },
        OR: [
          {
            scheduledAt: {
              lt: endTime,
            },
            AND: {
              scheduledAt: {
                gte: new Date(scheduledAt.getTime() - (60 * 60 * 1000)), // 1 hour buffer
              },
            },
          },
        ],
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: 'Time slot is not available' },
        { status: 400 }
      );
    }

    // Create the booking with Google Calendar integration
    const booking = await meetBookingService.createBooking({
      studentId: session.user.id,
      teacherId,
      topicId,
      scheduledAt,
      duration,
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}