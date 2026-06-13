"use client"

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"

// ─── Types ───────────────────────────────────────────────────────────────────

export type Locale = "pt" | "en"

type Messages = Record<string, unknown>

interface LangContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

// ─── Context ─────────────────────────────────────────────────────────────────

const LangContext = createContext<LangContextValue | null>(null)

// ─── Helper: deep-get a key like "nav.user" from a nested object ─────────────

function deepGet(obj: Messages, key: string): string {
  const parts = key.split(".")
  let cur: unknown = obj
  for (const part of parts) {
    if (cur == null || typeof cur !== "object") return key
    cur = (cur as Record<string, unknown>)[part]
  }
  return typeof cur === "string" ? cur : key
}

// ─── Helper: replace {param} placeholders ────────────────────────────────────

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template
  return Object.entries(params).reduce(
    (acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, "g"), String(v)),
    template,
  )
}

// ─── Messages loader (lazy, cached) ──────────────────────────────────────────

const cache: Partial<Record<Locale, Messages>> = {}

async function loadMessages(locale: Locale): Promise<Messages> {
  if (cache[locale]) return cache[locale]!
  const mod = await import(`@/messages/${locale}.json`)
  cache[locale] = mod.default as Messages
  return cache[locale]!
}

const STORAGE_KEY = "greenchain_locale"

// ─── Provider ────────────────────────────────────────────────────────────────

export function LangProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("pt")
  const [messages, setMessages] = useState<Messages>({})
  const [ready, setReady] = useState(false)

  // Initial locale: read from localStorage, fallback to browser preference
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null
    if (stored === "pt" || stored === "en") {
      setLocaleState(stored)
    } else {
      const browserLang = navigator.language?.slice(0, 2)
      setLocaleState(browserLang === "en" ? "en" : "pt")
    }
  }, [])

  // Load messages whenever locale changes
  useEffect(() => {
    loadMessages(locale).then(msgs => {
      setMessages(msgs)
      setReady(true)
    })
  }, [locale])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    localStorage.setItem(STORAGE_KEY, next)
    // Update the <html lang> attribute
    document.documentElement.lang = next === "pt" ? "pt-BR" : "en-US"
  }, [])

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      if (!ready) return ""
      const raw = deepGet(messages, key)
      return interpolate(raw, params)
    },
    [messages, ready],
  )

  return (
    <LangContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LangContext.Provider>
  )
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error("useLang must be used inside <LangProvider>")
  return ctx
}
