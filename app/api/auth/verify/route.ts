// app/api/auth/verify/route.ts
// POST /api/auth/verify
// Verifica assinatura SIWE e cria/atualiza usuário no banco

import { NextRequest } from "next/server"
import { SiweMessage } from "siwe"
import { getAddress } from "viem"
import { db } from "@/lib/db"
import { redis, REDIS_KEYS } from "@/lib/redis"
import { ok, err, ERRORS } from "@/lib/api-helpers"
import { calculateLevel } from "@/lib/api-helpers"
import { z } from "zod"

const verifySchema = z.object({
  message:   z.string().min(1),
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/, "Assinatura inválida"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = verifySchema.safeParse(body)

    if (!parsed.success) {
      return err("VALIDATION_ERROR", parsed.error.issues[0].message, 422)
    }

    const { message, signature } = parsed.data

    // 1. Parse da mensagem SIWE
    let siweMessage: SiweMessage
    try {
      siweMessage = new SiweMessage(JSON.parse(message))
    } catch {
      return err("INVALID_MESSAGE", "Formato de mensagem SIWE inválido", 400)
    }

    // 2. Verificar nonce no Redis
    const walletLower = siweMessage.address.toLowerCase()
    const storedNonce = await redis.get<string>(REDIS_KEYS.siweNonce(walletLower))

    if (!storedNonce || storedNonce !== siweMessage.nonce) {
      return err("INVALID_NONCE", "Nonce inválido ou expirado. Gere um novo.", 401)
    }

    // 3. Verificar assinatura
    let result: Awaited<ReturnType<typeof siweMessage.verify>>
    try {
      result = await siweMessage.verify({
        signature,
        domain: new URL(process.env.NEXTAUTH_URL!).host,
        nonce:  siweMessage.nonce,
      })
    } catch {
      return err("SIGNATURE_ERROR", "Assinatura inválida", 401)
    }

    if (!result.success) {
      return err("SIGNATURE_FAILED", "Verificação de assinatura falhou", 401)
    }

    // 4. Limpar nonce (one-time use)
    await redis.del(REDIS_KEYS.siweNonce(walletLower))

    // 5. Checksummed address (EIP-55)
    const checksummedWallet = getAddress(siweMessage.address)

    // 6. Upsert do usuário
    const user = await db.user.upsert({
      where:  { wallet: checksummedWallet },
      create: { wallet: checksummedWallet },
      update: { updatedAt: new Date() },
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
      },
    })

    // 7. Calcular level atualizado baseado no peso total
    const { level } = calculateLevel(Number(user.totalWeightKg))
    if (level !== user.level) {
      await db.user.update({
        where: { id: user.id },
        data:  { level },
      })
    }

    return ok({
      user: {
        ...user,
        level,
        tokenBalance:  Number(user.tokenBalance),
        totalWeightKg: Number(user.totalWeightKg),
      },
    }, 200)

  } catch (error) {
    console.error("[/api/auth/verify] Erro:", error)
    return ERRORS.SERVER_ERROR()
  }
}
