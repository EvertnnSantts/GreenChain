"use client"

import { useState } from "react"
import { AppProvider, useApp } from "@/lib/app-context"
import { useLang } from "@/lib/lang-context"
import { UserDashboard } from "@/components/user-dashboard"
import { CompanyDashboard } from "@/components/company-dashboard"
import { BinSimulator } from "@/components/bin-simulator"
import { Badge } from "@/components/ui/badge"
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher"
import { ConnectWalletButton } from "@/components/auth/ConnectWalletButton"
import { Leaf, LayoutDashboard, Cpu, User } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Tipos de aba ─────────────────────────────────────────────────────────────

type Tab = "user" | "company" | "simulator"

// ─── Indicador de simulação em curso ─────────────────────────────────────────

function SimulatorDot() {
  const { state } = useApp()
  if (state.simulatorStep === 1 || state.simulatorStep === 4) return null
  return (
    <span className="absolute -top-1 -right-1 size-2.5 bg-amber-400 rounded-full border border-background animate-pulse" />
  )
}

// ─── Navegação por abas ───────────────────────────────────────────────────────

function TabNav({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const { t } = useLang()

  const TABS: { id: Tab; label: string; shortLabel: string; icon: React.ElementType; badge?: string }[] = [
    { id: "user",      label: t("nav.user"),      shortLabel: t("nav.userShort"),      icon: User            },
    { id: "company",   label: t("nav.company"),   shortLabel: t("nav.companyShort"),   icon: LayoutDashboard },
    { id: "simulator", label: t("nav.simulator"), shortLabel: t("nav.simulatorShort"), icon: Cpu, badge: "IoT" },
  ]

  return (
    <nav
      aria-label="Navegação principal"
      className="flex gap-1.5 p-1.5 glass rounded-2xl border border-border"
    >
      {TABS.map(tab => {
        const Icon = tab.icon
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 overflow-hidden",
              isActive
                ? "bg-primary text-primary-foreground shadow-[0_4px_20px_oklch(0.72_0.18_160/35%)]"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="hidden sm:inline font-display tracking-tight">{tab.label}</span>
            <span className="sm:hidden font-display">{tab.shortLabel}</span>
            {tab.badge && (
              <Badge
                className={cn(
                  "hidden md:inline-flex text-[10px] py-0 h-4 ml-0.5 border",
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30"
                    : "bg-sky-400/15 text-sky-400 border-sky-400/30",
                )}
              >
                {tab.badge}
              </Badge>
            )}
            {tab.id === "simulator" && <SimulatorDot />}
          </button>
        )
      })}
    </nav>
  )
}

// ─── Shell principal ──────────────────────────────────────────────────────────

function AppShell() {
  const [tab, setTab] = useState<Tab>("user")
  const { t } = useLang()

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Decorative backdrop layers */}
      <div className="app-backdrop" aria-hidden />
      <div className="app-grid" aria-hidden />

      {/* Header global */}
      <header className="sticky top-0 z-40 glass border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="relative grid place-items-center size-9 rounded-xl bg-primary/15 border border-primary/30 shadow-[0_0_20px_oklch(0.72_0.18_160/35%)]">
              <Leaf className="size-5 text-primary" />
            </div>
            <div className="leading-none">
              <span className="font-display font-bold text-foreground text-base tracking-tight">
                Green<span className="text-primary">Chain</span>
              </span>
              <p className="hidden sm:block text-[10px] text-muted-foreground mt-0.5 tracking-wide uppercase">
                {t("header.tagline")}
              </p>
            </div>
          </div>

          {/* Live indicator + Language Switcher + Wallet */}
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
              <span className="size-1.5 bg-primary rounded-full live-dot" />
              <span className="text-[11px] font-medium text-primary">{t("header.live")}</span>
            </div>
            <Badge className="hidden sm:inline-flex bg-accent text-accent-foreground border-accent-foreground/20 text-xs font-mono">
              $GREEN
            </Badge>
            {/* Language Switcher */}
            <LanguageSwitcher compact />
            {/* Botão de conexão de carteira Web3 */}
            <ConnectWalletButton compact />
          </div>
        </div>

        {/* Tab nav */}
        <div className="max-w-5xl mx-auto px-4 pb-3">
          <TabNav active={tab} onChange={setTab} />
        </div>
      </header>

      {/* Conteúdo das abas */}
      <main className="relative z-10 flex-1">
        {tab === "user"      && <UserDashboard />}
        {tab === "company"   && <CompanyDashboard />}
        {tab === "simulator" && <BinSimulator />}
      </main>

      {/* Footer — corrigido: Celo PoS (não Polygon) */}
      <footer className="relative z-10 border-t border-border py-5 px-4 mt-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Leaf className="size-3.5 text-primary" />
            <span className="font-display font-medium">{t("footer.copyright")}</span>
          </div>
          <div className="flex items-center gap-3 font-mono">
            {/* CORRECTED: Celo (PoS) — Proof of Ship (PoS) is a Celo program, not Polygon */}
            <span title={t("footer.networkNote")}>{t("footer.network")}</span>
            <span className="text-border">/</span>
            <span>{t("footer.token")}</span>
            <span className="text-border">/</span>
            <span className="emerald-text font-semibold">{t("footer.version")}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ─── Export com Provider ──────────────────────────────────────────────────────

export default function Home() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  )
}
