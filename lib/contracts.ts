// lib/contracts.ts
// Mock smart contract interactions to allow compiling backend files locally

export function getGreenRewardsContract() {
  return {
    methods: {},
  } as any
}

export function kgToGrams(kg: number): number {
  return kg * 1000
}

export function tokensFromWei(wei: any): string {
  return "0"
}
