import { prisma } from '@/lib/db'
import { Level, BookingStatus } from '@prisma/client'
import { TeacherDashboardData, AnalyticsFilter } from './types'

export class TeacherAnalyticsService {
  /**
   * Get comprehensive teacher dashboard data
   */
  async getTeacherDashboardData(teacherId: string, filter?: AnalyticsFilter): Promise<TeacherDashboardData> {
    const dateFilter = filter?.dateRange ? {
      scheduledAt: {
        gte: filter.dateRange.start,
        lte: filter.dateRange.end
      }
    } : {}

    // Get class analytics with booking details
    const classAnalytics = await prisma.classAnalytics.findMany({
      where: {
        teacherId,
        booking: dateFilter
      },
      include: {
        booking: {
          include: {
            student: {
              select: { name: true, email: true, level: true }
            },
            topic: {
              select: { name: true, level: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get student overview for teacher's students
    const studentOverview = await this.getStudentOverview(teacherId, filter)

    // Calculate performance metrics
    const performanceMetrics = await this.calculatePerformanceMetrics(teacherId, filter)

    return {
      classAnalytics,
      studentOverview,
      performanceMetrics
    }
  }

  /**
   * Get overview of all students taught by this teacher
   */
  private async getStudentOverview(teacherId: string, filter?: AnalyticsFilter): Promise<any[]> {
    const dateFilter = filter?.dateRange ? {
      scheduledAt: {
        gte: filter.dateRange.start,
        lte: filter.dateRange.end
      }
    } : {}

    // Get all students who have had classes with this teacher
    const studentBookings = await prisma.booking.findMany({
      where: {
        teacherId,
        ...dateFilter
      },
      include: {
        student: {
          select: { 
            id: true, 
            name: true, 
            email: true, 
            level: true,
            analytics: {
              select: {
                attendanceRate: true,
                avgExerciseScore: true,
                totalClassesAttended: true,
                totalClassesBooked: true
              }
            }
          }
        },
        attendanceLogs: true
      }
    })

    // Group by student and calculate metrics
    const studentMetrics = new Map()

    for (const booking of studentBookings) {
      const studentId = booking.student.id
      
      if (!studentMetrics.has(studentId)) {
        studentMetrics.set(studentId, {
          studentId,
          name: booking.student.name,
          level: booking.student.level,
          totalClasses: 0,
          attendedClasses: 0,
          avgScore: booking.student.analytics?.avgExerciseScore || 0,
          engagement: 0,
          ratings: []
        })
      }

      const metrics = studentMetrics.get(studentId)
      metrics.totalClasses++

      // Check if student attended
      const attended = booking.status === BookingStatus.COMPLETED
      if (attended) {
        metrics.attendedClasses++
      }

      // Get class analytics for engagement score
      const classAnalytics = await prisma.classAnalytics.findUnique({
        where: { bookingId: booking.id }
      })

      if (classAnalytics) {
        metrics.engagement += classAnalytics.studentEngagement
        if (classAnalytics.teacherRating) {
          metrics.ratings.push(classAnalytics.teacherRating)
        }
      }
    }

    // Convert to array and calculate final metrics
    return Array.from(studentMetrics.values()).map(student => ({
      ...student,
      attendance: student.totalClasses > 0 ? (student.attendedClasses / student.totalClasses) * 100 : 0,
      engagement: student.totalClasses > 0 ? student.engagement / student.totalClasses : 0,
      avgRating: student.ratings.length > 0 
        ? student.ratings.reduce((sum: number, rating: number) => sum + rating, 0) / student.ratings.length 
        : 0
    }))
  }

  /**
   * Calculate teacher performance metrics
   */
  private async calculatePerformanceMetrics(teacherId: string, filter?: AnalyticsFilter): Promise<any> {
    const dateFilter = filter?.dateRange ? {
      createdAt: {
        gte: filter.dateRange.start,
        lte: filter.dateRange.end
      }
    } : {}

    // Get all class analytics for this teacher
    const analytics = await prisma.classAnalytics.findMany({
      where: {
        teacherId,
        ...dateFilter
      },
      include: {
        booking: {
          include: {
            topic: true
          }
        }
      }
    })

    if (analytics.length === 0) {
      return {
        avgClassRating: 0,
        avgStudentEngagement: 0,
        totalClasses: 0,
        popularTopics: []
      }
    }

    // Calculate averages
    const avgClassRating = analytics
      .filter(a => a.classRating !== null)
      .reduce((sum, a) => sum + (a.classRating || 0), 0) / 
      analytics.filter(a => a.classRating !== null).length || 0

    const avgStudentEngagement = analytics
      .reduce((sum, a) => sum + a.studentEngagement, 0) / analytics.length

    // Find most popular topics
    const topicCounts = new Map()
    analytics.forEach(a => {
      const topicName = a.booking.topic.name
      topicCounts.set(topicName, (topicCounts.get(topicName) || 0) + 1)
    })

    const popularTopics = Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic]) => topic)

    return {
      avgClassRating,
      avgStudentEngagement,
      totalClasses: analytics.length,
      popularTopics
    }
  }

  /**
   * Get detailed class analytics for a specific class
   */
  async getClassAnalytics(bookingId: string): Promise<any> {
    return await prisma.classAnalytics.findUnique({
      where: { bookingId },
      include: {
        booking: {
          include: {
            student: {
              select: { name: true, email: true, level: true }
            },
            topic: true
          }
        }
      }
    })
  }

  /**
   * Create or update class analytics
   */
  async createClassAnalytics(data: {
    bookingId: string
    teacherId: string
    preparationTime?: number
    actualDuration?: number
    studentEngagement?: number
    topicsCovered?: string[]
    exercisesUsed?: string[]
    studentQuestions?: number
    teacherRating?: number
    classRating?: number
    learningObjectivesMet?: boolean
    homeworkAssigned?: boolean
    followUpNeeded?: boolean
    notes?: string
  }): Promise<any> {
    return await prisma.classAnalytics.upsert({
      where: { bookingId: data.bookingId },
      create: {
        bookingId: data.bookingId,
        teacherId: data.teacherId,
        preparationTime: data.preparationTime || 0,
        actualDuration: data.actualDuration || 60,
        studentEngagement: data.studentEngagement || 5,
        topicsCovered: data.topicsCovered || [],
        exercisesUsed: data.exercisesUsed || [],
        studentQuestions: data.studentQuestions || 0,
        teacherRating: data.teacherRating,
        classRating: data.classRating,
        learningObjectivesMet: data.learningObjectivesMet || false,
        homeworkAssigned: data.homeworkAssigned || false,
        followUpNeeded: data.followUpNeeded || false,
        notes: data.notes
      },
      update: {
        preparationTime: data.preparationTime,
        actualDuration: data.actualDuration,
        studentEngagement: data.studentEngagement,
        topicsCovered: data.topicsCovered,
        exercisesUsed: data.exercisesUsed,
        studentQuestions: data.studentQuestions,
        teacherRating: data.teacherRating,
        classRating: data.classRating,
        learningObjectivesMet: data.learningObjectivesMet,
        homeworkAssigned: data.homeworkAssigned,
        followUpNeeded: data.followUpNeeded,
        notes: data.notes,
        updatedAt: new Date()
      }
    })
  }

  /**
   * Get teacher performance trends over time
   */
  async getPerformanceTrends(teacherId: string, days: number = 30): Promise<any[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const analytics = await prisma.classAnalytics.findMany({
      where: {
        teacherId,
        createdAt: { gte: startDate }
      },
      include: {
        booking: {
          select: { scheduledAt: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    // Group by week and calculate averages
    const weeklyData = new Map()

    analytics.forEach(a => {
      const week = this.getWeekKey(a.booking.scheduledAt)
      
      if (!weeklyData.has(week)) {
        weeklyData.set(week, {
          week,
          classes: [],
          avgEngagement: 0,
          avgRating: 0,
          totalClasses: 0
        })
      }

      const weekData = weeklyData.get(week)
      weekData.classes.push(a)
      weekData.totalClasses++
    })

    // Calculate averages for each week
    return Array.from(weeklyData.values()).map(week => {
      const engagementSum = week.classes.reduce((sum: number, c: any) => sum + c.studentEngagement, 0)
      const ratingClasses = week.classes.filter((c: any) => c.classRating !== null)
      const ratingSum = ratingClasses.reduce((sum: number, c: any) => sum + (c.classRating || 0), 0)

      return {
        week: week.week,
        avgEngagement: engagementSum / week.totalClasses,
        avgRating: ratingClasses.length > 0 ? ratingSum / ratingClasses.length : 0,
        totalClasses: week.totalClasses
      }
    }).sort((a, b) => a.week.localeCompare(b.week))
  }

  /**
   * Get student progress for teacher's students
   */
  async getStudentProgressOverview(teacherId: string): Promise<any[]> {
    // Get all students who have had classes with this teacher
    const students = await prisma.user.findMany({
      where: {
        studentBookings: {
          some: {
            teacherId
          }
        }
      },
      include: {
        analytics: {
          include: {
            skillProgress: true,
            achievements: {
              include: { badge: true },
              orderBy: { earnedAt: 'desc' },
              take: 3
            }
          }
        },
        studentBookings: {
          where: { teacherId },
          include: {
            attendanceLogs: true
          }
        }
      }
    })

    return students.map(student => {
      const analytics = student.analytics
      const recentBookings = student.studentBookings.slice(0, 5)
      
      return {
        id: student.id,
        name: student.name,
        email: student.email,
        level: student.level,
        progress: {
          currentLevel: analytics?.currentLevel,
          levelProgress: analytics?.levelProgress || 0,
          totalStudyTime: analytics?.totalStudyTime || 0,
          currentStreak: analytics?.currentStreak || 0,
          attendanceRate: analytics?.attendanceRate || 0,
          avgScore: analytics?.avgExerciseScore || 0
        },
        skillProgress: analytics?.skillProgress || [],
        recentAchievements: analytics?.achievements || [],
        recentClasses: recentBookings.length,
        lastClassDate: recentBookings[0]?.scheduledAt
      }
    })
  }

  /**
   * Get class preparation suggestions for teacher
   */
  async getClassPreparationSuggestions(bookingId: string): Promise<any> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        student: {
          include: {
            analytics: {
              include: {
                skillProgress: true
              }
            }
          }
        },
        topic: {
          include: {
            exercises: true
          }
        }
      }
    })

    if (!booking) {
      throw new Error('Booking not found')
    }

    const student = booking.student
    const topic = booking.topic
    const skillProgress = student.analytics?.skillProgress || []

    // Identify student's weak areas
    const weakSkills = skillProgress
      .filter(skill => skill.masteryPercentage < 70)
      .sort((a, b) => a.masteryPercentage - b.masteryPercentage)

    // Suggest exercises based on weak areas
    const suggestedExercises = topic.exercises
      .filter(exercise => {
        const category = exercise.category
        return weakSkills.some(skill => 
          this.mapSkillToCategory(skill.skillArea).includes(category)
        )
      })
      .slice(0, 5)

    // Generate preparation tips
    const preparationTips = [
      `Focus on ${student.name}'s weak areas: ${weakSkills.slice(0, 2).map(s => s.skillArea).join(', ')}`,
      `Student's current level: ${student.level || 'Not set'}`,
      `Recent attendance rate: ${student.analytics?.attendanceRate || 0}%`,
      `Average exercise score: ${student.analytics?.avgExerciseScore || 0}%`
    ]

    if (student.analytics?.currentStreak && student.analytics.currentStreak > 7) {
      preparationTips.push(`🔥 Student has a ${student.analytics.currentStreak}-day learning streak!`)
    }

    return {
      studentProfile: {
        name: student.name,
        level: student.level,
        weakAreas: weakSkills.map(s => s.skillArea),
        strengths: skillProgress
          .filter(skill => skill.masteryPercentage > 80)
          .map(s => s.skillArea),
        attendanceRate: student.analytics?.attendanceRate || 0,
        avgScore: student.analytics?.avgExerciseScore || 0,
        currentStreak: student.analytics?.currentStreak || 0
      },
      topicInfo: {
        name: topic.name,
        level: topic.level,
        description: topic.description,
        objectives: topic.objectives,
        materials: topic.materials
      },
      suggestedExercises,
      preparationTips,
      focusAreas: weakSkills.slice(0, 3).map(skill => ({
        skill: skill.skillArea,
        mastery: skill.masteryPercentage,
        suggestion: this.getSkillFocusSuggestion(skill.skillArea, skill.masteryPercentage)
      }))
    }
  }

  /**
   * Helper methods
   */
  private getWeekKey(date: Date): string {
    const year = date.getFullYear()
    const week = Math.ceil(
      ((date.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7
    )
    return `${year}-W${week.toString().padStart(2, '0')}`
  }

  private mapSkillToCategory(skillArea: string): string[] {
    switch (skillArea) {
      case 'READING':
        return ['READING']
      case 'WRITING':
        return ['WRITING']
      case 'LISTENING':
        return ['LISTENING']
      case 'SPEAKING':
        return ['SPEAKING']
      case 'GRAMMAR':
        return ['GRAMMAR']
      case 'VOCABULARY':
        return ['VOCABULARY']
      default:
        return ['READING', 'WRITING']
    }
  }

  private getSkillFocusSuggestion(skillArea: string, mastery: number): string {
    const suggestions = {
      READING: {
        low: 'Focus on basic comprehension exercises and vocabulary building',
        medium: 'Practice with longer texts and inference questions',
        high: 'Challenge with complex texts and critical analysis'
      },
      WRITING: {
        low: 'Work on sentence structure and basic grammar',
        medium: 'Practice paragraph writing and organization',
        high: 'Focus on advanced composition and style'
      },
      LISTENING: {
        low: 'Start with slow, clear audio and basic comprehension',
        medium: 'Practice with natural speed and varied accents',
        high: 'Challenge with complex audio and note-taking'
      },
      SPEAKING: {
        low: 'Focus on pronunciation and basic conversation',
        medium: 'Practice fluency and expression of ideas',
        high: 'Work on advanced discussion and presentation skills'
      },
      GRAMMAR: {
        low: 'Review fundamental grammar rules and patterns',
        medium: 'Practice complex structures and exceptions',
        high: 'Focus on advanced grammar and style'
      },
      VOCABULARY: {
        low: 'Build core vocabulary and word families',
        medium: 'Expand with academic and specialized terms',
        high: 'Master idiomatic expressions and nuances'
      }
    }

    const level = mastery < 40 ? 'low' : mastery < 70 ? 'medium' : 'high'
    return suggestions[skillArea as keyof typeof suggestions]?.[level] || 'Continue practicing this skill area'
  }

  /**
   * Generate teaching insights for teacher
   */
  async getTeachingInsights(teacherId: string, days: number = 30): Promise<any> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const analytics = await prisma.classAnalytics.findMany({
      where: {
        teacherId,
        createdAt: { gte: startDate }
      },
      include: {
        booking: {
          include: {
            student: true,
            topic: true
          }
        }
      }
    })

    if (analytics.length === 0) {
      return {
        totalClasses: 0,
        insights: ['Not enough data available for insights.']
      }
    }

    const insights = []

    // Engagement analysis
    const avgEngagement = analytics.reduce((sum, a) => sum + a.studentEngagement, 0) / analytics.length
    if (avgEngagement > 8) {
      insights.push('🌟 Excellent student engagement! Your classes are highly interactive.')
    } else if (avgEngagement < 6) {
      insights.push('💡 Consider increasing student interaction and engagement activities.')
    }

    // Rating analysis
    const ratedClasses = analytics.filter(a => a.classRating !== null)
    if (ratedClasses.length > 0) {
      const avgRating = ratedClasses.reduce((sum, a) => sum + (a.classRating || 0), 0) / ratedClasses.length
      if (avgRating > 4.5) {
        insights.push('⭐ Outstanding class ratings! Students love your teaching style.')
      } else if (avgRating < 3.5) {
        insights.push('📈 Focus on areas that could improve student satisfaction.')
      }
    }

    // Preparation time analysis
    const avgPrepTime = analytics.reduce((sum, a) => sum + a.preparationTime, 0) / analytics.length
    if (avgPrepTime > 30) {
      insights.push('⏰ High preparation time investment - great dedication to quality!')
    } else if (avgPrepTime < 10) {
      insights.push('🎯 Consider spending more time on class preparation for better outcomes.')
    }

    // Popular topics
    const topicCounts = new Map()
    analytics.forEach(a => {
      const topicName = a.booking.topic.name
      topicCounts.set(topicName, (topicCounts.get(topicName) || 0) + 1)
    })
    
    const mostPopular = Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]
    
    if (mostPopular) {
      insights.push(`📚 Most taught topic: "${mostPopular[0]}" (${mostPopular[1]} classes)`)
    }

    return {
      totalClasses: analytics.length,
      avgEngagement,
      avgRating: ratedClasses.length > 0 
        ? ratedClasses.reduce((sum, a) => sum + (a.classRating || 0), 0) / ratedClasses.length 
        : 0,
      avgPrepTime,
      insights
    }
  }
}