import { prisma } from '@/lib/db'
import { StudentAnalyticsService } from './student-analytics'
import { AchievementSystemService } from './achievement-system'

export interface Notification {
  id: string
  userId: string
  type: 'achievement' | 'milestone' | 'reminder' | 'progress' | 'recommendation'
  title: string
  message: string
  data?: any
  isRead: boolean
  createdAt: Date
  expiresAt?: Date
}

export interface ProgressUpdate {
  userId: string
  type: 'level_progress' | 'streak_update' | 'skill_improvement' | 'new_achievement'
  data: any
  timestamp: Date
}

export class NotificationService {
  private studentAnalytics: StudentAnalyticsService
  private achievementSystem: AchievementSystemService
  private listeners: Map<string, Function[]> = new Map()

  constructor() {
    this.studentAnalytics = new StudentAnalyticsService()
    this.achievementSystem = new AchievementSystemService()
  }

  /**
   * Subscribe to real-time notifications for a user
   */
  subscribe(userId: string, callback: (notification: Notification) => void): () => void {
    if (!this.listeners.has(userId)) {
      this.listeners.set(userId, [])
    }
    
    this.listeners.get(userId)?.push(callback)
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(userId) || []
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  /**
   * Send notification to user
   */
  private async sendNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<void> {
    const fullNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    }

    // Store notification in database (if you have a notifications table)
    // await prisma.notification.create({ data: fullNotification })

    // Send to real-time listeners
    const callbacks = this.listeners.get(notification.userId) || []
    callbacks.forEach(callback => {
      try {
        callback(fullNotification)
      } catch (error) {
        console.error('Error in notification callback:', error)
      }
    })

    // Could also integrate with push notification services here
    console.log(`📱 Notification sent to ${notification.userId}: ${notification.title}`)
  }

  /**
   * Handle achievement earned notification
   */
  async onAchievementEarned(userId: string, achievement: any): Promise<void> {
    await this.sendNotification({
      userId,
      type: 'achievement',
      title: '🎉 New Achievement Unlocked!',
      message: `You've earned the "${achievement.badge.name}" badge! ${achievement.badge.description}`,
      data: {
        badgeId: achievement.badgeId,
        points: achievement.badge.points,
        rarity: achievement.badge.rarity
      },
      isRead: false
    })
  }

  /**
   * Handle level progression notification
   */
  async onLevelProgress(userId: string, progressData: any): Promise<void> {
    const { currentLevel, progress, nextLevel } = progressData

    if (progress >= 25 && progress < 30) {
      await this.sendNotification({
        userId,
        type: 'progress',
        title: '📈 Great Progress!',
        message: `You're 25% of the way to ${nextLevel} level. Keep it up!`,
        data: { level: currentLevel, progress, nextLevel },
        isRead: false
      })
    } else if (progress >= 50 && progress < 55) {
      await this.sendNotification({
        userId,
        type: 'milestone',
        title: '🎯 Halfway There!',
        message: `You're halfway to ${nextLevel} level! Excellent progress.`,
        data: { level: currentLevel, progress, nextLevel },
        isRead: false
      })
    } else if (progress >= 75 && progress < 80) {
      await this.sendNotification({
        userId,
        type: 'progress',
        title: '🚀 Almost There!',
        message: `You're 75% of the way to ${nextLevel} level. The finish line is in sight!`,
        data: { level: currentLevel, progress, nextLevel },
        isRead: false
      })
    } else if (progress >= 100) {
      await this.sendNotification({
        userId,
        type: 'milestone',
        title: '🎉 Level Up!',
        message: `Congratulations! You've reached ${nextLevel} level!`,
        data: { oldLevel: currentLevel, newLevel: nextLevel },
        isRead: false
      })
    }
  }

  /**
   * Handle streak milestone notifications
   */
  async onStreakMilestone(userId: string, streakData: any): Promise<void> {
    const { currentStreak, longestStreak } = streakData

    const milestones = [3, 7, 14, 30, 50, 100]
    
    if (milestones.includes(currentStreak)) {
      let title = ''
      let message = ''
      
      switch (currentStreak) {
        case 3:
          title = '🔥 3-Day Streak!'
          message = 'Great start! You\'re building a learning habit.'
          break
        case 7:
          title = '🔥 Week Warrior!'
          message = 'One week of consistent learning! Amazing dedication.'
          break
        case 14:
          title = '🔥 Two Week Champion!'
          message = 'Your commitment is paying off! Keep the momentum going.'
          break
        case 30:
          title = '🔥 30-Day Master!'
          message = 'A full month of learning! You\'re unstoppable!'
          break
        case 50:
          title = '🔥 Streak Legend!'
          message = '50 days in a row! Your dedication is truly inspiring.'
          break
        case 100:
          title = '🔥 Century Club!'
          message = '100 days! You\'ve achieved something extraordinary!'
          break
      }

      await this.sendNotification({
        userId,
        type: 'milestone',
        title,
        message,
        data: { currentStreak, longestStreak },
        isRead: false
      })
    }
  }

  /**
   * Handle skill improvement notifications
   */
  async onSkillImprovement(userId: string, skillData: any): Promise<void> {
    const { skillArea, oldMastery, newMastery, improvement } = skillData

    if (improvement >= 10) {
      await this.sendNotification({
        userId,
        type: 'progress',
        title: '📚 Skill Improvement!',
        message: `Your ${skillArea.toLowerCase()} skills improved by ${improvement.toFixed(1)}%! Now at ${newMastery.toFixed(0)}% mastery.`,
        data: { skillArea, oldMastery, newMastery, improvement },
        isRead: false
      })
    }

    // Mastery milestones
    const milestones = [25, 50, 75, 90]
    for (const milestone of milestones) {
      if (oldMastery < milestone && newMastery >= milestone) {
        await this.sendNotification({
          userId,
          type: 'milestone',
          title: `🎯 ${skillArea} Milestone!`,
          message: `You've reached ${milestone}% mastery in ${skillArea.toLowerCase()}!`,
          data: { skillArea, milestone, mastery: newMastery },
          isRead: false
        })
      }
    }
  }

  /**
   * Send study reminders
   */
  async sendStudyReminder(userId: string, reminderData: any): Promise<void> {
    const { lastStudyDate, streakRisk } = reminderData

    if (streakRisk) {
      await this.sendNotification({
        userId,
        type: 'reminder',
        title: '⚠️ Streak at Risk!',
        message: 'Don\'t break your learning streak! Take a few minutes to practice today.',
        data: { type: 'streak_risk', lastStudyDate },
        isRead: false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      })
    } else {
      await this.sendNotification({
        userId,
        type: 'reminder',
        title: '📖 Time to Learn!',
        message: 'Ready for your daily learning session? Your future self will thank you!',
        data: { type: 'daily_reminder', lastStudyDate },
        isRead: false,
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hours
      })
    }
  }

  /**
   * Send recommendation notifications
   */
  async sendRecommendationNotification(userId: string, recommendation: any): Promise<void> {
    await this.sendNotification({
      userId,
      type: 'recommendation',
      title: '💡 New Recommendation',
      message: recommendation.title,
      data: {
        recommendationId: recommendation.id,
        type: recommendation.type,
        priority: recommendation.priority
      },
      isRead: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    })
  }

  /**
   * Send class reminder notifications
   */
  async sendClassReminder(userId: string, classData: any): Promise<void> {
    const { bookingId, topicName, scheduledAt, teacherName } = classData

    await this.sendNotification({
      userId,
      type: 'reminder',
      title: '📅 Upcoming Class',
      message: `You have a ${topicName} class with ${teacherName} in 1 hour.`,
      data: { 
        bookingId, 
        topicName, 
        scheduledAt, 
        teacherName,
        type: 'class_reminder'
      },
      isRead: false,
      expiresAt: new Date(scheduledAt)
    })
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    // Update notification in database
    // await prisma.notification.update({
    //   where: { id: notificationId, userId },
    //   data: { isRead: true }
    // })
    
    console.log(`✅ Notification ${notificationId} marked as read for user ${userId}`)
  }

  /**
   * Get user's unread notifications count
   */
  async getUnreadCount(userId: string): Promise<number> {
    // Would query database for unread notifications
    // return await prisma.notification.count({
    //   where: { userId, isRead: false }
    // })
    
    return 0 // Placeholder
  }
}

/**
 * Real-time progress tracking service
 */
export class ProgressTracker {
  private notificationService: NotificationService
  private updateListeners: Map<string, Function[]> = new Map()

  constructor() {
    this.notificationService = new NotificationService()
  }

  /**
   * Subscribe to progress updates for a user
   */
  subscribeToProgress(userId: string, callback: (update: ProgressUpdate) => void): () => void {
    if (!this.updateListeners.has(userId)) {
      this.updateListeners.set(userId, [])
    }
    
    this.updateListeners.get(userId)?.push(callback)
    
    return () => {
      const callbacks = this.updateListeners.get(userId) || []
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  /**
   * Emit progress update
   */
  private emitProgressUpdate(update: ProgressUpdate): void {
    const callbacks = this.updateListeners.get(update.userId) || []
    callbacks.forEach(callback => {
      try {
        callback(update)
      } catch (error) {
        console.error('Error in progress update callback:', error)
      }
    })
  }

  /**
   * Track exercise completion and trigger updates
   */
  async trackExerciseCompletion(userId: string, exerciseData: any): Promise<void> {
    // Emit real-time update
    this.emitProgressUpdate({
      userId,
      type: 'skill_improvement',
      data: exerciseData,
      timestamp: new Date()
    })

    // Check for notifications
    const analytics = await new StudentAnalyticsService().getStudentAnalytics(userId)
    
    // Check for level progress
    const levelProgress = await new StudentAnalyticsService().calculateLevelProgress(userId)
    await this.notificationService.onLevelProgress(userId, levelProgress)

    // Check for streak updates
    await this.notificationService.onStreakMilestone(userId, {
      currentStreak: analytics.currentStreak,
      longestStreak: analytics.longestStreak
    })
  }

  /**
   * Get real-time progress data for user
   */
  async getCurrentProgress(userId: string): Promise<any> {
    const analytics = await new StudentAnalyticsService().getStudentAnalytics(userId)
    const levelProgress = await new StudentAnalyticsService().calculateLevelProgress(userId)
    
    return {
      level: analytics.currentLevel,
      levelProgress: levelProgress.progress,
      streak: analytics.currentStreak,
      totalTime: analytics.totalStudyTime,
      avgScore: analytics.avgExerciseScore,
      lastUpdate: new Date()
    }
  }
}

// Global instances
export const notificationService = new NotificationService()
export const progressTracker = new ProgressTracker()

// React hooks for real-time updates (would be in a separate hooks file)
export const useNotifications = (userId: string) => {
  // React hook implementation would go here
  return {
    notifications: [],
    unreadCount: 0,
    markAsRead: (id: string) => notificationService.markAsRead(id, userId),
    subscribe: (callback: Function) => notificationService.subscribe(userId, callback)
  }
}

export const useProgressUpdates = (userId: string) => {
  // React hook implementation would go here
  return {
    currentProgress: null,
    subscribe: (callback: Function) => progressTracker.subscribeToProgress(userId, callback),
    refresh: () => progressTracker.getCurrentProgress(userId)
  }
}