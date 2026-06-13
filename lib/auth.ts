import { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  providers: [
    // Providers placeholder (e.g. credentials or web3 session authentication)
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "default-secret-change-me-in-production",
}
