import { prisma } from '@/lib/db'
import { 
  Level, 
  SkillArea, 
  StudentAnalytics, 
  SkillProgress,
  StudySession,
  LearningStreak,
  ExerciseCategory 
} from '@prisma/client'
import { 
  StudentAnalyticsWithRelations,
  StudentDashboardData,
  ProgressCalculation,
  LevelProgressCalculation,
  SkillProgressWithTrends,
  SessionAnalytics
} from './types'

export class StudentAnalyticsService {
  /**
   * Get or create student analytics record
   */
  async getStudentAnalytics(userId: string): Promise<StudentAnalyticsWithRelations> {
    let analytics = await prisma.studentAnalytics.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, name: true, email: true, level: true }
        },
        skillProgress: true,
        achievements: {
          include: { badge: true },
          orderBy: { earnedAt: 'desc' }
        },
        learningStreaks: {
          where: { isActive: true },
          orderBy: { startDate: 'desc' }
        },
        studySessions: {
          orderBy: { startTime: 'desc' },
          take: 10
        },
        recommendations: {
          where: { isActive: true },
          orderBy: { priority: 'desc' }
        },
        weeklyReports: {
          orderBy: { weekStartDate: 'desc' },
          take: 4
        }
      }
    })

    if (!analytics) {
      analytics = await this.createStudentAnalytics(userId)
    }

    return analytics
  }

  /**
   * Create initial analytics record for new student
   */
  private async createStudentAnalytics(userId: string): Promise<StudentAnalyticsWithRelations> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const analytics = await prisma.studentAnalytics.create({
      data: {
        userId,
        currentLevel: user.level,
        levelProgress: 0,
        totalStudyTime: 0,
        avgDailyStudyTime: 0,
        currentStreak: 0,
        longestStreak: 0,
        avgExerciseScore: 0,
        totalExercisesCompleted: 0,
        totalTopicsCompleted: 0,
        totalClassesBooked: 0,
        totalClassesAttended: 0,
        attendanceRate: 0,
        totalNoShows: 0,
        loginCount: 0,
        avgSessionDuration: 0,
        topicsPerWeek: 0,
        exercisesPerDay: 0,
        improvementRate: 0
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, level: true }
        },
        skillProgress: true,
        achievements: {
          include: { badge: true }
        },
        learningStreaks: true,
        studySessions: true,
        recommendations: true,
        weeklyReports: true
      }
    })

    // Initialize skill progress for all skills at current level
    if (user.level) {
      await this.initializeSkillProgress(analytics.id, userId, user.level)
    }

    return analytics
  }

  /**
   * Initialize skill progress tracking for all skill areas
   */
  private async initializeSkillProgress(analyticsId: string, userId: string, level: Level): Promise<void> {
    const skillAreas = Object.values(SkillArea)
    
    const skillProgressData = skillAreas.map(skill => ({
      userId,
      analyticsId,
      skillArea: skill,
      level,
      masteryPercentage: 0,
      exercisesCompleted: 0,
      avgScore: 0,
      timeSpent: 0,
      strongTopics: [],
      weakTopics: [],
      improvementTrend: 0,
      consistencyScore: 0
    }))

    await prisma.skillProgress.createMany({
      data: skillProgressData
    })
  }

  /**
   * Update analytics when student completes an exercise
   */
  async updateExerciseCompletion(
    userId: string,
    exerciseId: string,
    score: number,
    timeSpent: number,
    skillArea: SkillArea
  ): Promise<void> {
    const analytics = await this.getStudentAnalytics(userId)
    
    // Update overall analytics
    await prisma.studentAnalytics.update({
      where: { id: analytics.id },
      data: {
        totalExercisesCompleted: { increment: 1 },
        avgExerciseScore: this.calculateNewAverage(
          analytics.avgExerciseScore,
          analytics.totalExercisesCompleted,
          score
        ),
        totalStudyTime: { increment: timeSpent },
        lastStudyDate: new Date()
      }
    })

    // Update skill-specific progress
    await this.updateSkillProgress(analytics.id, skillArea, score, timeSpent)

    // Update or create study session
    await this.updateStudySession(analytics.id, userId, timeSpent, 'exercise')

    // Check for achievements
    await this.checkAchievements(userId)
  }

  /**
   * Update skill-specific progress
   */
  private async updateSkillProgress(
    analyticsId: string,
    skillArea: SkillArea,
    score: number,
    timeSpent: number
  ): Promise<void> {
    const skillProgress = await prisma.skillProgress.findFirst({
      where: { analyticsId, skillArea }
    })

    if (!skillProgress) return

    const newAvgScore = this.calculateNewAverage(
      skillProgress.avgScore,
      skillProgress.exercisesCompleted,
      score
    )

    const newMasteryPercentage = Math.min(100, skillProgress.masteryPercentage + (score / 100) * 2)

    await prisma.skillProgress.update({
      where: { id: skillProgress.id },
      data: {
        exercisesCompleted: { increment: 1 },
        avgScore: newAvgScore,
        timeSpent: { increment: timeSpent },
        masteryPercentage: newMasteryPercentage,
        lastPracticed: new Date(),
        improvementTrend: this.calculateImprovementTrend(skillProgress.avgScore, newAvgScore)
      }
    })
  }

  /**
   * Update or create study session
   */
  private async updateStudySession(
    analyticsId: string,
    userId: string,
    timeSpent: number,
    sessionType: string
  ): Promise<void> {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Look for existing session today
    const existingSession = await prisma.studySession.findFirst({
      where: {
        analyticsId,
        startTime: { gte: today }
      }
    })

    if (existingSession) {
      // Update existing session
      await prisma.studySession.update({
        where: { id: existingSession.id },
        data: {
          duration: { increment: timeSpent },
          exercisesCompleted: { increment: 1 },
          endTime: now
        }
      })
    } else {
      // Create new session
      await prisma.studySession.create({
        data: {
          userId,
          analyticsId,
          startTime: now,
          endTime: now,
          duration: timeSpent,
          exercisesCompleted: 1,
          sessionType,
          isCompleted: false,
          activitiesCompleted: [],
          topicsStudied: [],
          avgScore: 0
        }
      })
    }
  }

  /**
   * Update analytics when student attends a class
   */
  async updateClassAttendance(userId: string, attended: boolean, classRating?: number): Promise<void> {
    const analytics = await this.getStudentAnalytics(userId)
    
    const updates: any = {
      totalClassesBooked: { increment: 1 },
      lastStudyDate: new Date()
    }

    if (attended) {
      updates.totalClassesAttended = { increment: 1 }
      updates.attendanceRate = ((analytics.totalClassesAttended + 1) / (analytics.totalClassesBooked + 1)) * 100
    } else {
      updates.totalNoShows = { increment: 1 }
      updates.attendanceRate = (analytics.totalClassesAttended / (analytics.totalClassesBooked + 1)) * 100
    }

    await prisma.studentAnalytics.update({
      where: { id: analytics.id },
      data: updates
    })

    if (attended) {
      await this.updateStudySession(analytics.id, userId, 60, 'class')
      await this.updateLearningStreak(userId)
    }
  }

  /**
   * Update learning streak
   */
  private async updateLearningStreak(userId: string): Promise<void> {
    const analytics = await this.getStudentAnalytics(userId)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // Check if there's an active streak
    let activeStreak = await prisma.learningStreak.findFirst({
      where: {
        analyticsId: analytics.id,
        isActive: true
      }
    })

    if (!activeStreak) {
      // Start new streak
      activeStreak = await prisma.learningStreak.create({
        data: {
          userId,
          analyticsId: analytics.id,
          startDate: today,
          length: 1,
          isActive: true,
          activities: [],
          avgDailyTime: 0,
          totalTime: 0
        }
      })
    } else {
      // Check if streak should continue
      const lastActivity = analytics.lastStudyDate
      if (lastActivity && lastActivity >= yesterday) {
        // Continue streak
        await prisma.learningStreak.update({
          where: { id: activeStreak.id },
          data: {
            length: { increment: 1 },
            endDate: today
          }
        })
      } else {
        // Streak broken, end current and start new
        await prisma.learningStreak.update({
          where: { id: activeStreak.id },
          data: {
            isActive: false,
            endDate: lastActivity || yesterday
          }
        })

        await prisma.learningStreak.create({
          data: {
            userId,
            analyticsId: analytics.id,
            startDate: today,
            length: 1,
            isActive: true,
            activities: [],
            avgDailyTime: 0,
            totalTime: 0
          }
        })
      }
    }

    // Update analytics with streak info
    const currentStreakLength = activeStreak.isActive ? activeStreak.length + 1 : 1
    await prisma.studentAnalytics.update({
      where: { id: analytics.id },
      data: {
        currentStreak: currentStreakLength,
        longestStreak: Math.max(analytics.longestStreak, currentStreakLength)
      }
    })
  }

  /**
   * Calculate progress towards next level
   */
  async calculateLevelProgress(userId: string): Promise<LevelProgressCalculation> {
    const analytics = await this.getStudentAnalytics(userId)
    const currentLevel = analytics.currentLevel || Level.A1

    // Level progression requirements
    const levelRequirements = {
      [Level.A1]: { exercises: 50, topics: 10, skillThreshold: 60 },
      [Level.A2]: { exercises: 75, topics: 15, skillThreshold: 70 },
      [Level.B1]: { exercises: 100, topics: 20, skillThreshold: 75 },
      [Level.B2]: { exercises: 125, topics: 25, skillThreshold: 80 },
      [Level.C1]: { exercises: 150, topics: 30, skillThreshold: 85 },
      [Level.C2]: { exercises: 200, topics: 40, skillThreshold: 90 }
    }

    const nextLevelMap = {
      [Level.A1]: Level.A2,
      [Level.A2]: Level.B1,
      [Level.B1]: Level.B2,
      [Level.B2]: Level.C1,
      [Level.C1]: Level.C2
    }

    const requirements = levelRequirements[currentLevel]
    const nextLevel = nextLevelMap[currentLevel]

    // Calculate progress
    const exerciseProgress = Math.min(100, (analytics.totalExercisesCompleted / requirements.exercises) * 100)
    const topicProgress = Math.min(100, (analytics.totalTopicsCompleted / requirements.topics) * 100)
    
    // Calculate skill threshold progress
    const skillProgress = analytics.skillProgress || []
    const avgSkillMastery = skillProgress.length > 0 
      ? skillProgress.reduce((sum, skill) => sum + skill.masteryPercentage, 0) / skillProgress.length
      : 0
    const skillThresholdProgress = Math.min(100, (avgSkillMastery / requirements.skillThreshold) * 100)

    // Overall progress is the minimum of all requirements
    const overallProgress = Math.min(exerciseProgress, topicProgress, skillThresholdProgress)

    // Estimate completion date based on current velocity
    let estimatedCompletion: Date | undefined
    if (analytics.exercisesPerDay > 0 && overallProgress < 100) {
      const remainingExercises = requirements.exercises - analytics.totalExercisesCompleted
      const daysToComplete = remainingExercises / analytics.exercisesPerDay
      estimatedCompletion = new Date()
      estimatedCompletion.setDate(estimatedCompletion.getDate() + daysToComplete)
    }

    return {
      currentLevel,
      progress: overallProgress,
      nextLevel,
      estimatedCompletion,
      requirements: {
        exercisesNeeded: Math.max(0, requirements.exercises - analytics.totalExercisesCompleted),
        topicsNeeded: Math.max(0, requirements.topics - analytics.totalTopicsCompleted),
        skillThresholds: Object.values(SkillArea).reduce((acc, skill) => {
          const skillData = skillProgress.find(s => s.skillArea === skill)
          acc[skill] = Math.max(0, requirements.skillThreshold - (skillData?.masteryPercentage || 0))
          return acc
        }, {} as Record<SkillArea, number>)
      }
    }
  }

  /**
   * Get skill progress with trends
   */
  async getSkillProgressWithTrends(userId: string): Promise<SkillProgressWithTrends[]> {
    const analytics = await this.getStudentAnalytics(userId)
    
    return analytics.skillProgress.map(skill => {
      const trend = skill.improvementTrend > 0.1 ? 'improving' 
                   : skill.improvementTrend < -0.1 ? 'declining' 
                   : 'stable'

      // Calculate projected mastery based on current trend
      const projectedMastery = Math.min(100, skill.masteryPercentage + (skill.improvementTrend * 4)) // 4 weeks projection

      return {
        ...skill,
        trend,
        weeklyChange: skill.improvementTrend,
        monthlyChange: skill.improvementTrend * 4,
        projectedMastery
      }
    })
  }

  /**
   * Get complete dashboard data for student
   */
  async getStudentDashboardData(userId: string): Promise<StudentDashboardData> {
    const analytics = await this.getStudentAnalytics(userId)
    const levelProgress = await this.calculateLevelProgress(userId)
    const skillOverview = await this.getSkillProgressWithTrends(userId)
    
    const currentStreak = analytics.learningStreaks.find(streak => streak.isActive) || null
    const weeklyProgress = analytics.weeklyReports[0] || null
    
    const upcomingGoals = await prisma.learningGoal.findMany({
      where: {
        userId,
        isActive: true,
        isCompleted: false
      },
      orderBy: { targetDate: 'asc' },
      take: 5
    })

    return {
      analytics,
      currentLevelProgress: levelProgress,
      skillOverview,
      recentAchievements: analytics.achievements.slice(0, 5),
      currentStreak,
      weeklyProgress,
      recommendations: analytics.recommendations.slice(0, 5),
      upcomingGoals
    }
  }

  /**
   * Check and award achievements
   */
  private async checkAchievements(userId: string): Promise<void> {
    // This will be implemented when we create the achievement system
    // For now, this is a placeholder
  }

  /**
   * Utility functions
   */
  private calculateNewAverage(currentAvg: number, count: number, newValue: number): number {
    return ((currentAvg * count) + newValue) / (count + 1)
  }

  private calculateImprovementTrend(oldScore: number, newScore: number): number {
    if (oldScore === 0) return 0
    return ((newScore - oldScore) / oldScore) * 100
  }

  /**
   * Update daily analytics metrics
   */
  async updateDailyMetrics(userId: string): Promise<void> {
    const analytics = await this.getStudentAnalytics(userId)
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))

    // Calculate average daily study time from recent sessions
    const recentSessions = await prisma.studySession.findMany({
      where: {
        analyticsId: analytics.id,
        startTime: { gte: thirtyDaysAgo }
      }
    })

    const totalMinutes = recentSessions.reduce((sum, session) => sum + session.duration, 0)
    const avgDailyStudyTime = Math.round(totalMinutes / 30)

    // Calculate topics per week
    const recentProgress = await prisma.progress.findMany({
      where: {
        userId,
        completedAt: { gte: thirtyDaysAgo }
      }
    })

    const topicsPerWeek = (recentProgress.length / 4.3) // 30 days ≈ 4.3 weeks

    // Calculate exercises per day
    const recentSubmissions = await prisma.submission.findMany({
      where: {
        userId,
        submittedAt: { gte: thirtyDaysAgo }
      }
    })

    const exercisesPerDay = recentSubmissions.length / 30

    await prisma.studentAnalytics.update({
      where: { id: analytics.id },
      data: {
        avgDailyStudyTime,
        topicsPerWeek,
        exercisesPerDay,
        lastLoginAt: now,
        loginCount: { increment: 1 }
      }
    })
  }
}