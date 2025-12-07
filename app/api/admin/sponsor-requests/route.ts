import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/sponsor-requests - List all sponsor requests
export async function GET() {
  try {
    const requests = await prisma.sponsorRequest.findMany({
      orderBy: [
        { status: 'asc' }, // PENDING first
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json({ data: requests })
  } catch (error) {
    console.error('Error fetching sponsor requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sponsor requests' },
      { status: 500 }
    )
  }
}
