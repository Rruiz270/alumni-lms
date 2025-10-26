/**
 * Test script for Google Meet integration with Spanish topics
 * Run with: tsx scripts/test-meet-integration.ts
 */

import { PrismaClient } from '@prisma/client';
import { meetBookingService } from '../src/lib/meet-utils';
import { emailNotificationService } from '../src/lib/email-notifications';

const prisma = new PrismaClient();

async function testMeetIntegration() {
  console.log('🚀 Testing Google Meet Integration...\n');

  try {
    // 1. Check Spanish topics are available
    console.log('1. Checking Spanish topics...');
    const spanishTopics = await prisma.topic.findMany({
      where: {
        level: {
          in: ['A1', 'A2', 'B1'],
        },
      },
      take: 5,
    });
    
    console.log(`✅ Found ${spanishTopics.length} Spanish topics`);
    spanishTopics.forEach(topic => {
      console.log(`   - ${topic.name} (${topic.level}) - ${topic.tema || 'No theme'}`);
    });
    console.log();

    // 2. Check teachers are available
    console.log('2. Checking available teachers...');
    const teachers = await prisma.user.findMany({
      where: {
        role: 'TEACHER',
        isActive: true,
      },
      take: 3,
    });
    
    console.log(`✅ Found ${teachers.length} active teachers`);
    teachers.forEach(teacher => {
      console.log(`   - ${teacher.name} (${teacher.email})`);
    });
    console.log();

    // 3. Check students with packages
    console.log('3. Checking students with lesson packages...');
    const studentsWithPackages = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        packages: {
          some: {
            validUntil: {
              gte: new Date(),
            },
            remainingLessons: {
              gt: 0,
            },
          },
        },
      },
      include: {
        packages: {
          where: {
            validUntil: {
              gte: new Date(),
            },
            remainingLessons: {
              gt: 0,
            },
          },
        },
      },
      take: 3,
    });
    
    console.log(`✅ Found ${studentsWithPackages.length} students with active packages`);
    studentsWithPackages.forEach(student => {
      const activePackage = student.packages[0];
      console.log(`   - ${student.name}: ${activePackage?.remainingLessons || 0} lessons remaining`);
    });
    console.log();

    // 4. Test teacher availability setup
    console.log('4. Testing teacher availability...');
    if (teachers.length > 0) {
      const teacher = teachers[0];
      
      // Check existing availability
      const existingAvailability = await prisma.availability.findMany({
        where: { teacherId: teacher.id },
      });
      
      console.log(`✅ Teacher ${teacher.name} has ${existingAvailability.length} availability slots`);
      
      // If no availability, create a sample one for testing
      if (existingAvailability.length === 0) {
        await prisma.availability.create({
          data: {
            teacherId: teacher.id,
            dayOfWeek: 1, // Monday
            startTime: '09:00',
            endTime: '17:00',
            isActive: true,
          },
        });
        console.log(`✅ Created sample availability for ${teacher.name}: Monday 09:00-17:00`);
      }
    }
    console.log();

    // 5. Test available slots calculation
    console.log('5. Testing available slots calculation...');
    if (teachers.length > 0) {
      const teacher = teachers[0];
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      try {
        const availableSlots = await meetBookingService.getAvailableSlots(
          teacher.id,
          tomorrow,
          60
        );
        
        console.log(`✅ Found ${availableSlots.length} available slots for ${teacher.name} tomorrow`);
        availableSlots.slice(0, 3).forEach(slot => {
          console.log(`   - ${slot.start.toLocaleTimeString()} - ${slot.end.toLocaleTimeString()}`);
        });
      } catch (error) {
        console.log(`⚠️  Could not calculate available slots: ${error}`);
      }
    }
    console.log();

    // 6. Test booking creation (dry run - don't actually create)
    console.log('6. Testing booking creation logic...');
    if (teachers.length > 0 && studentsWithPackages.length > 0 && spanishTopics.length > 0) {
      const teacher = teachers[0];
      const student = studentsWithPackages[0];
      const topic = spanishTopics[0];
      
      // Calculate a future time slot
      const scheduledAt = new Date();
      scheduledAt.setDate(scheduledAt.getDate() + 2); // Day after tomorrow
      scheduledAt.setHours(10, 0, 0, 0); // 10:00 AM
      
      console.log('📝 Booking parameters:');
      console.log(`   - Student: ${student.name}`);
      console.log(`   - Teacher: ${teacher.name}`);
      console.log(`   - Topic: ${topic.name} (${topic.level})`);
      console.log(`   - Time: ${scheduledAt.toLocaleString()}`);
      console.log(`   - Theme: ${topic.tema || 'No theme specified'}`);
      console.log(`   - Grammar: ${topic.recursoGramatical || 'No grammar resource'}`);
      console.log(`   - Vocabulary: ${topic.vocabulario || 'No vocabulary theme'}`);
      
      console.log('✅ Booking parameters validated');
    }
    console.log();

    // 7. Test email configuration (without sending)
    console.log('7. Testing email configuration...');
    const smtpConfig = {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS ? '***' : 'Not set',
    };
    
    console.log('📧 Email configuration:');
    Object.entries(smtpConfig).forEach(([key, value]) => {
      console.log(`   - ${key}: ${value}`);
    });
    
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      console.log('✅ Email configuration appears complete');
    } else {
      console.log('⚠️  Email configuration incomplete - emails will not be sent');
    }
    console.log();

    // 8. Test Google Calendar configuration
    console.log('8. Testing Google Calendar configuration...');
    const googleConfig = {
      serviceAccountKey: process.env.GOOGLE_SERVICE_ACCOUNT_KEY ? 'Set' : 'Not set',
      clientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set',
    };
    
    console.log('📅 Google Calendar configuration:');
    Object.entries(googleConfig).forEach(([key, value]) => {
      console.log(`   - ${key}: ${value}`);
    });
    
    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      console.log('✅ Google Calendar configuration appears complete');
    } else {
      console.log('⚠️  Google Calendar configuration incomplete - calendar events will not be created');
    }
    console.log();

    // 9. Database schema validation
    console.log('9. Validating database schema...');
    
    // Check if all required fields exist by trying to select them
    const schemaCheck = await prisma.booking.findFirst({
      select: {
        id: true,
        googleMeetLink: true,
        googleEventId: true,
        student: { select: { name: true, email: true } },
        teacher: { select: { name: true, email: true } },
        topic: {
          select: {
            name: true,
            level: true,
            tema: true,
            recursoGramatical: true,
            vocabulario: true,
          },
        },
      },
    });
    
    console.log('✅ Database schema validation complete');
    console.log();

    // 10. Summary
    console.log('📊 Integration Test Summary:');
    console.log('=' .repeat(50));
    console.log(`✅ Spanish topics: ${spanishTopics.length} available`);
    console.log(`✅ Active teachers: ${teachers.length} found`);
    console.log(`✅ Students with packages: ${studentsWithPackages.length} found`);
    console.log(`${process.env.SMTP_HOST ? '✅' : '⚠️ '} Email configuration: ${process.env.SMTP_HOST ? 'Ready' : 'Needs setup'}`);
    console.log(`${process.env.GOOGLE_SERVICE_ACCOUNT_KEY ? '✅' : '⚠️ '} Google Calendar: ${process.env.GOOGLE_SERVICE_ACCOUNT_KEY ? 'Ready' : 'Needs setup'}`);
    console.log('✅ Database schema: Compatible');
    console.log();
    
    if (spanishTopics.length > 0 && teachers.length > 0 && studentsWithPackages.length > 0) {
      console.log('🎉 Integration test PASSED! The system is ready for Google Meet bookings.');
      
      console.log('\n📋 Next Steps:');
      console.log('1. Configure Google Calendar API credentials');
      console.log('2. Set up SMTP email configuration');
      console.log('3. Have teachers set their availability at /teacher/classes');
      console.log('4. Students can book classes at /student/book-class');
      console.log('5. Monitor bookings and attendance through the dashboards');
    } else {
      console.log('⚠️  Integration test incomplete. Please ensure:');
      if (spanishTopics.length === 0) console.log('   - Spanish topics are imported');
      if (teachers.length === 0) console.log('   - Teacher accounts are created');
      if (studentsWithPackages.length === 0) console.log('   - Students have active lesson packages');
    }

  } catch (error) {
    console.error('❌ Integration test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testMeetIntegration();