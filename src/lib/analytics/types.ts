import { 
  Level, 
  SkillArea, 
  BadgeType, 
  BadgeCategory, 
  RecommendationType,
  StudentAnalytics,
  SkillProgress,
  Badge,
  Achievement,
  LearningStreak,
  StudySession,
  Recommendation,
  WeeklyReport,
  ClassAnalytics,
  PlatformAnalytics,
  LearningGoal
} from '@prisma/client'

// Extended types with relations
export interface StudentAnalyticsWithRelations extends StudentAnalytics {
  user: {
    id: string
    name: string
    email: string
    level?: Level
  }
  skillProgress: SkillProgress[]
  achievements: (Achievement & { badge: Badge })[]
  learningStreaks: LearningStreak[]
  studySessions: StudySession[]
  recommendations: Recommendation[]
  weeklyReports: WeeklyReport[]
}

export interface SkillProgressWithTrends extends SkillProgress {
  trend: 'improving' | 'stable' | 'declining'
  weeklyChange: number
  monthlyChange: number
  projectedMastery: number
}

export interface DetailedAchievement extends Achievement {
  badge: Badge
  progressToNext?: {
    badge: Badge
    currentProgress: number
    requirement: any
  }
}

// Dashboard data interfaces
export interface StudentDashboardData {
  analytics: StudentAnalyticsWithRelations
  currentLevelProgress: {
    level: Level
    progress: number
    nextLevel?: Level
    estimatedCompletion?: Date
  }
  skillOverview: SkillProgressWithTrends[]
  recentAchievements: DetailedAchievement[]
  currentStreak: LearningStreak | null
  weeklyProgress: WeeklyReport | null
  recommendations: Recommendation[]
  upcomingGoals: LearningGoal[]
}

export interface TeacherDashboardData {
  classAnalytics: (ClassAnalytics & {
    booking: {
      id: string
      scheduledAt: Date
      student: { name: string; email: string; level?: Level }
      topic: { name: string; level: Level }
    }
  })[]
  studentOverview: {
    studentId: string
    name: string
    level?: Level
    attendance: number
    avgScore: number
    engagement: number
  }[]
  performanceMetrics: {
    avgClassRating: number
    avgStudentEngagement: number
    totalClasses: number
    popularTopics: string[]
  }
}

export interface AdminDashboardData {
  platformAnalytics: PlatformAnalytics[]
  userGrowth: {
    date: Date
    newUsers: number
    activeUsers: number
    retention: number
  }[]
  contentPerformance: {
    topicId: string
    topicName: string
    completionRate: number
    avgScore: number
    engagement: number
  }[]
  teacherPerformance: {
    teacherId: string
    teacherName: string
    avgRating: number
    totalClasses: number
    studentSatisfaction: number
  }[]
}

// Progress calculation interfaces
export interface ProgressCalculation {
  overall: number
  bySkill: Record<SkillArea, number>
  byLevel: Record<Level, number>
  trend: 'improving' | 'stable' | 'declining'
  velocity: number // topics per week
}

export interface LevelProgressCalculation {
  currentLevel: Level
  progress: number // 0-100 percentage within current level
  nextLevel?: Level
  estimatedCompletion?: Date
  requirements: {
    exercisesNeeded: number
    topicsNeeded: number
    skillThresholds: Record<SkillArea, number>
  }
}

// Analytics filters and options
export interface AnalyticsFilter {
  dateRange?: {
    start: Date
    end: Date
  }
  level?: Level
  skillArea?: SkillArea
  students?: string[]
  teachers?: string[]
}

export interface RecommendationContext {
  studentId: string
  currentLevel: Level
  skillProgress: SkillProgress[]
  recentPerformance: {
    avgScore: number
    weakAreas: SkillArea[]
    strongAreas: SkillArea[]
  }
  learningPattern: {
    preferredTime: string
    sessionLength: number
    frequency: number
  }
  goals: LearningGoal[]
}

// Badge system types
export interface BadgeRequirement {
  type: 'streak' | 'score' | 'completion' | 'attendance' | 'skill_mastery' | 'custom'
  value: number
  condition?: string
  skill?: SkillArea
  level?: Level
}

export interface BadgeProgress {
  badge: Badge
  currentProgress: number
  maxProgress: number
  percentage: number
  isCompleted: boolean
  nextMilestone?: number
}

// Chart and visualization data
export interface ChartDataPoint {
  date: Date
  value: number
  label?: string
  metadata?: any
}

export interface SkillRadarData {
  skill: SkillArea
  current: number
  target: number
  average: number
}

export interface ProgressTimelineData {
  date: Date
  level: Level
  score: number
  topics: number
  streak: number
  achievements: string[]
}

// Study session analytics
export interface SessionAnalytics {
  avgDuration: number
  peakHours: number[]
  preferredDays: number[]
  productivityScore: number
  focusPattern: 'morning' | 'afternoon' | 'evening' | 'consistent'
}

// Recommendation engine types
export interface RecommendationEngine {
  generateExerciseRecommendations(context: RecommendationContext): Promise<Recommendation[]>
  generateTopicRecommendations(context: RecommendationContext): Promise<Recommendation[]>
  generateSkillRecommendations(context: RecommendationContext): Promise<Recommendation[]>
  generateStudyPlanRecommendations(context: RecommendationContext): Promise<Recommendation[]>
  evaluateRecommendationEffectiveness(recommendationId: string): Promise<number>
}

// Export utilities
export interface ReportData {
  title: string
  subtitle?: string
  dateRange: { start: Date; end: Date }
  sections: ReportSection[]
  metadata: {
    generatedAt: Date
    generatedBy: string
    version: string
  }
}

export interface ReportSection {
  title: string
  type: 'chart' | 'table' | 'metrics' | 'text'
  data: any
  description?: string
}