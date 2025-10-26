const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createRealUsers() {
  try {
    console.log('👥 Creating real Alumni test users...')
    
    // Hash password for test users
    const hashedPassword = await bcrypt.hash('alumni2024', 10)
    
    // Create Raphael as Teacher
    const teacher = await prisma.user.upsert({
      where: { email: 'raphael.ruiz@belatam.com.br' },
      update: {},
      create: {
        email: 'raphael.ruiz@belatam.com.br',
        password: hashedPassword,
        name: 'Raphael Ruiz',
        role: 'TEACHER',
        isActive: true
      }
    })
    
    // Create Admin user for Alumni management
    const admin = await prisma.user.upsert({
      where: { email: 'admin@alumni.com' },
      update: {},
      create: {
        email: 'admin@alumni.com',
        password: hashedPassword,
        name: 'Alumni Admin',
        role: 'ADMIN',
        isActive: true
      }
    })
    
    // Create test students for different levels
    const students = [
      {
        email: 'student.a1@test.alumni.com',
        name: 'Ana García (A1)',
        level: 'A1',
        studentId: 'ALU-A1-001'
      },
      {
        email: 'student.a2@test.alumni.com',
        name: 'Carlos López (A2)',
        level: 'A2', 
        studentId: 'ALU-A2-001'
      },
      {
        email: 'student.b1@test.alumni.com',
        name: 'María Silva (B1)',
        level: 'B1',
        studentId: 'ALU-B1-001'
      },
      {
        email: 'student.b2@test.alumni.com',
        name: 'Diego Martín (B2)',
        level: 'B2',
        studentId: 'ALU-B2-001'
      }
    ]
    
    const createdStudents = []
    for (const studentData of students) {
      const student = await prisma.user.upsert({
        where: { email: studentData.email },
        update: {},
        create: {
          email: studentData.email,
          password: hashedPassword,
          name: studentData.name,
          role: 'STUDENT',
          level: studentData.level,
          studentId: studentData.studentId,
          isActive: true
        }
      })
      createdStudents.push(student)
    }
    
    console.log('✅ Real Alumni users created successfully:')
    console.log(`👨‍🏫 Teacher: ${teacher.email} - ${teacher.name}`)
    console.log(`👑 Admin: ${admin.email} - ${admin.name}`)
    
    createdStudents.forEach(student => {
      console.log(`👨‍🎓 Student: ${student.email} - ${student.name}`)
    })
    
    console.log('\n🔑 Login credentials for all users:')
    console.log('Password: alumni2024')
    console.log('\n🎯 Test accounts by level:')
    console.log('- A1 Beginner: student.a1@test.alumni.com')
    console.log('- A2 Elementary: student.a2@test.alumni.com') 
    console.log('- B1 Intermediate: student.b1@test.alumni.com')
    console.log('- B2 Upper-Intermediate: student.b2@test.alumni.com')
    
  } catch (error) {
    console.error('❌ Error creating real users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createRealUsers()
  .then(() => {
    console.log('🎉 Real user creation completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 User creation failed:', error)
    process.exit(1)
  })