"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import { useLang } from "@/lib/lang-context"

export function ConnectWalletButton({ compact = false }: { compact?: boolean }) {
  const { t } = useLang()

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading"
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated")

        if (!ready) {
          return (
            <div
              aria-hidden={true}
              className="opacity-0 pointer-events-none select-none h-9 w-28 bg-muted/20 animate-pulse rounded-xl"
            />
          )
        }

        if (!connected) {
          return (
            <Button
              onClick={openConnectModal}
              size={compact ? "sm" : "default"}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-medium shadow-[0_4px_12px_oklch(0.72_0.18_160/25%)] flex items-center gap-2"
            >
              <Wallet className="size-4 shrink-0" />
              <span className="hidden xs:inline">{t("wallet.connect")}</span>
              <span className="xs:hidden">{t("wallet.connectShort")}</span>
            </Button>
          )
        }

        if (chain.unsupported) {
          return (
            <Button
              onClick={openChainModal}
              variant="destructive"
              size={compact ? "sm" : "default"}
              className="rounded-xl font-medium"
            >
              {t("wallet.wrongNetwork")}
            </Button>
          )
        }

        return (
          <div className="flex items-center gap-2">
            {/* Chain switch button */}
            <button
              onClick={openChainModal}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/40 border border-border text-xs text-foreground hover:bg-muted/60 transition-all font-medium"
            >
              {chain.hasIcon && (
                <div
                  style={{
                    background: chain.iconBackground,
                    width: 12,
                    height: 12,
                    borderRadius: 999,
                    overflow: "hidden",
                  }}
                  className="shrink-0"
                >
                  {chain.iconUrl && (
                    <img
                      alt={chain.name ?? "Chain icon"}
                      src={chain.iconUrl}
                      style={{ width: 12, height: 12 }}
                    />
                  )}
                </div>
              )}
              <span>{chain.name}</span>
            </button>

            {/* Account address & balance display */}
            <button
              onClick={openAccountModal}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary hover:bg-primary/15 transition-all font-medium font-mono"
            >
              <span className="hidden sm:inline">
                {account.displayBalance ? `${account.displayBalance} — ` : ""}
              </span>
              <span>{account.displayName}</span>
            </button>
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}
