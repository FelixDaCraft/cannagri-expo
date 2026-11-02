import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'
import { resolveLocale } from '@/lib/locale'

export default getRequestConfig(async () => {
  // Choix explicite (cookie posé par le sélecteur de langue), sinon langue du navigateur,
  // sinon français
  const cookieStore = await cookies()
  const headerStore = await headers()
  const locale = resolveLocale(cookieStore.get('NEXT_LOCALE')?.value, headerStore.get('accept-language'))

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
