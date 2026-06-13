import { getRequestConfig } from "next-intl/server"

// Supported locales
export const locales = ["pt", "en"] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "pt"

export default getRequestConfig(async ({ locale }) => {
  // Validate that the locale is supported
  const safeLocale = locales.includes(locale as Locale) ? locale : defaultLocale

  return {
    locale: safeLocale as string,
    messages: (await import(`./messages/${safeLocale}.json`)).default,
  }
})
