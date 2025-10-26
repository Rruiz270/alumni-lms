import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

// GET /api/admin/reports - Generate various reports
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (adminUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'overview'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const format = searchParams.get('format') || 'json' // json, csv

    // Date range setup
    const dateFilter: any = {}
    if (startDate && endDate) {
      dateFilter.gte = new Date(startDate)
      dateFilter.lte = new Date(endDate)
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      dateFilter.gte = thirtyDaysAgo
    }

    switch (reportType) {
      case 'student-progress':
        const studentProgress = await prisma.user.findMany({
          where: { role: 'STUDENT', isActive: true },
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
            level: true,
            createdAt: true,
            packages: {
              select: {
                totalLessons: true,
                usedLessons: true,
                remainingLessons: true,
                validUntil: true
              }
            },
            studentStats: {
              select: {
                totalClasses: true,
                attendedClasses: true,
                attendanceRate: true,
                lastUpdated: true
              }
            },
            studentBookings: {
              where: {
                scheduledAt: dateFilter
              },
              select: {
                status: true,
                scheduledAt: true,
                topic: {
                  select: { name: true, level: true }
                }
              }
            },
            progress: {
              select: {
                preClassComplete: true,
                liveClassAttended: true,
                afterClassComplete: true,
                completedAt: true,
                topic: {
                  select: { name: true, level: true }
                }
              }
            }
          }
        })

        if (format === 'csv') {
          const csvData = studentProgress.map(student => ({
            'Student ID': student.studentId,
            'Name': student.name,
            'Email': student.email,
            'Level': student.level,
            'Total Classes': student.studentStats?.totalClasses || 0,
            'Attended Classes': student.studentStats?.attendedClasses || 0,
            'Attendance Rate': student.studentStats?.attendanceRate || 0,
            'Remaining Lessons': student.packages[0]?.remainingLessons || 0,
            'Package Valid Until': student.packages[0]?.validUntil || '',
            'Completed Topics': student.progress.filter(p => p.completedAt).length,
            'Recent Bookings': student.studentBookings.length
          }))
          
          return NextResponse.json({ 
            type: 'csv',
            data: csvData,
            filename: `student-progress-${new Date().toISOString().split('T')[0]}.csv`
          })
        }

        return NextResponse.json({
          reportType: 'student-progress',
          dateRange: { startDate, endDate },
          data: studentProgress,
          summary: {
            totalStudents: studentProgress.length,
            averageAttendanceRate: studentProgress.reduce((acc, s) => acc + (s.studentStats?.attendanceRate || 0), 0) / studentProgress.length
          }
        })

      case 'teacher-utilization':
        const teacherUtilization = await prisma.user.findMany({
          where: { role: 'TEACHER', isActive: true },
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            teacherClasses: {
              where: {
                scheduledAt: dateFilter
              },
              select: {
                status: true,
                scheduledAt: true,
                duration: true,
                student: {
                  select: { name: true, level: true }
                },
                topic: {
                  select: { name: true, level: true }
                }
              }
            },
            teacherAvailability: {
              select: {
                dayOfWeek: true,
                startTime: true,
                endTime: true,
                isActive: true
              }
            }
          }
        })

        const teacherStats = teacherUtilization.map(teacher => {
          const totalClasses = teacher.teacherClasses.length
          const completedClasses = teacher.teacherClasses.filter(c => c.status === 'COMPLETED').length
          const totalMinutes = teacher.teacherClasses.reduce((acc, c) => acc + c.duration, 0)
          const totalAvailableSlots = teacher.teacherAvailability.filter(a => a.isActive).length * 8 // Assuming 8 slots per day

          return {
            id: teacher.id,
            name: teacher.name,
            email: teacher.email,
            totalClasses,
            completedClasses,
            completionRate: totalClasses > 0 ? (completedClasses / totalClasses) * 100 : 0,
            totalHours: Math.round(totalMinutes / 60),
            availabilitySlots: totalAvailableSlots,
            utilizationRate: totalAvailableSlots > 0 ? (totalClasses / totalAvailableSlots) * 100 : 0
          }
        })

        if (format === 'csv') {
          return NextResponse.json({
            type: 'csv',
            data: teacherStats,
            filename: `teacher-utilization-${new Date().toISOString().split('T')[0]}.csv`
          })
        }

        return NextResponse.json({
          reportType: 'teacher-utilization',
          dateRange: { startDate, endDate },
          data: teacherStats,
          summary: {
            totalTeachers: teacherStats.length,
            averageUtilization: teacherStats.reduce((acc, t) => acc + t.utilizationRate, 0) / teacherStats.length,
            totalHoursTaught: teacherStats.reduce((acc, t) => acc + t.totalHours, 0)
          }
        })

      case 'class-completion':
        const classCompletion = await prisma.booking.findMany({
          where: {
            scheduledAt: dateFilter
          },
          select: {
            id: true,
            scheduledAt: true,
            status: true,
            duration: true,
            student: {
              select: {
                name: true,
                studentId: true,
                level: true
              }
            },
            teacher: {
              select: {
                name: true
              }
            },
            topic: {
              select: {
                name: true,
                level: true
              }
            },
            attendanceLogs: {
              select: {
                action: true,
                timestamp: true
              }
            }
          },
          orderBy: { scheduledAt: 'desc' }
        })

        const completionStats = {
          total: classCompletion.length,
          completed: classCompletion.filter(b => b.status === 'COMPLETED').length,
          cancelled: classCompletion.filter(b => b.status === 'CANCELLED').length,
          noShow: classCompletion.filter(b => b.status === 'NO_SHOW').length,
          scheduled: classCompletion.filter(b => b.status === 'SCHEDULED').length
        }

        if (format === 'csv') {
          const csvData = classCompletion.map(booking => ({
            'Booking ID': booking.id,
            'Date': booking.scheduledAt,
            'Student': booking.student.name,
            'Student ID': booking.student.studentId,
            'Teacher': booking.teacher.name,
            'Topic': booking.topic.name,
            'Level': booking.topic.level,
            'Status': booking.status,
            'Duration': booking.duration,
            'Attendance Logs': booking.attendanceLogs.length
          }))

          return NextResponse.json({
            type: 'csv',
            data: csvData,
            filename: `class-completion-${new Date().toISOString().split('T')[0]}.csv`
          })
        }

        return NextResponse.json({
          reportType: 'class-completion',
          dateRange: { startDate, endDate },
          data: classCompletion,
          summary: completionStats
        })

      case 'content-usage':
        const contentUsage = await prisma.topic.findMany({
          select: {
            id: true,
            name: true,
            level: true,
            orderIndex: true,
            _count: {
              select: {
                bookings: {
                  where: {
                    scheduledAt: dateFilter
                  }
                },
                progress: true,
                exercises: true
              }
            },
            bookings: {
              where: {
                scheduledAt: dateFilter,
                status: 'COMPLETED'
              },
              select: {
                student: {
                  select: { level: true }
                }
              }
            }
          },
          orderBy: [{ level: 'asc' }, { orderIndex: 'asc' }]
        })

        const contentStats = contentUsage.map(topic => ({
          id: topic.id,
          name: topic.name,
          level: topic.level,
          orderIndex: topic.orderIndex,
          totalBookings: topic._count.bookings,
          completedClasses: topic.bookings.length,
          totalProgress: topic._count.progress,
          exerciseCount: topic._count.exercises,
          completionRate: topic._count.bookings > 0 ? (topic.bookings.length / topic._count.bookings) * 100 : 0
        }))

        if (format === 'csv') {
          return NextResponse.json({
            type: 'csv',
            data: contentStats,
            filename: `content-usage-${new Date().toISOString().split('T')[0]}.csv`
          })
        }

        return NextResponse.json({
          reportType: 'content-usage',
          dateRange: { startDate, endDate },
          data: contentStats,
          summary: {
            totalTopics: contentStats.length,
            mostPopularTopic: contentStats.sort((a, b) => b.totalBookings - a.totalBookings)[0]?.name,
            averageCompletionRate: contentStats.reduce((acc, t) => acc + t.completionRate, 0) / contentStats.length
          }
        })

      default:
        // Overview report
        const [users, bookings, topics, exercises] = await Promise.all([
          prisma.user.groupBy({
            by: ['role'],
            _count: true
          }),
          prisma.booking.groupBy({
            by: ['status'],
            _count: true,
            where: {
              scheduledAt: dateFilter
            }
          }),
          prisma.topic.count(),
          prisma.exercise.count()
        ])

        return NextResponse.json({
          reportType: 'overview',
          dateRange: { startDate, endDate },
          data: {
            users: users.map(u => ({ role: u.role, count: u._count })),
            bookings: bookings.map(b => ({ status: b.status, count: b._count })),
            content: {
              topics,
              exercises
            }
          }
        })
    }
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}