const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkRemainingImports() {
  try {
    console.log('🔍 CHECKING REMAINING TOPICS TO IMPORT:')
    console.log('====================================')
    
    // Get all topics with classroom links
    const allTopicsWithLinks = await prisma.topic.findMany({
      where: {
        classroomLink: {
          not: null,
          not: ''
        }
      },
      select: {
        id: true,
        name: true,
        level: true,
        classroomLink: true,
        orderIndex: true
      },
      orderBy: [
        { level: 'asc' },
        { orderIndex: 'asc' }
      ]
    })

    // Get topics that already have presentations
    const importedTopics = await prisma.presentation.findMany({
      select: {
        topicId: true,
        topic: {
          select: {
            name: true,
            level: true
          }
        }
      }
    })

    const importedTopicIds = new Set(importedTopics.map(p => p.topicId).filter(Boolean))

    // Find remaining topics
    const remainingTopics = allTopicsWithLinks.filter(topic => 
      !importedTopicIds.has(topic.id)
    )

    console.log(`📚 TOTAL TOPICS WITH LINKS: ${allTopicsWithLinks.length}`)
    console.log(`✅ ALREADY IMPORTED: ${importedTopics.length}`)
    console.log(`⏳ REMAINING TO IMPORT: ${remainingTopics.length}`)
    console.log('')

    if (remainingTopics.length > 0) {
      console.log('📋 REMAINING TOPICS TO IMPORT:')
      remainingTopics.forEach((topic, index) => {
        console.log(`${index + 1}. ${topic.name} (${topic.level})`)
        console.log(`    ID: ${topic.id}`)
        console.log(`    Link: ${topic.classroomLink}`)
        console.log('')
      })

      // Group by level
      const byLevel = remainingTopics.reduce((acc, topic) => {
        acc[topic.level] = (acc[topic.level] || 0) + 1
        return acc
      }, {})

      console.log('📊 REMAINING BY LEVEL:')
      Object.entries(byLevel).forEach(([level, count]) => {
        console.log(`   ${level}: ${count} topics`)
      })
    } else {
      console.log('🎉 ALL TOPICS WITH CLASSROOM LINKS HAVE BEEN IMPORTED!')
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkRemainingImports()