"use client"

import React from "react"
import "@rainbow-me/rainbowkit/styles.css"
import { getDefaultConfig, RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit"
import { WagmiProvider } from "wagmi"
import { celo, celoAlfajores } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// Configure Wagmi/RainbowKit for Celo networks
// We use a placeholder project ID for local development.
const config = getDefaultConfig({
  appName: "GreenChain",
  projectId: "3fcc6bba6f1b848695f87b8d4f6c4ff5", // Public test projectId or placeholder
  chains: [celo, celoAlfajores],
  ssr: true,
})

const queryClient = new QueryClient()

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "oklch(0.72 0.18 160)", // Custom Emerald brand color matchingglobals.css
            accentColorForeground: "oklch(0.10 0.01 160)",
            borderRadius: "large",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
