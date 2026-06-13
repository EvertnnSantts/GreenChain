"use client"

import React, { createContext, useContext, useReducer, useCallback, useEffect } from "react"
import { useAccount } from "wagmi"

// ─── TYPES ─────────────────────────────────────────────────────────────────

export type MaterialType = "plastico" | "vidro" | "metal" | "papel"

export interface DiscardEntry {
  id: string
  userId: string
  date: string          // ISO string
  material: MaterialType
  weightKg: number
  tokensEarned: number
  binId: string
}

export interface User {
  id: string
  name: string
  wallet: string        // endereço simulado da carteira cripto
  level: string
  ranking: number
  tokenBalance: number  // saldo em $GREEN
  totalWeightKg: number
  // metas diárias (kg descartados hoje por material)
  dailyProgress: { plastico: number; vidro: number; metal: number; papel: number }
  history: DiscardEntry[]
}

export interface SmartBin {
  id: string
  location: string
  status: "disponivel" | "cheia" | "manutencao"
  capacityPct: number   // 0–100 % de ocupação
}

export interface CompanyStats {
  totalRevenueBRL: number
  totalBinsActive: number
  totalCollectedTons: number
  totalTokensIssued: number
  revenueHistory: { label: string; revenue: number; cost: number }[]
  materialBreakdown: { material: MaterialType; kg: number }[]
}

export interface AppState {
  users: User[]
  bins: SmartBin[]
  company: CompanyStats
  activeSimulatorUserId: string
  simulatorStep: number   // 1 = autenticação, 2 = dados, 3 = processando, 4 = sucesso
  lastDiscard: {
    tokensEarned: number
    revenueBRL: number
    userName: string
    material: MaterialType
    weightKg: number
  } | null
}

export type AppAction =
  | { type: "SET_SIMULATOR_USER"; userId: string }
  | { type: "SET_SIMULATOR_STEP"; step: number }
  | { type: "PROCESS_DISCARD"; userId: string; material: MaterialType; weightKg: number; binId: string }
  | { type: "RESET_SIMULATOR" }
  | { type: "SYNC_WEB3_USER"; address: string }


// ─── CONVERSION RATES ──────────────────────────────────────────────────────

export const RATES: Record<MaterialType, { tokensPerKg: number; revenueBRLperKg: number; label: string }> = {
  plastico: { tokensPerKg: 5,  revenueBRLperKg: 2.00, label: "Plástico"  },
  vidro:    { tokensPerKg: 3,  revenueBRLperKg: 1.50, label: "Vidro"     },
  metal:    { tokensPerKg: 12, revenueBRLperKg: 5.00, label: "Metal/Alumínio" },
  papel:    { tokensPerKg: 2,  revenueBRLperKg: 0.80, label: "Papel"     },
}

// Token value in BRL (1 $GREEN = R$ 0.15)
export const TOKEN_BRL_RATE = 0.15

// CO2 savings per kg of recycled material (kg CO2 avoided)
export const CO2_PER_KG: Record<MaterialType, number> = {
  plastico: 1.8,
  vidro:    0.6,
  metal:    4.0,
  papel:    1.3,
}

// ─── INITIAL STATE ─────────────────────────────────────────────────────────

const initialHistory: DiscardEntry[] = [
  { id: "d1", userId: "u1", date: "2025-06-08T09:00:00Z", material: "plastico", weightKg: 1.2, tokensEarned: 6,  binId: "b1" },
  { id: "d2", userId: "u1", date: "2025-06-08T14:30:00Z", material: "metal",    weightKg: 0.5, tokensEarned: 6,  binId: "b2" },
  { id: "d3", userId: "u1", date: "2025-06-09T08:15:00Z", material: "vidro",    weightKg: 0.8, tokensEarned: 2,  binId: "b1" },
  { id: "d4", userId: "u1", date: "2025-06-10T11:00:00Z", material: "papel",    weightKg: 2.0, tokensEarned: 4,  binId: "b3" },
  { id: "d5", userId: "u2", date: "2025-06-09T10:00:00Z", material: "plastico", weightKg: 0.9, tokensEarned: 5,  binId: "b1" },
  { id: "d6", userId: "u2", date: "2025-06-10T13:00:00Z", material: "metal",    weightKg: 1.5, tokensEarned: 18, binId: "b2" },
]

const initialUsers: User[] = [
  {
    id: "u1",
    name: "Ana Oliveira",
    wallet: "0x71C4...3A9F",
    level: "Reciclador Ouro",
    ranking: 1,
    tokenBalance: 340,
    totalWeightKg: 4.5,
    dailyProgress: { plastico: 1.2, vidro: 0.8, metal: 0.0, papel: 2.0 },
    history: initialHistory.filter(h => h.userId === "u1"),
  },
  {
    id: "u2",
    name: "Bruno Santos",
    wallet: "0xA2B9...8E1C",
    level: "Reciclador Prata",
    ranking: 2,
    tokenBalance: 183,
    totalWeightKg: 2.4,
    dailyProgress: { plastico: 0.9, vidro: 0.0, metal: 1.5, papel: 0.0 },
    history: initialHistory.filter(h => h.userId === "u2"),
  },
  {
    id: "u3",
    name: "Carla Mendes",
    wallet: "0xF3D0...7B44",
    level: "Reciclador Bronze",
    ranking: 3,
    tokenBalance: 52,
    totalWeightKg: 0.8,
    dailyProgress: { plastico: 0.0, vidro: 0.0, metal: 0.0, papel: 0.0 },
    history: [],
  },
]

const initialBins: SmartBin[] = [
  { id: "b1", location: "Av. Paulista, 1578 — Bela Vista",      status: "disponivel",  capacityPct: 42 },
  { id: "b2", location: "Rua Augusta, 300 — Consolação",        status: "disponivel",  capacityPct: 68 },
  { id: "b3", location: "Praça da Sé — Centro Histórico",       status: "cheia",       capacityPct: 97 },
  { id: "b4", location: "Av. Rebouças, 1045 — Pinheiros",       status: "disponivel",  capacityPct: 23 },
  { id: "b5", location: "Rua Oscar Freire, 800 — Jardins",      status: "manutencao",  capacityPct: 15 },
  { id: "b6", location: "Av. Brigadeiro Faria Lima, 2500 — Itaim", status: "disponivel", capacityPct: 55 },
]

function calcMaterialBreakdown(history: DiscardEntry[]): { material: MaterialType; kg: number }[] {
  const map: Record<MaterialType, number> = { plastico: 0, vidro: 0, metal: 0, papel: 0 }
  history.forEach(h => { map[h.material] += h.weightKg })
  return (Object.keys(map) as MaterialType[]).map(m => ({ material: m, kg: map[m] }))
}

const initialCompany: CompanyStats = {
  totalRevenueBRL: 3_842.50,
  totalBinsActive: 4,
  totalCollectedTons: 1.24,
  totalTokensIssued: 9_200,
  revenueHistory: [
    { label: "Jan", revenue: 520, cost: 210 },
    { label: "Fev", revenue: 680, cost: 275 },
    { label: "Mar", revenue: 890, cost: 340 },
    { label: "Abr", revenue: 760, cost: 295 },
    { label: "Mai", revenue: 1020, cost: 410 },
    { label: "Jun", revenue: 1250, cost: 480 },
  ],
  materialBreakdown: calcMaterialBreakdown(initialHistory),
}

const initialState: AppState = {
  users: initialUsers,
  bins: initialBins,
  company: initialCompany,
  activeSimulatorUserId: "u1",
  simulatorStep: 1,
  lastDiscard: null,
}

// ─── REDUCER ───────────────────────────────────────────────────────────────

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_SIMULATOR_USER":
      return { ...state, activeSimulatorUserId: action.userId }

    case "SET_SIMULATOR_STEP":
      return { ...state, simulatorStep: action.step }

    case "PROCESS_DISCARD": {
      const { userId, material, weightKg, binId } = action
      const rate = RATES[material]

      // Calcular tokens e receita
      const tokensEarned   = Math.round(rate.tokensPerKg * weightKg * 100) / 100
      const revenueBRL     = Math.round(rate.revenueBRLperKg * weightKg * 100) / 100
      // Custo = tokens pagos convertidos em BRL
      const costBRL        = Math.round(tokensEarned * TOKEN_BRL_RATE * 100) / 100

      const newEntry: DiscardEntry = {
        id: `d${Date.now()}`,
        userId,
        date: new Date().toISOString(),
        material,
        weightKg,
        tokensEarned,
        binId,
      }

      // Atualizar usuários
      const updatedUsers = state.users.map(u => {
        if (u.id !== userId) return u
        return {
          ...u,
          tokenBalance: Math.round((u.tokenBalance + tokensEarned) * 100) / 100,
          totalWeightKg: Math.round((u.totalWeightKg + weightKg) * 100) / 100,
          dailyProgress: {
            ...u.dailyProgress,
            [material]: Math.round((u.dailyProgress[material] + weightKg) * 100) / 100,
          },
          history: [newEntry, ...u.history],
        }
      })

      // Atualizar lixeira: aumentar capacidade
      const updatedBins = state.bins.map(b => {
        if (b.id !== binId) return b
        const newCap = Math.min(100, Math.round(b.capacityPct + weightKg * 5))
        return { ...b, capacityPct: newCap, status: newCap >= 95 ? "cheia" as const : b.status }
      })

      // Atualizar empresa
      const currentMonthEntry = state.company.revenueHistory[state.company.revenueHistory.length - 1]
      const updatedHistory = state.company.revenueHistory.map((entry, idx) => {
        if (idx !== state.company.revenueHistory.length - 1) return entry
        return {
          ...currentMonthEntry,
          revenue: Math.round((currentMonthEntry.revenue + revenueBRL) * 100) / 100,
          cost:    Math.round((currentMonthEntry.cost + costBRL) * 100) / 100,
        }
      })

      const updatedBreakdown = state.company.materialBreakdown.map(item =>
        item.material === material
          ? { ...item, kg: Math.round((item.kg + weightKg) * 100) / 100 }
          : item
      )

      const updatedCompany: CompanyStats = {
        ...state.company,
        totalRevenueBRL:    Math.round((state.company.totalRevenueBRL + revenueBRL) * 100) / 100,
        totalCollectedTons: Math.round((state.company.totalCollectedTons + weightKg / 1000) * 10000) / 10000,
        totalTokensIssued:  state.company.totalTokensIssued + tokensEarned,
        revenueHistory:     updatedHistory,
        materialBreakdown:  updatedBreakdown,
      }

      const user = state.users.find(u => u.id === userId)!

      return {
        ...state,
        users:        updatedUsers,
        bins:         updatedBins,
        company:      updatedCompany,
        simulatorStep: 4,
        lastDiscard: {
          tokensEarned,
          revenueBRL,
          userName: user.name,
          material,
          weightKg,
        },
      }
    }

    case "RESET_SIMULATOR":
      return { ...state, simulatorStep: 1, lastDiscard: null }

    case "SYNC_WEB3_USER": {
      const { address } = action
      const exists = state.users.some(u => u.id === "web3")
      if (exists) {
        return {
          ...state,
          users: state.users.map(u =>
            u.id === "web3" ? { ...u, wallet: address } : u
          ),
        }
      }
      const newWeb3User: User = {
        id: "web3",
        name: "Minha Carteira (Web3)",
        wallet: address,
        level: "Reciclador Blockchain",
        ranking: 1,
        tokenBalance: 0,
        totalWeightKg: 0,
        dailyProgress: { plastico: 0, vidro: 0, metal: 0, papel: 0 },
        history: [],
      }
      return {
        ...state,
        users: [newWeb3User, ...state.users],
        activeSimulatorUserId: state.activeSimulatorUserId === "u1" ? "web3" : state.activeSimulatorUserId,
      }
    }

    default:
      return state
  }
}

// ─── CONTEXT ───────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  activeUser: User
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  const { address, isConnected } = useAccount()

  useEffect(() => {
    if (isConnected && address) {
      dispatch({ type: "SYNC_WEB3_USER", address })
    }
  }, [isConnected, address])

  const activeUser = state.users.find(u => u.id === state.activeSimulatorUserId) ?? state.users[0]

  return (
    <AppContext.Provider value={{ state, dispatch, activeUser }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp deve ser usado dentro de <AppProvider>")
  return ctx
}

// Helper: CO2 total economizado de um usuário
export function calcUserCO2(user: User): number {
  return user.history.reduce((acc, h) => acc + CO2_PER_KG[h.material] * h.weightKg, 0)
}

// Helper: árvores salvas (1 árvore ~ 21kg CO2 / ano, estimativa)
export function calcTreesSaved(co2Kg: number): number {
  return Math.round((co2Kg / 21) * 100) / 100
}
