import { PrismaClient } from '@prisma/client'

// HARDCODED production database connection - bypassing environment variables
const DIRECT_DATABASE_URL = 'postgresql://neondb_owner:npg_Zu1zG2LPUovb@ep-snowy-shadow-a4hoyxtl-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

// Create a direct connection to production database
export const directPrisma = new PrismaClient({
  datasources: {
    db: {
      url: DIRECT_DATABASE_URL
    }
  }
})

// Fallback prisma client
export const prisma = directPrisma