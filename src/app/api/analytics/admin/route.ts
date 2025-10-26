import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { AdminAnalyticsService } from '@/lib/analytics/admin-analytics'

const adminAnalytics = new AdminAnalyticsService()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'dashboard' | 'overview' | 'insights' | 'export'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const filter = startDate && endDate ? {
      dateRange: {
        start: new Date(startDate),
        end: new Date(endDate)
      }
    } : undefined

    switch (type) {
      case 'dashboard':
        const dashboardData = await adminAnalytics.getAdminDashboardData(filter)
        return NextResponse.json(dashboardData)

      case 'overview':
        const overview = await adminAnalytics.getPlatformOverview()
        return NextResponse.json(overview)

      case 'levels':
        const levelDistribution = await adminAnalytics.getLevelDistribution()
        return NextResponse.json(levelDistribution)

      case 'engagement':
        const days = parseInt(searchParams.get('days') || '30')
        const engagement = await adminAnalytics.getEngagementTrends(days)
        return NextResponse.json(engagement)

      case 'insights':
        const insights = await adminAnalytics.getPerformanceInsights()
        return NextResponse.json(insights)

      case 'export':
        const format = searchParams.get('format') as 'json' | 'csv' || 'json'
        const exportData = await adminAnalytics.exportAnalytics(
          new Date(startDate || Date.now() - 30 * 24 * 60 * 60 * 1000),
          new Date(endDate || Date.now()),
          format
        )
        return NextResponse.json(exportData)

      default:
        const defaultData = await adminAnalytics.getAdminDashboardData()
        return NextResponse.json(defaultData)
    }
  } catch (error) {
    console.error('Error fetching admin analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'generatePlatformAnalytics':
        const startDate = new Date(data.startDate)
        const endDate = new Date(data.endDate)
        await adminAnalytics.generatePlatformAnalytics(startDate, endDate)
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error processing admin analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}