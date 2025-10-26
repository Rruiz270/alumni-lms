import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { ReportingService } from '@/lib/analytics/reporting'
import { UserRole } from '@prisma/client'

const reportingService = new ReportingService()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'student' | 'teacher' | 'platform' | 'class'
    const userId = searchParams.get('userId') || session.user.id
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const format = searchParams.get('format') as 'json' | 'csv' | 'pdf' || 'json'
    const bookingId = searchParams.get('bookingId')

    // Validate date parameters
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    // Ensure user can only access their own data unless they're an admin
    if (userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let report
    
    switch (type) {
      case 'student':
        if (session.user.role !== 'STUDENT' && session.user.role !== 'ALUMNI' && session.user.role !== 'ADMIN') {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
        report = await reportingService.generateStudentProgressReport(userId, start, end)
        break

      case 'teacher':
        if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
        report = await reportingService.generateTeacherPerformanceReport(userId, start, end)
        break

      case 'platform':
        if (session.user.role !== 'ADMIN') {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
        report = await reportingService.generatePlatformReport(start, end)
        break

      case 'class':
        if (!bookingId) {
          return NextResponse.json({ error: 'Booking ID required for class report' }, { status: 400 })
        }
        if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
        report = await reportingService.generateClassReport(bookingId)
        break

      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }

    // Export in requested format
    if (format === 'json') {
      return NextResponse.json(report)
    } else {
      const exportedData = await reportingService.exportReport(report, format)
      
      const headers: Record<string, string> = {
        'Content-Disposition': `attachment; filename="report-${type}-${Date.now()}.${format}"`
      }
      
      if (format === 'csv') {
        headers['Content-Type'] = 'text/csv'
      } else if (format === 'pdf') {
        headers['Content-Type'] = 'application/pdf'
      }

      return new NextResponse(exportedData as string, { headers })
    }
  } catch (error) {
    console.error('Error generating report:', error)
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
      case 'bulkGenerate':
        const { role, startDate, endDate } = data
        const reports = await reportingService.generateBulkReports(
          role as UserRole,
          new Date(startDate),
          new Date(endDate)
        )
        return NextResponse.json({ reports: reports.length, success: true })

      case 'scheduleAutomated':
        await reportingService.scheduleAutomatedReports()
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error processing report request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}