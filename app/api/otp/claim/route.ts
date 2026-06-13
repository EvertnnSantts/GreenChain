// app/api/otp/claim/route.ts
// POST /api/otp/claim
// Usuário autentica com OTP + dados do descarte → backend valida e minta tokens

import { NextRequest } from "next/server"
import { keccak256, encodePacked, getAddress } from "viem"
import { db } from "@/lib/db"
import { validateOtp, checkOtpRateLimit } from "@/lib/otp"
import { getGreenRewardsContract, kgToGrams, tokensFromWei } from "@/lib/contracts"
import {
  ok, err, ERRORS,
  requireAuth,
  getClientIp,
  claimDiscardSchema,
  calculateLevel,
  calculateStreakBonus,
} from "@/lib/api-helpers"

// Taxas de tokens por kg por material (espelho do Smart Contract)
const TOKENS_PER_KG: Record<string, number> = {
  PLASTICO: 5,
  VIDRO:    3,
  METAL:    12,
  PAPEL:    2,
}

export async function POST(request: NextRequest) {
  // 1. Verificar autenticação (sessão JWT)
  const auth = await requireAuth()
  if (!auth) return ERRORS.UNAUTHORIZED()

  const body   = await request.json()
  const parsed = claimDiscardSchema.safeParse(body)

  if (!parsed.success) {
    return ERRORS.VALIDATION(parsed.error.issues[0].message)
  }

  const { otpCode, otpSessionId, walletAddress, material, weightKg, binId } = parsed.data

  // 2. Confirmar que a carteira da sessão bate com a enviada
  const checksummedWallet = getAddress(walletAddress)
  if (auth.wallet !== checksummedWallet) {
    return err("WALLET_MISMATCH", "Carteira não corresponde à sessão", 403)
  }

  // 3. Rate limit por IP — máximo 3 tentativas de OTP em 15 minutos
  const clientIp = getClientIp(request)
  const rateLimit = await checkOtpRateLimit(clientIp)

  if (!rateLimit.allowed) {
    return err(
      "RATE_LIMITED",
      `Muitas tentativas. Tente em ${Math.ceil(rateLimit.resetIn / 60)} minutos.`,
      429
    )
  }

  // 4. Validar OTP (verifica hash no Redis + flag de uso)
  const otpResult = await validateOtp(otpSessionId, otpCode)

  if (!otpResult.valid) {
    const messages: Record<string, string> = {
      not_found:     "Sessão OTP não encontrada ou expirada",
      expired:       "Código OTP expirado",
      already_used:  "Este código OTP já foi utilizado",
      invalid_code:  "Código OTP incorreto",
    }
    return err("OTP_INVALID", messages[otpResult.reason] ?? "OTP inválido", 400)
  }

  // 5. Verificar sessão OTP no banco (validação dupla + dados da lixeira)
  const otpSession = await db.otpSession.findUnique({
    where:  { id: otpSessionId },
    select: {
      id:        true,
      binId:     true,
      used:      true,
      expiresAt: true,
      discard:   true,
    },
  })

  if (!otpSession) return ERRORS.NOT_FOUND()

  if (otpSession.used || otpSession.discard) {
    return err("OTP_ALREADY_USED", "Este OTP já foi resgatado", 409)
  }

  if (new Date() > otpSession.expiresAt) {
    return err("OTP_EXPIRED", "Código OTP expirado", 400)
  }

  // 6. Confirmar que o binId da requisição bate com o da sessão OTP
  if (otpSession.binId !== binId) {
    return err("BIN_MISMATCH", "Lixeira não corresponde ao OTP", 400)
  }

  // 7. Buscar usuário com dados de nível
  const user = await db.user.findUnique({
    where:  { id: auth.id },
    select: {
      id:            true,
      wallet:        true,
      totalWeightKg: true,
      tokenBalance:  true,
      streakDays:    true,
      lastDiscardAt: true,
    },
  })

  if (!user) return ERRORS.NOT_FOUND()

  // 8. Calcular tokens com multiplicadores (nível + streak)
  const baseTokensPerKg  = TOKENS_PER_KG[material] ?? 0
  const totalWeightKg    = Number(user.totalWeightKg)
  const { multiplier }   = calculateLevel(totalWeightKg)
  const streakBonus      = calculateStreakBonus(user.streakDays)
  const finalMultiplier  = multiplier + streakBonus
  const tokensEarned     = Math.round(baseTokensPerKg * weightKg * finalMultiplier * 100) / 100

  // 9. Gerar contractId único para anti-replay no Smart Contract
  //    keccak256(binId + userId + minuto atual)
  const minute     = Math.floor(Date.now() / 60_000)
  const contractId = keccak256(
    encodePacked(
      ["string", "string", "uint256"],
      [binId, user.id, BigInt(minute)]
    )
  )

  // 10. Registrar descarte como PENDING antes de chamar o contrato
  const discard = await db.discard.create({
    data: {
      userId:       auth.id,
      binId,
      material:     material as any,
      weightKg,
      tokensEarned,
      status:       "PENDING",
      contractId,
      otpSessionId,
    },
    select: { id: true },
  })

  // 11. Marcar sessão OTP como usada no banco
  await db.otpSession.update({
    where: { id: otpSessionId },
    data:  { used: true, usedBy: auth.id },
  })

  // 12. Chamar Smart Contract GreenRewards.claimReward()
  let txHash: string | null = null
  let contractSuccess = false

  try {
    const rewards     = getGreenRewardsContract()
    const weightGrams = kgToGrams(weightKg)

    const hash = await rewards.write.claimReward([
      contractId as `0x${string}`,
      checksummedWallet as `0x${string}`,
      binId,
      material,
      weightGrams,
    ])

    txHash = hash
    contractSuccess = true
  } catch (contractErr: any) {
    console.error("[OTP/claim] Erro no contrato:", contractErr?.message)
    // Em ambiente de desenvolvimento sem contrato deployado, continua sem tx
    if (process.env.NODE_ENV !== "production") {
      contractSuccess = true // modo dev: simula sucesso
    }
  }

  // 13. Atualizar descarte com resultado do contrato
  const newStatus = contractSuccess ? "CONFIRMED" : "FAILED"

  await db.discard.update({
    where: { id: discard.id },
    data:  {
      status: newStatus,
      txHash: txHash ?? undefined,
    },
  })

  if (!contractSuccess) {
    return err("CONTRACT_ERROR", "Erro ao processar transação na blockchain", 500)
  }

  // 14. Atualizar saldo e peso do usuário off-chain (espelho para UX rápida)
  const now          = new Date()
  const lastDiscard  = user.lastDiscardAt
  const isConsecutive =
    lastDiscard &&
    now.getTime() - lastDiscard.getTime() < 2 * 24 * 60 * 60 * 1000

  await db.user.update({
    where: { id: auth.id },
    data: {
      tokenBalance:  { increment: tokensEarned   },
      totalWeightKg: { increment: weightKg        },
      lastDiscardAt: now,
      streakDays:    isConsecutive ? { increment: 1 } : 1,
      // Recalcular level
      level: calculateLevel(totalWeightKg + weightKg).level,
    },
  })

  // 15. Atualizar capacidade da lixeira
  const bin = await db.smartBin.findUnique({ where: { id: binId } })
  if (bin) {
    const newCapacity = Math.min(100, bin.capacityPct + Math.round(weightKg * 5))
    await db.smartBin.update({
      where: { id: binId },
      data:  {
        capacityPct: newCapacity,
        status:      newCapacity >= 95 ? "FULL" : bin.status,
        lastSyncAt:  now,
      },
    })
  }

  return ok({
    success:      true,
    discardId:    discard.id,
    txHash,
    tokensEarned,
    multiplier:   finalMultiplier,
    newBalance:   Number(user.tokenBalance) + tokensEarned,
    material,
    weightKg,
    message:      `✅ +${tokensEarned} $GREEN creditados na sua carteira!`,
  }, 201)
}
