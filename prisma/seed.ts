import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting Alumni LMS database seeding...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@alumni.com' },
    update: {},
    create: {
      email: 'admin@alumni.com',
      password: adminPassword,
      name: 'Alumni Admin',
      role: 'ADMIN',
    },
  })
  console.log('✅ Created admin user')

  // Create Spanish teachers
  const teacherPassword = await bcrypt.hash('teacher123', 10)
  const teacher1 = await prisma.user.upsert({
    where: { email: 'teacher1@alumni.com' },
    update: {},
    create: {
      email: 'teacher1@alumni.com',
      password: teacherPassword,
      name: 'Prof. María García',
      role: 'TEACHER',
    },
  })

  const teacher2 = await prisma.user.upsert({
    where: { email: 'teacher2@alumni.com' },
    update: {},
    create: {
      email: 'teacher2@alumni.com',
      password: teacherPassword,
      name: 'Prof. Carlos Rodríguez',
      role: 'TEACHER',
    },
  })
  console.log('✅ Created Spanish teachers')

  // Create sample students
  const studentPassword = await bcrypt.hash('student123', 10)
  
  const students = [
    {
      email: 'student1@alumni.com',
      name: 'Ana Silva',
      level: 'A1',
      studentId: 'ALU001'
    },
    {
      email: 'student2@alumni.com', 
      name: 'Pedro Santos',
      level: 'A2',
      studentId: 'ALU002'
    },
    {
      email: 'student3@alumni.com',
      name: 'Laura Martins',
      level: 'B1', 
      studentId: 'ALU003'
    },
    {
      email: 'student4@alumni.com',
      name: 'João Costa',
      level: 'B2',
      studentId: 'ALU004'
    }
  ]

  for (const studentData of students) {
    const student = await prisma.user.upsert({
      where: { email: studentData.email },
      update: {},
      create: {
        email: studentData.email,
        password: studentPassword,
        name: studentData.name,
        role: 'STUDENT',
        level: studentData.level as any,
        studentId: studentData.studentId,
      },
    })

    // Create alumni profile for students
    await prisma.alumni.upsert({
      where: { userId: student.id },
      update: {},
      create: {
        userId: student.id,
        graduationYear: 2022,
        degree: 'Business Administration',
        institution: 'Better University',
        currentCompany: 'Better Corp',
        currentPosition: 'Business Analyst',
        bio: `Alumni member studying Spanish to enhance career opportunities.`,
        isPublic: true,
      },
    })

    // Create package for students (80 lessons valid for 1 year)
    const validFrom = new Date()
    const validUntil = new Date(validFrom)
    validUntil.setFullYear(validUntil.getFullYear() + 1)

    // Check if package already exists for this user
    const existingPackage = await prisma.package.findFirst({
      where: { userId: student.id }
    })
    
    if (!existingPackage) {
      const usedLessons = Math.floor(Math.random() * 10) // Random progress
      await prisma.package.create({
        data: {
          userId: student.id,
          totalLessons: 80,
          usedLessons,
          remainingLessons: 80 - usedLessons,
          validFrom,
          validUntil,
        },
      })
    }

    // Create student stats
    const totalClasses = Math.floor(Math.random() * 20) + 5
    const attendedClasses = Math.floor(totalClasses * 0.85) // 85% average attendance
    
    await prisma.studentStats.upsert({
      where: { studentId: student.id },
      update: {},
      create: {
        studentId: student.id,
        totalClasses,
        attendedClasses,
        attendanceRate: Math.round((attendedClasses / totalClasses) * 100),
      },
    })
  }
  console.log('✅ Created students with alumni profiles and packages')

  // Create teacher availability
  const weekDays = [1, 2, 3, 4, 5] // Monday to Friday
  const timeSlots = [
    { start: '09:00', end: '12:00' },
    { start: '14:00', end: '17:00' },
    { start: '19:00', end: '21:00' }
  ]

  for (const teacher of [teacher1, teacher2]) {
    for (const day of weekDays) {
      for (const slot of timeSlots) {
        await prisma.availability.create({
          data: {
            teacherId: teacher.id,
            dayOfWeek: day,
            startTime: slot.start,
            endTime: slot.end,
            isActive: Math.random() > 0.3, // 70% chance to be available
          },
        })
      }
    }
  }
  console.log('✅ Created teacher availability schedules')

  console.log('🎉 Alumni LMS database seeding completed!')
  console.log('\n📧 Demo accounts:')
  console.log('Admin: admin@alumni.com / admin123')
  console.log('Teacher: teacher1@alumni.com / teacher123')
  console.log('Student: student1@alumni.com / student123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })