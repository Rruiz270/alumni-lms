import { directPrisma as prisma } from '../src/lib/direct-prisma'

async function checkClassroomLinks() {
  try {
    console.log('Fetching topics with classroom links...')
    
    const topics = await prisma.topic.findMany({
      select: {
        id: true,
        name: true,
        level: true,
        classroomLink: true,
        orderIndex: true
      },
      orderBy: {
        orderIndex: 'asc'
      },
      take: 10
    })

    console.log(`Found ${topics.length} topics with classroom links:`)
    
    topics.forEach((topic, index) => {
      console.log(`\n${index + 1}. ${topic.name} (${topic.level} - Lesson ${topic.orderIndex})`)
      console.log(`   Link: ${topic.classroomLink}`)
      
      // Extract presentation ID if it's a Google Slides link
      const slideMatch = topic.classroomLink?.match(/\/presentation\/d\/([a-zA-Z0-9-_]+)/)
      if (slideMatch) {
        console.log(`   📊 Presentation ID: ${slideMatch[1]}`)
      }
      
      // Check for Google Drive folder links
      const folderMatch = topic.classroomLink?.match(/\/folders\/([a-zA-Z0-9-_]+)/)
      if (folderMatch) {
        console.log(`   📁 Folder ID: ${folderMatch[1]}`)
      }
      
      // Check for Google Classroom links
      const classroomMatch = topic.classroomLink?.match(/classroom\.google\.com/)
      if (classroomMatch) {
        console.log(`   🎓 Google Classroom Link`)
      }
    })

    console.log(`\nTotal topics in database: ${await prisma.topic.count()}`)
    
  } catch (error) {
    console.error('Error checking classroom links:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkClassroomLinks()