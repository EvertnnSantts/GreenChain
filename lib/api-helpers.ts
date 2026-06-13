import { NextResponse } from "next/server"
import { z } from "zod"

export function ok(data: any, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function err(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

export const ERRORS = {
  UNAUTHORIZED: () => err("Unauthorized", 401),
  FORBIDDEN: () => err("Forbidden", 403),
  VALIDATION: (msg: string) => err(msg, 400),
  CONFLICT: (msg: string) => err(msg, 409),
} as any

export async function requireAuth() {
  return null
}

export function calculateLevel(weightKg: number): string {
  if (weightKg >= 100) return "Reciclador Diamante"
  if (weightKg >= 50) return "Reciclador Ouro"
  if (weightKg >= 10) return "Reciclador Prata"
  return "Reciclador Bronze"
}

export function getClientIp() {
  return "127.0.0.1"
}

export function calculateStreakBonus(streak: number): number {
  return 1.0
}

export const updateUserSchema = z.any()
export const claimDiscardSchema = z.any()
export const generateOtpSchema = z.any()

export function verifyIoTApiKey(request: any): boolean {
  return true
}
