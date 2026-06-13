// app/api/users/me/route.ts
// GET  /api/users/me  — perfil do usuário autenticado
// PATCH /api/users/me — atualizar nome, email, avatar

import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import {
  ok, ERRORS,
  requireAuth,
  updateUserSchema,
  calculateLevel,
  calculateStreakBonus,
} from "@/lib/api-helpers"

export async function GET() {
  const auth = await requireAuth()
  if (!auth) return ERRORS.UNAUTHORIZED()

  const user = await db.user.findUnique({
    where:  { id: auth.id },
    select: {
      id:            true,
      wallet:        true,
      name:          true,
      email:         true,
      avatarUrl:     true,
      level:         true,
      role:          true,
      tokenBalance:  true,
      totalWeightKg: true,
      streakDays:    true,
      ranking:       true,
      createdAt:     true,
      _count:        { select: { discards: true } },
    },
  })

  if (!user) return ERRORS.NOT_FOUND()

  // Calcular progresso diário real (soma dos descartes confirmados hoje)
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const todayDiscards = await db.discard.findMany({
    where: {
      userId: user.id,
      createdAt: { gte: startOfToday },
      status: "CONFIRMED",
    },
    select: {
      material: true,
      weightKg: true,
    },
  })

  const dailyProgress = {
    plastico: 0,
    vidro:    0,
    metal:    0,
    papel:    0,
  }

  for (const d of todayDiscards) {
    const mat = d.material.toLowerCase() as keyof typeof dailyProgress
    if (mat in dailyProgress) {
      dailyProgress[mat] += Number(d.weightKg)
    }
  }

  const totalKg   = Number(user.totalWeightKg)
  const levelInfo = calculateLevel(totalKg)
  const streak    = calculateStreakBonus(user.streakDays)

  // Obter últimos descartes do usuário
  const recentDiscards = await db.discard.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id:           true,
      material:     true,
      weightKg:     true,
      tokensEarned: true,
      txHash:       true,
      status:       true,
      createdAt:    true,
      bin: {
        select: {
          id:       true,
          location: true,
        },
      },
    },
  })

  return ok({
    ...user,
    tokenBalance:  Number(user.tokenBalance),
    totalWeightKg: totalKg,
    totalDiscards: user._count.discards,
    dailyProgress,
    discards: recentDiscards,
    levelInfo,
    streakBonus:   streak,
  })
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth()
  if (!auth) return ERRORS.UNAUTHORIZED()

  const body   = await request.json()
  const parsed = updateUserSchema.safeParse(body)

  if (!parsed.success) {
    return ERRORS.VALIDATION(parsed.error.issues[0].message)
  }

  const updated = await db.user.update({
    where: { id: auth.id },
    data:  parsed.data,
    select: {
      id:        true,
      wallet:    true,
      name:      true,
      email:     true,
      avatarUrl: true,
    },
  })

  return ok(updated)
}
