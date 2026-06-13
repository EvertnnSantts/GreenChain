"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DollarSign,
  Trash2,
  Weight,
  Coins,
  MapPin,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Wrench,
  CheckCircle2,
} from "lucide-react"
import { useApp, RATES, type MaterialType } from "@/lib/app-context"
import { useLang } from "@/lib/lang-context"

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MATERIAL_COLORS_HEX: Record<MaterialType, string> = {
  plastico: "#38bdf8",
  vidro:    "#34d399",
  metal:    "#67e8f9",
  papel:    "#fbbf24",
}

// ─── Metric Cards ─────────────────────────────────────────────────────────────

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  accent = false,
}: {
  icon: React.ElementType
  label: string
  value: string
  sub?: string
  accent?: boolean
}) {
  return (
    <Card className={`relative overflow-hidden ${accent ? "bg-gradient-to-br from-primary/12 to-card border-primary/25 card-glow" : "bg-card/60"}`}>
      {accent && (
        <div className="absolute -top-10 -right-8 size-28 rounded-full bg-primary/15 blur-2xl pointer-events-none" aria-hidden />
      )}
      <CardContent className="relative pt-5 pb-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{label}</span>
          <div className={`grid place-items-center size-8 rounded-lg ${accent ? "bg-primary/20" : "bg-muted"}`}>
            <Icon className={`size-4 ${accent ? "text-primary" : "text-muted-foreground"}`} />
          </div>
        </div>
        <p className={`text-2xl font-display font-bold leading-none ${accent ? "emerald-text" : "text-foreground"}`}>
          {value}
        </p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  )
}

function MetricsGrid() {
  const { state } = useApp()
  const { t } = useLang()
  const c = state.company

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <MetricCard
        icon={DollarSign}
        label={t("companyDashboard.metrics.revenue")}
        value={`R$ ${c.totalRevenueBRL.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
        sub={t("companyDashboard.metrics.revenueSub")}
        accent
      />
      <MetricCard
        icon={Trash2}
        label={t("companyDashboard.metrics.bins")}
        value={String(c.totalBinsActive)}
        sub={t("companyDashboard.metrics.binsSub", { total: state.bins.length })}
      />
      <MetricCard
        icon={Weight}
        label={t("companyDashboard.metrics.volume")}
        value={`${(c.totalCollectedTons * 1000).toFixed(0)} kg`}
        sub={t("companyDashboard.metrics.volumeSub", { tons: c.totalCollectedTons.toFixed(3) })}
      />
      <MetricCard
        icon={Coins}
        label={t("companyDashboard.metrics.tokens")}
        value={c.totalTokensIssued.toLocaleString("pt-BR")}
        sub={t("companyDashboard.metrics.tokensSub")}
      />
    </div>
  )
}

// ─── Revenue vs Cost Bar Chart (custom SVG) ──────────────────────────────────

function RevenueChart() {
  const { state } = useApp()
  const { t } = useLang()
  const data = state.company.revenueHistory

  const maxVal = Math.max(...data.flatMap(d => [d.revenue, d.cost]))
  const chartH = 120
  const barW = 22
  const gap = 10
  const groupW = barW * 2 + gap
  const groupGap = 18
  const totalW = data.length * (groupW + groupGap) - groupGap

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="size-4 text-primary" />
          {t("companyDashboard.chart.title")}
        </CardTitle>
        <CardDescription>{t("companyDashboard.chart.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end gap-4 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="size-2.5 rounded-sm bg-primary" />
            {t("companyDashboard.chart.revenue")}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="size-2.5 rounded-sm bg-cyan-400/70" />
            {t("companyDashboard.chart.cost")}
          </div>
        </div>

        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${totalW + 20} ${chartH + 32}`}
            className="w-full min-w-[300px]"
            aria-label={t("companyDashboard.chart.ariaLabel")}
          >
            {[0, 0.25, 0.5, 0.75, 1].map(frac => {
              const y = chartH - chartH * frac
              const val = Math.round(maxVal * frac)
              return (
                <g key={frac}>
                  <line x1={0} y1={y} x2={totalW + 20} y2={y} stroke="oklch(1 0 0 / 6%)" strokeWidth={1} />
                  <text x={0} y={y - 2} fill="oklch(0.60 0.02 160)" fontSize={8} textAnchor="start">
                    {val}
                  </text>
                </g>
              )
            })}

            {data.map((d, i) => {
              const x = i * (groupW + groupGap) + 15
              const revenueH = (d.revenue / maxVal) * chartH
              const costH    = (d.cost    / maxVal) * chartH
              const profit   = d.revenue - d.cost

              return (
                <g key={d.label}>
                  <rect
                    x={x}
                    y={chartH - revenueH}
                    width={barW}
                    height={revenueH}
                    rx={3}
                    fill="oklch(0.72 0.18 160)"
                    opacity={0.9}
                  />
                  <rect
                    x={x + barW + gap}
                    y={chartH - costH}
                    width={barW}
                    height={costH}
                    rx={3}
                    fill="oklch(0.60 0.20 195)"
                    opacity={0.75}
                  />
                  <text
                    x={x + groupW / 2}
                    y={chartH + 14}
                    fill="oklch(0.60 0.02 160)"
                    fontSize={9}
                    textAnchor="middle"
                  >
                    {d.label}
                  </text>
                  <text
                    x={x + groupW / 2}
                    y={chartH - revenueH - 5}
                    fill={profit >= 0 ? "oklch(0.72 0.18 160)" : "oklch(0.65 0.22 25)"}
                    fontSize={7.5}
                    textAnchor="middle"
                    fontWeight="600"
                  >
                    +{profit.toFixed(0)}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Material Breakdown ───────────────────────────────────────────────────────

function MaterialBreakdown() {
  const { state } = useApp()
  const { t } = useLang()
  const data = state.company.materialBreakdown
  const total = data.reduce((s, d) => s + d.kg, 0)
  const sortedData = [...data].sort((a, b) => b.kg - a.kg)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingDown className="size-4 text-primary" />
          {t("companyDashboard.breakdown.title")}
        </CardTitle>
        <CardDescription>{t("companyDashboard.breakdown.description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {sortedData
          .map(({ material, kg }) => {
            const pct = total > 0 ? Math.round((kg / total) * 100) : 0
            const rate = RATES[material]
            return (
              <div key={material} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{rate.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{kg.toFixed(2)} kg</span>
                    <span
                      className="font-bold w-10 text-right"
                      style={{ color: MATERIAL_COLORS_HEX[material] }}
                    >
                      {pct}%
                    </span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: MATERIAL_COLORS_HEX[material],
                    }}
                  />
                </div>
              </div>
            )
          })}
        {total === 0 && (
          <p className="text-center text-muted-foreground text-sm py-4">
            {t("companyDashboard.breakdown.empty")}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Bin Monitoring ───────────────────────────────────────────────────────────

function BinCapacityBar({ pct }: { pct: number }) {
  const color = pct >= 90 ? "#f87171" : pct >= 60 ? "#fbbf24" : "#34d399"
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-mono text-muted-foreground w-9 text-right shrink-0">
        {pct}%
      </span>
    </div>
  )
}

function BinMonitoring() {
  const { state } = useApp()
  const { t } = useLang()

  const BIN_STATUS_CONFIG = {
    disponivel: {
      label: t("companyDashboard.bins.available"),
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg:    "bg-emerald-400/10",
      badge: "bg-emerald-400/20 text-emerald-400 border-emerald-400/30",
    },
    cheia: {
      label: t("companyDashboard.bins.full"),
      icon: AlertTriangle,
      color: "text-amber-400",
      bg:    "bg-amber-400/10",
      badge: "bg-amber-400/20 text-amber-400 border-amber-400/30",
    },
    manutencao: {
      label: t("companyDashboard.bins.maintenance"),
      icon: Wrench,
      color: "text-rose-400",
      bg:    "bg-rose-400/10",
      badge: "bg-rose-400/20 text-rose-400 border-rose-400/30",
    },
  } as const

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="size-4 text-primary" />
          {t("companyDashboard.bins.title")}
        </CardTitle>
        <CardDescription>{t("companyDashboard.bins.description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 p-4 pt-0">
        {state.bins.map(bin => {
          const cfg = BIN_STATUS_CONFIG[bin.status]
          const Icon = cfg.icon

          return (
            <div
              key={bin.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border hover:bg-muted/60 transition-colors"
            >
              <div className={`p-2 rounded-lg shrink-0 ${cfg.bg}`}>
                <Icon className={`size-4 ${cfg.color}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs font-semibold text-foreground font-mono">{bin.id.toUpperCase()}</span>
                  <Badge className={`text-[10px] py-0 h-4 border ${cfg.badge}`}>
                    {cfg.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate mb-1.5">{bin.location}</p>
                <BinCapacityBar pct={bin.capacityPct} />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

// ─── Dashboard principal ──────────────────────────────────────────────────────

export function CompanyDashboard() {
  const { t } = useLang()

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="grid place-items-center size-11 bg-primary/15 rounded-xl border border-primary/25 shadow-[0_0_20px_oklch(0.72_0.18_160/25%)]">
          <TrendingUp className="size-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display font-bold text-foreground text-xl leading-tight">{t("companyDashboard.title")}</h2>
          <p className="text-xs text-muted-foreground">{t("companyDashboard.subtitle")}</p>
        </div>
        <Badge className="ml-auto bg-primary/20 text-primary border-primary/30 text-xs flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-primary live-dot" />
          {t("companyDashboard.live")}
        </Badge>
      </div>

      <MetricsGrid />

      <div className="grid md:grid-cols-2 gap-5">
        <RevenueChart />
        <MaterialBreakdown />
      </div>

      <BinMonitoring />
    </div>
  )
}
