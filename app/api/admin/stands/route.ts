import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/stands - List all stands with full details
export async function GET(request: NextRequest) {
  try {
    const stands = await prisma.stand.findMany({
      orderBy: [
        { row: 'asc' },
        { col: 'asc' },
      ],
      include: {
        order: {
          select: {
            id: true,
            customerName: true,
            companyName: true,
            status: true,
          }
        }
      }
    })

    return NextResponse.json({ data: stands })
  } catch (error) {
    console.error('Error fetching stands:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stands' },
      { status: 500 }
    )
  }
}

// POST /api/admin/stands - Create a new stand
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      code,
      surfaceM2,
      priceHT,
      status = 'FREE',
      size = 'MEDIUM',
      row,
      col,
      width = 1,
      height = 1,
      hasFurniture = false,
      hasElectricity = false,
      furniturePrice = 120,
      electricityPrice = 80,
    } = body

    if (!code || surfaceM2 === undefined || priceHT === undefined || row === undefined || col === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: code, surfaceM2, priceHT, row, col' },
        { status: 400 }
      )
    }

    // Check if code already exists
    const existingStand = await prisma.stand.findUnique({
      where: { code }
    })

    if (existingStand) {
      return NextResponse.json(
        { error: 'A stand with this code already exists' },
        { status: 400 }
      )
    }

    const stand = await prisma.stand.create({
      data: {
        code,
        surfaceM2: parseFloat(surfaceM2),
        priceHT: parseFloat(priceHT),
        status,
        size,
        row: parseInt(row),
        col: parseInt(col),
        width: parseInt(width),
        height: parseInt(height),
        hasFurniture,
        hasElectricity,
        furniturePrice: parseFloat(furniturePrice),
        electricityPrice: parseFloat(electricityPrice),
      }
    })

    return NextResponse.json({ data: stand }, { status: 201 })
  } catch (error) {
    console.error('Error creating stand:', error)
    return NextResponse.json(
      { error: 'Failed to create stand' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/stands - Update a stand
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      code,
      surfaceM2,
      priceHT,
      status,
      size,
      row,
      col,
      width,
      height,
      hasFurniture,
      hasElectricity,
      furniturePrice,
      electricityPrice,
    } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Stand ID is required' },
        { status: 400 }
      )
    }

    // Check if the stand exists
    const existingStand = await prisma.stand.findUnique({
      where: { id }
    })

    if (!existingStand) {
      return NextResponse.json(
        { error: 'Stand not found' },
        { status: 404 }
      )
    }

    // If changing code, check it's not already in use
    if (code && code !== existingStand.code) {
      const codeExists = await prisma.stand.findUnique({
        where: { code }
      })
      if (codeExists) {
        return NextResponse.json(
          { error: 'A stand with this code already exists' },
          { status: 400 }
        )
      }
    }

    const updateData: any = {}
    if (code !== undefined) updateData.code = code
    if (surfaceM2 !== undefined) updateData.surfaceM2 = parseFloat(surfaceM2)
    if (priceHT !== undefined) updateData.priceHT = parseFloat(priceHT)
    if (status !== undefined) updateData.status = status
    if (size !== undefined) updateData.size = size
    if (row !== undefined) updateData.row = parseInt(row)
    if (col !== undefined) updateData.col = parseInt(col)
    if (width !== undefined) updateData.width = parseInt(width)
    if (height !== undefined) updateData.height = parseInt(height)
    if (hasFurniture !== undefined) updateData.hasFurniture = hasFurniture
    if (hasElectricity !== undefined) updateData.hasElectricity = hasElectricity
    if (furniturePrice !== undefined) updateData.furniturePrice = parseFloat(furniturePrice)
    if (electricityPrice !== undefined) updateData.electricityPrice = parseFloat(electricityPrice)

    // Handle status change to FREE (clear reservation data)
    if (status === 'FREE') {
      updateData.orderId = null
      updateData.reservedAt = null
      updateData.reservedUntil = null
    }

    const stand = await prisma.stand.update({
      where: { id },
      data: updateData,
      include: {
        order: {
          select: {
            id: true,
            customerName: true,
            companyName: true,
            status: true,
          }
        }
      }
    })

    return NextResponse.json({ data: stand })
  } catch (error) {
    console.error('Error updating stand:', error)
    return NextResponse.json(
      { error: 'Failed to update stand' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/stands - Delete a stand
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Stand ID is required' },
        { status: 400 }
      )
    }

    // Check if the stand exists
    const existingStand = await prisma.stand.findUnique({
      where: { id }
    })

    if (!existingStand) {
      return NextResponse.json(
        { error: 'Stand not found' },
        { status: 404 }
      )
    }

    // Don't allow deleting sold stands
    if (existingStand.status === 'SOLD') {
      return NextResponse.json(
        { error: 'Cannot delete a sold stand' },
        { status: 400 }
      )
    }

    await prisma.stand.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting stand:', error)
    return NextResponse.json(
      { error: 'Failed to delete stand' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/stands - Bulk operations (initialize default stands)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, stands } = body

    if (action === 'initialize') {
      // Delete all existing stands that are not sold
      await prisma.stand.deleteMany({
        where: {
          status: { not: 'SOLD' }
        }
      })

      // Create new stands from provided data
      if (stands && Array.isArray(stands)) {
        for (const stand of stands) {
          await prisma.stand.upsert({
            where: { code: stand.code },
            create: {
              code: stand.code,
              surfaceM2: parseFloat(stand.surfaceM2),
              priceHT: parseFloat(stand.priceHT),
              status: stand.status || 'FREE',
              size: stand.size || 'MEDIUM',
              row: parseInt(stand.row),
              col: parseInt(stand.col),
              width: parseInt(stand.width || 1),
              height: parseInt(stand.height || 1),
              hasFurniture: stand.hasFurniture || false,
              hasElectricity: stand.hasElectricity || false,
              furniturePrice: parseFloat(stand.furniturePrice || 120),
              electricityPrice: parseFloat(stand.electricityPrice || 80),
            },
            update: {
              surfaceM2: parseFloat(stand.surfaceM2),
              priceHT: parseFloat(stand.priceHT),
              status: stand.status || 'FREE',
              size: stand.size || 'MEDIUM',
              row: parseInt(stand.row),
              col: parseInt(stand.col),
              width: parseInt(stand.width || 1),
              height: parseInt(stand.height || 1),
              hasFurniture: stand.hasFurniture || false,
              hasElectricity: stand.hasElectricity || false,
              furniturePrice: parseFloat(stand.furniturePrice || 120),
              electricityPrice: parseFloat(stand.electricityPrice || 80),
            }
          })
        }
      }

      const allStands = await prisma.stand.findMany({
        orderBy: [{ row: 'asc' }, { col: 'asc' }]
      })

      return NextResponse.json({
        success: true,
        message: `Initialized ${allStands.length} stands`,
        data: allStands
      })
    }

    return NextResponse.json(
      { error: 'Unknown action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in bulk operation:', error)
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    )
  }
}
