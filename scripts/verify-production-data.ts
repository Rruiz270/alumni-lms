import { PrismaClient } from '@prisma/client'
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

async function verifyProductionData() {
  try {
    console.log('🔍 Verifying production data...')
    console.log('📊 Database URL:', DATABASE_URL.substring(0, 50) + '...')
    
    // Check topics count
    const topicsCount = await prisma.topic.count()
    console.log(`📚 Total topics in production: ${topicsCount}`)
    
    // Check topics by level
    const levels = ['A1', 'A2', 'B1', 'B2']
    for (const level of levels) {
      const levelCount = await prisma.topic.count({
        where: { level: level as any }
      })
      console.log(`  ${level}: ${levelCount} topics`)
    }
    
    // Check users count
    const usersCount = await prisma.user.count()
    console.log(`👥 Total users in production: ${usersCount}`)
    
    // Check users by role
    const roles = ['ADMIN', 'TEACHER', 'STUDENT']
    for (const role of roles) {
      const roleCount = await prisma.user.count({
        where: { role: role as any }
      })
      console.log(`  ${role}: ${roleCount} users`)
    }
    
    // Show some sample topics
    console.log('\n📋 Sample topics:')
    const sampleTopics = await prisma.topic.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        level: true,
        classroomLink: true
      }
    })
    
    sampleTopics.forEach((topic, index) => {
      console.log(`  ${index + 1}. [${topic.level}] ${topic.name}`)
      if (topic.classroomLink) {
        console.log(`     🔗 ${topic.classroomLink}`)
      }
    })
    
    console.log('\n✅ Production data verification completed!')
    
  } catch (error) {
    console.error('❌ Error verifying production data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the verification
verifyProductionData()
  .then(() => {
    console.log('🎉 Production data verification completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Verification failed:', error)
    process.exit(1)
  })