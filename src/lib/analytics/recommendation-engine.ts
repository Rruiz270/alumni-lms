import { prisma } from '@/lib/db'
import { 
  Level, 
  SkillArea, 
  RecommendationType, 
  ExerciseCategory,
  Phase 
} from '@prisma/client'
import { RecommendationContext, RecommendationEngine } from './types'
import { StudentAnalyticsService } from './student-analytics'

export class RecommendationEngineService implements RecommendationEngine {
  private studentAnalytics: StudentAnalyticsService

  constructor() {
    this.studentAnalytics = new StudentAnalyticsService()
  }

  /**
   * Generate personalized exercise recommendations
   */
  async generateExerciseRecommendations(context: RecommendationContext): Promise<any[]> {
    const { studentId, currentLevel, skillProgress, recentPerformance } = context
    
    // Identify weak areas that need attention
    const weakSkills = skillProgress
      .filter(skill => skill.masteryPercentage < 70)
      .sort((a, b) => a.masteryPercentage - b.masteryPercentage)
      .slice(0, 3)

    const recommendations = []

    for (const skill of weakSkills) {
      // Find exercises for this skill area at appropriate difficulty
      const exerciseCategory = this.mapSkillToExerciseCategory(skill.skillArea)
      
      const exercises = await prisma.exercise.findMany({
        where: {
          category: exerciseCategory,
          topic: {
            level: currentLevel
          }
        },
        include: {
          topic: true,
          submissions: {
            where: { userId: studentId },
            orderBy: { submittedAt: 'desc' },
            take: 1
          }
        },
        take: 5
      })

      for (const exercise of exercises) {
        // Skip if recently completed with high score
        const recentSubmission = exercise.submissions[0]
        if (recentSubmission && recentSubmission.score && recentSubmission.score > 85) {
          continue
        }

        const recommendation = await this.createRecommendation(
          studentId,
          RecommendationType.EXERCISE,
          `Practice ${skill.skillArea.toLowerCase()}`,
          `Improve your ${skill.skillArea.toLowerCase()} skills with this targeted exercise`,
          exercise.id,
          'exercise',
          this.calculatePriority(skill.masteryPercentage, recentPerformance.avgScore),
          0.8,
          `Your ${skill.skillArea.toLowerCase()} mastery is at ${skill.masteryPercentage}%. This exercise will help you improve.`,
          `Increase ${skill.skillArea.toLowerCase()} mastery by 5-10%`
        )

        recommendations.push(recommendation)
      }
    }

    return recommendations.slice(0, 5) // Return top 5 recommendations
  }

  /**
   * Generate topic recommendations based on learning path
   */
  async generateTopicRecommendations(context: RecommendationContext): Promise<any[]> {
    const { studentId, currentLevel, skillProgress } = context

    // Find completed topics to determine next logical topics
    const completedTopics = await prisma.progress.findMany({
      where: {
        userId: studentId,
        afterClassComplete: true
      },
      include: { topic: true }
    })

    const completedTopicIds = completedTopics.map(p => p.topicId)

    // Find next topics in the learning path
    const nextTopics = await prisma.topic.findMany({
      where: {
        level: currentLevel,
        id: { notIn: completedTopicIds }
      },
      orderBy: { orderIndex: 'asc' },
      take: 10
    })

    const recommendations = []

    for (const topic of nextTopics.slice(0, 3)) {
      const recommendation = await this.createRecommendation(
        studentId,
        RecommendationType.TOPIC,
        `Study: ${topic.name}`,
        `Continue your learning journey with this topic`,
        topic.id,
        'topic',
        8, // High priority for path progression
        0.9,
        `This topic follows your current learning path and builds on your existing knowledge.`,
        `Master new concepts and progress towards your next level`
      )

      recommendations.push(recommendation)
    }

    return recommendations
  }

  /**
   * Generate skill-specific practice recommendations
   */
  async generateSkillRecommendations(context: RecommendationContext): Promise<any[]> {
    const { studentId, skillProgress, recentPerformance } = context
    
    const recommendations = []

    // Identify skills that are lagging behind
    const avgMastery = skillProgress.reduce((sum, skill) => sum + skill.masteryPercentage, 0) / skillProgress.length
    const laggingSkills = skillProgress.filter(skill => skill.masteryPercentage < avgMastery - 10)

    for (const skill of laggingSkills) {
      let title = ''
      let description = ''
      let expectedBenefit = ''

      switch (skill.skillArea) {
        case SkillArea.READING:
          title = 'Focus on Reading Comprehension'
          description = 'Practice reading exercises to improve comprehension and vocabulary'
          expectedBenefit = 'Better understanding of texts and increased vocabulary'
          break
        case SkillArea.WRITING:
          title = 'Enhance Writing Skills'
          description = 'Work on grammar, sentence structure, and composition'
          expectedBenefit = 'More confident and accurate written communication'
          break
        case SkillArea.LISTENING:
          title = 'Improve Listening Skills'
          description = 'Practice with audio exercises and pronunciation drills'
          expectedBenefit = 'Better understanding of spoken language'
          break
        case SkillArea.SPEAKING:
          title = 'Boost Speaking Confidence'
          description = 'Practice pronunciation and conversation exercises'
          expectedBenefit = 'More fluent and confident speaking'
          break
        default:
          title = `Practice ${skill.skillArea}`
          description = `Focus on improving your ${skill.skillArea.toLowerCase()} skills`
          expectedBenefit = `Enhanced ${skill.skillArea.toLowerCase()} proficiency`
      }

      const recommendation = await this.createRecommendation(
        studentId,
        RecommendationType.SKILL_PRACTICE,
        title,
        description,
        skill.skillArea,
        'skill',
        this.calculatePriority(skill.masteryPercentage, recentPerformance.avgScore),
        0.7,
        `Your ${skill.skillArea.toLowerCase()} is ${(avgMastery - skill.masteryPercentage).toFixed(1)}% behind your average.`,
        expectedBenefit
      )

      recommendations.push(recommendation)
    }

    return recommendations
  }

  /**
   * Generate class booking recommendations
   */
  async generateClassBookingRecommendations(context: RecommendationContext): Promise<any[]> {
    const { studentId, currentLevel, learningPattern } = context
    
    const recommendations = []

    // Check recent attendance
    const recentBookings = await prisma.booking.findMany({
      where: {
        studentId,
        scheduledAt: {
          gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // Last 14 days
        }
      }
    })

    if (recentBookings.length < 2) {
      // Recommend booking more classes
      const recommendation = await this.createRecommendation(
        studentId,
        RecommendationType.CLASS_BOOKING,
        'Book More Live Classes',
        'Regular live classes accelerate your learning progress',
        null,
        'booking',
        9, // Very high priority
        0.9,
        'You haven\'t attended many live classes recently. Regular practice with teachers is crucial for improvement.',
        'Faster progress and personalized feedback from expert teachers'
      )

      recommendations.push(recommendation)
    }

    // Recommend specific topics for upcoming classes
    const strugglingAreas = context.skillProgress
      .filter(skill => skill.masteryPercentage < 60)
      .map(skill => skill.skillArea)

    if (strugglingAreas.length > 0) {
      const recommendation = await this.createRecommendation(
        studentId,
        RecommendationType.CLASS_BOOKING,
        `Book Class for ${strugglingAreas[0]}`,
        `Focus your next live class on improving ${strugglingAreas[0].toLowerCase()}`,
        strugglingAreas[0],
        'skill_class',
        8,
        0.8,
        `Your ${strugglingAreas[0].toLowerCase()} skills need attention. A focused live class can help.`,
        'Targeted practice and immediate feedback from your teacher'
      )

      recommendations.push(recommendation)
    }

    return recommendations
  }

  /**
   * Generate personalized study plan recommendations
   */
  async generateStudyPlanRecommendations(context: RecommendationContext): Promise<any[]> {
    const { studentId, goals, learningPattern } = context
    
    const recommendations = []

    // Analyze study pattern
    const dailyStudyTime = learningPattern.sessionLength
    const frequency = learningPattern.frequency

    if (dailyStudyTime < 30) {
      const recommendation = await this.createRecommendation(
        studentId,
        RecommendationType.STUDY_PLAN,
        'Increase Daily Study Time',
        'Consider extending your study sessions for better results',
        null,
        'study_plan',
        7,
        0.7,
        'Your current study sessions are quite short. Longer sessions can improve retention and progress.',
        'Better retention and faster progress towards your goals'
      )

      recommendations.push(recommendation)
    }

    if (frequency < 0.5) { // Less than every other day
      const recommendation = await this.createRecommendation(
        studentId,
        RecommendationType.STUDY_PLAN,
        'Study More Consistently',
        'Regular daily practice is key to language learning success',
        null,
        'study_plan',
        8,
        0.8,
        'Consistent daily practice is more effective than sporadic longer sessions.',
        'Build stronger learning habits and maintain momentum'
      )

      recommendations.push(recommendation)
    }

    // Check if student has active goals
    if (goals.length === 0) {
      const recommendation = await this.createRecommendation(
        studentId,
        RecommendationType.STUDY_PLAN,
        'Set Learning Goals',
        'Define clear goals to stay motivated and track progress',
        null,
        'goals',
        6,
        0.6,
        'Having clear learning goals helps maintain motivation and provides direction.',
        'Stay motivated and track your progress more effectively'
      )

      recommendations.push(recommendation)
    }

    return recommendations
  }

  /**
   * Generate difficulty adjustment recommendations
   */
  async generateDifficultyAdjustmentRecommendations(context: RecommendationContext): Promise<any[]> {
    const { studentId, currentLevel, recentPerformance } = context
    
    const recommendations = []

    if (recentPerformance.avgScore > 90) {
      // Suggest moving to harder content
      const nextLevel = this.getNextLevel(currentLevel)
      
      if (nextLevel) {
        const recommendation = await this.createRecommendation(
          studentId,
          RecommendationType.DIFFICULTY_ADJUSTMENT,
          `Try ${nextLevel} Level Content`,
          'Your performance suggests you\'re ready for more challenging material',
          nextLevel,
          'level',
          7,
          0.8,
          'Your average score of 90%+ indicates you may be ready for more challenging content.',
          'Accelerated learning and preparation for level advancement'
        )

        recommendations.push(recommendation)
      }
    } else if (recentPerformance.avgScore < 60) {
      // Suggest focusing on fundamentals
      const recommendation = await this.createRecommendation(
        studentId,
        RecommendationType.DIFFICULTY_ADJUSTMENT,
        'Strengthen Your Foundation',
        'Focus on fundamental concepts before advancing',
        null,
        'foundation',
        8,
        0.7,
        'Your recent scores suggest focusing on core concepts would be beneficial.',
        'Stronger foundation for future learning and improved confidence'
      )

      recommendations.push(recommendation)
    }

    return recommendations
  }

  /**
   * Evaluate recommendation effectiveness
   */
  async evaluateRecommendationEffectiveness(recommendationId: string): Promise<number> {
    const recommendation = await prisma.recommendation.findUnique({
      where: { id: recommendationId }
    })

    if (!recommendation || !recommendation.completedAt) {
      return 0
    }

    // Get student's performance before and after following the recommendation
    const beforeDate = recommendation.createdAt
    const afterDate = recommendation.completedAt

    const analytics = await this.studentAnalytics.getStudentAnalytics(recommendation.userId)

    // Calculate improvement based on recommendation type
    switch (recommendation.type) {
      case RecommendationType.EXERCISE:
        return await this.evaluateExerciseRecommendation(recommendation, beforeDate, afterDate)
      case RecommendationType.SKILL_PRACTICE:
        return await this.evaluateSkillRecommendation(recommendation, beforeDate, afterDate)
      default:
        return 0.5 // Default moderate effectiveness
    }
  }

  /**
   * Helper methods
   */
  private mapSkillToExerciseCategory(skillArea: SkillArea): ExerciseCategory {
    switch (skillArea) {
      case SkillArea.READING:
        return ExerciseCategory.READING
      case SkillArea.WRITING:
        return ExerciseCategory.WRITING
      case SkillArea.LISTENING:
        return ExerciseCategory.LISTENING
      case SkillArea.SPEAKING:
        return ExerciseCategory.SPEAKING
      case SkillArea.GRAMMAR:
        return ExerciseCategory.GRAMMAR
      case SkillArea.VOCABULARY:
        return ExerciseCategory.VOCABULARY
      default:
        return ExerciseCategory.READING
    }
  }

  private calculatePriority(masteryPercentage: number, avgScore: number): number {
    // Lower mastery = higher priority
    const masteryFactor = (100 - masteryPercentage) / 100
    const scoreFactor = (100 - avgScore) / 100
    return Math.round((masteryFactor + scoreFactor) * 5) + 1 // 1-10 scale
  }

  private getNextLevel(currentLevel: Level): Level | null {
    const levelOrder = [Level.A1, Level.A2, Level.B1, Level.B2, Level.C1, Level.C2]
    const currentIndex = levelOrder.indexOf(currentLevel)
    return currentIndex < levelOrder.length - 1 ? levelOrder[currentIndex + 1] : null
  }

  private async createRecommendation(
    userId: string,
    type: RecommendationType,
    title: string,
    description: string,
    targetId: string | null,
    targetType: string | null,
    priority: number,
    confidence: number,
    reason: string,
    expectedBenefit: string
  ): Promise<any> {
    const analytics = await this.studentAnalytics.getStudentAnalytics(userId)

    return await prisma.recommendation.create({
      data: {
        userId,
        analyticsId: analytics.id,
        type,
        title,
        description,
        targetId,
        targetType,
        priority,
        confidence,
        reason,
        expectedBenefit,
        isActive: true,
        isCompleted: false
      }
    })
  }

  private async evaluateExerciseRecommendation(
    recommendation: any,
    beforeDate: Date,
    afterDate: Date
  ): Promise<number> {
    // Compare exercise scores before and after
    const beforeScores = await prisma.submission.findMany({
      where: {
        userId: recommendation.userId,
        submittedAt: { lt: beforeDate }
      },
      orderBy: { submittedAt: 'desc' },
      take: 10
    })

    const afterScores = await prisma.submission.findMany({
      where: {
        userId: recommendation.userId,
        submittedAt: { gte: afterDate }
      },
      orderBy: { submittedAt: 'asc' },
      take: 10
    })

    if (beforeScores.length === 0 || afterScores.length === 0) {
      return 0.5
    }

    const beforeAvg = beforeScores.reduce((sum, s) => sum + (s.score || 0), 0) / beforeScores.length
    const afterAvg = afterScores.reduce((sum, s) => sum + (s.score || 0), 0) / afterScores.length

    const improvement = (afterAvg - beforeAvg) / 100
    return Math.max(0, Math.min(1, 0.5 + improvement)) // 0-1 scale
  }

  private async evaluateSkillRecommendation(
    recommendation: any,
    beforeDate: Date,
    afterDate: Date
  ): Promise<number> {
    // Evaluate based on skill progress improvement
    const skillArea = recommendation.targetId as SkillArea
    const analytics = await this.studentAnalytics.getStudentAnalytics(recommendation.userId)
    
    const skillProgress = analytics.skillProgress.find(s => s.skillArea === skillArea)
    
    if (!skillProgress) return 0.5

    // Simple effectiveness based on improvement trend
    return skillProgress.improvementTrend > 0 ? 0.8 : 0.3
  }

  /**
   * Get all active recommendations for a student
   */
  async getActiveRecommendations(userId: string): Promise<any[]> {
    const analytics = await this.studentAnalytics.getStudentAnalytics(userId)
    
    return await prisma.recommendation.findMany({
      where: {
        analyticsId: analytics.id,
        isActive: true
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    })
  }

  /**
   * Mark recommendation as viewed
   */
  async markRecommendationViewed(recommendationId: string): Promise<void> {
    await prisma.recommendation.update({
      where: { id: recommendationId },
      data: { viewedAt: new Date() }
    })
  }

  /**
   * Mark recommendation as completed
   */
  async markRecommendationCompleted(
    recommendationId: string, 
    userFeedback?: string
  ): Promise<void> {
    await prisma.recommendation.update({
      where: { id: recommendationId },
      data: {
        isCompleted: true,
        completedAt: new Date(),
        userFeedback
      }
    })

    // Evaluate effectiveness
    const effectiveness = await this.evaluateRecommendationEffectiveness(recommendationId)
    await prisma.recommendation.update({
      where: { id: recommendationId },
      data: { effectiveness }
    })
  }

  /**
   * Generate comprehensive recommendations for a student
   */
  async generateAllRecommendations(userId: string): Promise<any[]> {
    const analytics = await this.studentAnalytics.getStudentAnalytics(userId)
    
    // Create recommendation context
    const context: RecommendationContext = {
      studentId: userId,
      currentLevel: analytics.currentLevel || Level.A1,
      skillProgress: analytics.skillProgress,
      recentPerformance: {
        avgScore: analytics.avgExerciseScore,
        weakAreas: analytics.skillProgress
          .filter(s => s.masteryPercentage < 60)
          .map(s => s.skillArea),
        strongAreas: analytics.skillProgress
          .filter(s => s.masteryPercentage > 80)
          .map(s => s.skillArea)
      },
      learningPattern: {
        preferredTime: '18:00', // Default, could be calculated from study sessions
        sessionLength: analytics.avgSessionDuration,
        frequency: analytics.topicsPerWeek / 7 // Convert to daily frequency
      },
      goals: await prisma.learningGoal.findMany({
        where: { userId, isActive: true }
      })
    }

    // Generate different types of recommendations
    const [
      exerciseRecs,
      topicRecs,
      skillRecs,
      classRecs,
      studyPlanRecs,
      difficultyRecs
    ] = await Promise.all([
      this.generateExerciseRecommendations(context),
      this.generateTopicRecommendations(context),
      this.generateSkillRecommendations(context),
      this.generateClassBookingRecommendations(context),
      this.generateStudyPlanRecommendations(context),
      this.generateDifficultyAdjustmentRecommendations(context)
    ])

    // Combine and sort by priority
    const allRecommendations = [
      ...exerciseRecs,
      ...topicRecs,
      ...skillRecs,
      ...classRecs,
      ...studyPlanRecs,
      ...difficultyRecs
    ].sort((a, b) => b.priority - a.priority)

    return allRecommendations.slice(0, 8) // Return top 8 recommendations
  }
}