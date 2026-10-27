import { renderShareImage, shareImageSize } from '@/lib/editions/share-image'

// Rendu à la demande : la date et le lieu viennent de l'édition en ligne
export const dynamic = 'force-dynamic'

export const alt = "Cann'Agri Expo | Salon Professionnel du Chanvre CBD"
export const size = shareImageSize
export const contentType = 'image/png'

export default function Image() {
  return renderShareImage()
}
