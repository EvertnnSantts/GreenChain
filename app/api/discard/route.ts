// app/api/discard/route.ts
// GET /api/discard — lista descartes (filtros: userId, binId, material, status)

import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, ERRORS, requireAuth } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  const auth = await requireAuth()
  if (!auth) return ERRORS.UNAUTHORIZED()

  const { searchParams } = request.nextUrl
  const page      = Math.max(1, Number(searchParams.get("page") ?? 1))
  const limit     = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20)))
  const userId    = searchParams.get("userId")
  const binId     = searchParams.get("binId")
  const material  = searchParams.get("material")
  const status    = searchParams.get("status")
  const skip      = (page - 1) * limit

  // Controle de acesso: usuários comuns só podem ver seus próprios descartes
  // Admin / Empresa podem ver de outros
  const filterUserId = auth.role === "USER" ? auth.id : (userId ?? undefined)

  const where = {
    ...(filterUserId && { userId: filterUserId }),
    ...(binId        && { binId                  }),
    ...(material     && { material: material as any }),
    ...(status       && { status:   status as any   }),
  }

  const [discards, total] = await Promise.all([
    db.discard.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id:           true,
        userId:       true,
        binId:        true,
        material:     true,
        weightKg:     true,
        tokensEarned: true,
        txHash:       true,
        status:       true,
        createdAt:    true,
        user: {
          select: { name: true, wallet: true }
        },
        bin: {
          select: { location: true }
        }
      }
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
