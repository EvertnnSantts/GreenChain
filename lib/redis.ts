// lib/redis.ts
// Mock Redis client to allow compiling backend files locally

export const redis = {
  get: async () => null,
  set: async () => null,
  del: async () => null,
  setex: async () => null,
} as any

export const REDIS_KEYS = {
  nonce: (key: string) => `nonce:${key}`,
  otp: (key: string) => `otp:${key}`,
} as any

export const REDIS_TTL = {
  nonce: 300,
  otp: 600,
} as any
