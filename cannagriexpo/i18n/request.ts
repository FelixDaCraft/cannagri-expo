import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'
import { locales, defaultLocale, type Locale } from './config'

export default getRequestConfig(async () => {
  // Get locale from cookie
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value

  let locale: string = defaultLocale

  // Validate locale
  if (localeCookie && locales.includes(localeCookie as Locale)) {
    locale = localeCookie
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
