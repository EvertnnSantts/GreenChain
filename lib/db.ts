// lib/db.ts
// Mock Prisma client to allow compiling backend files locally

export const db = {
  smartBin: {
    findMany: async () => [],
    findUnique: async () => null,
    create: async () => ({}),
    update: async () => ({}),
  },
  user: {
    findMany: async () => [],
    findUnique: async () => null,
    findFirst: async () => null,
    create: async () => ({}),
    update: async () => ({}),
  },
  discardEntry: {
    findMany: async () => [],
    create: async () => ({}),
  },
  otpSession: {
    findUnique: async () => null,
    create: async () => ({}),
    delete: async () => ({}),
  }
} as any
