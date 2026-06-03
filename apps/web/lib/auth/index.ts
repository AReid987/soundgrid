import NextAuth from "next-auth"
import { authConfig } from "./config"

const nextAuth = NextAuth(authConfig)

export const handlers = nextAuth.handlers
export const auth = nextAuth.auth
export const signIn = nextAuth.signIn
export const signOut = nextAuth.signOut

export { authConfig }

// Type augmentation for NextAuth User
declare module "next-auth" {
  interface User {
    emailVerified?: Date | null
  }
}
