import { NextResponse } from 'next/server'
import { EditionValidationError } from './service'

/** Réponse HTTP commune aux routes d'administration des éditions. */
export function editionErrorResponse(error: unknown, fallback: string) {
  if (error instanceof EditionValidationError) {
    return NextResponse.json({ error: error.message, details: error.errors }, { status: 400 })
  }
  console.error(fallback, error)
  return NextResponse.json({ error: fallback }, { status: 500 })
}
