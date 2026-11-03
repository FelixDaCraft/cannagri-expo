import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { localizeImageUrl, localizeSpeakers, needsLocalCopy } from '@/lib/external-images'

export interface BackfillReport {
  copied: string[]
  failed: string[]
}

/**
 * Rattrapage : copie sur le site toutes les images encore hébergées ailleurs (ou en base64)
 * dans les sponsors, les stands, les comptes exposants et les intervenants du programme.
 * Une image qui ne répond pas est laissée telle quelle et listée dans `failed`.
 */
export async function localizeStoredImages(): Promise<BackfillReport> {
  const report: BackfillReport = { copied: [], failed: [] }
  const track = (label: string, before: string, after: string | null | undefined) => {
    if (after && after !== before) report.copied.push(label)
    else report.failed.push(`${label} : ${before.slice(0, 80)}`)
    return after !== before ? after : undefined
  }

  for (const s of await prisma.sponsor.findMany({ select: { id: true, name: true, logoUrl: true, articleImage: true } })) {
    const data: { logoUrl?: string; articleImage?: string } = {}
    if (needsLocalCopy(s.logoUrl)) {
      const v = track(`Sponsor ${s.name} (logo)`, s.logoUrl, await localizeImageUrl(s.logoUrl))
      if (v) data.logoUrl = v
    }
    if (needsLocalCopy(s.articleImage)) {
      const v = track(`Sponsor ${s.name} (image d'article)`, s.articleImage, await localizeImageUrl(s.articleImage))
      if (v) data.articleImage = v
    }
    if (Object.keys(data).length) await prisma.sponsor.update({ where: { id: s.id }, data })
  }

  for (const st of await prisma.stand.findMany({ select: { id: true, number: true, exhibitorName: true, exhibitorLogo: true } })) {
    if (!needsLocalCopy(st.exhibitorLogo)) continue
    const v = track(`Stand ${st.number} ${st.exhibitorName ?? ''}`.trim(), st.exhibitorLogo, await localizeImageUrl(st.exhibitorLogo))
    if (v) await prisma.stand.update({ where: { id: st.id }, data: { exhibitorLogo: v } })
  }

  for (const u of await prisma.user.findMany({ where: { companyLogo: { not: null } }, select: { id: true, companyName: true, companyLogo: true } })) {
    if (!needsLocalCopy(u.companyLogo)) continue
    const v = track(`Exposant ${u.companyName ?? u.id}`, u.companyLogo, await localizeImageUrl(u.companyLogo))
    if (v) await prisma.user.update({ where: { id: u.id }, data: { companyLogo: v } })
  }

  for (const e of await prisma.event.findMany({ select: { id: true, title: true, speakers: true, speakerPhoto: true } })) {
    const data: { speakers?: Prisma.InputJsonValue; speakerPhoto?: string } = {}
    const speakers = Array.isArray(e.speakers) ? (e.speakers as { name?: string; photo?: string }[]) : []
    if (speakers.some((sp) => needsLocalCopy(sp?.photo))) {
      const localized = await localizeSpeakers(speakers)
      localized.forEach((sp, i) => {
        if (needsLocalCopy(speakers[i]?.photo)) track(`Intervenant ${sp.name ?? '?'} (${e.title})`, speakers[i].photo as string, sp.photo)
      })
      data.speakers = localized as Prisma.InputJsonValue
    }
    if (needsLocalCopy(e.speakerPhoto)) {
      const v = track(`Intervenant (${e.title})`, e.speakerPhoto, await localizeImageUrl(e.speakerPhoto))
      if (v) data.speakerPhoto = v
    }
    if (Object.keys(data).length) await prisma.event.update({ where: { id: e.id }, data })
  }

  return report
}
