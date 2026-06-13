"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Coins,
  Leaf,
  TreePine,
  Wind,
  TrendingUp,
  Package,
  Recycle,
  FlaskConical,
  Cpu,
} from "lucide-react"
import { useApp, calcUserCO2, calcTreesSaved, RATES, TOKEN_BRL_RATE, type MaterialType } from "@/lib/app-context"
import { useLang } from "@/lib/lang-context"
import { useAccount, useBalance } from "wagmi"

// ─── Metas diárias por material ─────────────────────────────────────────────
const DAILY_GOAL_DEFS: { material: MaterialType; labelKey: string; targetKg: number; icon: React.ElementType }[] = [
  { material: "plastico", labelKey: "userDashboard.dailyGoals.plastico", targetKg: 2.0, icon: Package        },
  { material: "vidro",    labelKey: "userDashboard.dailyGoals.vidro",    targetKg: 1.5, icon: FlaskConical   },
  { material: "metal",    labelKey: "userDashboard.dailyGoals.metal",    targetKg: 1.0, icon: Cpu            },
  { material: "papel",    labelKey: "userDashboard.dailyGoals.papel",    targetKg: 3.0, icon: Recycle        },
]

const MATERIAL_COLORS: Record<MaterialType, string> = {
  plastico: "text-sky-400",
  vidro:    "text-emerald-400",
  metal:    "neon-text",
  papel:    "text-amber-400",
}

const MATERIAL_BG: Record<MaterialType, string> = {
  plastico: "bg-sky-400/10",
  vidro:    "bg-emerald-400/10",
  metal:    "bg-cyan-400/10",
  papel:    "bg-amber-400/10",
}

function formatDate(iso: string, locale: string) {
  const dateLocale = locale === "en" ? "en-US" : "pt-BR"
  return new Date(iso).toLocaleDateString(dateLocale, {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  })
}

// ─── Subcomponentes ──────────────────────────────────────────────────────────

function HeroCard() {
  const { state } = useApp()
  const { t, locale } = useLang()
  const user = state.users.find(u => u.id === state.activeSimulatorUserId) ?? state.users[0]
  const brlValue = user.tokenBalance * TOKEN_BRL_RATE

  const { address, isConnected } = useAccount()
  const isWeb3User = user.id === "web3"

  const { data: balanceData } = useBalance({
    address: isWeb3User && address ? address : undefined,
  })

  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/12 via-card to-card hero-glow p-6">
      <div
        className="absolute -top-24 -right-20 size-64 rounded-full bg-primary/20 blur-3xl pointer-events-none"
        aria-hidden
      />

      {/* Profile row */}
      <div className="relative flex items-center gap-4">
        <div className="relative shrink-0">
          <div
            className="absolute -inset-1.5 rounded-full border border-dashed border-primary/40 aura-spin"
            aria-hidden
          />
          <Avatar className="size-14 border-2 border-primary/50">
            <AvatarFallback className="bg-primary/15 text-primary font-bold text-lg font-display">
              {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-display font-bold text-foreground text-lg leading-tight truncate">{user.name}</h2>
            <Badge className="bg-primary/20 text-primary border-primary/30 text-xs shrink-0">
              {user.level}
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs mt-1 font-mono truncate">{user.wallet}</p>
        </div>

        <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{t("userDashboard.ranking")}</span>
          <span className="font-display font-bold text-foreground text-lg leading-none">#{user.ranking}</span>
        </div>
      </div>

      {/* Balance */}
      <div className="relative mt-6 pt-5 border-t border-primary/15">
        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
          <Coins className="size-3.5" />
          <span className="text-xs uppercase tracking-wide">{t("userDashboard.walletBalance")}</span>
        </div>
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-display font-bold emerald-text leading-none">
              {isWeb3User && balanceData
                ? parseFloat(balanceData.formatted).toFixed(4)
                : user.tokenBalance.toLocaleString(locale === "en" ? "en-US" : "pt-BR")}
            </span>
            <span className="text-primary font-display font-semibold text-xl">
              {isWeb3User && balanceData ? balanceData.symbol : "$GREEN"}
            </span>
          </div>
          <div className="pb-1 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-muted/60 border border-border text-foreground font-semibold text-sm">
              {isWeb3User && balanceData
                ? t("userDashboard.networkMain")
                : `≈ R$ ${brlValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span className="font-mono">
            {isWeb3User && balanceData
              ? t("userDashboard.networkLabel")
              : t("userDashboard.tokenRate", { rate: TOKEN_BRL_RATE.toFixed(2) })}
          </span>
          <span className="flex items-center gap-1 text-primary">
            <TrendingUp className="size-3.5" />
            {t("userDashboard.recycled", { kg: user.totalWeightKg.toFixed(1) })}
          </span>
        </div>
      </div>
    </div>
  )
}

function DailyGoals() {
  const { state } = useApp()
  const { t } = useLang()
  const user = state.users.find(u => u.id === state.activeSimulatorUserId) ?? state.users[0]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Leaf className="size-4 text-primary" />
          {t("userDashboard.dailyGoals.title")}
        </CardTitle>
        <CardDescription>{t("userDashboard.dailyGoals.description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {DAILY_GOAL_DEFS.map(({ material, labelKey, targetKg, icon: Icon }) => {
          const current = user.dailyProgress[material]
          const pct = Math.min(100, Math.round((current / targetKg) * 100))
          const done = pct >= 100

          return (
            <div key={material} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className={`flex items-center gap-2 ${MATERIAL_COLORS[material]}`}>
                  <Icon className="size-3.5" />
                  <span className="text-xs font-medium text-foreground">{t(labelKey)}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {current.toFixed(1)} / {targetKg} kg
                  </span>
                  {done && (
                    <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] py-0 h-4">
                      {t("userDashboard.dailyGoals.complete")}
                    </Badge>
                  )}
                </div>
              </div>
              <Progress
                value={pct}
                className="h-1.5"
                style={{ ["--progress-foreground" as string]: done ? "var(--primary)" : "oklch(0.72 0.18 160)" }}
              />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function ImpactIndicators() {
  const { state } = useApp()
  const { t } = useLang()
  const user = state.users.find(u => u.id === state.activeSimulatorUserId) ?? state.users[0]
  const co2 = calcUserCO2(user)
  const trees = calcTreesSaved(co2)

  const indicators = [
    {
      icon: Wind,
      label: t("userDashboard.impact.co2Label"),
      value: `${co2.toFixed(1)} kg`,
      sub: t("userDashboard.impact.co2Sub"),
      color: "text-sky-400",
      bg: "bg-sky-400/10",
    },
    {
      icon: TreePine,
      label: t("userDashboard.impact.treesLabel"),
      value: trees.toFixed(1),
      sub: t("userDashboard.impact.treesSub"),
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      icon: Recycle,
      label: t("userDashboard.impact.recycledLabel"),
      value: `${user.totalWeightKg.toFixed(1)} kg`,
      sub: t("userDashboard.impact.recycledSub"),
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {indicators.map(({ icon: Icon, label, value, sub, color, bg }, index) => (
        <Card key={index} className="relative overflow-hidden border-border bg-card/60">
          <CardContent className="pt-4 pb-3 px-3 flex flex-col items-center text-center gap-1.5">
            <div className={`grid place-items-center size-9 rounded-xl ${bg}`}>
              <Icon className={`size-4.5 ${color}`} />
            </div>
            <span className={`font-display font-bold text-xl leading-tight ${color}`}>{value}</span>
            <span className="text-[11px] text-muted-foreground leading-tight">{label}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function DiscardHistory() {
  const { state } = useApp()
  const { t, locale } = useLang()
  const user = state.users.find(u => u.id === state.activeSimulatorUserId) ?? state.users[0]
  const recent = user.history.slice(0, 8)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Recycle className="size-4 text-primary" />
          {t("userDashboard.history.title")}
        </CardTitle>
        <CardDescription>{t("userDashboard.history.description")}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {recent.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-8">
            {t("userDashboard.history.empty")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-xs">{t("userDashboard.history.colDate")}</TableHead>
                  <TableHead className="text-muted-foreground text-xs">{t("userDashboard.history.colMaterial")}</TableHead>
                  <TableHead className="text-muted-foreground text-xs text-right">{t("userDashboard.history.colWeight")}</TableHead>
                  <TableHead className="text-muted-foreground text-xs text-right">{t("userDashboard.history.colTokens")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map(entry => (
                  <TableRow key={entry.id} className="border-border hover:bg-muted/50">
                    <TableCell className="text-xs text-muted-foreground font-mono whitespace-nowrap py-2.5">
                      {formatDate(entry.date, locale)}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <span className={`text-xs font-medium ${MATERIAL_COLORS[entry.material]} ${MATERIAL_BG[entry.material]} px-2 py-0.5 rounded-full`}>
                        {RATES[entry.material].label}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-xs text-foreground py-2.5 whitespace-nowrap">
                      {entry.weightKg.toFixed(2)} kg
                    </TableCell>
                    <TableCell className="text-right py-2.5">
                      <span className="text-xs font-bold emerald-text">+{entry.tokensEarned} $GREEN</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Painel principal ────────────────────────────────────────────────────────

export function UserDashboard() {
  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-5">
        <HeroCard />
        <ImpactIndicators />
        <div className="grid lg:grid-cols-2 gap-5 items-start">
          <DailyGoals />
          <DiscardHistory />
        </div>
      </div>
    </div>
  )
}
