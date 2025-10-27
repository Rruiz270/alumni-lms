const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkAllContent() {
  try {
    // Check all topics
    const allTopics = await prisma.topic.findMany({
      select: {
        id: true,
        name: true,
        level: true,
        classroomLink: true,
      },
      orderBy: [
        { level: 'asc' },
        { name: 'asc' }
      ]
    })

    console.log('📚 ALL TOPICS IN DATABASE:')
    console.log('========================')
    
    let topicsWithLinks = 0
    let topicsWithoutLinks = 0
    
    allTopics.forEach((topic, index) => {
      const hasLink = topic.classroomLink ? '✅' : '❌'
      console.log(`${index + 1}. ${hasLink} ${topic.name} (${topic.level})`)
      if (topic.classroomLink) {
        console.log(`     Link: ${topic.classroomLink}`)
        topicsWithLinks++
      } else {
        console.log(`     No classroom link`)
        topicsWithoutLinks++
      }
      console.log('')
    })

    console.log('📊 SUMMARY:')
    console.log(`Total topics: ${allTopics.length}`)
    console.log(`With classroom links: ${topicsWithLinks}`)
    console.log(`Without classroom links: ${topicsWithoutLinks}`)

    // Group by level
    const byLevel = allTopics.reduce((acc, topic) => {
      acc[topic.level] = acc[topic.level] || { total: 0, withLinks: 0 }
      acc[topic.level].total++
      if (topic.classroomLink) acc[topic.level].withLinks++
      return acc
    }, {})

    console.log('\n📈 BY LEVEL:')
    Object.entries(byLevel).forEach(([level, stats]) => {
      console.log(`${level}: ${stats.withLinks}/${stats.total} topics have classroom links`)
    })

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAllContent()