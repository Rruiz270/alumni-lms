import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Creating essential accounts...')

  try {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.create({
      data: {
        email: 'admin@alumni.com',
        password: adminPassword,
        name: 'Alumni Admin',
        role: 'ADMIN',
      },
    })
    console.log('✅ Created admin user')

    // Create one teacher
    const teacherPassword = await bcrypt.hash('teacher123', 10)
    const teacher = await prisma.user.create({
      data: {
        email: 'teacher@alumni.com',
        password: teacherPassword,
        name: 'Prof. María García',
        role: 'TEACHER',
      },
    })
    console.log('✅ Created Spanish teacher')

    // Create one student
    const studentPassword = await bcrypt.hash('student123', 10)
    const student = await prisma.user.create({
      data: {
        email: 'student@alumni.com',
        password: studentPassword,
        name: 'Ana Silva',
        role: 'STUDENT',
        level: 'A1',
        studentId: 'ALU001',
      },
    })

    // Create alumni profile
    await prisma.alumni.create({
      data: {
        userId: student.id,
        graduationYear: 2022,
        degree: 'Business Administration',
        institution: 'Better University',
        currentCompany: 'Better Corp',
        currentPosition: 'Business Analyst',
        bio: 'Alumni member studying Spanish to enhance career opportunities.',
        isPublic: true,
      },
    })

    // Create package
    const validFrom = new Date()
    const validUntil = new Date(validFrom)
    validUntil.setFullYear(validUntil.getFullYear() + 1)

    await prisma.package.create({
      data: {
        userId: student.id,
        totalLessons: 80,
        usedLessons: 5,
        remainingLessons: 75,
        validFrom,
        validUntil,
      },
    })

    console.log('✅ Created student with alumni profile and package')
    console.log('\n📧 Demo accounts:')
    console.log('Admin: admin@alumni.com / admin123')
    console.log('Teacher: teacher@alumni.com / teacher123') 
    console.log('Student: student@alumni.com / student123')

  } catch (error) {
    console.error('Error:', error)
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })