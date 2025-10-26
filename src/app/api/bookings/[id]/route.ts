import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { meetBookingService } from '@/lib/meet-utils';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateBookingSchema = z.object({
  scheduledAt: z.string().transform((str) => new Date(str)).optional(),
  status: z.enum(['SCHEDULED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']).optional(),
  attended: z.boolean().optional(),
});

// GET /api/bookings/[id] - Get specific booking
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
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
        attendanceLogs: {
          orderBy: {
            timestamp: 'desc',
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user has access to this booking
    if (booking.studentId !== session.user.id && booking.teacherId !== session.user.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });

      if (user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

// PUT /api/bookings/[id] - Update booking
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { scheduledAt, status, attended } = updateBookingSchema.parse(body);

    // Get the booking to check permissions
    const existingBooking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        student: true,
        teacher: true,
      },
    });

    if (!existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const canUpdate = 
      existingBooking.studentId === session.user.id ||
      existingBooking.teacherId === session.user.id ||
      user?.role === 'ADMIN';

    if (!canUpdate) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Handle different update operations
    if (attended !== undefined) {
      // Mark attendance
      await meetBookingService.markAttendance(params.id, attended);
      return NextResponse.json({ message: 'Attendance updated successfully' });
    }

    if (status === 'CANCELLED') {
      // Cancel booking
      await meetBookingService.cancelBooking(params.id);
      return NextResponse.json({ message: 'Booking cancelled successfully' });
    }

    if (scheduledAt) {
      // Reschedule booking
      const booking = await meetBookingService.rescheduleBooking(params.id, scheduledAt);
      return NextResponse.json({ booking });
    }

    // General status update
    if (status) {
      const booking = await prisma.booking.update({
        where: { id: params.id },
        data: { status },
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
      });

      return NextResponse.json({ booking });
    }

    return NextResponse.json({ message: 'No updates specified' }, { status: 400 });
  } catch (error) {
    console.error('Error updating booking:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings/[id] - Cancel booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the booking to check permissions
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      select: {
        studentId: true,
        teacherId: true,
        status: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const canDelete = 
      booking.studentId === session.user.id ||
      booking.teacherId === session.user.id ||
      user?.role === 'ADMIN';

    if (!canDelete) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (booking.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Booking already cancelled' }, { status: 400 });
    }

    await meetBookingService.cancelBooking(params.id);
    return NextResponse.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}