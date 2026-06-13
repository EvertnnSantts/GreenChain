// app/api/users/me/history/route.ts
// GET /api/users/me/history — histórico de descartes paginado

import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, ERRORS, requireAuth } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  const auth = await requireAuth()
  if (!auth) return ERRORS.UNAUTHORIZED()

  const { searchParams } = request.nextUrl
  const page     = Math.max(1, Number(searchParams.get("page")  ?? 1))
  const limit    = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)))
  const material = searchParams.get("material") as string | null
  const skip     = (page - 1) * limit

  const where = {
    userId:   auth.id,
    ...(material && { material: material as any }),
  }

  const [discards, total] = await Promise.all([
    db.discard.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
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
    }),
    db.discard.count({ where }),
  ])

  return ok({
    discards: discards.map(d => ({
      ...d,
      weightKg:     Number(d.weightKg),
      tokensEarned: Number(d.tokensEarned),
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext:    page * limit < total,
    },
  })
}
