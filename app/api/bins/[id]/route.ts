// app/api/bins/[id]/route.ts
// GET   /api/bins/:id — detalhes de uma lixeira
// PATCH /api/bins/:id — atualiza status/capacidade (IoT ou Admin)

import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, ERRORS, verifyIoTApiKey, requireAuth } from "@/lib/api-helpers"
import { z } from "zod"

const updateBinSchema = z.object({
  status:      z.enum(["AVAILABLE", "FULL", "MAINTENANCE", "OFFLINE"]).optional(),
  capacityPct: z.number().int().min(0).max(100).optional(),
  lat:         z.number().optional(),
  lng:         z.number().optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const resolvedParams = params instanceof Promise ? await params : params
  const { id } = resolvedParams

  const bin = await db.smartBin.findUnique({
    where: { id },
    select: {
      id:          true,
      location:    true,
      status:      true,
      capacityPct: true,
      lat:         true,
      lng:         true,
      lastSyncAt:  true,
      company:     { select: { id: true, name: true } },
      _count:      { select: { discards: true } },
    },
  })

  if (!bin) return ERRORS.NOT_FOUND()

  return ok({ ...bin, totalDiscards: bin._count.discards })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  // Aceita autenticação por API Key (IoT) ou sessão de admin
  const isIoT   = verifyIoTApiKey(request)
  const auth    = !isIoT ? await requireAuth() : null

  if (!isIoT && (!auth || (auth.role !== "SUPER_ADMIN" && auth.role !== "COMPANY_ADMIN"))) {
    return ERRORS.UNAUTHORIZED()
  }

  const resolvedParams = params instanceof Promise ? await params : params
  const { id } = resolvedParams

  const body   = await request.json()
  const parsed = updateBinSchema.safeParse(body)
  if (!parsed.success) return ERRORS.VALIDATION(parsed.error.issues[0].message)

  const bin = await db.smartBin.update({
    where: { id },
    data:  { ...parsed.data, lastSyncAt: new Date() },
    select: {
      id: true, status: true, capacityPct: true, lastSyncAt: true,
    },
  })

  return ok(bin)
}
