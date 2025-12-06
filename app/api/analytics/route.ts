import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Hash IP for privacy
function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip + 'cannagri-salt').digest('hex').slice(0, 16)
}

// POST /api/analytics - Track a page view
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { path } = body

    if (!path) {
      return NextResponse.json({ error: 'Path required' }, { status: 400 })
    }

    // Get client info
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown'
    const userAgent = request.headers.get('user-agent') || undefined
    const referrer = request.headers.get('referer') || undefined

    // Don't track admin pages
    if (path.startsWith('/admin')) {
      return NextResponse.json({ success: true, tracked: false })
    }

    // Create page view
    await prisma.pageView.create({
      data: {
        path,
        ip: hashIP(ip),
        userAgent,
        referrer,
      }
    })

    return NextResponse.json({ success: true, tracked: true })
  } catch (error) {
    console.error('Error tracking page view:', error)
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 })
  }
}

// GET /api/analytics - Get analytics stats (admin only)
export async function GET(request: NextRequest) {
  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const thisWeekStart = new Date(today)
    thisWeekStart.setDate(thisWeekStart.getDate() - 7)
    const thisMonthStart = new Date(today)
    thisMonthStart.setDate(thisMonthStart.getDate() - 30)

    // Get counts
    const [todayViews, yesterdayViews, weekViews, monthViews, totalViews] = await Promise.all([
      prisma.pageView.count({
        where: { createdAt: { gte: today } }
      }),
      prisma.pageView.count({
        where: { createdAt: { gte: yesterday, lt: today } }
      }),
      prisma.pageView.count({
        where: { createdAt: { gte: thisWeekStart } }
      }),
      prisma.pageView.count({
        where: { createdAt: { gte: thisMonthStart } }
      }),
      prisma.pageView.count()
    ])

    // Get unique visitors (by IP hash)
    const [todayUnique, weekUnique, monthUnique] = await Promise.all([
      prisma.pageView.groupBy({
        by: ['ip'],
        where: { createdAt: { gte: today } }
      }).then(r => r.length),
      prisma.pageView.groupBy({
        by: ['ip'],
        where: { createdAt: { gte: thisWeekStart } }
      }).then(r => r.length),
      prisma.pageView.groupBy({
        by: ['ip'],
        where: { createdAt: { gte: thisMonthStart } }
      }).then(r => r.length)
    ])

    // Get top pages this week
    const topPages = await prisma.pageView.groupBy({
      by: ['path'],
      where: { createdAt: { gte: thisWeekStart } },
      _count: { path: true },
      orderBy: { _count: { path: 'desc' } },
      take: 5
    })

    // Get daily views for the last 7 days
    const dailyViews: { date: string; views: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(today)
      dayStart.setDate(dayStart.getDate() - i)
      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayEnd.getDate() + 1)

      const count = await prisma.pageView.count({
        where: {
          createdAt: { gte: dayStart, lt: dayEnd }
        }
      })

      dailyViews.push({
        date: dayStart.toISOString().split('T')[0],
        views: count
      })
    }

    return NextResponse.json({
      data: {
        today: {
          views: todayViews,
          unique: todayUnique,
          trend: yesterdayViews > 0
            ? Math.round(((todayViews - yesterdayViews) / yesterdayViews) * 100)
            : 0
        },
        week: {
          views: weekViews,
          unique: weekUnique
        },
        month: {
          views: monthViews,
          unique: monthUnique
        },
        total: totalViews,
        topPages: topPages.map(p => ({
          path: p.path,
          views: p._count.path
        })),
        dailyViews
      }
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
