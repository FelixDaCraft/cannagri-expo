/**
 * CSV pour tableur (séparateur « ; », BOM UTF-8 pour Excel). Les cellules qui commencent par
 * = + - @ sont neutralisées pour éviter l'injection de formules dans le tableur.
 */
export function csvCell(value: unknown): string {
  let text = value == null ? '' : value instanceof Date ? value.toISOString() : String(value)
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function toCsv(headers: string[], rows: unknown[][]): string {
  return '﻿' + [headers, ...rows].map((row) => row.map(csvCell).join(';')).join('\r\n') + '\r\n'
}
