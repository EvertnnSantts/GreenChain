// app/api/discard/[id]/route.ts
// GET /api/discard/:id — detalhes de um descarte específico

import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, ERRORS, requireAuth } from "@/lib/api-helpers"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const auth = await requireAuth()
  if (!auth) return ERRORS.UNAUTHORIZED()

  // Suporte a params assíncronos no Next.js 15+ e síncronos em testes
  const resolvedParams = params instanceof Promise ? await params : params
  const { id } = resolvedParams

  const discard = await db.discard.findUnique({
    where: { id },
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
        select: { id: true, name: true, wallet: true }
      },
      bin: {
        select: { location: true, capacityPct: true }
      }
    }
  })

  if (!discard) return ERRORS.NOT_FOUND()

  // Controle de acesso: usuário comum só pode ver seus próprios descartes
  if (auth.role === "USER" && discard.userId !== auth.id) {
    return ERRORS.FORBIDDEN()
  }

  return ok({
    ...discard,
    weightKg:     Number(discard.weightKg),
    tokensEarned: Number(discard.tokensEarned),
  })
}
