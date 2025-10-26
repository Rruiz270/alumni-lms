import { prisma } from '@/lib/db'
import { Level, SkillArea, UserRole } from '@prisma/client'
import { StudentAnalyticsService } from './student-analytics'
import { TeacherAnalyticsService } from './teacher-analytics'
import { AdminAnalyticsService } from './admin-analytics'
import { ReportData, ReportSection } from './types'

export class ReportingService {
  private studentAnalytics: StudentAnalyticsService
  private teacherAnalytics: TeacherAnalyticsService
  private adminAnalytics: AdminAnalyticsService

  constructor() {
    this.studentAnalytics = new StudentAnalyticsService()
    this.teacherAnalytics = new TeacherAnalyticsService()
    this.adminAnalytics = new AdminAnalyticsService()
  }

  /**
   * Generate comprehensive student progress report
   */
  async generateStudentProgressReport(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ReportData> {
    const dashboardData = await this.studentAnalytics.getStudentDashboardData(userId)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, level: true }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const sections: ReportSection[] = [
      {
        title: 'Learning Overview',
        type: 'metrics',
        data: {
          currentLevel: dashboardData.analytics.currentLevel,
          levelProgress: dashboardData.currentLevelProgress.progress,
          totalStudyTime: dashboardData.analytics.totalStudyTime,
          avgDailyStudyTime: dashboardData.analytics.avgDailyStudyTime,
          currentStreak: dashboardData.analytics.currentStreak,
          longestStreak: dashboardData.analytics.longestStreak
        },
        description: 'Overall learning progress and engagement metrics'
      },
      {
        title: 'Performance Analysis',
        type: 'metrics',
        data: {
          avgScore: dashboardData.analytics.avgExerciseScore,
          totalExercises: dashboardData.analytics.totalExercisesCompleted,
          totalTopics: dashboardData.analytics.totalTopicsCompleted,
          attendanceRate: dashboardData.analytics.attendanceRate,
          totalClasses: dashboardData.analytics.totalClassesAttended
        },
        description: 'Academic performance and class participation'
      },
      {
        title: 'Skill Progress',
        type: 'chart',
        data: dashboardData.skillOverview.map(skill => ({
          skill: skill.skillArea,
          mastery: skill.masteryPercentage,
          trend: skill.trend,
          timeSpent: skill.timeSpent,
          exercisesCompleted: skill.exercisesCompleted
        })),
        description: 'Progress breakdown by skill area'
      },
      {
        title: 'Achievements Earned',
        type: 'table',
        data: dashboardData.recentAchievements.map(achievement => ({
          badge: achievement.badge.name,
          description: achievement.badge.description,
          points: achievement.badge.points,
          earnedAt: achievement.earnedAt,
          rarity: achievement.badge.rarity
        })),
        description: 'Badges and achievements earned during this period'
      },
      {
        title: 'Recommendations',
        type: 'text',
        data: dashboardData.recommendations.map(rec => ({
          title: rec.title,
          description: rec.description,
          priority: rec.priority,
          type: rec.type
        })),
        description: 'Personalized learning recommendations'
      }
    ]

    return {
      title: `Learning Progress Report - ${user.name}`,
      subtitle: `${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      dateRange: { start: startDate, end: endDate },
      sections,
      metadata: {
        generatedAt: new Date(),
        generatedBy: userId,
        version: '1.0'
      }
    }
  }

  /**
   * Generate teacher performance report
   */
  async generateTeacherPerformanceReport(
    teacherId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ReportData> {
    const dashboardData = await this.teacherAnalytics.getTeacherDashboardData(teacherId, {
      dateRange: { start: startDate, end: endDate }
    })

    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
      select: { name: true, email: true }
    })

    if (!teacher) {
      throw new Error('Teacher not found')
    }

    const insights = await this.teacherAnalytics.getTeachingInsights(teacherId)

    const sections: ReportSection[] = [
      {
        title: 'Teaching Overview',
        type: 'metrics',
        data: {
          totalClasses: dashboardData.performanceMetrics.totalClasses,
          avgClassRating: dashboardData.performanceMetrics.avgClassRating,
          avgStudentEngagement: dashboardData.performanceMetrics.avgStudentEngagement,
          totalStudents: dashboardData.studentOverview.length
        },
        description: 'Overall teaching performance metrics'
      },
      {
        title: 'Student Performance',
        type: 'table',
        data: dashboardData.studentOverview.map(student => ({
          student: student.name,
          level: student.level,
          attendance: student.attendance,
          avgScore: student.avgScore,
          engagement: student.engagement
        })),
        description: 'Individual student performance analysis'
      },
      {
        title: 'Class Analytics',
        type: 'table',
        data: dashboardData.classAnalytics.slice(0, 20).map(cls => ({
          topic: cls.booking.topic.name,
          student: cls.booking.student.name,
          date: cls.booking.scheduledAt,
          duration: cls.actualDuration,
          engagement: cls.studentEngagement,
          rating: cls.classRating,
          objectives: cls.learningObjectivesMet
        })),
        description: 'Recent class performance and feedback'
      },
      {
        title: 'Popular Topics',
        type: 'chart',
        data: dashboardData.performanceMetrics.popularTopics.map((topic, index) => ({
          topic,
          rank: index + 1
        })),
        description: 'Most frequently taught topics'
      },
      {
        title: 'Teaching Insights',
        type: 'text',
        data: insights.insights,
        description: 'AI-generated insights and recommendations'
      }
    ]

    return {
      title: `Teaching Performance Report - ${teacher.name}`,
      subtitle: `${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      dateRange: { start: startDate, end: endDate },
      sections,
      metadata: {
        generatedAt: new Date(),
        generatedBy: teacherId,
        version: '1.0'
      }
    }
  }

  /**
   * Generate platform analytics report for admins
   */
  async generatePlatformReport(
    startDate: Date,
    endDate: Date
  ): Promise<ReportData> {
    const dashboardData = await this.adminAnalytics.getAdminDashboardData({
      dateRange: { start: startDate, end: endDate }
    })

    const overview = await this.adminAnalytics.getPlatformOverview()
    const insights = await this.adminAnalytics.getPerformanceInsights()

    const sections: ReportSection[] = [
      {
        title: 'Platform Overview',
        type: 'metrics',
        data: {
          totalUsers: overview.users.total,
          activeUsers: overview.users.newThisWeek,
          totalStudents: overview.users.students,
          totalTeachers: overview.users.teachers,
          totalTopics: overview.content.topics,
          totalExercises: overview.content.exercises,
          totalClasses: overview.classes.total,
          classCompletionRate: overview.classes.completionRate
        },
        description: 'High-level platform statistics'
      },
      {
        title: 'User Growth Trends',
        type: 'chart',
        data: dashboardData.userGrowth.map(day => ({
          date: day.date,
          newUsers: day.newUsers,
          activeUsers: day.activeUsers,
          retention: day.retention
        })),
        description: 'User registration and retention trends'
      },
      {
        title: 'Content Performance',
        type: 'table',
        data: dashboardData.contentPerformance.slice(0, 20).map(content => ({
          topic: content.topicName,
          students: content.totalStudents,
          completionRate: content.completionRate,
          avgScore: content.avgScore,
          engagement: content.engagement
        })),
        description: 'Top performing content and topics'
      },
      {
        title: 'Teacher Performance',
        type: 'table',
        data: dashboardData.teacherPerformance.slice(0, 10).map(teacher => ({
          teacher: teacher.teacherName,
          rating: teacher.avgRating,
          classes: teacher.totalClasses,
          satisfaction: teacher.studentSatisfaction
        })),
        description: 'Teacher performance rankings'
      },
      {
        title: 'Platform Insights',
        type: 'text',
        data: insights,
        description: 'Key insights and recommendations for platform improvement'
      }
    ]

    return {
      title: 'Platform Analytics Report',
      subtitle: `${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      dateRange: { start: startDate, end: endDate },
      sections,
      metadata: {
        generatedAt: new Date(),
        generatedBy: 'system',
        version: '1.0'
      }
    }
  }

  /**
   * Generate class analytics report for a specific class
   */
  async generateClassReport(bookingId: string): Promise<ReportData> {
    const classAnalytics = await this.teacherAnalytics.getClassAnalytics(bookingId)
    
    if (!classAnalytics) {
      throw new Error('Class analytics not found')
    }

    const sections: ReportSection[] = [
      {
        title: 'Class Overview',
        type: 'metrics',
        data: {
          topic: classAnalytics.booking.topic.name,
          student: classAnalytics.booking.student.name,
          date: classAnalytics.booking.scheduledAt,
          duration: classAnalytics.actualDuration,
          preparationTime: classAnalytics.preparationTime
        },
        description: 'Basic class information'
      },
      {
        title: 'Performance Metrics',
        type: 'metrics',
        data: {
          studentEngagement: classAnalytics.studentEngagement,
          classRating: classAnalytics.classRating,
          teacherRating: classAnalytics.teacherRating,
          learningObjectivesMet: classAnalytics.learningObjectivesMet,
          studentQuestions: classAnalytics.studentQuestions
        },
        description: 'Class effectiveness and engagement metrics'
      },
      {
        title: 'Content Covered',
        type: 'text',
        data: {
          topics: classAnalytics.topicsCovered,
          exercises: classAnalytics.exercisesUsed,
          homework: classAnalytics.homeworkAssigned,
          followUp: classAnalytics.followUpNeeded
        },
        description: 'Topics and exercises covered during the class'
      }
    ]

    if (classAnalytics.notes) {
      sections.push({
        title: 'Teacher Notes',
        type: 'text',
        data: classAnalytics.notes,
        description: 'Additional notes and observations from the teacher'
      })
    }

    return {
      title: `Class Report - ${classAnalytics.booking.topic.name}`,
      subtitle: `${classAnalytics.booking.scheduledAt.toLocaleDateString()}`,
      dateRange: { 
        start: classAnalytics.booking.scheduledAt, 
        end: classAnalytics.booking.scheduledAt 
      },
      sections,
      metadata: {
        generatedAt: new Date(),
        generatedBy: classAnalytics.teacherId,
        version: '1.0'
      }
    }
  }

  /**
   * Export report to different formats
   */
  async exportReport(
    report: ReportData,
    format: 'json' | 'csv' | 'pdf' = 'json'
  ): Promise<string | Buffer> {
    switch (format) {
      case 'json':
        return JSON.stringify(report, null, 2)
      
      case 'csv':
        return this.convertToCSV(report)
      
      case 'pdf':
        // Would integrate with a PDF generation library
        throw new Error('PDF export not yet implemented')
      
      default:
        throw new Error(`Unsupported format: ${format}`)
    }
  }

  /**
   * Convert report data to CSV format
   */
  private convertToCSV(report: ReportData): string {
    let csv = `Report: ${report.title}\n`
    csv += `Generated: ${report.metadata.generatedAt.toISOString()}\n`
    csv += `Period: ${report.dateRange.start.toLocaleDateString()} - ${report.dateRange.end.toLocaleDateString()}\n\n`

    for (const section of report.sections) {
      csv += `\n${section.title}\n`
      csv += `${section.description}\n`
      csv += '---\n'

      if (section.type === 'metrics' && typeof section.data === 'object') {
        for (const [key, value] of Object.entries(section.data)) {
          csv += `${key},${value}\n`
        }
      } else if (section.type === 'table' && Array.isArray(section.data)) {
        if (section.data.length > 0) {
          // Header row
          csv += Object.keys(section.data[0]).join(',') + '\n'
          // Data rows
          for (const row of section.data) {
            csv += Object.values(row).join(',') + '\n'
          }
        }
      } else if (section.type === 'chart' && Array.isArray(section.data)) {
        if (section.data.length > 0) {
          csv += Object.keys(section.data[0]).join(',') + '\n'
          for (const item of section.data) {
            csv += Object.values(item).join(',') + '\n'
          }
        }
      } else if (typeof section.data === 'string') {
        csv += `${section.data}\n`
      }
      
      csv += '\n'
    }

    return csv
  }

  /**
   * Schedule automated reports
   */
  async scheduleAutomatedReports() {
    // This would integrate with a job scheduler like node-cron
    // For now, it's a placeholder for the scheduling logic
    
    console.log('Automated report scheduling would be implemented here')
    
    // Example implementation:
    // - Weekly student progress reports
    // - Monthly teacher performance reports
    // - Quarterly platform analytics reports
  }

  /**
   * Generate bulk reports for all users of a specific role
   */
  async generateBulkReports(
    role: UserRole,
    startDate: Date,
    endDate: Date
  ): Promise<ReportData[]> {
    const users = await prisma.user.findMany({
      where: { role },
      select: { id: true, name: true, email: true }
    })

    const reports: ReportData[] = []

    for (const user of users) {
      try {
        let report: ReportData
        
        switch (role) {
          case UserRole.STUDENT:
          case UserRole.ALUMNI:
            report = await this.generateStudentProgressReport(user.id, startDate, endDate)
            break
          case UserRole.TEACHER:
            report = await this.generateTeacherPerformanceReport(user.id, startDate, endDate)
            break
          default:
            continue
        }
        
        reports.push(report)
      } catch (error) {
        console.error(`Error generating report for user ${user.id}:`, error)
      }
    }

    return reports
  }
}