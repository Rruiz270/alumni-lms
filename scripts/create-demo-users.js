const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createDemoUsers() {
  try {
    console.log('🚀 Creating demo users...')
    
    // Hash password for demo users
    const hashedPassword = await bcrypt.hash('demo123', 10)
    
    // Create demo student
    const student = await prisma.user.upsert({
      where: { email: 'estudiante@demo.com' },
      update: {},
      create: {
        email: 'estudiante@demo.com',
        password: hashedPassword,
        name: 'María García',
        role: 'STUDENT',
        level: 'A1',
        studentId: 'EST001'
      }
    })
    
    // Create demo teacher
    const teacher = await prisma.user.upsert({
      where: { email: 'profesor@demo.com' },
      update: {},
      create: {
        email: 'profesor@demo.com',
        password: hashedPassword,
        name: 'Carlos Rodríguez',
        role: 'TEACHER'
      }
    })
    
    // Create demo admin
    const admin = await prisma.user.upsert({
      where: { email: 'admin@demo.com' },
      update: {},
      create: {
        email: 'admin@demo.com',
        password: hashedPassword,
        name: 'Ana Silva',
        role: 'ADMIN'
      }
    })
    
    console.log('✅ Demo users created successfully:')
    console.log('👨‍🎓 Student:', student.email, '-', student.name)
    console.log('👩‍🏫 Teacher:', teacher.email, '-', teacher.name)
    console.log('👑 Admin:', admin.email, '-', admin.name)
    console.log('🔑 Password for all: demo123')
    
  } catch (error) {
    console.error('❌ Error creating demo users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDemoUsers()