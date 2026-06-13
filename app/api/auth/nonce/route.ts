// app/api/auth/nonce/route.ts
// GET /api/auth/nonce
// Gera um nonce único para a mensagem SIWE — previne replay attacks

import { NextRequest } from "next/server"
import { generateNonce } from "siwe"
import { redis, REDIS_KEYS, REDIS_TTL } from "@/lib/redis"
import { ok, err, getClientIp } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  try {
    // Extrair endereço da query string (?address=0x...)
    const address = request.nextUrl.searchParams.get("address")?.toLowerCase()

    if (!address || !/^0x[a-f0-9]{40}$/.test(address)) {
      return err("INVALID_ADDRESS", "Endereço de carteira inválido", 400)
    }

    // Gerar nonce criptograficamente seguro
    const nonce = generateNonce()

    // Armazenar no Redis com TTL de 10 minutos
    await redis.set(REDIS_KEYS.siweNonce(address), nonce, {
      ex: REDIS_TTL.siweNonce,
    })

    return ok({ nonce })
  } catch (error) {
    console.error("[/api/auth/nonce] Erro:", error)
    return err("SERVER_ERROR", "Erro ao gerar nonce", 500)
  }
}
