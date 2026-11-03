import { NextResponse } from 'next/server'
import { checkFullAdminAuth, unauthorizedResponse } from '@/lib/admin-auth'
import { localizeStoredImages } from '@/lib/external-images-backfill'

// POST /api/admin/images/localize : rattrapage des images externes (administrateurs, idempotent)
export async function POST() {
  if (!(await checkFullAdminAuth())) return unauthorizedResponse()
  const report = await localizeStoredImages()
  return NextResponse.json(report)
}
