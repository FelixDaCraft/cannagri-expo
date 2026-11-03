/** Première édition du salon : 2023 (2027 est la 5e édition) */
export const FIRST_EDITION_YEAR = 2023

export function editionNumber(year: number): number {
  return year - FIRST_EDITION_YEAR + 1
}
