const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkAdminUsers() {
  try {
    // Check for admin users
    const adminUsers = await prisma.user.findMany({
      where: {
        role: 'ADMIN'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    console.log('🔐 ADMIN USERS IN DATABASE:')
    console.log('==========================')
    
    if (adminUsers.length === 0) {
      console.log('❌ No admin users found!')
      console.log('')
      console.log('📝 You need to either:')
      console.log('1. Create an admin user')
      console.log('2. Temporarily bypass authentication for import')
    } else {
      console.log(`✅ Found ${adminUsers.length} admin user(s):`)
      adminUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email}) - Created: ${user.createdAt}`)
      })
    }

    // Also check all users to see what we have
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    console.log('')
    console.log('👥 ALL USERS IN DATABASE:')
    console.log('=========================')
    if (allUsers.length === 0) {
      console.log('❌ No users found!')
    } else {
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`)
      })
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdminUsers()