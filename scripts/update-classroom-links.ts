import { google } from 'googleapis'
import { directPrisma as prisma } from '../src/lib/direct-prisma'
import * as dotenv from 'dotenv'

dotenv.config()

async function updateTopicsWithRealClassroomLinks() {
  try {
    console.log('🔧 Updating topics with real classroom links from Google Sheets...')
    
    // Get Google Sheets auth
    const serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!)
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccountKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    })

    const sheets = google.sheets({ version: 'v4', auth })
    const spreadsheetId = '1ezRurCziI_hcHg3Shs5Hg3wAU_Cgdia_3p89LXncyKg'

    // Mapping of sheet names to levels
    const levelSheets = {
      'ÍNDICE A1': 'A1',
      'INDICE A2': 'A2', 
      'INDICE B1': 'B1',
      'INDICE B2': 'B2'
    }

    let totalLinksFound = 0
    let totalTopicsUpdated = 0

    for (const [sheetName, level] of Object.entries(levelSheets)) {
      console.log(`\n📊 Processing ${sheetName} (Level ${level})...`)
      
      try {
        // Get classroom links from column E only (since we know topic names from database)
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `${sheetName}!E:E`,
          valueRenderOption: 'UNFORMATTED_VALUE'
        })

        const rows = response.data.values || []
        console.log(`Found ${rows.length} rows in column E for ${sheetName}`)

        // Get existing topics for this level from database, ordered by orderIndex
        const existingTopics = await prisma.topic.findMany({
          where: { level },
          select: { id: true, name: true, orderIndex: true },
          orderBy: { orderIndex: 'asc' }
        })

        console.log(`Found ${existingTopics.length} existing ${level} topics in database`)

        // Process each row to extract classroom links
        let linksFoundInSheet = 0
        for (let i = 1; i < rows.length; i++) { // Skip header row
          const row = rows[i] || []
          const classroomLink = row[0]?.toString()?.trim() // Column E is now index 0
          
          if (classroomLink && (
              classroomLink.includes('docs.google.com/presentation') ||
              classroomLink.includes('drive.google.com/file')
            )) {
            
            // Find corresponding topic in database by matching row number to existing topics
            // Skip first few rows and match with topics in order
            const topicIndex = linksFoundInSheet; // Use number of links found so far as index
            const matchingTopic = existingTopics[topicIndex]
            
            if (matchingTopic) {
              try {
                await prisma.topic.update({
                  where: { id: matchingTopic.id },
                  data: { classroomLink }
                })
                
                console.log(`✅ Updated "${matchingTopic.name}" with link: ${classroomLink.substring(0, 50)}...`)
                totalTopicsUpdated++
              } catch (updateError) {
                console.error(`❌ Failed to update topic ${matchingTopic.id}:`, updateError)
              }
            } else {
              console.log(`⚠️ No matching topic available for link index ${topicIndex} (only ${existingTopics.length} topics exist)`)
            }
            
            linksFoundInSheet++
            totalLinksFound++
          }
        }
        
        console.log(`📝 Found ${linksFoundInSheet} classroom links in ${sheetName}`)

      } catch (error) {
        console.error(`❌ Error processing ${sheetName}:`, error.message)
      }
    }

    console.log(`\n🎯 Summary:`)
    console.log(`📊 Total classroom links found: ${totalLinksFound}`)
    console.log(`✅ Total topics updated: ${totalTopicsUpdated}`)
    
    // Verify updates
    console.log(`\n🔍 Verifying updates...`)
    const updatedTopics = await prisma.topic.findMany({
      where: {
        classroomLink: {
          contains: 'docs.google.com'
        }
      },
      select: {
        id: true,
        name: true,
        level: true,
        classroomLink: true
      }
    })
    
    console.log(`✅ ${updatedTopics.length} topics now have real Google Slides links`)
    
    // Show sample of updated topics
    console.log(`\n📋 Sample updated topics:`)
    updatedTopics.slice(0, 5).forEach(topic => {
      console.log(`- ${topic.level}: ${topic.name} -> ${topic.classroomLink?.substring(0, 60)}...`)
    })

  } catch (error) {
    console.error('❌ Error updating classroom links:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateTopicsWithRealClassroomLinks()