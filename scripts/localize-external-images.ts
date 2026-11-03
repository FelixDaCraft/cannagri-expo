/**
 * Rattrapage des images externes (logos, photos d'intervenants) : copie dans public/images/gallery.
 * Usage : DATABASE_URL=… npx tsx scripts/localize-external-images.ts
 * (en production, préférer le bouton « Rapatrier les images externes » de l'administration
 * ou POST /api/admin/images/localize, qui écrivent dans le volume monté du conteneur)
 */
import { localizeStoredImages } from '../lib/external-images-backfill'
import { prisma } from '../lib/prisma'

localizeStoredImages()
  .then((report) => {
    console.log(`Copiées : ${report.copied.length}`)
    report.copied.forEach((line) => console.log(`  ✓ ${line}`))
    console.log(`Échecs (adresse d'origine conservée) : ${report.failed.length}`)
    report.failed.forEach((line) => console.log(`  ✗ ${line}`))
  })
  .finally(() => prisma.$disconnect())
