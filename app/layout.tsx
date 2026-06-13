import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Geist, Geist_Mono, Space_Grotesk } from 'next/font/google'
import { WalletProvider } from '@/components/providers/WalletProvider'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { LangProvider } from '@/lib/lang-context'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})
const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'GreenChain — Recicle e Ganhe | Recycle & Earn',
  description: 'Plataforma Recycle-to-Earn: conectando cidadãos a lixeiras inteligentes e recompensando com tokens $GREEN. Powered by Celo.',
  keywords: ['blockchain', 'reciclagem', 'recycling', 'web3', 'token', 'sustentabilidade', 'sustainability', 'celo'],
  other: {
    "talentapp:project_verification": "b8fa040e1a9b1e85424e3db7d73589e3175ae98efd764bfc5217db7f301172e21ac505361830024153ba3e3487bbea0d116d2f5f1e1e14f4fd2ac02ac1023260"
  },
  openGraph: {
    title:       'GreenChain — Recicle e Ganhe | Recycle & Earn',
    description: 'Recicle materiais, ganhe $GREEN tokens. Powered by Celo.',
    type:        'website',
  },
}

export const viewport = {
  themeColor:    '#0d1f17',
  userScalable:  false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} bg-background`}>
      <body className="font-sans antialiased min-h-screen bg-background text-foreground">
        {/* LangProvider → i18n client-side; SessionProvider + WalletProvider → auth & Web3 */}
        <LangProvider>
          <SessionProvider>
            <WalletProvider>
              {children}
            </WalletProvider>
          </SessionProvider>
        </LangProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
