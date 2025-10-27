const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkAdminPasswords() {
  try {
    // Check admin users and their password status
    const adminUsers = await prisma.user.findMany({
      where: {
        role: 'ADMIN'
      },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        createdAt: true
      }
    })

    console.log('🔐 ADMIN PASSWORD STATUS:')
    console.log('========================')
    
    adminUsers.forEach((user, index) => {
      const hasPassword = user.password ? '✅ Has password' : '❌ No password set'
      console.log(`${index + 1}. ${user.email} - ${hasPassword}`)
    })

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdminPasswords()