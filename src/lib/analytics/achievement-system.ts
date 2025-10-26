import { prisma } from '@/lib/db'
import { 
  Badge, 
  Achievement, 
  BadgeType, 
  BadgeCategory, 
  SkillArea, 
  Level 
} from '@prisma/client'
import { BadgeRequirement, BadgeProgress, DetailedAchievement } from './types'
import { StudentAnalyticsService } from './student-analytics'

export class AchievementSystemService {
  private studentAnalytics: StudentAnalyticsService

  constructor() {
    this.studentAnalytics = new StudentAnalyticsService()
  }

  /**
   * Initialize default badges in the system
   */
  async initializeDefaultBadges(): Promise<void> {
    const defaultBadges = [
      // Milestone Badges
      {
        name: "First Steps",
        description: "Complete your first exercise",
        icon: "🚀",
        type: BadgeType.MILESTONE,
        category: BadgeCategory.PROGRESS,
        requirements: { type: 'completion', value: 1 },
        points: 10,
        rarity: "common",
        color: "#10B981",
        bgColor: "#ECFDF5"
      },
      {
        name: "Exercise Enthusiast",
        description: "Complete 25 exercises",
        icon: "📚",
        type: BadgeType.MILESTONE,
        category: BadgeCategory.PROGRESS,
        requirements: { type: 'completion', value: 25 },
        points: 50,
        rarity: "common",
        color: "#3B82F6",
        bgColor: "#EFF6FF"
      },
      {
        name: "Century Club",
        description: "Complete 100 exercises",
        icon: "🏆",
        type: BadgeType.MILESTONE,
        category: BadgeCategory.PROGRESS,
        requirements: { type: 'completion', value: 100 },
        points: 200,
        rarity: "rare",
        color: "#F59E0B",
        bgColor: "#FFFBEB"
      },
      {
        name: "Exercise Master",
        description: "Complete 500 exercises",
        icon: "👑",
        type: BadgeType.MILESTONE,
        category: BadgeCategory.PROGRESS,
        requirements: { type: 'completion', value: 500 },
        points: 1000,
        rarity: "epic",
        color: "#8B5CF6",
        bgColor: "#F3E8FF"
      },

      // Streak Badges
      {
        name: "Getting Started",
        description: "Study for 3 days in a row",
        icon: "🔥",
        type: BadgeType.STREAK,
        category: BadgeCategory.CONSISTENCY,
        requirements: { type: 'streak', value: 3 },
        points: 25,
        rarity: "common",
        color: "#EF4444",
        bgColor: "#FEF2F2"
      },
      {
        name: "Week Warrior",
        description: "Study for 7 days in a row",
        icon: "🔥",
        type: BadgeType.STREAK,
        category: BadgeCategory.CONSISTENCY,
        requirements: { type: 'streak', value: 7 },
        points: 75,
        rarity: "common",
        color: "#F97316",
        bgColor: "#FFF7ED"
      },
      {
        name: "Monthly Master",
        description: "Study for 30 days in a row",
        icon: "🔥",
        type: BadgeType.STREAK,
        category: BadgeCategory.CONSISTENCY,
        requirements: { type: 'streak', value: 30 },
        points: 300,
        rarity: "rare",
        color: "#DC2626",
        bgColor: "#FEF2F2"
      },
      {
        name: "Streak Legend",
        description: "Study for 100 days in a row",
        icon: "🔥",
        type: BadgeType.STREAK,
        category: BadgeCategory.CONSISTENCY,
        requirements: { type: 'streak', value: 100 },
        points: 1000,
        rarity: "legendary",
        color: "#991B1B",
        bgColor: "#FEF2F2"
      },

      // Skill Mastery Badges
      {
        name: "Reading Rookie",
        description: "Achieve 70% mastery in Reading",
        icon: "📖",
        type: BadgeType.SKILL_MASTERY,
        category: BadgeCategory.EXCELLENCE,
        requirements: { type: 'skill_mastery', value: 70, skill: SkillArea.READING },
        points: 100,
        rarity: "common",
        color: "#059669",
        bgColor: "#ECFDF5"
      },
      {
        name: "Reading Expert",
        description: "Achieve 90% mastery in Reading",
        icon: "📚",
        type: BadgeType.SKILL_MASTERY,
        category: BadgeCategory.EXCELLENCE,
        requirements: { type: 'skill_mastery', value: 90, skill: SkillArea.READING },
        points: 250,
        rarity: "rare",
        color: "#047857",
        bgColor: "#ECFDF5"
      },
      {
        name: "Writing Warrior",
        description: "Achieve 70% mastery in Writing",
        icon: "✍️",
        type: BadgeType.SKILL_MASTERY,
        category: BadgeCategory.EXCELLENCE,
        requirements: { type: 'skill_mastery', value: 70, skill: SkillArea.WRITING },
        points: 100,
        rarity: "common",
        color: "#7C3AED",
        bgColor: "#F3E8FF"
      },
      {
        name: "Speaking Star",
        description: "Achieve 70% mastery in Speaking",
        icon: "🗣️",
        type: BadgeType.SKILL_MASTERY,
        category: BadgeCategory.EXCELLENCE,
        requirements: { type: 'skill_mastery', value: 70, skill: SkillArea.SPEAKING },
        points: 100,
        rarity: "common",
        color: "#DC2626",
        bgColor: "#FEF2F2"
      },
      {
        name: "Listening Legend",
        description: "Achieve 70% mastery in Listening",
        icon: "👂",
        type: BadgeType.SKILL_MASTERY,
        category: BadgeCategory.EXCELLENCE,
        requirements: { type: 'skill_mastery', value: 70, skill: SkillArea.LISTENING },
        points: 100,
        rarity: "common",
        color: "#0891B2",
        bgColor: "#ECFEFF"
      },

      // Attendance Badges
      {
        name: "Class Regular",
        description: "Attend 10 live classes",
        icon: "🎓",
        type: BadgeType.ATTENDANCE,
        category: BadgeCategory.PARTICIPATION,
        requirements: { type: 'attendance', value: 10 },
        points: 100,
        rarity: "common",
        color: "#7C2D12",
        bgColor: "#FEF7ED"
      },
      {
        name: "Perfect Attendance",
        description: "Maintain 95% attendance rate for 30 days",
        icon: "⭐",
        type: BadgeType.ATTENDANCE,
        category: BadgeCategory.PARTICIPATION,
        requirements: { type: 'attendance', value: 95, condition: 'rate_30_days' },
        points: 200,
        rarity: "rare",
        color: "#B91C1C",
        bgColor: "#FEF2F2"
      },

      // Score-based Badges
      {
        name: "High Achiever",
        description: "Maintain 90% average score for 20 exercises",
        icon: "🌟",
        type: BadgeType.ACHIEVEMENT,
        category: BadgeCategory.EXCELLENCE,
        requirements: { type: 'score', value: 90, condition: '20_exercises' },
        points: 150,
        rarity: "rare",
        color: "#FBBF24",
        bgColor: "#FFFBEB"
      },
      {
        name: "Perfectionist",
        description: "Score 100% on 10 exercises",
        icon: "💯",
        type: BadgeType.ACHIEVEMENT,
        category: BadgeCategory.EXCELLENCE,
        requirements: { type: 'score', value: 100, condition: '10_exercises' },
        points: 300,
        rarity: "epic",
        color: "#A855F7",
        bgColor: "#F3E8FF"
      },

      // Level Progression Badges
      {
        name: "A2 Graduate",
        description: "Reach A2 level",
        icon: "🎯",
        type: BadgeType.MILESTONE,
        category: BadgeCategory.PROGRESS,
        requirements: { type: 'level', value: 2, level: Level.A2 },
        points: 500,
        rarity: "rare",
        color: "#059669",
        bgColor: "#ECFDF5"
      },
      {
        name: "B1 Graduate",
        description: "Reach B1 level",
        icon: "🎯",
        type: BadgeType.MILESTONE,
        category: BadgeCategory.PROGRESS,
        requirements: { type: 'level', value: 3, level: Level.B1 },
        points: 750,
        rarity: "epic",
        color: "#0891B2",
        bgColor: "#ECFEFF"
      },
      {
        name: "B2 Graduate",
        description: "Reach B2 level",
        icon: "🎯",
        type: BadgeType.MILESTONE,
        category: BadgeCategory.PROGRESS,
        requirements: { type: 'level', value: 4, level: Level.B2 },
        points: 1000,
        rarity: "epic",
        color: "#7C3AED",
        bgColor: "#F3E8FF"
      },

      // Special Badges
      {
        name: "Early Bird",
        description: "Complete 10 exercises before 8 AM",
        icon: "🌅",
        type: BadgeType.SPECIAL,
        category: BadgeCategory.SPECIAL_EVENT,
        requirements: { type: 'custom', value: 10, condition: 'before_8am' },
        points: 75,
        rarity: "rare",
        color: "#F59E0B",
        bgColor: "#FFFBEB"
      },
      {
        name: "Night Owl",
        description: "Complete 10 exercises after 10 PM",
        icon: "🦉",
        type: BadgeType.SPECIAL,
        category: BadgeCategory.SPECIAL_EVENT,
        requirements: { type: 'custom', value: 10, condition: 'after_10pm' },
        points: 75,
        rarity: "rare",
        color: "#6366F1",
        bgColor: "#EEF2FF"
      },
      {
        name: "Weekend Warrior",
        description: "Study for 5 consecutive weekends",
        icon: "🛡️",
        type: BadgeType.SPECIAL,
        category: BadgeCategory.CONSISTENCY,
        requirements: { type: 'custom', value: 5, condition: 'weekend_study' },
        points: 100,
        rarity: "rare",
        color: "#DC2626",
        bgColor: "#FEF2F2"
      }
    ]

    for (const badge of defaultBadges) {
      await prisma.badge.upsert({
        where: { name: badge.name },
        create: badge,
        update: badge
      })
    }
  }

  /**
   * Check and award achievements for a student
   */
  async checkAndAwardAchievements(userId: string): Promise<Achievement[]> {
    const analytics = await this.studentAnalytics.getStudentAnalytics(userId)
    const badges = await prisma.badge.findMany({
      where: { isActive: true }
    })

    const newAchievements: Achievement[] = []

    for (const badge of badges) {
      const requirement = badge.requirements as BadgeRequirement
      const hasAchievement = await this.hasAchievement(analytics.id, badge.id)

      if (!hasAchievement && await this.meetsRequirement(analytics, requirement)) {
        const achievement = await this.awardBadge(analytics.id, userId, badge.id)
        newAchievements.push(achievement)
      }
    }

    return newAchievements
  }

  /**
   * Check if student meets badge requirement
   */
  private async meetsRequirement(analytics: any, requirement: BadgeRequirement): Promise<boolean> {
    switch (requirement.type) {
      case 'completion':
        return analytics.totalExercisesCompleted >= requirement.value

      case 'streak':
        return analytics.currentStreak >= requirement.value

      case 'score':
        if (requirement.condition === '20_exercises') {
          // Check last 20 exercises average
          const recentSubmissions = await prisma.submission.findMany({
            where: { userId: analytics.userId },
            orderBy: { submittedAt: 'desc' },
            take: 20
          })
          if (recentSubmissions.length < 20) return false
          const avgScore = recentSubmissions.reduce((sum, sub) => sum + (sub.score || 0), 0) / 20
          return avgScore >= requirement.value
        }
        if (requirement.condition === '10_exercises') {
          // Check for 10 perfect scores
          const perfectScores = await prisma.submission.count({
            where: {
              userId: analytics.userId,
              score: 100
            }
          })
          return perfectScores >= requirement.value
        }
        return analytics.avgExerciseScore >= requirement.value

      case 'attendance':
        if (requirement.condition === 'rate_30_days') {
          // Check 30-day attendance rate
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          
          const recentBookings = await prisma.booking.count({
            where: {
              studentId: analytics.userId,
              scheduledAt: { gte: thirtyDaysAgo }
            }
          })
          
          const recentAttendance = await prisma.attendanceLog.count({
            where: {
              studentId: analytics.userId,
              timestamp: { gte: thirtyDaysAgo },
              action: 'marked_present'
            }
          })

          if (recentBookings === 0) return false
          const rate = (recentAttendance / recentBookings) * 100
          return rate >= requirement.value
        }
        return analytics.totalClassesAttended >= requirement.value

      case 'skill_mastery':
        if (requirement.skill) {
          const skillProgress = analytics.skillProgress.find(
            (s: any) => s.skillArea === requirement.skill
          )
          return skillProgress && skillProgress.masteryPercentage >= requirement.value
        }
        return false

      case 'custom':
        return await this.checkCustomRequirement(analytics, requirement)

      default:
        return false
    }
  }

  /**
   * Check custom badge requirements
   */
  private async checkCustomRequirement(analytics: any, requirement: BadgeRequirement): Promise<boolean> {
    switch (requirement.condition) {
      case 'before_8am':
        // Check exercises completed before 8 AM
        const morningExercises = await prisma.submission.count({
          where: {
            userId: analytics.userId,
            submittedAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(8, 0, 0, 0))
            }
          }
        })
        return morningExercises >= requirement.value

      case 'after_10pm':
        // Check exercises completed after 10 PM
        const nightExercises = await prisma.submission.count({
          where: {
            userId: analytics.userId,
            submittedAt: {
              gte: new Date(new Date().setHours(22, 0, 0, 0))
            }
          }
        })
        return nightExercises >= requirement.value

      case 'weekend_study':
        // Check weekend study sessions
        const weekendSessions = await prisma.studySession.findMany({
          where: {
            userId: analytics.userId
          }
        })
        
        const weekendCount = weekendSessions.filter(session => {
          const dayOfWeek = session.startTime.getDay()
          return dayOfWeek === 0 || dayOfWeek === 6 // Sunday or Saturday
        }).length

        // Check for consecutive weekend groups
        let consecutiveWeekends = 0
        let maxConsecutive = 0
        // This is a simplified check - in reality, you'd want more sophisticated logic
        
        return maxConsecutive >= requirement.value

      default:
        return false
    }
  }

  /**
   * Check if student already has achievement
   */
  private async hasAchievement(analyticsId: string, badgeId: string): Promise<boolean> {
    const achievement = await prisma.achievement.findUnique({
      where: {
        analyticsId_badgeId: {
          analyticsId,
          badgeId
        }
      }
    })
    return !!achievement
  }

  /**
   * Award badge to student
   */
  private async awardBadge(analyticsId: string, userId: string, badgeId: string): Promise<Achievement> {
    const badge = await prisma.badge.findUnique({
      where: { id: badgeId }
    })

    if (!badge) {
      throw new Error('Badge not found')
    }

    const achievement = await prisma.achievement.create({
      data: {
        userId,
        analyticsId,
        badgeId,
        earnedAt: new Date(),
        progress: 100,
        isVisible: true,
        context: {
          earnedAt: new Date().toISOString(),
          points: badge.points
        }
      }
    })

    // Update analytics with achievement notification
    await this.createAchievementNotification(userId, badge)

    return achievement
  }

  /**
   * Create achievement notification
   */
  private async createAchievementNotification(userId: string, badge: Badge): Promise<void> {
    // This would integrate with a notification system
    console.log(`🎉 ${badge.name} badge awarded to user ${userId}!`)
  }

  /**
   * Get student's badge progress
   */
  async getBadgeProgress(userId: string): Promise<BadgeProgress[]> {
    const analytics = await this.studentAnalytics.getStudentAnalytics(userId)
    const badges = await prisma.badge.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { points: 'asc' }]
    })

    const progress: BadgeProgress[] = []

    for (const badge of badges) {
      const hasAchievement = await this.hasAchievement(analytics.id, badge.id)
      const requirement = badge.requirements as BadgeRequirement
      
      let currentProgress = 0
      let maxProgress = requirement.value

      if (!hasAchievement) {
        currentProgress = await this.calculateProgress(analytics, requirement)
      } else {
        currentProgress = maxProgress
      }

      const percentage = Math.min(100, (currentProgress / maxProgress) * 100)

      progress.push({
        badge,
        currentProgress,
        maxProgress,
        percentage,
        isCompleted: hasAchievement,
        nextMilestone: hasAchievement ? undefined : this.getNextMilestone(currentProgress, maxProgress)
      })
    }

    return progress
  }

  /**
   * Calculate current progress towards a badge
   */
  private async calculateProgress(analytics: any, requirement: BadgeRequirement): Promise<number> {
    switch (requirement.type) {
      case 'completion':
        return analytics.totalExercisesCompleted

      case 'streak':
        return analytics.currentStreak

      case 'score':
        if (requirement.condition === '20_exercises') {
          const recentSubmissions = await prisma.submission.findMany({
            where: { userId: analytics.userId },
            orderBy: { submittedAt: 'desc' },
            take: 20
          })
          if (recentSubmissions.length < 20) return recentSubmissions.length
          const avgScore = recentSubmissions.reduce((sum, sub) => sum + (sub.score || 0), 0) / 20
          return avgScore >= requirement.value ? requirement.value : avgScore
        }
        return analytics.avgExerciseScore

      case 'attendance':
        return analytics.totalClassesAttended

      case 'skill_mastery':
        if (requirement.skill) {
          const skillProgress = analytics.skillProgress.find(
            (s: any) => s.skillArea === requirement.skill
          )
          return skillProgress ? skillProgress.masteryPercentage : 0
        }
        return 0

      default:
        return 0
    }
  }

  /**
   * Get next milestone for badge progress
   */
  private getNextMilestone(current: number, max: number): number | undefined {
    if (current >= max) return undefined
    
    // Define milestone percentages
    const milestones = [0.25, 0.5, 0.75, 1.0]
    
    for (const milestone of milestones) {
      const milestoneValue = max * milestone
      if (current < milestoneValue) {
        return milestoneValue
      }
    }
    
    return max
  }

  /**
   * Get student achievements with badge details
   */
  async getStudentAchievements(userId: string): Promise<DetailedAchievement[]> {
    const analytics = await this.studentAnalytics.getStudentAnalytics(userId)
    
    const achievements = await prisma.achievement.findMany({
      where: { analyticsId: analytics.id },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' }
    })

    return achievements.map(achievement => ({
      ...achievement,
      progressToNext: undefined // Could be enhanced to show progress to next badge in series
    }))
  }
}