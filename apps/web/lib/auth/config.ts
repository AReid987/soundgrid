import { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import { prisma } from "@/lib/db/client"

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  
  callbacks: {
    async signIn() {
      return true
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },

    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
        
        const user = await prisma.user.findUnique({
          where: { id: token.sub },
          include: { personas: true }
        })
        
        if (user) {
          session.user.personas = user.personas
          session.user.identityVerified = user.identityVerified
        }
      }
      return session
    },
    
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
  
  events: {
    async signIn({ user }) {
      if (user.email) {
        await prisma.user.upsert({
          where: { email: user.email },
          update: {},
          create: {
            email: user.email,
            emailVerified: new Date(),
          },
        })
      }
    },
  },
  
  pages: {
    signIn: "/signin",
    error: "/auth/error",
    newUser: "/persona/select",
  },
  
  session: {
    strategy: "jwt",
  },
}

// Extend session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      emailVerified: Date | null
      personas: { id: string; type: string; displayName: string }[]
      identityVerified: boolean
      name?: string | null
      image?: string | null
    }
  }
}
