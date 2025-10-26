import { StudentAnalyticsService } from './student-analytics'
import { AchievementSystemService } from './achievement-system'
import { TeacherAnalyticsService } from './teacher-analytics'
import { SkillArea, ExerciseCategory } from '@prisma/client'

const studentAnalytics = new StudentAnalyticsService()
const achievementSystem = new AchievementSystemService()
const teacherAnalytics = new TeacherAnalyticsService()

/**
 * Integration hooks for the existing LMS system
 */

export class AnalyticsIntegration {
  /**
   * Call this when a student completes an exercise
   */
  static async onExerciseCompletion(data: {
    userId: string
    exerciseId: string
    score: number
    timeSpent: number
    category: ExerciseCategory
  }) {
    try {
      // Map exercise category to skill area
      const skillArea = mapExerciseCategoryToSkill(data.category)
      
      // Update student analytics
      await studentAnalytics.updateExerciseCompletion(
        data.userId,
        data.exerciseId,
        data.score,
        data.timeSpent,
        skillArea
      )

      // Check for new achievements
      const newAchievements = await achievementSystem.checkAndAwardAchievements(data.userId)
      
      // Update daily metrics
      await studentAnalytics.updateDailyMetrics(data.userId)

      return {
        success: true,
        newAchievements: newAchievements.length > 0 ? newAchievements : null
      }
    } catch (error) {
      console.error('Error in exercise completion analytics:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Call this when a student attends/misses a class
   */
  static async onClassAttendance(data: {
    userId: string
    bookingId: string
    attended: boolean
    classRating?: number
    teacherRating?: number
  }) {
    try {
      // Update student analytics
      await studentAnalytics.updateClassAttendance(
        data.userId,
        data.attended,
        data.classRating
      )

      // Create basic class analytics entry
      if (data.attended) {
        await teacherAnalytics.createClassAnalytics({
          bookingId: data.bookingId,
          teacherId: '', // Will be filled by the booking system
          actualDuration: 60, // Default, can be updated later
          studentEngagement: 5, // Default, can be updated later
          classRating: data.classRating,
          teacherRating: data.teacherRating,
          learningObjectivesMet: false // Can be updated later
        })
      }

      // Check for new achievements
      await achievementSystem.checkAndAwardAchievements(data.userId)

      return { success: true }
    } catch (error) {
      console.error('Error in class attendance analytics:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Call this when a student logs in
   */
  static async onUserLogin(userId: string) {
    try {
      await studentAnalytics.updateDailyMetrics(userId)
      return { success: true }
    } catch (error) {
      console.error('Error in login analytics:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Call this when a topic is completed
   */
  static async onTopicCompletion(data: {
    userId: string
    topicId: string
    timeSpent: number
  }) {
    try {
      // This would update topic completion in analytics
      // Implementation depends on your topic completion logic
      
      // Check for new achievements
      await achievementSystem.checkAndAwardAchievements(data.userId)

      return { success: true }
    } catch (error) {
      console.error('Error in topic completion analytics:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Call this when a teacher updates class details
   */
  static async onClassAnalyticsUpdate(data: {
    bookingId: string
    teacherId: string
    preparationTime?: number
    actualDuration?: number
    studentEngagement?: number
    topicsCovered?: string[]
    exercisesUsed?: string[]
    studentQuestions?: number
    learningObjectivesMet?: boolean
    homeworkAssigned?: boolean
    followUpNeeded?: boolean
    notes?: string
  }) {
    try {
      await teacherAnalytics.createClassAnalytics(data)
      return { success: true }
    } catch (error) {
      console.error('Error updating class analytics:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Initialize the analytics system for a new user
   */
  static async initializeUserAnalytics(userId: string) {
    try {
      await studentAnalytics.getStudentAnalytics(userId)
      return { success: true }
    } catch (error) {
      console.error('Error initializing user analytics:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Initialize default badges (run once when setting up the system)
   */
  static async initializeDefaultBadges() {
    try {
      await achievementSystem.initializeDefaultBadges()
      return { success: true }
    } catch (error) {
      console.error('Error initializing badges:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get analytics summary for a user
   */
  static async getUserAnalyticsSummary(userId: string) {
    try {
      const analytics = await studentAnalytics.getStudentDashboardData(userId)
      const achievements = await achievementSystem.getStudentAchievements(userId)
      
      return {
        success: true,
        data: {
          analytics,
          recentAchievements: achievements.slice(0, 3),
          totalAchievements: achievements.length
        }
      }
    } catch (error) {
      console.error('Error getting user analytics summary:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Real-time progress update for live display
   */
  static async getProgressUpdate(userId: string) {
    try {
      const analytics = await studentAnalytics.getStudentAnalytics(userId)
      const levelProgress = await studentAnalytics.calculateLevelProgress(userId)
      
      return {
        success: true,
        data: {
          currentLevel: analytics.currentLevel,
          levelProgress: levelProgress.progress,
          currentStreak: analytics.currentStreak,
          totalStudyTime: analytics.totalStudyTime,
          avgScore: analytics.avgExerciseScore,
          attendanceRate: analytics.attendanceRate
        }
      }
    } catch (error) {
      console.error('Error getting progress update:', error)
      return { success: false, error: error.message }
    }
  }
}

/**
 * Helper function to map exercise categories to skill areas
 */
function mapExerciseCategoryToSkill(category: ExerciseCategory): SkillArea {
  const mapping = {
    [ExerciseCategory.READING]: SkillArea.READING,
    [ExerciseCategory.WRITING]: SkillArea.WRITING,
    [ExerciseCategory.LISTENING]: SkillArea.LISTENING,
    [ExerciseCategory.SPEAKING]: SkillArea.SPEAKING,
    [ExerciseCategory.GRAMMAR]: SkillArea.GRAMMAR,
    [ExerciseCategory.VOCABULARY]: SkillArea.VOCABULARY
  }
  
  return mapping[category] || SkillArea.READING
}

/**
 * Middleware function to automatically track analytics
 */
export function withAnalytics<T extends (...args: any[]) => any>(
  fn: T,
  analyticsHook: (result: any, ...args: Parameters<T>) => Promise<void>
): T {
  return (async (...args: Parameters<T>) => {
    const result = await fn(...args)
    
    // Run analytics hook in background
    analyticsHook(result, ...args).catch(error => {
      console.error('Analytics hook error:', error)
    })
    
    return result
  }) as T
}

/**
 * Event emitter for real-time analytics updates
 */
export class AnalyticsEventEmitter {
  private static listeners: Map<string, Function[]> = new Map()

  static on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)?.push(callback)
  }

  static emit(event: string, data: any) {
    const callbacks = this.listeners.get(event) || []
    callbacks.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error('Analytics event callback error:', error)
      }
    })
  }

  static off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event) || []
    const index = callbacks.indexOf(callback)
    if (index > -1) {
      callbacks.splice(index, 1)
    }
  }
}

/**
 * React hook for real-time analytics updates
 */
export function useAnalyticsUpdates(userId: string) {
  // This would be implemented as a React hook to provide real-time updates
  // For now, it's a placeholder that would integrate with WebSocket or Server-Sent Events
  
  return {
    subscribe: (callback: (data: any) => void) => {
      AnalyticsEventEmitter.on(`user:${userId}:analytics`, callback)
      return () => AnalyticsEventEmitter.off(`user:${userId}:analytics`, callback)
    },
    
    triggerUpdate: async () => {
      const update = await AnalyticsIntegration.getProgressUpdate(userId)
      if (update.success) {
        AnalyticsEventEmitter.emit(`user:${userId}:analytics`, update.data)
      }
    }
  }
}

/**
 * Scheduled tasks for analytics maintenance
 */
export class AnalyticsTasks {
  /**
   * Daily task to calculate analytics for all users
   */
  static async dailyAnalyticsUpdate() {
    // This would be run as a cron job
    console.log('Running daily analytics update...')
    // Implementation would update metrics for all users
  }

  /**
   * Weekly task to generate reports
   */
  static async weeklyReportGeneration() {
    // This would generate weekly reports for all users
    console.log('Generating weekly reports...')
  }

  /**
   * Monthly task to clean up old analytics data
   */
  static async monthlyCleanup() {
    // This would clean up old analytics data to keep the database optimized
    console.log('Running monthly analytics cleanup...')
  }
}