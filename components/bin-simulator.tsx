"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  QrCode,
  Cpu,
  Scale,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  Coins,
  DollarSign,
  Wifi,
  Activity,
  Package,
  FlaskConical,
  Recycle,
  ArrowRight,
} from "lucide-react"
import { useApp, RATES, TOKEN_BRL_RATE, type MaterialType } from "@/lib/app-context"
import { useLang } from "@/lib/lang-context"
import { cn } from "@/lib/utils"

// ─── Step indicator ────────────────────────────────────────────────────────

function StepDot({ step, current, label }: { step: number; current: number; label: string }) {
  const done   = current > step
  const active = current === step
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          "size-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300",
          done   && "bg-primary border-primary text-primary-foreground",
          active && "bg-primary/20 border-primary text-primary scale-110",
          !done && !active && "bg-muted border-border text-muted-foreground",
        )}
      >
        {done ? <CheckCircle2 className="size-4" /> : step}
      </div>
      <span className={cn(
        "text-[10px] text-center leading-tight max-w-[56px] hidden sm:block",
        active ? "text-primary font-semibold" : "text-muted-foreground",
      )}>
        {label}
      </span>
    </div>
  )
}

function StepBar({ current }: { current: number }) {
  const { t } = useLang()
  const steps = [
    { label: t("simulator.steps.recognize") },
    { label: t("simulator.steps.materials") },
    { label: t("simulator.steps.process") },
    { label: t("simulator.steps.confirm") },
  ]
  return (
    <div className="flex items-start gap-0 justify-between px-2">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <StepDot step={i + 1} current={current} label={s.label} />
          {i < steps.length - 1 && (
            <div className={cn(
              "flex-1 h-0.5 mx-1 rounded transition-all duration-500 mt-[-12px] sm:mt-[-20px]",
              current > i + 1 ? "bg-primary" : "bg-border",
            )} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Step 1: Autenticação ─────────────────────────────────────────────────────

function Step1Auth() {
  const { state, dispatch } = useApp()
  const { t } = useLang()
  const [selected, setSelected] = useState(state.activeSimulatorUserId)

  function handleAuthenticate() {
    dispatch({ type: "SET_SIMULATOR_USER", userId: selected })
    dispatch({ type: "SET_SIMULATOR_STEP", step: 2 })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="p-2 bg-primary/15 rounded-lg">
          <QrCode className="size-4 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-sm text-foreground">{t("simulator.step1.title")}</p>
          <p className="text-xs text-muted-foreground">{t("simulator.step1.description")}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {state.users.map(user => (
          <button
            key={user.id}
            onClick={() => setSelected(user.id)}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200",
              selected === user.id
                ? "border-primary bg-primary/10 shadow-[0_0_8px_oklch(0.72_0.18_160/25%)]"
                : "border-border bg-muted/30 hover:bg-muted/60",
            )}
          >
            <Avatar className="size-9 border border-primary/30 shrink-0">
              <AvatarFallback className="bg-primary/15 text-primary text-xs font-bold">
                {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground font-mono truncate">{user.wallet}</p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <Badge className="bg-primary/15 text-primary border-primary/25 text-[10px] h-4">
                {user.level}
              </Badge>
              <span className="text-xs emerald-text font-bold">{user.tokenBalance} $GREEN</span>
            </div>
          </button>
        ))}
      </div>

      <Button
        onClick={handleAuthenticate}
        className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 w-full"
      >
        <Wifi className="size-4" />
        {t("simulator.step1.authenticate")}
        <ChevronRight className="size-4" />
      </Button>
    </div>
  )
}

// ─── Step 2: Dados da Lixeira ──────────────────────────────────────────────

const MATERIAL_ACCENT: Record<MaterialType, string> = {
  plastico: "border-sky-400/60 bg-sky-400/10",
  vidro:    "border-emerald-400/60 bg-emerald-400/10",
  metal:    "border-cyan-400/60 bg-cyan-400/10",
  papel:    "border-amber-400/60 bg-amber-400/10",
}

function Step2Data({
  material,
  setMaterial,
  weightGrams,
  setWeightGrams,
  binId,
  setBinId,
}: {
  material: MaterialType
  setMaterial: (m: MaterialType) => void
  weightGrams: string
  setWeightGrams: (v: string) => void
  binId: string
  setBinId: (v: string) => void
}) {
  const { state, dispatch } = useApp()
  const { t } = useLang()

  const MATERIAL_OPTIONS: { value: MaterialType; labelKey: string; icon: React.ElementType; desc: string }[] = [
    { value: "plastico", labelKey: "simulator.materials.plastico", icon: Package,      desc: "5 $GREEN/kg | R$ 2,00/kg" },
    { value: "vidro",    labelKey: "simulator.materials.vidro",    icon: FlaskConical, desc: "3 $GREEN/kg | R$ 1,50/kg" },
    { value: "metal",    labelKey: "simulator.materials.metal",    icon: Cpu,          desc: "12 $GREEN/kg | R$ 5,00/kg" },
    { value: "papel",    labelKey: "simulator.materials.papel",    icon: Recycle,      desc: "2 $GREEN/kg | R$ 0,80/kg" },
  ]

  const availableBins = state.bins.filter(b => b.status !== "cheia" && b.status !== "manutencao")

  function handleNext() {
    if (!weightGrams || parseFloat(weightGrams) <= 0 || !binId) return
    dispatch({ type: "SET_SIMULATOR_STEP", step: 3 })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="p-2 bg-primary/15 rounded-lg">
          <Scale className="size-4 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-sm text-foreground">{t("simulator.step2.title")}</p>
          <p className="text-xs text-muted-foreground">{t("simulator.step2.description")}</p>
        </div>
      </div>

      {/* Material selection */}
      <div>
        <p className="text-xs text-muted-foreground mb-2 font-medium">{t("simulator.step2.materialType")}</p>
        <div className="grid grid-cols-2 gap-2">
          {MATERIAL_OPTIONS.map(opt => {
            const Icon = opt.icon
            const active = material === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => setMaterial(opt.value)}
                className={cn(
                  "flex flex-col items-start gap-1.5 p-3 rounded-xl border text-left transition-all duration-200",
                  active
                    ? `${MATERIAL_ACCENT[opt.value]} shadow-sm`
                    : "border-border bg-muted/20 hover:bg-muted/50",
                )}
              >
                <div className="flex items-center gap-2 w-full">
                  <Icon className={cn("size-4", active ? "text-primary" : "text-muted-foreground")} />
                  <span className={cn("text-xs font-semibold", active ? "text-foreground" : "text-muted-foreground")}>
                    {t(opt.labelKey)}
                  </span>
                </div>
                <span className={cn("text-[10px]", active ? "text-primary" : "text-muted-foreground")}>
                  {opt.desc}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Weight input */}
      <div>
        <p className="text-xs text-muted-foreground mb-2 font-medium">{t("simulator.step2.weight")}</p>
        <div className="flex items-center gap-2 bg-muted/40 border border-border rounded-xl px-3 py-2 focus-within:border-primary/60 focus-within:bg-primary/5 transition-colors">
          <Scale className="size-4 text-muted-foreground shrink-0" />
          <input
            type="number"
            min={0.001}
            step={0.01}
            value={weightGrams}
            onChange={e => setWeightGrams(e.target.value)}
            placeholder="0.00"
            className="flex-1 bg-transparent text-foreground text-sm font-mono outline-none placeholder:text-muted-foreground"
          />
          <span className="text-muted-foreground text-xs shrink-0">kg</span>
        </div>
      </div>

      {/* Bin selection */}
      <div>
        <p className="text-xs text-muted-foreground mb-2 font-medium">{t("simulator.step2.bin")}</p>
        <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
          {availableBins.map(bin => (
            <button
              key={bin.id}
              onClick={() => setBinId(bin.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-colors text-xs",
                binId === bin.id
                  ? "border-primary/60 bg-primary/10 text-foreground"
                  : "border-border bg-muted/20 hover:bg-muted/40 text-muted-foreground",
              )}
            >
              <span className="font-mono font-bold uppercase shrink-0">{bin.id}</span>
              <span className="truncate">{bin.location}</span>
              <span className="ml-auto shrink-0 font-bold" style={{
                color: bin.capacityPct >= 60 ? "#fbbf24" : "#34d399",
              }}>
                {bin.capacityPct}%
              </span>
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={handleNext}
        disabled={!weightGrams || parseFloat(weightGrams) <= 0 || !binId}
        className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 w-full"
      >
        {t("simulator.step2.next")}
        <ArrowRight className="size-4" />
      </Button>
    </div>
  )
}

// ─── Step 3: Processando ───────────────────────────────────────────────────────

function Step3Processing({
  material,
  weightKg,
  binId,
}: {
  material: MaterialType
  weightKg: number
  binId: string
}) {
  const { state, dispatch } = useApp()
  const { t } = useLang()
  const rate = RATES[material]
  const tokensEarned = Math.round(rate.tokensPerKg * weightKg * 100) / 100
  const revenueBRL   = Math.round(rate.revenueBRLperKg * weightKg * 100) / 100
  const costBRL      = Math.round(tokensEarned * TOKEN_BRL_RATE * 100) / 100
  const profitBRL    = Math.round((revenueBRL - costBRL) * 100) / 100

  const user = state.users.find(u => u.id === state.activeSimulatorUserId) ?? state.users[0]

  function handleConfirm() {
    dispatch({
      type: "PROCESS_DISCARD",
      userId: state.activeSimulatorUserId,
      material,
      weightKg,
      binId,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="p-2 bg-primary/15 rounded-lg">
          <Activity className="size-4 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-sm text-foreground">{t("simulator.step3.title")}</p>
          <p className="text-xs text-muted-foreground">{t("simulator.step3.description")}</p>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-2xl border border-border bg-muted/30 p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/15 text-primary text-xs font-bold">
              {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground font-mono">{user.wallet}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <span className="text-muted-foreground">{t("simulator.step3.material")}</span>
          <span className="text-right font-semibold text-foreground">{rate.label}</span>

          <span className="text-muted-foreground">{t("simulator.step3.weight")}</span>
          <span className="text-right font-semibold text-foreground">{weightKg.toFixed(3)} kg</span>

          <span className="text-muted-foreground">{t("simulator.step3.bin")}</span>
          <span className="text-right font-semibold text-foreground uppercase">{binId}</span>
        </div>

        <Separator className="opacity-20" />

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Coins className="size-3.5 text-primary" />
            {t("simulator.step3.tokensLabel")}
          </div>
          <span className="text-right font-bold emerald-text text-sm">+{tokensEarned} $GREEN</span>

          <div className="flex items-center gap-1.5 text-muted-foreground">
            <DollarSign className="size-3.5 text-sky-400" />
            {t("simulator.step3.revenueLabel")}
          </div>
          <span className="text-right font-semibold text-sky-400">R$ {revenueBRL.toFixed(2)}</span>

          <div className="flex items-center gap-1.5 text-muted-foreground">
            <DollarSign className="size-3.5 text-rose-400" />
            {t("simulator.step3.costLabel")}
          </div>
          <span className="text-right font-semibold text-rose-400">- R$ {costBRL.toFixed(2)}</span>

          <span className="text-muted-foreground font-semibold border-t border-border pt-2">{t("simulator.step3.profitLabel")}</span>
          <span className={cn(
            "text-right font-bold text-sm border-t border-border pt-2",
            profitBRL >= 0 ? "text-primary" : "text-rose-400",
          )}>
            R$ {profitBRL.toFixed(2)}
          </span>
        </div>
      </div>

      <Button
        onClick={handleConfirm}
        className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 w-full font-bold"
      >
        <CheckCircle2 className="size-4" />
        {t("simulator.step3.confirm")}
      </Button>
    </div>
  )
}

// ─── Step 4: Sucesso ───────────────────────────────────────────────────────────

function Step4Success() {
  const { state, dispatch } = useApp()
  const { t } = useLang()
  const last = state.lastDiscard

  function handleReset() {
    dispatch({ type: "RESET_SIMULATOR" })
  }

  if (!last) return null

  const rate = RATES[last.material]

  return (
    <div className="flex flex-col items-center gap-5 py-4">
      {/* Animated success ring */}
      <div className="relative flex items-center justify-center size-24">
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: "2s" }} />
        <div className="size-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
          <CheckCircle2 className="size-10 text-primary" />
        </div>
      </div>

      <div className="text-center">
        <p className="text-xl font-bold text-foreground">{t("simulator.step4.title")}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {t("simulator.step4.description")}
        </p>
      </div>

      {/* Receipt */}
      <div className="w-full rounded-2xl border border-primary/30 bg-primary/5 p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t("simulator.step4.user")}</span>
          <span className="font-semibold text-foreground">{last.userName}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t("simulator.step4.material")}</span>
          <span className="font-semibold text-foreground">{rate.label}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t("simulator.step4.weight")}</span>
          <span className="font-semibold text-foreground">{last.weightKg.toFixed(3)} kg</span>
        </div>
        <Separator className="opacity-30" />
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{t("simulator.step4.tokens")}</span>
          <span className="text-xl font-bold emerald-text">+{last.tokensEarned} $GREEN</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t("simulator.step4.revenue")}</span>
          <span className="font-semibold text-sky-400">R$ {last.revenueBRL.toFixed(2)}</span>
        </div>
      </div>

      <p className="text-xs text-center text-muted-foreground px-4">
        {t("simulator.step4.syncNote")}
      </p>

      <Button
        onClick={handleReset}
        variant="outline"
        className="gap-2 border-primary/40 text-primary hover:bg-primary/10"
      >
        <RotateCcw className="size-4" />
        {t("simulator.step4.reset")}
      </Button>
    </div>
  )
}

// ─── Simulador principal ───────────────────────────────────────────────────────

export function BinSimulator() {
  const { state } = useApp()
  const { t } = useLang()
  const step = state.simulatorStep

  const [material, setMaterial] = useState<MaterialType>("plastico")
  const [weightGrams, setWeightGrams] = useState("")
  const [binId, setBinId] = useState(state.bins.find(b => b.status === "disponivel")?.id ?? "b1")

  const weightKg = parseFloat(weightGrams) || 0

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="p-2.5 bg-primary/15 rounded-xl">
            <Cpu className="size-5 text-primary" />
          </div>
          <div className="absolute -top-1 -right-1 size-3 bg-primary rounded-full border-2 border-background">
            <div className="size-full rounded-full bg-primary animate-ping" style={{ animationDuration: "2s" }} />
          </div>
        </div>
        <div>
          <h2 className="font-bold text-foreground text-lg leading-tight">{t("simulator.title")}</h2>
          <p className="text-xs text-muted-foreground">{t("simulator.subtitle")}</p>
        </div>
        <Badge className="ml-auto bg-sky-400/15 text-sky-400 border-sky-400/30 text-xs neon-border">
          {t("simulator.online")}
        </Badge>
      </div>

      {/* Step bar */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <StepBar current={step} />
        </CardContent>
      </Card>

      {/* Step content */}
      <Card className={step === 4 ? "border-primary/30 bg-primary/5" : ""}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-mono">
            {t("simulator.stepOf", { step })}
          </CardTitle>
          <CardDescription className="text-xs">
            {t(`simulator.stepDescriptions.${step}`)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && <Step1Auth />}
          {step === 2 && (
            <Step2Data
              material={material}
              setMaterial={setMaterial}
              weightGrams={weightGrams}
              setWeightGrams={setWeightGrams}
              binId={binId}
              setBinId={setBinId}
            />
          )}
          {step === 3 && (
            <Step3Processing material={material} weightKg={weightKg} binId={binId} />
          )}
          {step === 4 && <Step4Success />}
        </CardContent>
      </Card>

      {/* Info footer */}
      <p className="text-center text-xs text-muted-foreground px-4 leading-relaxed">
        {t("simulator.footer")}
      </p>
    </div>
  )
}
