import { prisma } from '@/lib/db'
import { Level, UserRole, BookingStatus } from '@prisma/client'
import { AdminDashboardData, AnalyticsFilter } from './types'

export class AdminAnalyticsService {
  /**
   * Get comprehensive admin dashboard data
   */
  async getAdminDashboardData(filter?: AnalyticsFilter): Promise<AdminDashboardData> {
    const dateFilter = filter?.dateRange ? {
      createdAt: {
        gte: filter.dateRange.start,
        lte: filter.dateRange.end
      }
    } : {}

    // Get platform analytics
    const platformAnalytics = await this.getPlatformAnalytics(filter)

    // Get user growth data
    const userGrowth = await this.getUserGrowthData(filter)

    // Get content performance
    const contentPerformance = await this.getContentPerformance(filter)

    // Get teacher performance
    const teacherPerformance = await this.getTeacherPerformance(filter)

    return {
      platformAnalytics,
      userGrowth,
      contentPerformance,
      teacherPerformance
    }
  }

  /**
   * Get or create platform analytics for specific date
   */
  private async getPlatformAnalytics(filter?: AnalyticsFilter): Promise<any[]> {
    const days = filter?.dateRange ? 
      Math.ceil((filter.dateRange.end.getTime() - filter.dateRange.start.getTime()) / (1000 * 60 * 60 * 24)) : 
      30

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const analytics = await prisma.platformAnalytics.findMany({
      where: {
        date: { gte: startDate }
      },
      orderBy: { date: 'asc' }
    })

    // If no analytics exist, generate them
    if (analytics.length === 0) {
      await this.generatePlatformAnalytics(startDate, new Date())
      return await prisma.platformAnalytics.findMany({
        where: { date: { gte: startDate } },
        orderBy: { date: 'asc' }
      })
    }

    return analytics
  }

  /**
   * Generate platform analytics for date range
   */
  async generatePlatformAnalytics(startDate: Date, endDate: Date): Promise<void> {
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const nextDate = new Date(currentDate)
      nextDate.setDate(nextDate.getDate() + 1)

      // Check if analytics already exist for this date
      const existing = await prisma.platformAnalytics.findUnique({
        where: { date: currentDate }
      })

      if (!existing) {
        const analytics = await this.calculateDailyPlatformAnalytics(currentDate, nextDate)
        
        await prisma.platformAnalytics.create({
          data: {
            date: currentDate,
            ...analytics
          }
        })
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }
  }

  /**
   * Calculate platform analytics for a specific day
   */
  private async calculateDailyPlatformAnalytics(date: Date, nextDate: Date): Promise<any> {
    // User metrics
    const totalUsers = await prisma.user.count()
    
    const activeUsers = await prisma.user.count({
      where: {
        analytics: {
          lastLoginAt: {
            gte: new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      }
    })

    const newRegistrations = await prisma.user.count({
      where: {
        createdAt: {
          gte: date,
          lt: nextDate
        }
      }
    })

    // Calculate 7-day retention
    const weekAgo = new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000)
    const newUsersWeekAgo = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: weekAgo,
          lt: new Date(weekAgo.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    })

    const retainedUsers = await prisma.user.count({
      where: {
        id: { in: newUsersWeekAgo.map(u => u.id) },
        analytics: {
          lastLoginAt: { gte: date }
        }
      }
    })

    const userRetention = newUsersWeekAgo.length > 0 ? retainedUsers / newUsersWeekAgo.length : 0

    // Content metrics
    const totalExercises = await prisma.exercise.count()
    
    const exercisesCompleted = await prisma.submission.count({
      where: {
        submittedAt: {
          gte: date,
          lt: nextDate
        }
      }
    })

    const avgExerciseScore = await prisma.submission.aggregate({
      where: {
        submittedAt: {
          gte: date,
          lt: nextDate
        },
        score: { not: null }
      },
      _avg: { score: true }
    })

    // Calculate content engagement (sessions with content)
    const contentSessions = await prisma.studySession.count({
      where: {
        startTime: {
          gte: date,
          lt: nextDate
        }
      }
    })

    const totalSessions = await prisma.studySession.count({
      where: {
        startTime: {
          gte: date,
          lt: nextDate
        }
      }
    })

    const contentEngagement = totalSessions > 0 ? contentSessions / totalSessions : 0

    // Class metrics
    const totalClasses = await prisma.booking.count({
      where: {
        scheduledAt: {
          gte: date,
          lt: nextDate
        }
      }
    })

    const classesCompleted = await prisma.booking.count({
      where: {
        scheduledAt: {
          gte: date,
          lt: nextDate
        },
        status: BookingStatus.COMPLETED
      }
    })

    const avgClassRating = await prisma.classAnalytics.aggregate({
      where: {
        createdAt: {
          gte: date,
          lt: nextDate
        },
        classRating: { not: null }
      },
      _avg: { classRating: true }
    })

    const noShows = await prisma.booking.count({
      where: {
        scheduledAt: {
          gte: date,
          lt: nextDate
        },
        status: BookingStatus.NO_SHOW
      }
    })

    const noShowRate = totalClasses > 0 ? noShows / totalClasses : 0

    return {
      totalUsers,
      activeUsers,
      newRegistrations,
      userRetention,
      totalExercises,
      exercisesCompleted,
      avgExerciseScore: avgExerciseScore._avg.score || 0,
      contentEngagement,
      totalClasses,
      classesCompleted,
      avgClassRating: avgClassRating._avg.classRating || 0,
      noShowRate,
      avgLoadTime: 1.2, // Placeholder - would need actual performance monitoring
      errorRate: 0.01, // Placeholder
      serverUptime: 99.9, // Placeholder
      revenue: 0, // Placeholder - would integrate with payment system
      newSubscriptions: 0, // Placeholder
      churnRate: 0 // Placeholder
    }
  }

  /**
   * Get user growth data
   */
  private async getUserGrowthData(filter?: AnalyticsFilter): Promise<any[]> {
    const days = filter?.dateRange ? 
      Math.ceil((filter.dateRange.end.getTime() - filter.dateRange.start.getTime()) / (1000 * 60 * 60 * 24)) : 
      30

    const endDate = filter?.dateRange?.end || new Date()
    const startDate = filter?.dateRange?.start || new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)

    const growthData = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const nextDate = new Date(currentDate)
      nextDate.setDate(nextDate.getDate() + 1)

      const newUsers = await prisma.user.count({
        where: {
          createdAt: {
            gte: currentDate,
            lt: nextDate
          }
        }
      })

      const activeUsers = await prisma.user.count({
        where: {
          analytics: {
            lastLoginAt: {
              gte: currentDate,
              lt: nextDate
            }
          }
        }
      })

      // Calculate retention for users who joined 7 days ago
      const weekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000)
      const cohortUsers = await prisma.user.findMany({
        where: {
          createdAt: {
            gte: weekAgo,
            lt: new Date(weekAgo.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      })

      const retainedFromCohort = await prisma.user.count({
        where: {
          id: { in: cohortUsers.map(u => u.id) },
          analytics: {
            lastLoginAt: { gte: currentDate }
          }
        }
      })

      const retention = cohortUsers.length > 0 ? retainedFromCohort / cohortUsers.length * 100 : 0

      growthData.push({
        date: new Date(currentDate),
        newUsers,
        activeUsers,
        retention
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return growthData
  }

  /**
   * Get content performance metrics
   */
  private async getContentPerformance(filter?: AnalyticsFilter): Promise<any[]> {
    const dateFilter = filter?.dateRange ? {
      submittedAt: {
        gte: filter.dateRange.start,
        lte: filter.dateRange.end
      }
    } : {}

    // Get topic performance
    const topics = await prisma.topic.findMany({
      include: {
        exercises: {
          include: {
            submissions: {
              where: dateFilter
            }
          }
        },
        progress: {
          where: filter?.dateRange ? {
            updatedAt: {
              gte: filter.dateRange.start,
              lte: filter.dateRange.end
            }
          } : {}
        }
      }
    })

    return topics.map(topic => {
      const allSubmissions = topic.exercises.flatMap(e => e.submissions)
      const completions = topic.progress.filter(p => p.afterClassComplete).length
      const totalStudents = topic.progress.length

      const completionRate = totalStudents > 0 ? completions / totalStudents * 100 : 0
      const avgScore = allSubmissions.length > 0 
        ? allSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / allSubmissions.length 
        : 0

      // Calculate engagement based on time spent and completion
      const engagement = (completionRate + avgScore) / 2

      return {
        topicId: topic.id,
        topicName: topic.name,
        completionRate,
        avgScore,
        engagement,
        totalSubmissions: allSubmissions.length,
        totalStudents
      }
    }).sort((a, b) => b.engagement - a.engagement)
  }

  /**
   * Get teacher performance metrics
   */
  private async getTeacherPerformance(filter?: AnalyticsFilter): Promise<any[]> {
    const dateFilter = filter?.dateRange ? {
      createdAt: {
        gte: filter.dateRange.start,
        lte: filter.dateRange.end
      }
    } : {}

    const teachers = await prisma.user.findMany({
      where: { role: UserRole.TEACHER },
      include: {
        teacherClasses: {
          where: filter?.dateRange ? {
            scheduledAt: {
              gte: filter.dateRange.start,
              lte: filter.dateRange.end
            }
          } : {},
          include: {
            classAnalytics: true
          }
        }
      }
    })

    return teachers.map(teacher => {
      const classes = teacher.teacherClasses
      const analytics = classes.map(c => c.classAnalytics).filter(a => a !== null)

      const avgRating = analytics.length > 0 && analytics.some(a => a!.teacherRating !== null)
        ? analytics
            .filter(a => a!.teacherRating !== null)
            .reduce((sum, a) => sum + (a!.teacherRating || 0), 0) / 
          analytics.filter(a => a!.teacherRating !== null).length
        : 0

      const studentSatisfaction = analytics.length > 0 && analytics.some(a => a!.classRating !== null)
        ? analytics
            .filter(a => a!.classRating !== null)
            .reduce((sum, a) => sum + (a!.classRating || 0), 0) / 
          analytics.filter(a => a!.classRating !== null).length
        : 0

      return {
        teacherId: teacher.id,
        teacherName: teacher.name,
        avgRating,
        totalClasses: classes.length,
        studentSatisfaction
      }
    }).sort((a, b) => b.avgRating - a.avgRating)
  }

  /**
   * Get platform overview statistics
   */
  async getPlatformOverview(): Promise<any> {
    const [
      totalUsers,
      totalStudents,
      totalTeachers,
      totalTopics,
      totalExercises,
      totalBookings,
      completedBookings,
      totalSubmissions
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: UserRole.STUDENT } }),
      prisma.user.count({ where: { role: UserRole.TEACHER } }),
      prisma.topic.count(),
      prisma.exercise.count(),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: BookingStatus.COMPLETED } }),
      prisma.submission.count()
    ])

    // Get recent activity
    const recentUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    })

    const recentSubmissions = await prisma.submission.count({
      where: {
        submittedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    })

    const recentBookings = await prisma.booking.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    })

    return {
      users: {
        total: totalUsers,
        students: totalStudents,
        teachers: totalTeachers,
        newThisWeek: recentUsers
      },
      content: {
        topics: totalTopics,
        exercises: totalExercises,
        submissions: totalSubmissions,
        submissionsThisWeek: recentSubmissions
      },
      classes: {
        total: totalBookings,
        completed: completedBookings,
        completionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
        newThisWeek: recentBookings
      }
    }
  }

  /**
   * Get level distribution
   */
  async getLevelDistribution(): Promise<any[]> {
    const distribution = await prisma.user.groupBy({
      by: ['level'],
      where: {
        role: UserRole.STUDENT,
        level: { not: null }
      },
      _count: true
    })

    return distribution.map(d => ({
      level: d.level,
      count: d._count,
      percentage: 0 // Will be calculated by frontend
    }))
  }

  /**
   * Get engagement trends
   */
  async getEngagementTrends(days: number = 30): Promise<any[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const trends = []
    const currentDate = new Date(startDate)

    while (currentDate <= new Date()) {
      const nextDate = new Date(currentDate)
      nextDate.setDate(nextDate.getDate() + 1)

      const [
        dailyLogins,
        exerciseSubmissions,
        classBookings,
        studySessions
      ] = await Promise.all([
        prisma.user.count({
          where: {
            analytics: {
              lastLoginAt: {
                gte: currentDate,
                lt: nextDate
              }
            }
          }
        }),
        prisma.submission.count({
          where: {
            submittedAt: {
              gte: currentDate,
              lt: nextDate
            }
          }
        }),
        prisma.booking.count({
          where: {
            createdAt: {
              gte: currentDate,
              lt: nextDate
            }
          }
        }),
        prisma.studySession.count({
          where: {
            startTime: {
              gte: currentDate,
              lt: nextDate
            }
          }
        })
      ])

      trends.push({
        date: new Date(currentDate),
        logins: dailyLogins,
        exercises: exerciseSubmissions,
        bookings: classBookings,
        sessions: studySessions
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return trends
  }

  /**
   * Get performance insights
   */
  async getPerformanceInsights(): Promise<string[]> {
    const insights = []

    // User growth insight
    const thisWeekUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    })

    const lastWeekUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    })

    if (thisWeekUsers > lastWeekUsers) {
      const growth = ((thisWeekUsers - lastWeekUsers) / lastWeekUsers * 100).toFixed(1)
      insights.push(`📈 User registration increased by ${growth}% this week`)
    }

    // Exercise completion insight
    const avgScore = await prisma.submission.aggregate({
      where: {
        submittedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      _avg: { score: true }
    })

    if (avgScore._avg.score && avgScore._avg.score > 80) {
      insights.push(`🎯 High performance week! Average exercise score: ${avgScore._avg.score.toFixed(1)}%`)
    }

    // Class attendance insight
    const recentBookings = await prisma.booking.count({
      where: {
        scheduledAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    })

    const attendedClasses = await prisma.booking.count({
      where: {
        scheduledAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        status: BookingStatus.COMPLETED
      }
    })

    if (recentBookings > 0) {
      const attendanceRate = (attendedClasses / recentBookings) * 100
      if (attendanceRate > 85) {
        insights.push(`⭐ Excellent class attendance rate: ${attendanceRate.toFixed(1)}%`)
      } else if (attendanceRate < 70) {
        insights.push(`⚠️ Class attendance needs attention: ${attendanceRate.toFixed(1)}%`)
      }
    }

    return insights
  }

  /**
   * Export platform analytics
   */
  async exportAnalytics(startDate: Date, endDate: Date, format: 'json' | 'csv' = 'json'): Promise<any> {
    const analytics = await prisma.platformAnalytics.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'asc' }
    })

    if (format === 'json') {
      return {
        dateRange: { start: startDate, end: endDate },
        data: analytics,
        summary: {
          totalDays: analytics.length,
          avgActiveUsers: analytics.reduce((sum, a) => sum + a.activeUsers, 0) / analytics.length,
          totalNewUsers: analytics.reduce((sum, a) => sum + a.newRegistrations, 0),
          avgExerciseScore: analytics.reduce((sum, a) => sum + a.avgExerciseScore, 0) / analytics.length
        }
      }
    }

    // CSV format would be implemented here
    return analytics
  }
}