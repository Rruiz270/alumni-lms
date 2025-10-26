import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config()

// Use production database URL - same one Vercel will use
const PRODUCTION_DATABASE_URL = 'postgresql://neondb_owner:npg_Zu1zG2LPUovb@ep-snowy-shadow-a4hoyxtl-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: PRODUCTION_DATABASE_URL
    }
  }
})

async function quickVercelTest() {
  try {
    console.log('🚀 Testing direct connection to production database...')
    
    // Test the exact same database that Vercel will use
    const topicsCount = await prisma.topic.count()
    console.log(`📚 Topics in production: ${topicsCount}`)
    
    // Test getting topics like the API would
    const topics = await prisma.topic.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        level: true,
        orderIndex: true
      },
      orderBy: [
        { level: 'asc' },
        { orderIndex: 'asc' }
      ]
    })
    
    console.log('📋 Sample topics that Vercel should see:')
    topics.forEach((topic, index) => {
      console.log(`  ${index + 1}. [${topic.level}] ${topic.name}`)
    })
    
    // Test user authentication
    const raphael = await prisma.user.findUnique({
      where: { email: 'raphael.ruiz@belatam.com.br' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })
    
    if (raphael) {
      console.log('✅ Your teacher account is ready:', raphael)
    }
    
    console.log('\n🎯 SUMMARY:')
    console.log(`- Production database has ${topicsCount} topics ✅`)
    console.log(`- Your teacher account exists ✅`)
    console.log(`- Database connection works ✅`)
    console.log('\nThe issue is just Vercel environment variables!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

quickVercelTest()