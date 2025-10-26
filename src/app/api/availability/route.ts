import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const availabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6), // 0-6 (Sunday-Saturday)
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:MM format
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:MM format
  isActive: z.boolean().optional().default(true),
});

const bulkAvailabilitySchema = z.array(availabilitySchema);

// GET /api/availability - Get teacher availability
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    // If teacherId is provided, get that teacher's availability (for students/admin)
    // Otherwise, get the current user's availability (for teachers)
    const targetTeacherId = teacherId || session.user.id;

    // Check permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (teacherId && teacherId !== session.user.id && user?.role === 'STUDENT') {
      // Students can only view availability, not modify
    } else if (teacherId && teacherId !== session.user.id && user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const availability = await prisma.availability.findMany({
      where: {
        teacherId: targetTeacherId,
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    return NextResponse.json({ availability });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}

// POST /api/availability - Create or update teacher availability
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a teacher
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Only teachers can set availability' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Support both single availability object and array of availability objects
    const availabilityData = Array.isArray(body) ? body : [body];
    const validatedData = bulkAvailabilitySchema.parse(availabilityData);

    // First, deactivate all existing availability for this teacher
    await prisma.availability.updateMany({
      where: { teacherId: session.user.id },
      data: { isActive: false },
    });

    // Create or update availability slots
    const results = [];
    for (const avail of validatedData) {
      const { dayOfWeek, startTime, endTime, isActive } = avail;

      // Validate time range
      if (startTime >= endTime) {
        return NextResponse.json(
          { error: `Invalid time range for day ${dayOfWeek}: start time must be before end time` },
          { status: 400 }
        );
      }

      // Check for overlapping slots on the same day
      const overlapping = validatedData.filter(
        (other, index) =>
          other.dayOfWeek === dayOfWeek &&
          index !== validatedData.indexOf(avail) &&
          !(other.endTime <= startTime || other.startTime >= endTime)
      );

      if (overlapping.length > 0) {
        return NextResponse.json(
          { error: `Overlapping time slots found for day ${dayOfWeek}` },
          { status: 400 }
        );
      }

      // Create or update availability
      const availability = await prisma.availability.upsert({
        where: {
          teacherId_dayOfWeek_startTime: {
            teacherId: session.user.id,
            dayOfWeek,
            startTime,
          },
        },
        update: {
          endTime,
          isActive,
        },
        create: {
          teacherId: session.user.id,
          dayOfWeek,
          startTime,
          endTime,
          isActive,
        },
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      results.push(availability);
    }

    return NextResponse.json({ availability: results }, { status: 201 });
  } catch (error) {
    console.error('Error creating availability:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create availability' },
      { status: 500 }
    );
  }
}

// DELETE /api/availability - Clear all teacher availability
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a teacher
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Only teachers can manage availability' },
        { status: 403 }
      );
    }

    await prisma.availability.deleteMany({
      where: { teacherId: session.user.id },
    });

    return NextResponse.json({ message: 'Availability cleared successfully' });
  } catch (error) {
    console.error('Error clearing availability:', error);
    return NextResponse.json(
      { error: 'Failed to clear availability' },
      { status: 500 }
    );
  }
}