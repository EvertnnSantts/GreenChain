// app/api/users/leaderboard/route.ts
// GET /api/users/leaderboard — ranking global dos recicladores

import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, ERRORS } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  const limit = Math.min(100, Number(request.nextUrl.searchParams.get("limit") ?? 10))

  const users = await db.user.findMany({
    orderBy: { totalWeightKg: "desc" },
    take:    limit,
    select: {
      id:            true,
      wallet:        true,
      name:          true,
      avatarUrl:     true,
      level:         true,
      tokenBalance:  true,
      totalWeightKg: true,
      streakDays:    true,
      _count:        { select: { discards: true } },
    },
  })

  const leaderboard = users.map((u, index) => ({
    rank:          index + 1,
    id:            u.id,
    // Exibir apenas os primeiros 6 + últimos 4 caracteres da wallet
    wallet:        `${u.wallet.slice(0, 6)}...${u.wallet.slice(-4)}`,
    name:          u.name ?? "Reciclador Anônimo",
    avatarUrl:     u.avatarUrl,
    level:         u.level,
    tokenBalance:  Number(u.tokenBalance),
    totalWeightKg: Number(u.totalWeightKg),
    streakDays:    u.streakDays,
    totalDiscards: u._count.discards,
  }))

  return ok({ leaderboard })
}
