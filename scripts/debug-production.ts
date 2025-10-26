import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config()

// Use production database URL
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Zu1zG2LPUovb@ep-snowy-shadow-a4hoyxtl-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

console.log('🔍 Debugging production setup...')
console.log('📊 Database URL:', DATABASE_URL.substring(0, 50) + '...')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
})

async function debugProduction() {
  try {
    // Test database connection
    console.log('📡 Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Check topics
    const topicsCount = await prisma.topic.count()
    console.log(`📚 Topics in database: ${topicsCount}`)
    
    if (topicsCount > 0) {
      const sampleTopic = await prisma.topic.findFirst({
        select: {
          id: true,
          name: true,
          level: true,
          classroomLink: true
        }
      })
      console.log('📋 Sample topic:', sampleTopic)
    }
    
    // Check users  
    const usersCount = await prisma.user.count()
    console.log(`👥 Users in database: ${usersCount}`)
    
    if (usersCount > 0) {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      })
      console.log('👤 Users found:')
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.role}) - ${user.name}`)
      })
    }
    
    // Test login for Raphael
    const raphael = await prisma.user.findUnique({
      where: { email: 'raphael.ruiz@belatam.com.br' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true
      }
    })
    
    if (raphael) {
      console.log('✅ Raphael user found:', {
        email: raphael.email,
        name: raphael.name,
        role: raphael.role,
        hasPassword: !!raphael.password
      })
    } else {
      console.log('❌ Raphael user NOT found')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugProduction()