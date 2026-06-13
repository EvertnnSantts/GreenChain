// app/api/bins/route.ts
// GET  /api/bins — lista todas as lixeiras
// POST /api/bins — cadastra nova lixeira (Admin)

import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { ok, err, ERRORS, requireAuth } from "@/lib/api-helpers"
import { z } from "zod"

const createBinSchema = z.object({
  id:        z.string().min(1).max(20),
  location:  z.string().min(5).max(200),
  companyId: z.string().cuid(),
  lat:       z.number().min(-90).max(90).optional(),
  lng:       z.number().min(-180).max(180).optional(),
})

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const status    = searchParams.get("status")
  const companyId = searchParams.get("companyId")

  const bins = await db.smartBin.findMany({
    where: {
      ...(status    && { status:    status    as any }),
      ...(companyId && { companyId: companyId        }),
    },
    orderBy: { createdAt: "asc" },
    select: {
      id:          true,
      location:    true,
      status:      true,
      capacityPct: true,
      lat:         true,
      lng:         true,
      lastSyncAt:  true,
      company: {
        select: { id: true, name: true },
      },
    },
  })

  return ok({ bins })
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth()
  if (!auth) return ERRORS.UNAUTHORIZED()
  if (auth.role !== "SUPER_ADMIN" && auth.role !== "COMPANY_ADMIN") {
    return ERRORS.FORBIDDEN()
  }

  const body   = await request.json()
  const parsed = createBinSchema.safeParse(body)
  if (!parsed.success) return ERRORS.VALIDATION(parsed.error.issues[0].message)

  // Verificar duplicata
  const existing = await db.smartBin.findUnique({ where: { id: parsed.data.id } })
  if (existing) return ERRORS.CONFLICT("ID de lixeira já cadastrado")

  const bin = await db.smartBin.create({
    data: parsed.data,
    select: {
      id: true, location: true, status: true,
      capacityPct: true, companyId: true,
    },
  })

  return ok(bin, 201)
}
