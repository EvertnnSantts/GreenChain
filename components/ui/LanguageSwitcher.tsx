"use client"

import { useLang, type Locale } from "@/lib/lang-context"
import { cn } from "@/lib/utils"
import { Languages } from "lucide-react"

const OPTIONS: { value: Locale; short: string; full: string }[] = [
  { value: "pt", short: "PT", full: "Português" },
  { value: "en", short: "EN", full: "English" },
]

interface LanguageSwitcherProps {
  /** Compact mode shows only the 2-letter code */
  compact?: boolean
  className?: string
}

export function LanguageSwitcher({ compact = false, className }: LanguageSwitcherProps) {
  const { locale, setLocale } = useLang()

  return (
    <div
      className={cn(
        "flex items-center gap-0.5 rounded-xl border border-border bg-muted/40 p-0.5",
        className,
      )}
      role="group"
      aria-label="Language switcher"
    >
      <Languages className="size-3.5 text-muted-foreground mx-1.5 shrink-0 hidden sm:block" />
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => setLocale(opt.value)}
          aria-pressed={locale === opt.value}
          aria-label={opt.full}
          title={opt.full}
          className={cn(
            "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 leading-none",
            locale === opt.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
          )}
        >
          {compact ? opt.short : opt.full}
        </button>
      ))}
    </div>
  )
}
