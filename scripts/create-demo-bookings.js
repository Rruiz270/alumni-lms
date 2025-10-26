const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createDemoBookings() {
  try {
    console.log('📅 Creating demo bookings...')
    
    // Get demo users
    const student = await prisma.user.findUnique({ where: { email: 'estudiante@demo.com' } })
    const teacher = await prisma.user.findUnique({ where: { email: 'profesor@demo.com' } })
    
    if (!student || !teacher) {
      console.error('❌ Demo users not found. Run create-demo-users.js first.')
      return
    }
    
    // Get some topics
    const topics = await prisma.topic.findMany({ take: 5 })
    
    if (topics.length === 0) {
      console.error('❌ No topics found. Run seed-spanish-content.ts first.')
      return
    }
    
    // Create bookings for different dates and statuses
    const bookings = [
      {
        studentId: student.id,
        teacherId: teacher.id,
        topicId: topics[0].id,
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        duration: 60,
        status: 'SCHEDULED',
        googleMeetLink: 'https://meet.google.com/abc-defg-hij'
      },
      {
        studentId: student.id,
        teacherId: teacher.id,
        topicId: topics[1].id,
        scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        duration: 60,
        status: 'SCHEDULED',
        googleMeetLink: 'https://meet.google.com/abc-defg-hij'
      },
      {
        studentId: student.id,
        teacherId: teacher.id,
        topicId: topics[2].id,
        scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        duration: 60,
        status: 'COMPLETED',
        attendedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        googleMeetLink: 'https://meet.google.com/abc-defg-hij'
      },
      {
        studentId: student.id,
        teacherId: teacher.id,
        topicId: topics[3].id,
        scheduledAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
        duration: 60,
        status: 'NO_SHOW',
        googleMeetLink: 'https://meet.google.com/abc-defg-hij'
      },
      {
        studentId: student.id,
        teacherId: teacher.id,
        topicId: topics[4].id,
        scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
        duration: 60,
        status: 'CANCELLED',
        cancelledAt: new Date(),
        googleMeetLink: 'https://meet.google.com/abc-defg-hij'
      }
    ]
    
    // Check if bookings already exist
    const existingBookings = await prisma.booking.findMany()
    
    if (existingBookings.length === 0) {
      for (const booking of bookings) {
        await prisma.booking.create({ data: booking })
      }
      console.log(`✅ Created ${bookings.length} demo bookings`)
    } else {
      console.log(`ℹ️ ${existingBookings.length} bookings already exist, skipping creation`)
    }
    
    // Create some attendance logs
    const allBookings = await prisma.booking.findMany()
    
    for (const booking of allBookings) {
      const existingLogs = await prisma.attendanceLog.findMany({
        where: { bookingId: booking.id }
      })
      
      if (existingLogs.length === 0) {
        await prisma.attendanceLog.create({
          data: {
            bookingId: booking.id,
            studentId: booking.studentId,
            action: booking.status === 'COMPLETED' ? 'marked_present' : 'booking_created',
            timestamp: booking.createdAt,
            source: 'admin'
          }
        })
      }
    }
    
    console.log('✅ Demo bookings and attendance logs created successfully!')
    
  } catch (error) {
    console.error('❌ Error creating demo bookings:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDemoBookings()
  .then(() => {
    console.log('🎉 Demo booking creation completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Demo booking creation failed:', error)
    process.exit(1)
  })