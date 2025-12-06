import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Configuration des 25 stands par défaut
const defaultStandsConfig = [
  // Rangée du haut (stands 3-8)
  { number: 3, surfaceM2: 9, priceHT: 350, size: 'SMALL', x: 195, y: 30, width: 50, height: 50 },
  { number: 4, surfaceM2: 9, priceHT: 350, size: 'SMALL', x: 255, y: 30, width: 50, height: 50 },
  { number: 5, surfaceM2: 9, priceHT: 350, size: 'SMALL', x: 315, y: 30, width: 50, height: 50 },
  { number: 6, surfaceM2: 9, priceHT: 350, size: 'SMALL', x: 375, y: 30, width: 50, height: 50 },
  { number: 7, surfaceM2: 9, priceHT: 350, size: 'SMALL', x: 435, y: 30, width: 50, height: 50 },
  { number: 8, surfaceM2: 9, priceHT: 350, size: 'SMALL', x: 495, y: 30, width: 50, height: 50 },
  // Stands 1-2 (à côté conférence)
  { number: 2, surfaceM2: 12, priceHT: 450, size: 'MEDIUM', x: 195, y: 100, width: 50, height: 50 },
  { number: 1, surfaceM2: 12, priceHT: 450, size: 'MEDIUM', x: 195, y: 160, width: 50, height: 50 },
  // Colonne de droite (stands 9-18)
  { number: 9, surfaceM2: 9, priceHT: 350, size: 'SMALL', x: 555, y: 30, width: 50, height: 50 },
  { number: 10, surfaceM2: 9, priceHT: 350, size: 'SMALL', x: 555, y: 90, width: 50, height: 50 },
  { number: 11, surfaceM2: 9, priceHT: 350, size: 'SMALL', x: 555, y: 150, width: 50, height: 50 },
  { number: 12, surfaceM2: 9, priceHT: 350, size: 'SMALL', x: 555, y: 210, width: 50, height: 50 },
  { number: 13, surfaceM2: 9, priceHT: 350, size: 'SMALL', x: 555, y: 270, width: 50, height: 50 },
  { number: 14, surfaceM2: 9, priceHT: 350, size: 'SMALL', x: 555, y: 330, width: 50, height: 50 },
  { number: 15, surfaceM2: 9, priceHT: 350, size: 'SMALL', x: 555, y: 390, width: 50, height: 50 },
  { number: 16, surfaceM2: 9, priceHT: 350, size: 'SMALL', x: 555, y: 450, width: 50, height: 50 },
  { number: 17, surfaceM2: 9, priceHT: 350, size: 'SMALL', x: 555, y: 510, width: 50, height: 50 },
  { number: 18, surfaceM2: 9, priceHT: 350, size: 'SMALL', x: 555, y: 570, width: 50, height: 50 },
  // Rangée du bas (stands 25-19) - décalés de 60px vers la gauche
  { number: 25, surfaceM2: 9, priceHT: 350, size: 'SMALL', x: 135, y: 570, width: 50, height: 50 },
  { number: 24, surfaceM2: 9, priceHT: 350, size: 'SMALL', x: 195, y: 570, width: 50, height: 50 },
  { number: 23, surfaceM2: 9, priceHT: 350, size: 'SMALL', x: 255, y: 570, width: 50, height: 50 },
  { number: 22, surfaceM2: 9, priceHT: 350, size: 'SMALL', x: 315, y: 570, width: 50, height: 50 },
  { number: 21, surfaceM2: 9, priceHT: 350, size: 'SMALL', x: 375, y: 570, width: 50, height: 50 },
  { number: 20, surfaceM2: 9, priceHT: 350, size: 'SMALL', x: 435, y: 570, width: 50, height: 50 },
  { number: 19, surfaceM2: 9, priceHT: 350, size: 'SMALL', x: 555, y: 570, width: 50, height: 50 },
]

// GET /api/admin/stands - List all stands with full details
export async function GET(request: NextRequest) {
  try {
    const stands = await prisma.stand.findMany({
      orderBy: [
        { number: 'asc' },
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
      number,
      surfaceM2,
      priceHT,
      status = 'FREE',
      size = 'MEDIUM',
      x = 0,
      y = 0,
      width = 55,
      height = 55,
      hasFurniture = false,
      hasElectricity = false,
      furniturePrice = 120,
      electricityPrice = 80,
      exhibitorName = null,
    } = body

    if (number === undefined || surfaceM2 === undefined || priceHT === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: number, surfaceM2, priceHT' },
        { status: 400 }
      )
    }

    // Check if number already exists
    const existingStand = await prisma.stand.findUnique({
      where: { number: parseInt(number) }
    })

    if (existingStand) {
      return NextResponse.json(
        { error: 'A stand with this number already exists' },
        { status: 400 }
      )
    }

    const stand = await prisma.stand.create({
      data: {
        number: parseInt(number),
        code: String(number),
        surfaceM2: parseFloat(surfaceM2),
        priceHT: parseFloat(priceHT),
        status,
        size,
        x: parseInt(x),
        y: parseInt(y),
        width: parseInt(width),
        height: parseInt(height),
        row: 0,
        col: 0,
        hasFurniture,
        hasElectricity,
        furniturePrice: parseFloat(furniturePrice),
        electricityPrice: parseFloat(electricityPrice),
        exhibitorName,
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
      number,
      surfaceM2,
      priceHT,
      status,
      size,
      x,
      y,
      width,
      height,
      hasFurniture,
      hasElectricity,
      furniturePrice,
      electricityPrice,
      exhibitorName,
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

    // If changing number, check it's not already in use
    if (number !== undefined && number !== existingStand.number) {
      const numberExists = await prisma.stand.findUnique({
        where: { number: parseInt(number) }
      })
      if (numberExists) {
        return NextResponse.json(
          { error: 'A stand with this number already exists' },
          { status: 400 }
        )
      }
    }

    const updateData: any = {}
    if (number !== undefined) {
      updateData.number = parseInt(number)
      updateData.code = String(number)
    }
    if (surfaceM2 !== undefined) updateData.surfaceM2 = parseFloat(surfaceM2)
    if (priceHT !== undefined) updateData.priceHT = parseFloat(priceHT)
    if (status !== undefined) updateData.status = status
    if (size !== undefined) updateData.size = size
    if (x !== undefined) updateData.x = parseInt(x)
    if (y !== undefined) updateData.y = parseInt(y)
    if (width !== undefined) updateData.width = parseInt(width)
    if (height !== undefined) updateData.height = parseInt(height)
    if (hasFurniture !== undefined) updateData.hasFurniture = hasFurniture
    if (hasElectricity !== undefined) updateData.hasElectricity = hasElectricity
    if (furniturePrice !== undefined) updateData.furniturePrice = parseFloat(furniturePrice)
    if (electricityPrice !== undefined) updateData.electricityPrice = parseFloat(electricityPrice)
    if (exhibitorName !== undefined) updateData.exhibitorName = exhibitorName || null

    // Handle status change to FREE (clear reservation and exhibitor)
    if (status === 'FREE') {
      updateData.orderId = null
      updateData.reservedAt = null
      updateData.reservedUntil = null
      updateData.exhibitorName = null
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

    const existingStand = await prisma.stand.findUnique({
      where: { id }
    })

    if (!existingStand) {
      return NextResponse.json(
        { error: 'Stand not found' },
        { status: 404 }
      )
    }

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
    const { action } = body

    if (action === 'initialize') {
      // Delete all existing stands
      await prisma.stand.deleteMany({})

      // Create all 25 stands
      for (const stand of defaultStandsConfig) {
        await prisma.stand.create({
          data: {
            number: stand.number,
            code: String(stand.number),
            surfaceM2: stand.surfaceM2,
            priceHT: stand.priceHT,
            status: 'FREE',
            size: stand.size as any,
            x: stand.x,
            y: stand.y,
            width: stand.width,
            height: stand.height,
            row: 0,
            col: 0,
            hasFurniture: false,
            hasElectricity: false,
            furniturePrice: 120,
            electricityPrice: 80,
          }
        })
      }

      const allStands = await prisma.stand.findMany({
        orderBy: [{ number: 'asc' }]
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
