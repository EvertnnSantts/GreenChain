// app/api/company/stats/route.ts
// GET /api/company/stats — métricas agregadas para o dashboard da empresa

import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, ERRORS, requireAuth } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  const auth = await requireAuth()
  if (!auth) return ERRORS.UNAUTHORIZED()
  if (auth.role !== "SUPER_ADMIN" && auth.role !== "COMPANY_ADMIN") {
    return ERRORS.FORBIDDEN()
  }

  const companyId = request.nextUrl.searchParams.get("companyId")

  // Agregações em paralelo para performance
  const [
    totalDiscards,
    totalUsers,
    binsStats,
    materialBreakdown,
    tokenStats,
    recentDiscards,
  ] = await Promise.all([
    // Total de descartes confirmados
    db.discard.aggregate({
      where:   { status: "CONFIRMED", bin: { companyId: companyId ?? undefined } },
      _sum:    { weightKg: true, tokensEarned: true },
      _count:  { id: true },
    }),

    // Usuários únicos que descartaram
    db.discard.findMany({
      where:    { status: "CONFIRMED", bin: { companyId: companyId ?? undefined } },
      distinct: ["userId"],
      select:   { userId: true },
    }),

    // Status das lixeiras
    db.smartBin.groupBy({
      by:      ["status"],
      where:   { companyId: companyId ?? undefined },
      _count:  { id: true },
    }),

    // Breakdown por material
    db.discard.groupBy({
      by:     ["material"],
      where:  { status: "CONFIRMED", bin: { companyId: companyId ?? undefined } },
      _sum:   { weightKg: true, tokensEarned: true },
      _count: { id: true },
    }),

    // Tokens emitidos no total
    db.user.aggregate({ _sum: { tokenBalance: true } }),

    // Últimos 30 descartes para receita por mês
    db.discard.findMany({
      where:   { status: "CONFIRMED", bin: { companyId: companyId ?? undefined } },
      orderBy: { createdAt: "desc" },
      take:    500,
      select:  { weightKg: true, tokensEarned: true, material: true, createdAt: true },
    }),
  ])

  // Calcular receita por mês (últimos 6 meses)
  const REVENUE_PER_KG: Record<string, number> = {
    PLASTICO: 2.00, VIDRO: 1.50, METAL: 5.00, PAPEL: 0.80,
  }
  const TOKEN_BRL_RATE = 0.15

  const monthlyMap = new Map<string, { revenue: number; cost: number; month: string }>()

  for (const d of recentDiscards) {
    const month = d.createdAt.toISOString().slice(0, 7) // "2025-06"
    const label = new Date(d.createdAt).toLocaleDateString("pt-BR", { month: "short" })
    const kg    = Number(d.weightKg)
    const revenue = kg * (REVENUE_PER_KG[d.material] ?? 0)
    const cost    = Number(d.tokensEarned) * TOKEN_BRL_RATE

    const entry = monthlyMap.get(month) ?? { revenue: 0, cost: 0, month: label }
    entry.revenue += revenue
    entry.cost    += cost
    monthlyMap.set(month, entry)
  }

  const revenueHistory = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([, v]) => ({
      label:   v.month,
      revenue: Math.round(v.revenue * 100) / 100,
      cost:    Math.round(v.cost    * 100) / 100,
    }))

  const totalWeightKg = Number(totalDiscards._sum.weightKg ?? 0)
  const totalTokens   = Number(totalDiscards._sum.tokensEarned ?? 0)

  return ok({
    overview: {
      totalDiscards:      totalDiscards._count.id,
      totalUsers:         totalUsers.length,
      totalWeightKg:      Math.round(totalWeightKg * 1000) / 1000,
      totalCollectedTons: Math.round(totalWeightKg / 10) / 100,
      totalTokensIssued:  Math.round(totalTokens * 100) / 100,
      totalRevenueBRL:    Math.round(totalWeightKg * 2.5 * 100) / 100, // estimativa média
    },
    binsStatus: binsStats.map(b => ({
      status: b.status,
      count:  b._count.id,
    })),
    materialBreakdown: materialBreakdown.map(m => ({
      material:     m.material,
      kg:           Number(m._sum.weightKg ?? 0),
      tokens:       Number(m._sum.tokensEarned ?? 0),
      totalDiscards: m._count.id,
    })),
    revenueHistory,
  })
}
