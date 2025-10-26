import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

// GET /api/admin/bookings/[id] - Get booking details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (adminUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        scheduledAt: true,
        duration: true,
        status: true,
        googleMeetLink: true,
        googleEventId: true,
        cancelledAt: true,
        attendedAt: true,
        createdAt: true,
        updatedAt: true,
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
            level: true,
            packages: {
              select: {
                totalLessons: true,
                usedLessons: true,
                remainingLessons: true,
                validUntil: true
              }
            }
          }
        },
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        topic: {
          select: {
            id: true,
            name: true,
            level: true,
            description: true,
            recursoGramatical: true,
            vocabulario: true,
            tema: true,
            objetivoImplicito: true,
            classroomLink: true
          }
        },
        attendanceLogs: {
          select: {
            id: true,
            action: true,
            timestamp: true,
            recordedBy: true,
            source: true
          },
          orderBy: { timestamp: 'asc' }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/admin/bookings/[id] - Update booking status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, id: true }
    })

    if (adminUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { status, scheduledAt, teacherId, topicId } = body

    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        student: { select: { id: true } }
      }
    })

    if (!existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {}
    
    if (status) {
      updateData.status = status
      
      // Set timestamps based on status
      if (status === 'CANCELLED') {
        updateData.cancelledAt = new Date()
      } else if (status === 'COMPLETED') {
        updateData.attendedAt = new Date()
        
        // Create attendance log for completion
        await prisma.attendanceLog.create({
          data: {
            bookingId: params.id,
            studentId: existingBooking.studentId,
            action: 'marked_present',
            timestamp: new Date(),
            recordedBy: adminUser.id,
            source: 'admin'
          }
        })
      }
    }
    
    if (scheduledAt) {
      updateData.scheduledAt = new Date(scheduledAt)
    }
    
    if (teacherId) {
      updateData.teacherId = teacherId
    }
    
    if (topicId) {
      updateData.topicId = topicId
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        scheduledAt: true,
        status: true,
        student: {
          select: { name: true, studentId: true }
        },
        teacher: {
          select: { name: true }
        },
        topic: {
          select: { name: true, level: true }
        }
      }
    })

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/bookings/[id] - Cancel booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, id: true }
    })

    if (adminUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id: params.id }
    })

    if (!existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Cancel the booking
    const cancelledBooking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date()
      },
      select: {
        id: true,
        status: true,
        student: {
          select: { name: true, studentId: true }
        },
        teacher: {
          select: { name: true }
        },
        topic: {
          select: { name: true, level: true }
        }
      }
    })

    // Create attendance log
    await prisma.attendanceLog.create({
      data: {
        bookingId: params.id,
        studentId: existingBooking.studentId,
        action: 'cancelled_by_admin',
        timestamp: new Date(),
        recordedBy: adminUser.id,
        source: 'admin'
      }
    })

    return NextResponse.json({ 
      message: 'Booking cancelled successfully', 
      booking: cancelledBooking 
    })
  } catch (error) {
    console.error('Error cancelling booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}