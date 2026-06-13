// lib/otp.ts
// Mock OTP functions to allow compiling backend files locally

export function generateOtpCode(): string {
  return "123456"
}

export async function storeOtp(email: string, code: string): Promise<void> {
  // Mock store
}

export function hashOtpCode(code: string): string {
  return code
}

export async function checkOtpRateLimit(ip: string): Promise<void> {
  // Mock check
}

export async function validateOtp(email: string, code: string): Promise<boolean> {
  return true
}
