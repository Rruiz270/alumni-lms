import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { StudentDashboard } from '@/components/analytics/student-dashboard'
import { TeacherDashboard } from '@/components/analytics/teacher-dashboard'
import { AdminDashboard } from '@/components/analytics/admin-dashboard'
import { StudentAnalyticsService } from '@/lib/analytics/student-analytics'
import { TeacherAnalyticsService } from '@/lib/analytics/teacher-analytics'
import { AdminAnalyticsService } from '@/lib/analytics/admin-analytics'

const studentAnalytics = new StudentAnalyticsService()
const teacherAnalytics = new TeacherAnalyticsService()
const adminAnalytics = new AdminAnalyticsService()

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  const userId = session.user.id
  const userRole = session.user.role

  // Load data based on user role
  let dashboardData = null

  try {
    switch (userRole) {
      case 'STUDENT':
      case 'ALUMNI':
        dashboardData = await studentAnalytics.getStudentDashboardData(userId)
        break
        
      case 'TEACHER':
        dashboardData = await teacherAnalytics.getTeacherDashboardData(userId)
        break
        
      case 'ADMIN':
        dashboardData = await adminAnalytics.getAdminDashboardData()
        break
        
      default:
        redirect('/dashboard')
    }
  } catch (error) {
    console.error('Error loading analytics data:', error)
    // Handle error appropriately
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          {userRole === 'STUDENT' || userRole === 'ALUMNI' 
            ? 'Track your learning progress and achievements'
            : userRole === 'TEACHER' 
            ? 'Monitor your teaching performance and student progress'
            : 'Platform-wide analytics and insights'
          }
        </p>
      </div>

      {/* Render appropriate dashboard based on user role */}
      {(userRole === 'STUDENT' || userRole === 'ALUMNI') && dashboardData && (
        <StudentDashboard 
          data={dashboardData}
          onRefresh={() => window.location.reload()}
        />
      )}

      {userRole === 'TEACHER' && dashboardData && (
        <TeacherDashboard 
          data={dashboardData}
          teacherId={userId}
          onRefresh={() => window.location.reload()}
        />
      )}

      {userRole === 'ADMIN' && dashboardData && (
        <AdminDashboard 
          data={dashboardData}
          onRefresh={() => window.location.reload()}
          onExport={() => {
            // Handle export functionality
            window.open('/api/analytics/admin?type=export&format=json')
          }}
        />
      )}

      {!dashboardData && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            Loading analytics data...
          </div>
        </div>
      )}
    </div>
  )
}