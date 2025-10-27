const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function setAdminPassword() {
  try {
    const email = 'admin@alumni.com'
    const newPassword = 'admin123' // Simple password for testing
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    
    // Update the admin user password
    const updatedUser = await prisma.user.update({
      where: {
        email: email
      },
      data: {
        password: hashedPassword
      }
    })

    console.log('✅ Admin password updated successfully!')
    console.log('')
    console.log('🔐 LOGIN CREDENTIALS:')
    console.log('====================')
    console.log(`Email: ${email}`)
    console.log(`Password: ${newPassword}`)
    console.log('')
    console.log('📋 NEXT STEPS:')
    console.log('1. Go to your Alumni LMS site + /auth/login')
    console.log('2. Login with the credentials above')
    console.log('3. Navigate to /admin')
    console.log('4. Click "Content Import"')
    console.log('5. Click "Start Bulk Import"')

  } catch (error) {
    console.error('Error updating admin password:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setAdminPassword()