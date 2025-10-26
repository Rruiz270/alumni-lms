'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Award, 
  BookOpen, 
  Calendar,
  Zap,
  Star,
  ChevronRight,
  Trophy,
  Flame,
  Brain,
  Users,
  BarChart3
} from 'lucide-react'
import { StudentDashboardData, SkillProgressWithTrends } from '@/lib/analytics/types'
import { Level, SkillArea } from '@prisma/client'

interface StudentDashboardProps {
  data: StudentDashboardData
  onRefresh?: () => void
}

export function StudentDashboard({ data, onRefresh }: StudentDashboardProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'skills' | 'achievements' | 'goals'>('overview')

  return (
    <div className="space-y-6">
      {/* Header with key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Current Level"
          value={data.currentLevelProgress.level || 'A1'}
          subtitle={`${data.currentLevelProgress.progress.toFixed(0)}% to ${data.currentLevelProgress.nextLevel || 'Complete'}`}
          icon={Target}
          color="text-blue-600"
        />
        <MetricCard
          title="Study Streak"
          value={`${data.analytics.currentStreak} days`}
          subtitle={`Longest: ${data.analytics.longestStreak} days`}
          icon={Flame}
          color="text-orange-600"
        />
        <MetricCard
          title="Total Study Time"
          value={formatStudyTime(data.analytics.totalStudyTime)}
          subtitle={`Avg: ${data.analytics.avgDailyStudyTime}min/day`}
          icon={Clock}
          color="text-green-600"
        />
        <MetricCard
          title="Average Score"
          value={`${data.analytics.avgExerciseScore.toFixed(0)}%`}
          subtitle={`${data.analytics.totalExercisesCompleted} exercises`}
          icon={Star}
          color="text-purple-600"
        />
      </div>

      {/* Navigation tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'skills', label: 'Skills', icon: Brain },
          { id: 'achievements', label: 'Achievements', icon: Trophy },
          { id: 'goals', label: 'Goals', icon: Target }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md flex-1 text-sm font-medium transition-colors ${
              selectedTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {selectedTab === 'overview' && (
        <OverviewTab 
          data={data} 
          onRefresh={onRefresh}
        />
      )}
      {selectedTab === 'skills' && (
        <SkillsTab skillProgress={data.skillOverview} />
      )}
      {selectedTab === 'achievements' && (
        <AchievementsTab achievements={data.recentAchievements} />
      )}
      {selectedTab === 'goals' && (
        <GoalsTab goals={data.upcomingGoals} />
      )}
    </div>
  )
}

function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color 
}: { 
  title: string
  value: string
  subtitle: string
  icon: any
  color: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  )
}

function OverviewTab({ data, onRefresh }: { data: StudentDashboardData, onRefresh?: () => void }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Level Progress */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Level Progress</span>
          </CardTitle>
          <CardDescription>
            Your journey towards {data.currentLevelProgress.nextLevel || 'mastery'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LevelProgressChart progress={data.currentLevelProgress} />
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Recent Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recentAchievements.slice(0, 3).map((achievement) => (
              <div key={achievement.id} className="flex items-center space-x-3">
                <div className="text-2xl">{achievement.badge.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{achievement.badge.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(achievement.earnedAt)}
                  </p>
                </div>
                <Badge variant="secondary">+{achievement.badge.points}</Badge>
              </div>
            ))}
            {data.recentAchievements.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No achievements yet. Keep studying to earn your first badge!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Skill Overview */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Skill Overview</span>
          </CardTitle>
          <CardDescription>
            Your progress across different language skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SkillRadarChart skills={data.skillOverview} />
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recommendations.slice(0, 3).map((rec) => (
              <div key={rec.id} className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">{rec.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {rec.description}
                </p>
                <Button size="sm" variant="ghost" className="mt-2 p-0 h-auto">
                  Start <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Progress */}
      {data.weeklyProgress && (
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>This Week's Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyProgressChart progress={data.weeklyProgress} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function SkillsTab({ skillProgress }: { skillProgress: SkillProgressWithTrends[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {skillProgress.map((skill) => (
        <Card key={skill.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <span>{getSkillIcon(skill.skillArea)}</span>
                <span>{skill.skillArea.toLowerCase().replace('_', ' ')}</span>
              </span>
              <Badge variant={getTrendVariant(skill.trend)}>
                {skill.trend}
              </Badge>
            </CardTitle>
            <CardDescription>
              {skill.exercisesCompleted} exercises completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Mastery</span>
                  <span>{skill.masteryPercentage.toFixed(0)}%</span>
                </div>
                <Progress value={skill.masteryPercentage} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Average Score</p>
                  <p className="font-medium">{skill.avgScore.toFixed(0)}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Time Spent</p>
                  <p className="font-medium">{formatStudyTime(skill.timeSpent)}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Monthly Change</p>
                <div className="flex items-center space-x-1">
                  <TrendingUp className={`h-3 w-3 ${
                    skill.monthlyChange > 0 ? 'text-green-600' : 'text-red-600'
                  }`} />
                  <span className={`text-xs ${
                    skill.monthlyChange > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {skill.monthlyChange > 0 ? '+' : ''}{skill.monthlyChange.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function AchievementsTab({ achievements }: { achievements: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {achievements.map((achievement) => (
        <Card key={achievement.id} className="text-center">
          <CardContent className="p-6">
            <div className="text-4xl mb-3">{achievement.badge.icon}</div>
            <h3 className="font-semibold mb-2">{achievement.badge.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {achievement.badge.description}
            </p>
            <div className="flex items-center justify-between">
              <Badge 
                variant="outline" 
                style={{ 
                  color: achievement.badge.color,
                  borderColor: achievement.badge.color 
                }}
              >
                {achievement.badge.rarity}
              </Badge>
              <span className="text-sm font-medium">
                +{achievement.badge.points} pts
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function GoalsTab({ goals }: { goals: any[] }) {
  return (
    <div className="space-y-4">
      {goals.map((goal) => (
        <Card key={goal.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{goal.title}</h3>
                {goal.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {goal.description}
                  </p>
                )}
              </div>
              <Badge variant={goal.isCompleted ? 'default' : 'secondary'}>
                {goal.isCompleted ? 'Completed' : 'Active'}
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{goal.currentProgress.toFixed(0)}%</span>
                </div>
                <Progress value={goal.currentProgress} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Target Date</p>
                  <p className="font-medium">{formatDate(goal.targetDate)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Priority</p>
                  <p className="font-medium">{goal.priority}/10</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {goals.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No Goals Set</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Set learning goals to track your progress and stay motivated.
            </p>
            <Button>Set Your First Goal</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Chart components (simplified versions - in reality you'd use a charting library)
function LevelProgressChart({ progress }: { progress: any }) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-4xl font-bold mb-2">{progress.level}</div>
        <div className="text-sm text-muted-foreground">Current Level</div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress to {progress.nextLevel || 'Completion'}</span>
          <span>{progress.progress.toFixed(0)}%</span>
        </div>
        <Progress value={progress.progress} className="h-3" />
      </div>
      
      {progress.estimatedCompletion && (
        <div className="text-center text-sm text-muted-foreground">
          Estimated completion: {formatDate(progress.estimatedCompletion)}
        </div>
      )}
    </div>
  )
}

function SkillRadarChart({ skills }: { skills: SkillProgressWithTrends[] }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {skills.map((skill) => (
        <div key={skill.skillArea} className="text-center">
          <div className="text-2xl mb-1">{getSkillIcon(skill.skillArea)}</div>
          <div className="text-xs text-muted-foreground mb-2">
            {skill.skillArea.toLowerCase()}
          </div>
          <Progress value={skill.masteryPercentage} className="h-2" />
          <div className="text-xs mt-1">{skill.masteryPercentage.toFixed(0)}%</div>
        </div>
      ))}
    </div>
  )
}

function WeeklyProgressChart({ progress }: { progress: any }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">{progress.studyTime}</div>
        <div className="text-xs text-muted-foreground">Minutes Studied</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">{progress.exercisesCompleted}</div>
        <div className="text-xs text-muted-foreground">Exercises</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-purple-600">{progress.avgScore.toFixed(0)}%</div>
        <div className="text-xs text-muted-foreground">Avg Score</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-orange-600">{progress.classesAttended}</div>
        <div className="text-xs text-muted-foreground">Classes</div>
      </div>
    </div>
  )
}

// Utility functions
function formatStudyTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

function getSkillIcon(skill: SkillArea): string {
  const icons = {
    [SkillArea.READING]: '📖',
    [SkillArea.WRITING]: '✍️',
    [SkillArea.LISTENING]: '👂',
    [SkillArea.SPEAKING]: '🗣️',
    [SkillArea.GRAMMAR]: '📝',
    [SkillArea.VOCABULARY]: '📚',
    [SkillArea.PRONUNCIATION]: '🔊',
    [SkillArea.CONVERSATION]: '💬'
  }
  return icons[skill] || '📚'
}

function getTrendVariant(trend: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (trend) {
    case 'improving': return 'default'
    case 'stable': return 'secondary'
    case 'declining': return 'destructive'
    default: return 'outline'
  }
}