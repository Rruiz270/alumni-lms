import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

dotenv.config()

// Use production database URL
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Zu1zG2LPUovb@ep-snowy-shadow-a4hoyxtl-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
})

async function createProductionUsers() {
  try {
    console.log('🚀 Creating production test users...')
    console.log('📊 Database URL:', DATABASE_URL.substring(0, 50) + '...')
    
    // Create a secure password hash for all test users
    const password = 'alumni2024'
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Create teacher account (Raphael)
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
    console.log(`✅ Created teacher: ${teacher.email}`)
    
    // Create admin user
    const admin = await prisma.user.upsert({
      where: { email: 'admin@alumni-lms.com' },
      update: {},
      create: {
        email: 'admin@alumni-lms.com',
        password: hashedPassword,
        name: 'Admin Alumni',
        role: 'ADMIN',
        isActive: true
      }
    })
    console.log(`✅ Created admin: ${admin.email}`)
    
    // Create test students for each level
    const testStudents = [
      { email: 'student.a1@alumni-test.com', name: 'María García (A1)', level: 'A1' },
      { email: 'student.a2@alumni-test.com', name: 'Carlos López (A2)', level: 'A2' },
      { email: 'student.b1@alumni-test.com', name: 'Ana Martínez (B1)', level: 'B1' },
      { email: 'student.b2@alumni-test.com', name: 'Diego Hernández (B2)', level: 'B2' }
    ]
    
    for (const studentData of testStudents) {
      const student = await prisma.user.upsert({
        where: { email: studentData.email },
        update: {},
        create: {
          email: studentData.email,
          password: hashedPassword,
          name: studentData.name,
          role: 'STUDENT',
          isActive: true
        }
      })
      console.log(`✅ Created student: ${student.email} (${studentData.level})`)
    }
    
    console.log('\n🎉 Production users created successfully!')
    console.log('\n📋 Login credentials:')
    console.log('Password for all users: alumni2024')
    console.log('\n👨‍🏫 Teacher:')
    console.log('  Email: raphael.ruiz@belatam.com.br')
    console.log('\n👩‍💼 Admin:')
    console.log('  Email: admin@alumni-lms.com')
    console.log('\n👨‍🎓 Students:')
    console.log('  Email: student.a1@alumni-test.com (A1 level)')
    console.log('  Email: student.a2@alumni-test.com (A2 level)')
    console.log('  Email: student.b1@alumni-test.com (B1 level)')
    console.log('  Email: student.b2@alumni-test.com (B2 level)')
    
  } catch (error) {
    console.error('❌ Error creating production users:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the user creation
createProductionUsers()
  .then(() => {
    console.log('🎉 Production users creation completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 User creation failed:', error)
    process.exit(1)
  })