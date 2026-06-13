// app/api/otp/generate/route.ts
// POST /api/otp/generate
// Chamado pelas lixeiras IoT para gerar OTP de 6 dígitos
// Autenticado por API Key (Header: x-api-key)

import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { generateOtpCode, storeOtp } from "@/lib/otp"
import {
  ok, err, ERRORS,
  verifyIoTApiKey,
  generateOtpSchema,
} from "@/lib/api-helpers"

export async function POST(request: NextRequest) {
  // 1. Verificar API Key da lixeira
  if (!verifyIoTApiKey(request)) {
    return ERRORS.UNAUTHORIZED()
  }

  const body   = await request.json()
  const parsed = generateOtpSchema.safeParse(body)

  if (!parsed.success) {
    return ERRORS.VALIDATION(parsed.error.issues[0].message)
  }

  const { binId } = parsed.data

  // 2. Verificar se a lixeira existe e está disponível
  const bin = await db.smartBin.findUnique({
    where:  { id: binId },
    select: { id: true, status: true, location: true },
  })

  if (!bin) {
    return ERRORS.NOT_FOUND()
  }

  if (bin.status === "FULL") {
    return err("BIN_FULL", "Lixeira cheia — não aceita novos descartes", 409)
  }

  if (bin.status === "MAINTENANCE" || bin.status === "OFFLINE") {
    return err("BIN_UNAVAILABLE", "Lixeira em manutenção ou offline", 409)
  }

  // 3. Gerar OTP e criar sessão no banco
  const code = generateOtpCode()

  // Calcular expiração: agora + 5 minutos
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

  // Gerar hash para armazenar no banco (nunca o plain text)
  const { hashOtpCode } = await import("@/lib/otp")
  const codeHash = hashOtpCode(code)

  // Salvar sessão OTP no banco
  const session = await db.otpSession.create({
    data: {
      binId,
      codeHash,
      expiresAt,
    },
    select: { id: true, expiresAt: true },
  })

  // 4. Armazenar hash no Redis para validação rápida (com TTL)
  await storeOtp(session.id, code)

  // 5. Retornar OTP plain text APENAS para a lixeira exibir na tela
  //    O backend nunca mais vai ver este valor
  return ok({
    otp:       code,           // ← lixeira exibe este valor na tela
    sessionId: session.id,     // ← app usa este ID para clicar em claim
    expiresAt: session.expiresAt.toISOString(),
    binId:     bin.id,
    location:  bin.location,
  }, 201)
}
